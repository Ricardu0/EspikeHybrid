import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { TYPE_CONFIG, getRatingColor } from "../utils/helpers";

const Legend = ({
  showZones,
  setShowZones,
  drawingMode,
  setDrawingMode,
  onFinishDrawing,
  webviewRef
}) => {
  const handleZoneToggle = () => {
    const next = !showZones;
    setShowZones(next);
    
    if (Platform.OS !== "web" && webviewRef.current) {
      const script = `if(window.__toggleZones){ window.__toggleZones(${next}); } true;`;
      webviewRef.current.injectJavaScript(script);
    }
  };

  return (
    <View style={Platform.OS === "web" ? styles.legend : styles.legendMobile}>
      <Text style={styles.legendTitle}>Legenda</Text>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Crime.color }]} />
        <Text style={Platform.OS === "web" ? styles.legendText : styles.legendTextSmall}>Crime</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Acidente.color }]} />
        <Text style={Platform.OS === "web" ? styles.legendText : styles.legendTextSmall}>Acidente</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.sw, { backgroundColor: TYPE_CONFIG.Outro.color }]} />
        <Text style={Platform.OS === "web" ? styles.legendText : styles.legendTextSmall}>Outro</Text>
      </View>
      
      {Platform.OS === "web" && (
        <>
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
        </>
      )}
      
      <TouchableOpacity style={styles.zoneToggle} onPress={handleZoneToggle}>
        <Text style={styles.zoneToggleText}>
          {showZones ? "Ocultar zonas" : "Mostrar zonas"}
        </Text>
      </TouchableOpacity>
      
      {Platform.OS === "web" && (
        <>
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
              onPress={onFinishDrawing}
            >
              <Text style={styles.zoneToggleText}>Finalizar Área</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  legendTextSmall: { 
    fontSize: 11, 
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
});

export default Legend;