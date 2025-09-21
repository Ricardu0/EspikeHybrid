import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

import { WebView } from "react-native-webview";
import "leaflet/dist/leaflet.css";

// --- Só carregamos react-leaflet / leaflet no web ---
let MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, L;
if (Platform.OS === "web") {
  const RL = require("react-leaflet");
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  Circle = RL.Circle;
  useMapEvents = RL.useMapEvents;
  L = require("leaflet");

  if (typeof document !== "undefined" && !document.getElementById("leaflet-custom-css")) {
    const style = document.createElement("style");
    style.id = "leaflet-custom-css";
    style.innerHTML = `
      .leaflet-container { background: #f8f9fa; border-radius: 8px; }
      .custom-dot { width: 12px; height: 12px; border-radius: 50%; display: block; position: relative; box-shadow: 0 0 0 2px rgba(0,0,0,0.06); }
      .dot-crime { background: #ff4444; }
      .dot-acidente { background: #ffaa00; }
      .dot-outro { background: #44aa44; }
      .pulse { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 12px; height: 12px; border-radius: 50%; background: currentColor; opacity:0.45; animation: pulse 1.4s infinite; }
      .marker-wrapper { position: relative; width: 24px; height: 24px; }
      @keyframes pulse { 0% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; } 70% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; } 100% { opacity: 0; } }

      /* legend */
      .map-legend {
        position: absolute;
        left: 12px;
        top: 12px;
        background: rgba(255,255,255,0.95);
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 12px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      }
      .map-legend .item { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
      .map-legend .sw { width:12px; height:12px; border-radius:3px; display:inline-block; }
    `;
    document.head.appendChild(style);
  }
}

// --- Helper: mapping severity/visual ---
const TYPE_CONFIG = {
  Crime: { color: "#ff4444", weight: 3 },
  Acidente: { color: "#ffaa00", weight: 2 },
  Outro: { color: "#44aa44", weight: 1 },
};

