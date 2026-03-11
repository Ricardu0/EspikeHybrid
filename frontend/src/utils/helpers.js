/**
 * helpers.js — versão atualizada com suporte a hexágonos no WebView (mobile).
 *
 * Estratégia mobile (WebView):
 *  - O HTML gerado é ESTÁTICO — não recebe hexágonos como parâmetro.
 *  - A WebView expõe window.atualizarHexagonos(hexagonos) que adiciona/remove
 *    polígonos dinamicamente via L.layerGroup, sem recarregar a página.
 *  - A WebView notifica o React Native a cada mudança de viewport via postMessage
 *    (type: 'regionChange'), para que o hook useHexagonos re-filtre os dados.
 *  - O Initialpage escuta hexagonosVisiveis e injeta injectJavaScript quando mudam.
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

/**
 * Gera o HTML estático para a WebView mobile.
 * Hexágonos NÃO são passados aqui — são injetados dinamicamente depois via
 * webviewRef.current.injectJavaScript('window.atualizarHexagonos([...])')
 *
 * @param {object} params
 * @param {Array}  params.markers        - Marcadores de ocorrências
 * @param {object} params.userLocation   - { lat, lng }
 * @param {Array}  params.areas          - Áreas com avaliação manual
 */
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
        var c = L.circle([${m.coordinate.lat}, ${m.coordinate.lng}], { radius: ${radius}, color: '${col}', fillColor: '${col}', fillOpacity: 0.12, weight: 0 }).addTo(map);
        window.__circles = window.__circles || [];
        window.__circles.push(c);
      })();
    `;
  }).join('\n');

  // ── Áreas (avaliação manual) ──────────────────────────────────────────────
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

  // ── HTML final ────────────────────────────────────────────────────────────
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
    </style>
  </head><body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
      var map = L.map('map', { zoomControl: false }).setView([${userLocation.lat}, ${userLocation.lng}], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
      window.__circles = [];

      // Áreas com avaliação manual (estáticas, geradas uma vez)
      ${areasJs}

      // Marcadores de ocorrências (estáticos, gerados uma vez)
      ${markersJs}

      map.on('click', function(e){
        var msg = JSON.stringify({ type:'mapClick', lat: e.latlng.lat, lng: e.latlng.lng });
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(msg);
        }
      });

      // ── Notifica o React Native a cada mudança de viewport ──────────────
      // O RN filtra os hexágonos no hook e os injeta de volta via injectJavaScript
      function notificarRegiao() {
        try {
          var c = map.getCenter();
          var b = map.getBounds();
          var msg = JSON.stringify({
            type:           'regionChange',
            latitude:       c.lat,
            longitude:      c.lng,
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

      // ── Camada de hexágonos (atualizada dinamicamente via injectJavaScript) ─
      // Chamada pelo Initialpage sempre que hexagonosVisiveis mudar.
      window.hexagonosLayer = null;
      window.atualizarHexagonos = function(hexagonos) {
        try {
          // Remove camada anterior se existir
          if (window.hexagonosLayer) {
            window.hexagonosLayer.remove();
            window.hexagonosLayer = null;
          }
          if (!hexagonos || hexagonos.length === 0) return;

          window.hexagonosLayer = L.layerGroup().addTo(map);

          hexagonos.forEach(function(h) {
            // Normaliza coordenadas: aceita [[lat,lng]...] ou [{lat,lng}...]
            var coords = h.coordinates.map(function(c) {
              return Array.isArray(c) ? [c[0], c[1]] : [c.lat, c.lng];
            });
            L.polygon(coords, {
              color:       h.color,
              fillColor:   h.color,
              fillOpacity: h.fill_opacity != null ? h.fill_opacity : 0.55,
              weight:      1,
              opacity:     0.8,
            })
            .bindPopup('<b>Criminalidade:</b> ' + (h.severity || ''))
            .addTo(window.hexagonosLayer);
          });
        } catch(e) {
          console.error('atualizarHexagonos error:', e);
        }
      };

      // ── Funções auxiliares existentes (inalteradas) ──────────────────────
      window.__handleAddMarker = function(m) {
        try {
          var col = m.type === 'Crime' ? '#ff4444' : m.type === 'Acidente' ? '#ffaa00' : '#44aa44';
          var weight = m.type === 'Crime' ? 3 : m.type === 'Acidente' ? 2 : 1;
          var radius = 120 * weight;
          var ic = L.divIcon({ className:'marker-wrapper', html:'<div class="custom-dot" style="color:'+col+'"></div><div class="pulse" style="color:'+col+'"></div>', iconSize:[24,24], iconAnchor:[12,12] });
          var mk = L.marker([m.coordinate.lat, m.coordinate.lng], { icon: ic }).addTo(map).bindPopup('<b>'+m.type+'</b><br/>'+m.description);
          var c = L.circle([m.coordinate.lat, m.coordinate.lng], { radius: radius, color: col, fillColor: col, fillOpacity: 0.12, weight: 0 }).addTo(map);
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