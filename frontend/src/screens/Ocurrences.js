import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const COLORS = {
  primary: "#1768C6",
  bg: "#fff",
  text: "#222",
  muted: "#6b6b6b",
};

export default function Occurrences({ navigation }) {
  const [occurrences, setOccurrences] = useState([
    { id: "1", title: "Acidente leve", location: "Rua A, Centro" },
    { id: "2", title: "Alagamento", location: "Av. Principal, 300" },
  ]);

  const handleAddOccurrence = () => {
    // aqui no futuro você pode puxar localização real
    const newOccurrence = {
      id: String(Date.now()),
      title: "Novo relato",
      location: "Localização atual (mock)",
    };
    setOccurrences((prev) => [newOccurrence, ...prev]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ocorrências por proximidade</Text>

      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardLocation}>{item.location}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.85}
        onPress={handleAddOccurrence}
      >
        <Text style={styles.addButtonText}>+ Nova Ocorrência</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: COLORS.text },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: "700", fontSize: 16, color: COLORS.text },
  cardLocation: { fontSize: 14, color: COLORS.muted },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 12,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
