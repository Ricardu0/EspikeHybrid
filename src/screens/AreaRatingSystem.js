import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

// --- Helper: get color based on rating ---
export const getRatingColor = (rating) => {
  if (rating >= 4) return "#4CAF50"; // Verde
  if (rating >= 3) return "#FFC107"; // Amarelo
  if (rating >= 2) return "#FF9800"; // Laranja
  return "#F44336"; // Vermelho
};

// Componente de input de avaliação com estrelas
export const RatingInput = ({ label, value, onChange }) => (
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

// Modal principal de avaliação
const AreaRatingModal = ({ visible, area, onUpdate, onClose }) => {
  const [areaRatingData, setAreaRatingData] = useState({
    overall: 0,
    risk: 0,
    lighting: 0,
    infrastructure: 0,
    policing: 0,
    comments: ""
  });

  const submitAreaRating = () => {
    if (!areaRatingData.overall) {
      Alert.alert("Erro", "Avaliação geral é obrigatória");
      return;
    }

    onUpdate(areaRatingData);
    onClose();
    Alert.alert("Sucesso", "Avaliação registrada!");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.formModal}>
          <Text style={styles.formTitle}>Avaliar Área</Text>
          {area && <Text style={styles.subTitle}>{area.name}</Text>}
          
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
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#f44336", marginLeft: 8 }]} onPress={onClose}>
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook para gerenciar o estado das áreas
export const useAreaRating = (initialAreas = []) => {
  const [areas, setAreas] = useState(initialAreas);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setShowAreaForm(true);
  };

  const updateAreaRating = (areaId, newRatings) => {
    setAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { ...area, ratings: newRatings }
        : area
    ));
  };

  const addNewArea = (newArea) => {
    setAreas(prev => [...prev, newArea]);
  };

  return {
    areas,
    showAreaForm,
    selectedArea,
    setShowAreaForm,
    setSelectedArea,
    handleAreaClick,
    updateAreaRating,
    addNewArea
  };
};

// Componente principal exportado
const AreaRatingSystem = ({ 
  visible, 
  area, 
  onUpdate, 
  onClose 
}) => {
  return (
    <AreaRatingModal 
      visible={visible}
      area={area}
      onUpdate={onUpdate}
      onClose={onClose}
    />
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.35)", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 16 
  },
  formModal: { 
    width: "100%", 
    maxWidth: 540, 
    maxHeight: "80%", 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 16, 
    elevation: 8 
  },
  formTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 8 
  },
  subTitle: { 
    fontSize: 16, 
    color: "#666", 
    marginBottom: 12 
  },
  label: { 
    fontWeight: "700", 
    marginBottom: 6 
  },
  textInput: { 
    borderWidth: 1, 
    borderColor: "#e6e6e6", 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: "#fafafa", 
    textAlignVertical: "top" 
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12 
  },
  actionButton: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  actionButtonText: { 
    color: "#fff", 
    fontWeight: "700" 
  },
  ratingContainer: { 
    maxHeight: 300, 
    marginBottom: 12 
  },
  ratingRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 12 
  },
  ratingLabel: { 
    flex: 2, 
    fontSize: 14, 
    fontWeight: "600" 
  },
  starsContainer: { 
    flex: 3, 
    flexDirection: "row", 
    justifyContent: "center" 
  },
  starButton: { 
    padding: 4 
  },
  star: { 
    fontSize: 24, 
    color: "#ddd" 
  },
  starSelected: { 
    color: "#FFD700" 
  },
  ratingValue: { 
    flex: 1, 
    textAlign: "right", 
    fontSize: 14, 
    fontWeight: "600" 
  },
});

export default AreaRatingSystem;