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
let MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Polygon, L;
if (Platform.OS === "web") {
  const RL = require("react-leaflet");
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  Circle = RL.Circle;
  Polygon = RL.Polygon;
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

// --- Helper: get color based on rating ---
const getRatingColor = (rating) => {
  if (rating >= 4) return "#4CAF50"; // Verde
  if (rating >= 3) return "#FFC107"; // Amarelo
  if (rating >= 2) return "#FF9800"; // Laranja
  return "#F44336"; // Vermelho
};

const Initialpage = ({ navigation }) => {
  const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showZones, setShowZones] = useState(true);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);

  const handleNavigate = (route) => {
    Alert.alert("Navegar", `Você clicou em: ${route}`);
  };

  const [occurrenceData, setOccurrenceData] = useState({
    description: "",
    type: "Crime",
    coord: null,
  });

  const [areaRatingData, setAreaRatingData] = useState({
    overall: 0,
    risk: 0,
    lighting: 0,
    infrastructure: 0,
    policing: 0,
    comments: ""
  });

  const [markers, setMarkers] = useState([
    { id: 1, type: "Crime", description: "Roubo reportado", coordinate: { lat: -23.5505, lng: -46.6333 } },
    { id: 2, type: "Acidente", description: "Acidente de trânsito", coordinate: { lat: -23.5515, lng: -46.6343 } },
    { id: 3, type: "Outro", description: "Atividade suspeita", coordinate: { lat: -23.5525, lng: -46.6353 } },
  ]);

  const [areas, setAreas] = useState([
    {
      id: 1,
      name: "Praça Central",
      coordinates: [
        [-23.5505, -46.6333],
        [-23.5515, -46.6333],
        [-23.5515, -46.6343],
        [-23.5505, -46.6343]
      ],
      ratings: {
        overall: 4,
        risk: 3,
        lighting: 4,
        infrastructure: 5,
        policing: 2,
        comments: "Boa infraestrutura mas policiamento insuficiente"
      }
    }
  ]);

  const userLocation = { lat: -23.5505, lng: -46.6333 };
  const webviewRef = useRef();

  // Função para navegar para a tela do Chatbot
  const navigateToChatbot = () => {
    navigation.navigate('ChatbotScreen');
  };

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

    if (Platform.OS !== "web" && webviewRef.current) {
      const script = `(function(){ if(window.__handleAddMarker){ window.__handleAddMarker(${JSON.stringify(newMarker)}); }})(); true;`;
      webviewRef.current.injectJavaScript(script);
    }

    Alert.alert("Sucesso", "Ocorrência registrada!");
  };

  const submitAreaRating = () => {
    if (!areaRatingData.overall) {
      Alert.alert("Erro", "Avaliação geral é obrigatória");
      return;
    }

    const updatedAreas = areas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          ratings: areaRatingData
        };
      }
      return area;
    });

    setAreas(updatedAreas);
    setShowAreaForm(false);
    setAreaRatingData({
      overall: 0,
      risk: 0,
      lighting: 0,
      infrastructure: 0,
      policing: 0,
      comments: ""
    });
    Alert.alert("Sucesso", "Avaliação registrada!");
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setAreaRatingData(area.ratings || {
      overall: 0,
      risk: 0,
      lighting: 0,
      infrastructure: 0,
      policing: 0,
      comments: ""
    });
    setShowAreaForm(true);
  };

  const handleMapClick = (latlng) => {
    if (drawingMode) {
      setCurrentPolygon(prev => [...prev, [latlng.lat, latlng.lng]]);
    } else {
      openOccurrenceFormWithCoord({ lat: latlng.lat, lng: latlng.lng });
    }
  };

  const finishDrawing = () => {
    if (currentPolygon.length < 3) {
      Alert.alert("Erro", "Um polígono precisa de pelo menos 3 pontos");
      return;
    }

    const newArea = {
      id: Date.now(),
      name: `Área ${areas.length + 1}`,
      coordinates: [...currentPolygon, currentPolygon[0]], // Fechar o polígono
      ratings: {
        overall: 0,
        risk: 0,
        lighting: 0,
        infrastructure: 0,
        policing: 0,
        comments: ""
      }
    };

    setAreas(prev => [...prev, newArea]);
    setCurrentPolygon([]);
    setDrawingMode(false);
    Alert.alert("Sucesso", "Área criada! Agora você pode avaliá-la.");
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
    return 120 * weight;
  };

  // circle style
  const circleStyle = (type) => {
    const cfg = TYPE_CONFIG[type] || { color: "#999", weight: 1 };
    return { color: cfg.color, fillColor: cfg.color, fillOpacity: 0.12, weight: 0 };
  };

  // polygon style based on ratings
  const polygonStyle = (area) => {
    const rating = area.ratings?.overall || 0;
    return {
      fillColor: getRatingColor(rating),
      color: getRatingColor(rating),
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.3
    };
  };

  const RatingInput = ({ label, value, onChange }) => (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, star <= value && styles.starSelected]}>
              {star <= value ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingValue}>{value}/5</Text>
    </View>
  );

  return (
    <View style={styles.pageWrapper}>
      {Platform.OS === "web" ? (
        <View style={styles.mapWrapper}>
          <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} style={styles.map} attributionControl={false} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                       attribution='&copy; OpenStreetMap contributors &amp; CARTO' />

            <MapClickHandler onMapClick={handleMapClick} />

            {/* Áreas existentes */}
            {areas.map(area => (
              <Polygon
                key={area.id}
                positions={area.coordinates}
                pathOptions={polygonStyle(area)}
                eventHandlers={{
                  click: () => handleAreaClick(area)
                }}
              />
            ))}

            {/* Polígono em criação */}
            {currentPolygon.length > 0 && (
              <Polygon
                positions={currentPolygon}
                pathOptions={{ fillColor: 'blue', color: 'blue', weight: 2, opacity: 0.8, fillOpacity: 0.3 }}
              />
            )}

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
          </MapContainer>

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legenda</Text>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Crime.color }]} /><Text style={styles.legendText}>Crime</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Acidente.color }]} /><Text style={styles.legendText}>Acidente</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Outro.color }]} /><Text style={styles.legendText}>Outro</Text></View>
            
            <Text style={[styles.legendTitle, { marginTop: 8 }]}>Áreas</Text>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: "#4CAF50" }]} /><Text style={styles.legendText}>Boa (4-5)</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: "#FFC107" }]} /><Text style={styles.legendText}>Média (3)</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: "#FF9800" }]} /><Text style={styles.legendText}>Ruim (2)</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: "#F44336" }]} /><Text style={styles.legendText}>Crítica (0-1)</Text></View>
            
            <TouchableOpacity style={styles.zoneToggle} onPress={() => setShowZones(!showZones)}>
              <Text style={styles.zoneToggleText}>{showZones ? "Ocultar zonas" : "Mostrar zonas"}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.zoneToggle, { backgroundColor: drawingMode ? "#f44336" : "#4CAF50", marginTop: 6 }]} 
              onPress={() => setDrawingMode(!drawingMode)}
            >
              <Text style={styles.zoneToggleText}>
                {drawingMode ? "Cancelar Desenho" : "Desenhar Área"}
              </Text>
            </TouchableOpacity>
            
            {drawingMode && (
              <TouchableOpacity 
                style={[styles.zoneToggle, { backgroundColor: "#2196F3", marginTop: 6 }]} 
                onPress={finishDrawing}
              >
                <Text style={styles.zoneToggleText}>Finalizar Área</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.mapWrapper}>
          <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            style={styles.map}
            source={{ html: generateWebViewHtml({ markers, userLocation, areas }) }}
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (data?.type === "mapClick" && data?.lat && data?.lng) {
                  handleMapClick({ lat: data.lat, lng: data.lng });
                } else if (data?.type === "areaClick" && data?.areaId) {
                  const area = areas.find(a => a.id === data.areaId);
                  if (area) handleAreaClick(area);
                }
              } catch (err) {}
            }}
          />
          <View style={styles.legendMobile}>
            <Text style={styles.legendTitle}>Legenda</Text>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Crime.color }]} /><Text style={styles.legendTextSmall}>Crime</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Acidente.color }]} /><Text style={styles.legendTextSmall}>Acidente</Text></View>
            <View style={styles.legendRow}><View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Outro.color }]} /><Text style={styles.legendTextSmall}>Outro</Text></View>
            
            <TouchableOpacity style={styles.zoneToggleMobile} onPress={() => {
              setShowZones(prev => {
                const next = !prev;
                if (webviewRef.current) {
                  const script = `if(window.__toggleZones){ window.__toggleZones(${next}); } true;`;
                  webviewRef.current.injectJavaScript(script);
                }
                return next;
              });
            }}>
              <Text style={styles.zoneToggleText}>{showZones ? "Ocultar zonas" : "Mostrar zonas"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========== BOTÕES FLUTUANTES ========== */}

      {/* Botão do Chatbot - NOVO */}
      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={navigateToChatbot}
        accessibilityLabel="Abrir assistente de IA"
      >
        <Text style={styles.chatbotButtonText}>🤖</Text>
      </TouchableOpacity>

      {/* Botão para adicionar ocorrência */}
      <TouchableOpacity style={styles.addOccurrenceButton} onPress={() => { 
        setOccurrenceData({ description: "", type: "Crime", coord: null }); 
        setShowOccurrenceForm(true); 
      }}>
        <Text style={styles.addOccurrenceButtonText}>＋</Text>
      </TouchableOpacity>

      {/* Botão para modo desenho (apenas web por enquanto) */}
      {Platform.OS === "web" && (
        <TouchableOpacity 
          style={[styles.drawingButton, { backgroundColor: drawingMode ? "#f44336" : "#4CAF50" }]} 
          onPress={() => setDrawingMode(!drawingMode)}
        >
          <Text style={styles.drawingButtonText}>
            {drawingMode ? "✕" : "◯"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Botão menu */}
      <TouchableOpacity
        style={styles.menuButtonLeft}
        onPress={() => navigation.navigate("Menu")}
        accessibilityLabel="Abrir menu"
      >
        <Text style={styles.menuButtonLeftText}>☰</Text>
      </TouchableOpacity>

      {/* ========== MODAIS ========== */}

      {/* Modal para ocorrências */}
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

      {/* Modal para avaliação de áreas */}
      <Modal visible={showAreaForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.formModal}>
            <Text style={styles.formTitle}>Avaliar Área</Text>
            {selectedArea && <Text style={styles.subTitle}>{selectedArea.name}</Text>}
            
            <ScrollView style={styles.ratingContainer}>
              <RatingInput 
                label="Avaliação Geral:" 
                value={areaRatingData.overall} 
                onChange={(value) => setAreaRatingData({...areaRatingData, overall: value})} 
              />
              <RatingInput 
                label="Risco:" 
                value={areaRatingData.risk} 
                onChange={(value) => setAreaRatingData({...areaRatingData, risk: value})} 
              />
              <RatingInput 
                label="Iluminação:" 
                value={areaRatingData.lighting} 
                onChange={(value) => setAreaRatingData({...areaRatingData, lighting: value})} 
              />
              <RatingInput 
                label="Infraestrutura:" 
                value={areaRatingData.infrastructure} 
                onChange={(value) => setAreaRatingData({...areaRatingData, infrastructure: value})} 
              />
              <RatingInput 
                label="Policiamento:" 
                value={areaRatingData.policing} 
                onChange={(value) => setAreaRatingData({...areaRatingData, policing: value})} 
              />
              
              <Text style={[styles.label, { marginTop: 12 }]}>Comentários:</Text>
              <TextInput 
                style={[styles.textInput, { height: 80 }]} 
                placeholder="Comentários adicionais..." 
                multiline 
                value={areaRatingData.comments} 
                onChangeText={t => setAreaRatingData({...areaRatingData, comments: t})} 
              />
            </ScrollView>

            <View style={styles.row}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#4CAF50" }]} onPress={submitAreaRating}>
                <Text style={styles.actionButtonText}>Salvar Avaliação</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#f44336", marginLeft: 8 }]} onPress={() => setShowAreaForm(false)}>
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 6 }} />
    </View>
  );
};

