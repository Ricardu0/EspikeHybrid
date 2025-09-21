// src/screens/Home.js
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";

const COLORS = {
  primary: "#1768C6",
  primaryDark: "#0f5aa3",
  text: "#222",
  muted: "#6b6b6b",
  bg: "#ffffff",
};

export default function Home({ navigation }) {
  const { width } = useWindowDimensions();

  // Layout: usa row (lado a lado) somente em web + largura suficiente
  const isWideWeb = Platform.OS === "web" && width >= 760;
  const layoutRow = isWideWeb;

  // image sizing (limita para evitar overflow)
  const imageMaxWidth = layoutRow ? Math.min(360, width * 0.35) : Math.min(260, width * 0.6);
  const imageMaxHeight = imageMaxWidth * 0.7;

  // button width
  const buttonWidth = layoutRow ? 220 : Math.min(360, width * 0.85);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.wrapper, layoutRow ? styles.row : styles.column]}>
          {/* LOGO */}
          <View style={[styles.logoWrap, layoutRow ? styles.logoWrapRow : styles.logoWrapColumn]}>
            <Image
              source={require("../imgs/logo1.jpg")}
              style={[
                styles.logo,
                { width: imageMaxWidth, height: imageMaxHeight },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* TEXT + BUTTONS */}
          <View style={[styles.content, layoutRow ? styles.contentRow : styles.contentColumn]}>
            <Text style={[styles.title, layoutRow ? styles.titleRow : styles.titleColumn]}>
              Seja bem-vindo{"\n"}ao E-Spike!
            </Text>

            <TouchableOpacity
              style={[styles.button, { width: buttonWidth }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.buttonText}>Cadastre-se</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { width: buttonWidth, marginTop: 12 },
              ]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 — Todos os direitos reservados</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },

  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapRow: {
    flex: 0.45,
    paddingRight: 24,
  },
  logoWrapColumn: {
    width: "100%",
    marginBottom: 18,
  },

  logo: {
    borderRadius: 12,
    // shadow no web/android varia; deixamos simples
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flex: 0.55,
    alignItems: "flex-start",
  },
  contentColumn: {
    width: "100%",
    alignItems: "center",
  },

  title: {
    color: COLORS.text,
    fontWeight: "800",
    marginBottom: 18,
  },
  titleRow: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: "left",
  },
  titleColumn: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },

  footer: {
    marginTop: 28,
    alignItems: "center",
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
