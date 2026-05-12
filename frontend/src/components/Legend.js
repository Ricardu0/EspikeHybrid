import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { TYPE_CONFIG } from "../utils/helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Legend = ({
                  showZones,
                  setShowZones,
                  drawingMode,
                  setDrawingMode,
                  onFinishDrawing,
                  webviewRef,
                  showHexagons,
                  setShowHexagons,
                }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const raw = await AsyncStorage.getItem("userData");
        if (raw) {
          const userData = JSON.parse(raw);
          if (userData.user_type === "admin" || userData.user_type === "mod") {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.warn("Legend: erro ao ler userData", e);
      }
    };
    checkAdmin();
  }, []);

  const handleZoneToggle = () => {
    const next = !showZones;
    setShowZones(next);
    if (Platform.OS !== "web" && webviewRef?.current) {
      const script = `if(window.__toggleZones){ window.__toggleZones(${next}); } true;`;
      webviewRef.current.injectJavaScript(script);
    }
  };

  const handleHexagonToggle = () => {
    const next = !showHexagons;
    setShowHexagons(next);
    if (Platform.OS !== "web" && webviewRef?.current) {
      const script = `try { if(window.hexagonosLayer){ if(${next}){ window.hexagonosLayer.addTo(map); } else { window.hexagonosLayer.remove(); } } } catch(e){} true;`;
      webviewRef.current.injectJavaScript(script);
    }
  };

  // Estado Fechado (Pílula discreta)
  if (!isOpen) {
    return (
        <TouchableOpacity
            style={[styles.collapsedContainer, styles.positionFix]}
            onPress={() => setIsOpen(true)}
            activeOpacity={0.8}
        >
          <Text style={styles.collapsedText}>📊 Filtros e funcionalidades</Text>
        </TouchableOpacity>
    );
  }

  // Estado Aberto (Card completo)
  return (
      <View style={[styles.legendCard, styles.positionFix]}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Camadas</Text>
          <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO: OCORRÊNCIAS */}
        <Text style={styles.sectionTitle}>Ocorrências</Text>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: TYPE_CONFIG.Crime.color }]} />
          <Text style={styles.legendText}>Crime</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: TYPE_CONFIG.Acidente.color }]} />
          <Text style={styles.legendText}>Acidente</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: TYPE_CONFIG.Outro.color }]} />
          <Text style={styles.legendText}>Outro</Text>
        </View>

        <View style={styles.divider} />

        {/* SEÇÃO: CALOR / ZONAS */}
        <Text style={styles.sectionTitle}>Nível de Risco Aferido</Text>
        <View style={styles.legendRow}>
          <View style={[styles.square, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Baixo (Verde)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.square, { backgroundColor: "#FF9800" }]} />
          <Text style={styles.legendText}>Médio (Laranja)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.square, { backgroundColor: "#F44336" }]} />
          <Text style={styles.legendText}>Alto (Vermelho)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.square, { backgroundColor: "#8B0000" }]} />
          <Text style={styles.legendText}>Crítico (Escuro)</Text>
        </View>

        <View style={styles.divider} />

        {/* CONTROLES DE VISIBILIDADE */}
        <Text style={styles.sectionTitle}>Visibilidade</Text>

        {/* Botão de toggle de Zonas — visível para todos */}
        <TouchableOpacity
          style={[styles.visibilityBtn, { borderColor: showZones ? "#1768C6" : "#bbb" }]}
          onPress={handleZoneToggle}
          activeOpacity={0.75}
        >
          <View style={[styles.visibilityIcon, { backgroundColor: showZones ? "#EBF3FF" : "#f0f0f0" }]}>
            <Text style={{ fontSize: 14 }}>📍</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.visibilityLabel, { color: showZones ? "#1768C6" : "#999" }]}>
              Áreas Avaliáveis
            </Text>
            <Text style={styles.visibilityStatus}>
              {showZones ? "Exibindo no mapa" : "Ocultas no mapa"}
            </Text>
          </View>
          {/* Switch visual */}
          <View style={[styles.switchTrack, { backgroundColor: showZones ? "#1768C6" : "#ccc" }]}>
            <View style={[styles.switchThumb, { alignSelf: showZones ? "flex-end" : "flex-start" }]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.visibilityBtn, { borderColor: showHexagons ? "#E53935" : "#bbb", marginTop: 8 }]}
          onPress={handleHexagonToggle}
          activeOpacity={0.75}
        >
          <View style={[styles.visibilityIcon, { backgroundColor: showHexagons ? "#FFEBEE" : "#f0f0f0" }]}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.visibilityLabel, { color: showHexagons ? "#E53935" : "#999" }]}>
              Mapa de Calor
            </Text>
            <Text style={styles.visibilityStatus}>
              {showHexagons ? "Visível no mapa" : "Oculto no mapa"}
            </Text>
          </View>
          <View style={[styles.switchTrack, { backgroundColor: showHexagons ? "#E53935" : "#ccc" }]}>
            <View style={[styles.switchThumb, { alignSelf: showHexagons ? "flex-end" : "flex-start" }]} />
          </View>
        </TouchableOpacity>

        {/* FERRAMENTAS DE ZONA — somente admin/mod */}
        {Platform.OS === "web" && isAdmin && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>🛠 Ferramentas Admin</Text>
              <TouchableOpacity
                  style={[styles.drawBtn, { backgroundColor: drawingMode ? "#f44336" : "#2196F3" }]}
                  onPress={() => setDrawingMode(!drawingMode)}
              >
                <Text style={styles.drawBtnText}>{drawingMode ? "Cancelar" : "Mapear Zona"}</Text>
              </TouchableOpacity>
              {drawingMode && (
                  <TouchableOpacity style={styles.finishBtn} onPress={onFinishDrawing}>
                    <Text style={styles.drawBtnText}>Salvar Zona</Text>
                  </TouchableOpacity>
              )}
            </>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  positionFix: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 1000,
  },
  collapsedContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  collapsedText: { fontSize: 13, fontWeight: "bold", color: "#333" },

  legendCard: {
    backgroundColor: "rgba(255,255,255,0.98)",
    padding: 14,
    borderRadius: 15,
    width: 180,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  mainTitle: { fontSize: 14, fontWeight: "800", color: "#1768C6", textTransform: "uppercase" },
  closeBtn: { padding: 5, backgroundColor: "#f0f0f0", borderRadius: 12 },
  closeBtnText: { fontSize: 10, fontWeight: "bold", color: "#999" },

  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#666", marginBottom: 8, textTransform: "underline" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  square: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 12, color: "#444", fontWeight: "500" },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },

  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, borderRadius: 8, backgroundColor: "#f9f9f9" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  toggleLabel: { fontSize: 11, color: "#333", fontWeight: "700" },

  drawBtn: { paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  finishBtn: { backgroundColor: "#4CAF50", paddingVertical: 8, borderRadius: 8, alignItems: "center", marginTop: 6 },
  drawBtnText: { color: "#fff", fontWeight: "bold", fontSize: 11 },

  // Botões de visibilidade (toggle switch)
  visibilityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "#fafafa",
  },
  visibilityIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  visibilityLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  visibilityStatus: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 1,
  },
  switchTrack: {
    width: 34,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: "center",
  },
  switchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default Legend;