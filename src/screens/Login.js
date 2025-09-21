import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation(); // Hook para navegação

  const handleLogin = () => {
    // Validação básica
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    // Aqui você pode adicionar a lógica de autenticação
    // Por enquanto, vamos navegar direto para o Initialpage
    navigation.navigate("Initialpage");
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Seja bem vindo de volta!</Text>
        <Text style={styles.subtitle}>Coloque seu email e senha abaixo</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Botão de voltar para Home */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Initialpage")}
        >
          <Text style={styles.backButtonText}>Voltar para Home</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© 2024 - Todos os direitos reservados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", backgroundColor: "white", padding: 20 },
  loginContainer: { flex: 1, justifyContent: "center", maxWidth: 400, alignSelf: "center", width: "100%" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  backButton: { marginTop: 15, alignItems: "center" },
  backButtonText: { color: "#007bff" },
  footer: { textAlign: "center", paddingVertical: 20, fontSize: 12, color: "#999" },

});