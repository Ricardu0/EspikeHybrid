import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const isWeb = width > 768;

const team = [
  { name: "Kelvyn Hesley", role: "Desenvolvedor Principal" },
  { name: "Ricardo Fontes", role: "Desenvolvedor Principal" },
  { name: "Paulo", role: "Membro - Canarinho" },
  { name: "Carol", role: "Ex Membro do Time" },
  { name: "Gilson", role: "Ex Membro do Time - Mano Gilson" },
  { name: "Felipe Dionizio", role: "Membro do Time - " },
  { name: "Raul", role: "Ex Membro do Time" },
  { name: "Filipe Messias", role: "Ex Membro do Time" },
  { name: "Pedro", role: "Ex   Membro do Time" },
  { name: "Hellen", role: "Membro do Time" },
];

const Agradecimentos = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Agradecimentos</Text>
          <Text style={styles.subtitle}>
            Este projeto não existiria sem o esforço e dedicação de cada um
            abaixo. Obrigado por fazer parte do E-Spike.
          </Text>
        </View>

        <View style={styles.grid}>
          {team.map((member, index) => (
            <View
              key={index}
              style={[
                styles.card,
                { borderLeftColor: index % 2 === 0 ? "#2196F3" : "#FF9800" },
              ]}
            >
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.closing}>
          Obrigado a todos que contribuíram, direta ou indiretamente, para
          tornar este projeto realidade.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: isWeb ? 60 : 40,
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: isWeb ? 42 : 32,
    fontWeight: "800",
    color: "#2196F3",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: isWeb ? 17 : 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "85%",
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  memberName: {
    fontSize: isWeb ? 18 : 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  memberRole: {
    fontSize: isWeb ? 14 : 13,
    color: "#888",
    fontWeight: "500",
  },
  closing: {
    marginTop: 36,
    fontSize: isWeb ? 16 : 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  backButton: {
    marginTop: 40,
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Agradecimentos;
