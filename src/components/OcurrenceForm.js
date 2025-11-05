import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const OccurrenceForm = ({
  visible,
  onClose,
  occurrenceData,
  setOccurrenceData,
  onSubmit
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.formModal}>
          <Text style={styles.formTitle}>Registrar Ocorrência</Text>
          
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.row}>
            {["Crime","Acidente","Outro"].map(t => (
              <TouchableOpacity 
                key={t} 
                style={[styles.typeButton, occurrenceData.type===t && styles.typeButtonActive]} 
                onPress={() => setOccurrenceData({...occurrenceData, type: t})}
              >
                <Text style={[styles.typeButtonText, occurrenceData.type===t && styles.typeButtonTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 8 }]}>Descrição</Text>
          <TextInput 
            style={[styles.textInput, { height: 80 }]} 
            placeholder="Descreva o que aconteceu" 
            multiline 
            value={occurrenceData.description} 
            onChangeText={t => setOccurrenceData({...occurrenceData, description: t})} 
          />

          {occurrenceData.coord ? (
            <Text style={styles.hint}>
              Local selecionado: {occurrenceData.coord.lat.toFixed(5)}, {occurrenceData.coord.lng.toFixed(5)}
            </Text>
          ) : (
            <Text style={styles.hint}>
              Clique no mapa para escolher o local (ou deixe em branco)
            </Text>
          )}

          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]} 
              onPress={onSubmit}
            >
              <Text style={styles.actionButtonText}>Registrar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: "#f44336", marginLeft: 8 }]} 
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  typeButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    marginRight: 8, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: "#eee", 
    backgroundColor: "#fff" 
  },
  typeButtonActive: { 
    backgroundColor: "#111", 
    borderColor: "#111" 
  },
  typeButtonText: { 
    color: "#111", 
    fontWeight: "700" 
  },
  typeButtonTextActive: { 
    color: "#fff" 
  },
  hint: { 
    fontSize: 12, 
    color: "#666", 
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
});

export default OccurrenceForm;