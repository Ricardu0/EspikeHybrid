import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../services/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Novo estado para o erro visual
  const navigation = useNavigation();

  const handleLogin = async () => {
    // Limpa qualquer erro anterior assim que o usuário clica de novo
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await apiService.post("/auth/login", {
        email,
        password,
      });

      if (response && response.token) {
        await AsyncStorage.setItem("userToken", response.token);
        // Em caso de sucesso, vamos direto para a página inicial
        navigation.navigate("Initialpage");
      } else {
        setErrorMessage("Falha na autenticação. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      // Aqui disparamos a mensagem que o usuário vai ver na tela
      setErrorMessage(
        "E-mail ou senha incorretos. Verifique seus dados e tente novamente.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Seja bem vindo de volta!</Text>
        <Text style={styles.subtitle}>Coloque seu email e senha abaixo</Text>

        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(""); // Tira o erro quando a pessoa começa a digitar de novo
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder="Senha"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(""); // Tira o erro quando a pessoa começa a digitar de novo
          }}
          secureTextEntry
        />

        {/* Bloco condicional que exibe a mensagem vermelha na tela */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Botão de cadastro */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerButtonText}>
            Não tem uma conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>© 2024 - Todos os direitos reservados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  // Novo estilo: muda a cor da borda se der erro
  inputError: {
    borderColor: "#d32f2f",
  },
  // Novo estilo: o texto da mensagem de alerta na tela
  errorText: {
    color: "#d32f2f", // Um tom de vermelho profissional (Material Design)
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registerButton: { marginTop: 20, alignItems: "center" },
  registerButtonText: { color: "#007bff", fontWeight: "600" },
  footer: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 12,
    color: "#999",
  },
});
