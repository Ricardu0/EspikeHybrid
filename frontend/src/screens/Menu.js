import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const isWeb = width > 768;

const Menu = ({ navigation }) => {
  // Lista completa de itens restaurada
  const menuItems = [
    { key: "Mapa", label: "Mapa", bgColor: "#2196F3", shadowColor: "#1976D2" },
    {
      key: "Ocorrencias",
      label: "Ocorrências",
      bgColor: "#FF9800",
      shadowColor: "#F57C00",
    },
    {
      key: "Agradecimentos",
      label: "Agradecimentos",
      bgColor: "#2196F3",
      shadowColor: "#e600ff",
    },
    {
      key: "Features",
      label: "Funcionalidades",
      bgColor: "#2196F3",
      shadowColor: "#1976D2",
    },
    {
      key: "Userterms",
      label: "Termos de Usuário",
      bgColor: "#FF9800",
      shadowColor: "#F57C00",
    },
    {
      key: "Aboutus",
      label: "Sobre Nós",
      bgColor: "#2196F3",
      shadowColor: "#1976D2",
    },
    {
      key: "Profile",
      label: "Perfil",
      bgColor: "#FF9800",
      shadowColor: "#F57C00",
    },
    {
      key: "Sair",
      label: "Sair da Conta",
      bgColor: "#f44336",
      shadowColor: "#d32f2f",
    },
  ];

  const handlePress = async (item) => {
    if (item.key === "Sair") {
      try {
        // Limpa o token de autenticação
        await AsyncStorage.removeItem("userToken");
        Alert.alert("Logout", "Você saiu da sua conta.");
        navigation.navigate("Login");
      } catch (error) {
        Alert.alert("Erro", "Não foi possível deslogar agora.");
      }
    } else if (item.key === "Mapa") {
      navigation.navigate("Initialpage");
    } else {
      navigation.navigate(item.key);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Menu Principal</Text>
          <Text style={styles.subtitle}>Escolha uma opção abaixo</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuCard,
                { backgroundColor: item.bgColor },
                styles.cardShadow,
              ]}
              onPress={() => handlePress(item)}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>{item.label}</Text>
              </View>
              <View
                style={[
                  styles.cardAccent,
                  { backgroundColor: item.shadowColor },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.decorativeBar} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: isWeb ? 40 : 20,
    paddingTop: isWeb ? 60 : 40,
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: isWeb ? 600 : "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: isWeb ? 60 : 40,
  },
  title: {
    fontSize: isWeb ? 42 : 32,
    fontWeight: "800",
    color: "#2196F3",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: isWeb ? 18 : 16,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  menuGrid: {
    justifyContent: "center",
    gap: isWeb ? 25 : 20,
  },
  menuCard: {
    height: isWeb ? 90 : 75,
    borderRadius: isWeb ? 20 : 16,
    marginBottom: isWeb ? 15 : 10,
    overflow: "hidden",
    position: "relative",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    color: "#ffffff",
    fontSize: isWeb ? 20 : 17,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  cardAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 40,
  },
  decorativeBar: {
    width: 120,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF9800",
  },
});

export default Menu;
