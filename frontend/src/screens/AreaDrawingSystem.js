import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';

let Polygon, L;
if (Platform.OS === "web") {
  const RL = require("react-leaflet");
  Polygon = RL.Polygon;
  L = require("leaflet");
}

export const useAreaDrawing = () => {
  const [drawingMode, setDrawingMode] = React.useState(false);
  const [currentPolygon, setCurrentPolygon] = React.useState([]);

  const handleMapClick = (latlng, areas, addNewArea) => {
    if (drawingMode) {
      setCurrentPolygon(prev => [...prev, [latlng.lat, latlng.lng]]);
    }
  };

  const finishDrawing = (areas, addNewArea) => {
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

    addNewArea(newArea);
    setCurrentPolygon([]);
    setDrawingMode(false);
    Alert.alert("Sucesso", "Área criada! Agora você pode avaliá-la.");
  };

  const cancelDrawing = () => {
    setCurrentPolygon([]);
    setDrawingMode(false);
  };

  return {
    drawingMode,
    setDrawingMode,
    currentPolygon,
    setCurrentPolygon,
    handleMapClick,
    finishDrawing,
    cancelDrawing
  };
};

// Componente para renderizar controles de desenho (Web)
export const DrawingControls = ({ 
  drawingMode, 
  setDrawingMode, 
  finishDrawing, 
  areas, 
  addNewArea,
  showZones,
  setShowZones 
}) => {
  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.legend}>
      <Text style={styles.legendTitle}>Legenda</Text>
      
      <Text style={[styles.legendTitle, { marginTop: 8 }]}>Áreas</Text>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: "#4CAF50" }]} />
        <Text style={styles.legendText}>Boa (4-5)</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: "#FFC107" }]} />
        <Text style={styles.legendText}>Média (3)</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: "#FF9800" }]} />
        <Text style={styles.legendText}>Ruim (2)</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: "#F44336" }]} />
        <Text style={styles.legendText}>Crítica (0-1)</Text>
      </View>
      
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
          onPress={() => finishDrawing(areas, addNewArea)}
        >
          <Text style={styles.zoneToggleText}>Finalizar Área</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente para renderizar polígonos no mapa (Web)
export const AreaPolygons = ({ areas, onAreaClick, drawingMode, currentPolygon }) => {
  if (Platform.OS !== "web") return null;

  const polygonStyle = (area) => {
    const rating = area.ratings?.overall || 0;
    const color = getRatingColor(rating);
    return {
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.3
    };
  };

  return (
    <>
      {/* Áreas existentes */}
      {areas.map(area => (
        <Polygon
          key={area.id}
          positions={area.coordinates}
          pathOptions={polygonStyle(area)}
          eventHandlers={{
            click: () => onAreaClick(area)
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
    </>
  );
};

const styles = {
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
  legendTitle: { 
    fontSize: 14, 
    fontWeight: "700", 
    marginBottom: 6, 
    color: "#222" 
  },
  legendRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    marginBottom: 4 
  },
  sw: { 
    width: 12, 
    height: 12, 
    borderRadius: 3 
  },
  legendText: { 
    fontSize: 12, 
    color: "#222" 
  },
  zoneToggle: { 
    marginTop: 6, 
    paddingVertical: 6, 
    borderRadius: 8, 
    backgroundColor: "#111", 
    alignItems: "center" 
  },
  zoneToggleText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 12 
  },
};