// --- WebView HTML generator atualizado para mobile ---
function generateWebViewHtml({ markers = [], userLocation = { lat: -23.55, lng: -46.63 }, areas = [] }) {
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

// ------------------- estilos atualizados -------------------
const styles = StyleSheet.create({
  pageWrapper: { flex: 1, padding: 6, backgroundColor: "#fff" },
  mapWrapper: { flex: 1, borderRadius: 8, overflow: "hidden", backgroundColor: "#f8f9fa", borderWidth: 1, borderColor: "#eee" },
  map: { flex: 1, minHeight: 300 },

  // Botão do Chatbot - NOVO
  chatbotButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#5856D6",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },
  chatbotButtonText: {
    color: "#fff",
    fontSize: 24,
  },

  addOccurrenceButton: {
    position: "absolute", bottom: 24, right: 24, backgroundColor: "#006eff", width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6,
  },
  addOccurrenceButtonText: { color: "#fff", fontSize: 28, lineHeight: 28 },

  drawingButton: {
    position: "absolute", bottom: 90, right: 24, width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6,
  },
  drawingButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  menuButtonLeft: {
    position: "absolute",
    left: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ff6a00",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    zIndex: 1000,
  },
  menuButtonLeftText: { color: "#fff", fontSize: 26, fontWeight: "700" },

  legend: { 
    position: "absolute", 
    left: 12, 
    top: 12, 
    backgroundColor: "rgba(255,255,255,0.95)", 
    padding: 12, 
    borderRadius: 8, 
    width: 160, 
    zIndex: 999,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6, color: "#222" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  sw: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: "#222" },
  zoneToggle: { marginTop: 6, paddingVertical: 6, borderRadius: 8, backgroundColor: "#111", alignItems: "center" },
  zoneToggleText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // mobile legend
  legendMobile: { 
    position: "absolute", 
    left: 12, 
    top: 12, 
    backgroundColor: "rgba(255,255,255,0.95)", 
    padding: 8, 
    borderRadius: 8, 
    zIndex: 999,
    elevation: 4,
  },
  legendTextSmall: { fontSize: 11, color: "#222" },
  zoneToggleMobile: { marginTop: 6, paddingVertical: 6, borderRadius: 8, backgroundColor: "#111", alignItems: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", padding: 16 },
  formModal: { width: "100%", maxWidth: 540, maxHeight: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 8 },
  formTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  subTitle: { fontSize: 16, color: "#666", marginBottom: 12 },
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

  // Rating styles
  ratingContainer: { maxHeight: 300, marginBottom: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  ratingLabel: { flex: 2, fontSize: 14, fontWeight: "600" },
  starsContainer: { flex: 3, flexDirection: "row", justifyContent: "center" },
  starButton: { padding: 4 },
  star: { fontSize: 24, color: "#ddd" },
  starSelected: { color: "#FFD700" },
  ratingValue: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: "600" },
});

export default Initialpage;