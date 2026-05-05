/**
 * helpers.js
 *
 * MUDANÇAS UI/UX:
 *   - Hexágonos na WebView: fillOpacity reduzido para 0.18 (borda visível,
 *     mapa base legível). A camada de hexágonos começa OCULTA (hexagonosLayer
 *     criado sem addTo(map) — só é exibido quando Initialpage injeta o toggle).
 *   - Geolocalização: o HTML da WebView tenta obter a posição do usuário via
 *     navigator.geolocation e notifica o React Native via postMessage
 *     (type: 'userLocation', lat, lng). Se negada, mantém posição padrão.
 */

export const TYPE_CONFIG = {
    Crime:    { color: '#ff4444', weight: 3 },
    Acidente: { color: '#ffaa00', weight: 2 },
    Outro:    { color: '#44aa44', weight: 1 },
};

export const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50';
    if (rating >= 3) return '#FFC107';
    if (rating >= 2) return '#FF9800';
    return '#F44336';
};

// ---------------------------------------------------------------------------
// generateWebViewHtml
// ---------------------------------------------------------------------------

export const generateWebViewHtml = ({
                                        markers      = [],
                                        userLocation = { lat: -23.55, lng: -46.63 },
                                        areas        = [],
                                    }) => {
    // ── Marcadores ────────────────────────────────────────────────────────────
    const markersJs = markers.map(m => {
        const col    = m.type === 'Crime' ? '#ff4444' : m.type === 'Acidente' ? '#ffaa00' : '#44aa44';
        const weight = m.type === 'Crime' ? 3 : m.type === 'Acidente' ? 2 : 1;
        const radius = 120 * weight;
        return `
      (function(){
        var ic = L.divIcon({ className:'marker-wrapper', html:'<div class="custom-dot ${m.type==='Crime'?'dot-crime':m.type==='Acidente'?'dot-acidente':'dot-outro'}" style="color:${col}"></div><div class="pulse" style="color:${col}"></div>', iconSize:[24,24], iconAnchor:[12,12] });
        var mm = L.marker([${m.coordinate.lat}, ${m.coordinate.lng}], {icon: ic}).addTo(map).bindPopup(${JSON.stringify(`<b>${m.type}</b><br/>${m.description}`)});
        var c = L.circle([${m.coordinate.lat}, ${m.coordinate.lng}], { radius: ${radius}, color: '${col}', fillColor: '${col}', fillOpacity: 0.10, weight: 0 }).addTo(map);
        window.__circles = window.__circles || [];
        window.__circles.push(c);
      })();
    `;
    }).join('\n');

    // ── Áreas ────────────────────────────────────────────────────────────────
    const areasJs = areas.map(area => {
        const rating = area.ratings?.overall || 0;
        const color  = rating >= 4 ? '#4CAF50' : rating >= 3 ? '#FFC107' : rating >= 2 ? '#FF9800' : '#F44336';
        return `
      (function(){
        var polygon = L.polygon(${JSON.stringify(area.coordinates)}, {
          fillColor: '${color}', color: '${color}', weight: 2, opacity: 0.8, fillOpacity: 0.3
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
    }).join('\n');

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
      @keyframes pulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.7; } 70% { transform:translate(-50%,-50%) scale(2.6); opacity:0; } 100% { opacity:0; } }
      /* Marcador da localização do usuário */
      .user-dot { width:14px; height:14px; border-radius:50%; background:#007AFF; border:3px solid #fff; box-shadow:0 0 0 4px rgba(0,122,255,0.25); }
    </style>
  </head><body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
      var map = L.map('map', { zoomControl: false }).setView([${userLocation.lat}, ${userLocation.lng}], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      window.__circles = [];

      // ── Geolocalização automática ─────────────────────────────────────────
      // Tenta obter posição real; notifica RN para centralizar o mapa RN-side.
      // Também centraliza o próprio mapa da WebView.
      var userMarker = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var lat = pos.coords.latitude, lng = pos.coords.longitude;
            map.setView([lat, lng], 15, { animate: true });
            var userIcon = L.divIcon({ className:'', html:'<div class="user-dot"></div>', iconSize:[14,14], iconAnchor:[7,7] });
            if(userMarker) map.removeLayer(userMarker);
            userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('<b>Você está aqui</b>');
            // Notifica React Native
            var msg = JSON.stringify({ type: 'userLocation', lat: lat, lng: lng });
            if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(msg);
            }
          },
          function() { /* Permissão negada — mantém posição padrão silenciosamente */ },
          { timeout: 8000, maximumAge: 60000 }
        );
      }

      ${areasJs}
      ${markersJs}

      map.on('click', function(e){
        var msg = JSON.stringify({ type:'mapClick', lat: e.latlng.lat, lng: e.latlng.lng });
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(msg);
        }
      });

      // ── Notifica região ao RN ─────────────────────────────────────────────
      function notificarRegiao() {
        try {
          var c = map.getCenter(), b = map.getBounds();
          var msg = JSON.stringify({
            type: 'regionChange',
            latitude: c.lat, longitude: c.lng,
            latitudeDelta:  b.getNorth() - b.getSouth(),
            longitudeDelta: b.getEast()  - b.getWest(),
          });
          if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(msg);
          }
        } catch(e) {}
      }
      map.on('moveend', notificarRegiao);
      map.on('zoomend', notificarRegiao);

      // ── Camada de hexágonos ───────────────────────────────────────────────
      // COMEÇA OCULTA (não adicionada ao mapa).
      // Initialpage.js injeta atualizarHexagonos() e respeita o toggle.
      window.hexagonosLayer = null;
      window.hexagonosVisible = false;

      window.atualizarHexagonos = function(hexagonos) {
        try {
          var wasVisible = window.hexagonosVisible;

          // Remove camada anterior
          if (window.hexagonosLayer) {
            window.hexagonosLayer.remove();
            window.hexagonosLayer = null;
          }
          if (!hexagonos || hexagonos.length === 0) return;

          // Cria nova camada mas NÃO adiciona ao mapa ainda
          var layer = L.layerGroup();
          hexagonos.forEach(function(h) {
            var coords = h.coordinates.map(function(c) {
              return Array.isArray(c) ? [c[0], c[1]] : [c.lat, c.lng];
            });
            L.polygon(coords, {
              color:       h.color,
              fillColor:   h.color,
              fillOpacity: 0.18,   // ← bem transparente: mapa base visível
              weight:      1,
              opacity:     0.50,
            })
            .bindPopup('<b>Criminalidade:</b> ' + (h.severity || ''))
            .addTo(layer);
          });

          window.hexagonosLayer = layer;

          // Só exibe se estava visível antes (toggle ativo)
          if (wasVisible) {
            window.hexagonosLayer.addTo(map);
          }
        } catch(e) { console.error('atualizarHexagonos error:', e); }
      };

      // Toggle chamado pelo Initialpage via injectJavaScript
      window.__toggleHexagonos = function(show) {
        window.hexagonosVisible = show;
        if (!window.hexagonosLayer) return;
        if (show) { window.hexagonosLayer.addTo(map); }
        else { window.hexagonosLayer.remove(); }
      };

      // ── Funções auxiliares ────────────────────────────────────────────────
      window.__handleAddMarker = function(m) {
        try {
          var col = m.type === 'Crime' ? '#ff4444' : m.type === 'Acidente' ? '#ffaa00' : '#44aa44';
          var weight = m.type === 'Crime' ? 3 : m.type === 'Acidente' ? 2 : 1;
          var radius = 120 * weight;
          var ic = L.divIcon({ className:'marker-wrapper', html:'<div class="custom-dot" style="color:'+col+'"></div><div class="pulse" style="color:'+col+'"></div>', iconSize:[24,24], iconAnchor:[12,12] });
          var mk = L.marker([m.coordinate.lat, m.coordinate.lng], { icon: ic }).addTo(map).bindPopup('<b>'+m.type+'</b><br/>'+m.description);
          var c = L.circle([m.coordinate.lat, m.coordinate.lng], { radius: radius, color: col, fillColor: col, fillOpacity: 0.10, weight: 0 }).addTo(map);
          window.__circles.push(c);
          map.setView([m.coordinate.lat, m.coordinate.lng], map.getZoom());
        } catch(e) {}
      };

      window.__toggleZones = function(show) {
        try {
          window.__circles.forEach(function(c){
            if(show) { c.addTo(map); } else { map.removeLayer(c); }
          });
        } catch(e) {}
      };
    </script>
  </body></html>
  `;
};