export const TYPE_CONFIG = {
  Crime: { color: "#ff4444", weight: 3 },
  Acidente: { color: "#ffaa00", weight: 2 },
  Outro: { color: "#44aa44", weight: 1 },
};

export const getRatingColor = (rating) => {
  if (rating >= 4) return "#4CAF50";
  if (rating >= 3) return "#FFC107";
  if (rating >= 2) return "#FF9800";
  return "#F44336";
};

export const generateWebViewHtml = ({ markers = [], userLocation = { lat: -23.55, lng: -46.63 }, areas = [] }) => {
  const markersJs = markers.map(m => {
    const col = m.type === "Crime" ? "#ff4444" : m.type === "Acidente" ? "#ffaa00" : "#44aa44";
    const weight = m.type === "Crime" ? 3 : m.type === "Acidente" ? 2 : 1;
    const radius = 120 * weight;
    return `
      (function(){
        var ic = L.divIcon({ className:'marker-wrapper', html:'<div class="custom-dot ${m.type==="Crime"?"dot-crime":m.type==="Acidente"?"dot-acidente":"dot-outro"}" style="color:${col}"></div><div class="pulse" style="color:${col}"></div>', iconSize:[24,24], iconAnchor:[12,12] });
        var mm = L.marker([${m.coordinate.lat}, ${m.coordinate.lng}], {icon: ic}).addTo(map).bindPopup(${JSON.stringify(`<b>${m.type}</b><br/>${m.description}`)});
        var c = L.circle([${m.coordinate.lat}, ${m.coordinate.lng}], { radius: ${radius}, color: '${col}', fillColor: '${col}', fillOpacity: 0.12, weight:0 }).addTo(map);
        window.__circles = window.__circles || [];
        window.__circles.push(c);
      })();
    `;
  }).join("\n");

  const areasJs = areas.map(area => {
    const rating = area.ratings?.overall || 0;
    const color = rating >= 4 ? "#4CAF50" : rating >= 3 ? "#FFC107" : rating >= 2 ? "#FF9800" : "#F44336";
    
    return `
      (function(){
        var polygon = L.polygon(${JSON.stringify(area.coordinates)}, {
          fillColor: '${color}',
          color: '${color}',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3
        }).addTo(map);
        
        polygon.on('click', function() {
          var msg = JSON.stringify({ type: 'areaClick', areaId: ${area.id} });
          if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(msg);
          }
        });
        
        polygon.bindPopup('<b>${area.name}</b><br/>Avaliação: ${rating}/5');
      })();
    `;
  }).join("\n");

  return `
  <!doctype html><html><head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    <style>
      html,body,#map { height:100%; margin:0; padding:0; background:#f8f9fa; }
      .leaflet-container { border-radius:8px; }
      .custom-dot { width:12px; height:12px; border-radius:50%; display:block; position:relative; box-shadow:0 0 0 2px rgba(0,0,0,0.06); }
      .dot-crime { background:#ff4444; }
      .dot-acidente { background:#ffaa00; }
      .dot-outro { background:#44aa44; }
      .pulse { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:12px; height:12px; border-radius:50%; background:currentColor; opacity:0.45; animation: pulse 1.4s infinite; }
      @keyframes pulse { 0% { transform: translate(-50%,-50%) scale(1); opacity:0.7; } 70% { transform: translate(-50%,-50%) scale(2.6); opacity:0; } 100% { opacity:0; } }
      .map-legend{ position:absolute; left:12px; top:12px; background: rgba(255,255,255,0.95); padding:8px 10px; border-radius:8px; font-size:12px; box-shadow:0 6px 18px rgba(0,0,0,0.06);}
      .map-legend .item { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
      .map-legend .sw{ width:12px; height:12px; border-radius:3px; }
    </style>
  </head><body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
      var map = L.map('map', { zoomControl: false }).setView([${userLocation.lat}, ${userLocation.lng}], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      window.__circles = [];
      ${markersJs}
      ${areasJs}

      map.on('click', function(e){ 
        var msg = JSON.stringify({ type:'mapClick', lat: e.latlng.lat, lng: e.latlng.lng }); 
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) { 
          window.ReactNativeWebView.postMessage(msg); 
        } 
      });

      window.__handleAddMarker = function(m) {
        try {
          var col = m.type === 'Crime' ? '#ff4444' : m.type === 'Acidente' ? '#ffaa00' : '#44aa44';
          var weight = m.type === 'Crime' ? 3 : m.type === 'Acidente' ? 2 : 1;
          var radius = 120 * weight;
          var ic = L.divIcon({ className:'marker-wrapper', html:'<div class="custom-dot" style="color:'+col+'"></div><div class="pulse" style="color:'+col+'"></div>', iconSize:[24,24], iconAnchor:[12,12] });
          var mk = L.marker([m.coordinate.lat, m.coordinate.lng], { icon: ic }).addTo(map).bindPopup('<b>'+m.type+'</b><br/>'+m.description);
          var c = L.circle([m.coordinate.lat, m.coordinate.lng], { radius: radius, color: col, fillColor: col, fillOpacity: 0.12, weight:0 }).addTo(map);
          window.__circles.push(c);
          map.setView([m.coordinate.lat, m.coordinate.lng], map.getZoom());
        } catch(e) {}
      };

      window.__toggleZones = function(show) {
        try {
          window.__circles.forEach(function(c){ if(show) { c.addTo(map); } else { map.removeLayer(c); } });
        } catch(e) {}
      };
    </script>
  </body></html>
  `;
};