import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";

const { width } = Dimensions.get('window');

const isWeb = width > 768;

const Menu = ({ navigation }) => { 
  const menuItems = [
    { key: "Mapa", label: "Mapa", bgColor: "#2196F3", shadowColor: "#1976D2" },
    { key: "Ocorrencias", label: "Ocorrências", bgColor: "#FF9800", shadowColor: "#F57C00" },
    { key: "Features", label: "Funcionalidades", bgColor: "#2196F3", shadowColor: "#1976D2" },
    { key: "Userterms", label: "Termos de Usuário", bgColor: "#FF9800", shadowColor: "#F57C00" },
    { key: "Aboutus", label: "Sobre Nós", bgColor: "#2196F3", shadowColor: "#1976D2" },
    { key: "Profile", label: "Perfil", bgColor: "#FF9800", shadowColor: "#F57C00" },
    { key: "Sair", label: "Sair", bgColor: "#2196F3", shadowColor: "#1976D2" },
  ];

  const handlePress = (screenName) => {
    if (screenName === "Sair") {
      navigation.navigate('Login'); 
    } else {
      navigation.navigate(screenName);
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
              onPress={() => handlePress(item.key)}
              activeOpacity={0.9}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>{item.label}</Text>
              </View>
              <View style={[styles.cardAccent, { backgroundColor: item.shadowColor }]} />
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
    letterSpacing: 0.5,
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
    paddingHorizontal: isWeb ? 20 : 0,
  },
  menuCard: {
    height: isWeb ? 100 : 80,
    borderRadius: isWeb ? 20 : 16,
    marginBottom: isWeb ? 20 : 15,
    overflow: "hidden",
    position: "relative",
    ...(isWeb && {
      cursor: "pointer",
    }),
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: isWeb ? 6 : 4,
    },
    shadowOpacity: isWeb ? 0.2 : 0.15,
    shadowRadius: isWeb ? 12 : 8,
    elevation: isWeb ? 8 : 6,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: isWeb ? 30 : 20,
  },
  cardText: {
    color: "#ffffff",
    fontSize: isWeb ? 22 : 18,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  cardAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: isWeb ? 6 : 4,
  },
  footer: {
    alignItems: "center",
    marginTop: isWeb ? 60 : 40,
    paddingBottom: isWeb ? 40 : 20,
  },
  decorativeBar: {
    width: isWeb ? 160 : 120,
    height: isWeb ? 8 : 6,
    borderRadius: isWeb ? 4 : 3,
    backgroundColor: "#FF9800",
  },
});

export default Menu;