const Initialpage = ({ navigation }) => {
  const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showZones, setShowZones] = useState(true); // toggle zonas de risco

  const handleNavigate = (route) => {
    Alert.alert("Navegar", `Você clicou em: ${route}`);
    // Aqui você pode integrar com React Navigation ou trocar estados
  };

  const [occurrenceData, setOccurrenceData] = useState({
    description: "",
    type: "Crime",
    coord: null,
  });

  const [markers, setMarkers] = useState([
    { id: 1, type: "Crime", description: "Roubo reportado", coordinate: { lat: -23.5505, lng: -46.6333 } },
    { id: 2, type: "Acidente", description: "Acidente de trânsito", coordinate: { lat: -23.5515, lng: -46.6343 } },
    { id: 3, type: "Outro", description: "Atividade suspeita", coordinate: { lat: -23.5525, lng: -46.6353 } },
  ]);

  const userLocation = { lat: -23.5505, lng: -46.6333 };
  const webviewRef = useRef();

  const openOccurrenceFormWithCoord = (latlng) => {
    setOccurrenceData({ description: "", type: "Crime", coord: latlng });
    setShowOccurrenceForm(true);
  };

  const submitOccurrence = () => {
    if (!occurrenceData.description) {
      Alert.alert("Erro", "Preencha a descrição");
      return;
    }
    const coord = occurrenceData.coord || {
      lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
    };
    const newMarker = { id: Date.now(), type: occurrenceData.type, description: occurrenceData.description, coordinate: { lat: coord.lat, lng: coord.lng } };
    setMarkers(prev => [...prev, newMarker]);
    setShowOccurrenceForm(false);
    setOccurrenceData({ description: "", type: "Crime", coord: null });
    setSelectedMarker(newMarker);

    // Mobile: inform WebView to add marker + circle
    if (Platform.OS !== "web" && webviewRef.current) {
      const script = `(function(){ if(window.__handleAddMarker){ window.__handleAddMarker(${JSON.stringify(newMarker)}); }})(); true;`;
      webviewRef.current.injectJavaScript(script);
    }

    Alert.alert("Sucesso", "Ocorrência registrada!");
  };

  // Web: component to capture map clicks
  const MapClickHandler = ({ onMapClick }) => {
    if (!useMapEvents) return null;
    const MapEvents = () => {
      useMapEvents({
        click(e) { onMapClick(e.latlng); },
      });
      return null;
    };
    return <MapEvents />;
  };

  // radius (meters) function by type weight
  const radiusForType = (type) => {
    const weight = TYPE_CONFIG[type]?.weight || 1;
    return 120 * weight; // 120m * weight (1..3)
  };

  // circle style
  const circleStyle = (type) => {
    const cfg = TYPE_CONFIG[type] || { color: "#999", weight: 1 };
    return { color: cfg.color, fillColor: cfg.color, fillOpacity: 0.12, weight: 0 };
  };

  return (
    <View style={styles.pageWrapper}>
      {Platform.OS === "web" ? (
        <View style={styles.mapWrapper}>
          <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} style={styles.map} attributionControl={false} zoomControl={false}>
            {/* Use a cleaner tile provider (Carto Positron) for nicer visuals */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                       attribution='&copy; OpenStreetMap contributors &amp; CARTO' />

            {/* Click handler */}
            <MapClickHandler onMapClick={(latlng) => openOccurrenceFormWithCoord({ lat: latlng.lat, lng: latlng.lng })} />

            {/* Markers + optional circles (zones) */}
            {markers.map(m => {
              const icon = L.divIcon({
                className: "marker-wrapper",
                html: `<div class="custom-dot ${m.type==='Crime'?'dot-crime':m.type==='Acidente'?'dot-acidente':'dot-outro'}" style="color:${TYPE_CONFIG[m.type].color}"></div><div class="pulse" style="color:${TYPE_CONFIG[m.type].color}"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12]
              });
              return (
                <React.Fragment key={m.id}>
                  <Marker position={[m.coordinate.lat, m.coordinate.lng]} icon={icon} eventHandlers={{ click: () => setSelectedMarker(m) }}>
                    <Popup>
                      <Text style={{ fontWeight: "700" }}>{m.type}</Text><br />
                      <Text>{m.description}</Text>
                    </Popup>
                  </Marker>

                  {showZones && (
                    <Circle center={[m.coordinate.lat, m.coordinate.lng]} radius={radiusForType(m.type)} pathOptions={circleStyle(m.type)} />
                  )}
                </React.Fragment>
              );
            })}

            {/* Legend (overlay) - simple HTML injected via control isn't necessary; render as overlay in React Native layer */}
          </MapContainer>

          {/* Legend + Toggle rendered overlapping on top-left (native overlay) */}
          <View style={styles.legend}>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Crime.color }]} /><Text style={styles.legendText}>Crime</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Acidente.color }]} /><Text style={styles.legendText}>Acidente</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Outro.color }]} /><Text style={styles.legendText}>Outro</Text></View>
            <TouchableOpacity style={styles.zoneToggle} onPress={() => setShowZones(!showZones)}><Text style={styles.zoneToggleText}>{showZones ? "Ocultar zonas" : "Mostrar zonas"}</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.mapWrapper}>
          <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            style={styles.map}
            source={{ html: generateWebViewHtml({ markers, userLocation }) }}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (data?.type === "mapClick" && data?.lat && data?.lng) {
                  openOccurrenceFormWithCoord({ lat: data.lat, lng: data.lng });
                }
              } catch (err) {}
            }}
          />
          {/* Native overlay legend + toggle for mobile */}
          <View style={styles.legendMobile}>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Crime.color }]} /><Text style={styles.legendTextSmall}>Crime</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Acidente.color }]} /><Text style={styles.legendTextSmall}>Acidente</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Outro.color }]} /><Text style={styles.legendTextSmall}>Outro</Text></View>
            <TouchableOpacity style={styles.zoneToggleMobile} onPress={() => {
              // toggle zones inside webview
              setShowZones(prev => {
                const next = !prev;
                if (webviewRef.current) {
                  const script = `if(window.__toggleZones){ window.__toggleZones(${next}); } true;`;
                  webviewRef.current.injectJavaScript(script);
                }
                return next;
              });
            }}><Text style={styles.zoneToggleText}>{showZones ? "Ocultar zonas" : "Mostrar zonas"}</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* floating button */}
      <TouchableOpacity style={styles.addOccurrenceButton} onPress={() => { setOccurrenceData({ description: "", type: "Crime", coord: null }); setShowOccurrenceForm(true); }}>
        <Text style={styles.addOccurrenceButtonText}>＋</Text>
      </TouchableOpacity>

      {/* ---------- NOVO: botão fixo no canto esquerdo que abre MenuScreen ---------- */}
      <TouchableOpacity
        style={styles.menuButtonLeft}
        onPress={() => navigation.navigate("Menu")}
        accessibilityLabel="Abrir menu"
      >
        <Text style={styles.menuButtonLeftText}>☰</Text>
      </TouchableOpacity>

      {/* Modal form */}
      <Modal visible={showOccurrenceForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.formModal}>
            <Text style={styles.formTitle}>Registrar Ocorrência</Text>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.row}>
              {["Crime","Acidente","Outro"].map(t => (
                <TouchableOpacity key={t} style={[styles.typeButton, occurrenceData.type===t && styles.typeButtonActive]} onPress={() => setOccurrenceData({...occurrenceData, type: t})}>
                  <Text style={[styles.typeButtonText, occurrenceData.type===t && styles.typeButtonTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 8 }]}>Descrição</Text>
            <TextInput style={[styles.textInput, { height: 80 }]} placeholder="Descreva o que aconteceu" multiline value={occurrenceData.description} onChangeText={t => setOccurrenceData({...occurrenceData, description: t})} />

            {occurrenceData.coord ? (
              <Text style={styles.hint}>Local selecionado: {occurrenceData.coord.lat.toFixed(5)}, {occurrenceData.coord.lng.toFixed(5)}</Text>
            ) : (
              <Text style={styles.hint}>Clique no mapa para escolher o local (ou deixe em branco)</Text>
            )}

            <View style={styles.row}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#4CAF50" }]} onPress={submitOccurrence}><Text style={styles.actionButtonText}>Registrar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#f44336", marginLeft: 8 }]} onPress={() => setShowOccurrenceForm(false)}><Text style={styles.actionButtonText}>Cancelar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 6 }} />
    </View>
  );
};

// --- WebView HTML generator (mobile) with circles + toggling support ---
function generateWebViewHtml({ markers = [], userLocation = { lat: -23.55, lng: -46.63 } }) {
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

      // click handler -> RN
      map.on('click', function(e){ var msg = JSON.stringify({ type:'mapClick', lat: e.latlng.lat, lng: e.latlng.lng }); if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage) { window.ReactNativeWebView.postMessage(msg); } });

      // function to add marker from RN
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

      // toggle circles visibility
      window.__toggleZones = function(show) {
        try {
          window.__circles.forEach(function(c){ if(show) { c.addTo(map); } else { map.removeLayer(c); } });
        } catch(e) {}
      };
    </script>
  </body></html>
  `;
}

// ------------------- estilos -------------------
const styles = StyleSheet.create({
  pageWrapper: { flex: 1, padding: 6, backgroundColor: "#fff" },
  mapWrapper: { flex: 1, borderRadius: 8, overflow: "hidden", backgroundColor: "#f8f9fa", borderWidth: 1, borderColor: "#eee" },
  map: { flex: 1, minHeight: 300 },

  addOccurrenceButton: {
    position: "absolute", bottom: 24, right: 24, backgroundColor: "#006effff", width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#ff7700ff", shadowOpacity: 0.12, shadowRadius: 6,
  },
  addOccurrenceButtonText: { color: "#fff", fontSize: 28, lineHeight: 28 },

  // novo: botão menu esquerdo
  menuButtonLeft: {
    position: "absolute",
    left: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ff6a00ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },
  menuButtonLeftText: { color: "#fff", fontSize: 26, fontWeight: "700" },

  legend: { position: "absolute", left: 12, top: 12, backgroundColor: "rgba(255,255,255,0.95)", padding: 8, borderRadius: 8, width: 140, zIndex: 999 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sw: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: "#222" },
  zoneToggle: { marginTop: 6, paddingVertical: 6, borderRadius: 8, backgroundColor: "#111", alignItems: "center" },
  zoneToggleText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // mobile legend
  legendMobile: { position: "absolute", left: 12, top: 12, backgroundColor: "rgba(255,255,255,0.95)", padding: 8, borderRadius: 8, zIndex: 999 },
  legendTextSmall: { fontSize: 11, color: "#222" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", padding: 16 },
  formModal: { width: "100%", maxWidth: 540, backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 8 },
  formTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  label: { fontWeight: "700", marginBottom: 6 },
  textInput: { borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 8, padding: 12, backgroundColor: "#fafafa", textAlignVertical: "top" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  typeButton: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: "#eee", backgroundColor: "#fff" },
  typeButtonActive: { backgroundColor: "#111", borderColor: "#111" },
  typeButtonText: { color: "#111", fontWeight: "700" },
  typeButtonTextActive: { color: "#fff" },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  actionButtonText: { color: "#fff", fontWeight: "700" },
});

export default Initialpage;
