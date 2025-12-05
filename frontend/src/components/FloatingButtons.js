import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";

const FloatingButtons = ({ 
  navigation, 
  onAddOccurrence, 
  drawingMode, 
  setDrawingMode, 
  navigateToChatbot 
}) => {
  return (
    <>
      {/* Botão do Chatbot */}
      <TouchableOpacity 
        style={styles.chatbotButton}
        onPress={navigateToChatbot}
        accessibilityLabel="Abrir assistente de IA"
      >
        <Text style={styles.chatbotButtonText}>🤖</Text>
      </TouchableOpacity>

      {/* Botão para adicionar ocorrência */}
      <TouchableOpacity 
        style={styles.addOccurrenceButton} 
        onPress={onAddOccurrence}
      >
        <Text style={styles.addOccurrenceButtonText}>＋</Text>
      </TouchableOpacity>

      {/* Botão para modo desenho (apenas web) */}
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
    </>
  );
};

const styles = StyleSheet.create({
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
    position: "absolute", 
    bottom: 24, 
    right: 24, 
    backgroundColor: "#006eff", 
    width: 56, 
    height: 56, 
    borderRadius: 28,
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 6, 
    shadowColor: "#000", 
    shadowOpacity: 0.12, 
    shadowRadius: 6,
  },
  addOccurrenceButtonText: { 
    color: "#fff", 
    fontSize: 28, 
    lineHeight: 28 
  },
  drawingButton: {
    position: "absolute", 
    bottom: 90, 
    right: 24, 
    width: 56, 
    height: 56, 
    borderRadius: 28,
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 6, 
    shadowColor: "#000", 
    shadowOpacity: 0.12, 
    shadowRadius: 6,
  },
  drawingButtonText: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "bold" 
  },
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
  menuButtonLeftText: { 
    color: "#fff", 
    fontSize: 26, 
    fontWeight: "700" 
  },
});

export default FloatingButtons;