import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../services/apiService";

export default function Register() {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    user_type: "user",
    adminCode: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" }); // Estado para mensagens de feedback

  // Função para limpar mensagens e erros ao digitar
  const updateField = (field, value) => {
    setUser({ ...user, [field]: value });
    setErrors({ ...errors, [field]: null });
    setStatusMessage({ text: "", type: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    let valid = true;

    if (!user.name) {
      newErrors.name = "Nome é obrigatório";
      valid = false;
    }
    if (!user.email) {
      newErrors.email = "Email é obrigatório";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "Email inválido";
      valid = false;
    }
    if (!user.phone) {
      newErrors.phone = "Telefone é obrigatório";
      valid = false;
    }
    if (!user.cpf) {
      newErrors.cpf = "CPF é obrigatório";
      valid = false;
    }
    if (!user.password) {
      newErrors.password = "Senha é obrigatória";
      valid = false;
    } else if (user.password.length < 8) {
      newErrors.password = "A senha deve ter pelo menos 8 caracteres";
      valid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
      valid = false;
    } else if (user.password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      valid = false;
    }
    if (!aceitouTermos) {
      newErrors.terms = "Você precisa aceitar os termos";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    setStatusMessage({ text: "", type: "" });

    if (validateForm()) {
      try {
        await apiService.post("/auth/register", user);

        // Feedback de Sucesso
        setStatusMessage({
          text: "Conta criada com sucesso! Redirecionando...",
          type: "success",
        });

        // Pequeno atraso para o usuário ler a mensagem antes de mudar de tela
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } catch (error) {
        console.error("Erro no registro:", error);

        // Feedback de Erro
        const msg = error.message.includes("409")
          ? "Este e-mail já está em uso."
          : "Não foi possível registrar. Tente novamente mais tarde.";

        setStatusMessage({ text: msg, type: "error" });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Insira os seus dados {"\n"} nos campos abaixo:
      </Text>

      {/* Nome */}
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Nome"
        value={user.name}
        onChangeText={(text) => updateField("name", text)}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      {/* Email */}
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Email"
        value={user.email}
        onChangeText={(text) => updateField("email", text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Telefone */}
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={user.phone}
        onChangeText={(text) => updateField("phone", text)}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      {/* CPF */}
      <TextInput
        style={[styles.input, errors.cpf && styles.inputError]}
        placeholder="CPF"
        value={user.cpf}
        onChangeText={(text) => updateField("cpf", text)}
        keyboardType="numeric"
      />
      {errors.cpf && <Text style={styles.error}>{errors.cpf}</Text>}

      {/* Senha */}
      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Senha"
        secureTextEntry
        value={user.password}
        onChangeText={(text) => updateField("password", text)}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {/* Confirmar Senha */}
      <TextInput
        style={[styles.input, errors.confirmPassword && styles.inputError]}
        placeholder="Confirmar Senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setStatusMessage({ text: "", type: "" });
        }}
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword}</Text>
      )}

      {/* Código de Administrador */}
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Código Admin (Opcional)"
        value={user.adminCode}
        onChangeText={(text) => updateField("adminCode", text)}
      />

      {/* Checkbox de Termos */}
      <TouchableOpacity
        onPress={() => {
          setAceitouTermos(!aceitouTermos);
          setStatusMessage({ text: "", type: "" });
        }}
      >
        <Text style={[styles.checkbox, aceitouTermos && styles.checked]}>
          {aceitouTermos ? "☑" : "☐"} Aceito os termos de uso (obrigatório)
        </Text>
      </TouchableOpacity>
      {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

      {/* Mensagem de Feedback (Sucesso ou Erro) */}
      {statusMessage.text ? (
        <Text
          style={[
            styles.statusText,
            statusMessage.type === "success"
              ? styles.successText
              : styles.errorText,
          ]}
        >
          {statusMessage.text}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, !aceitouTermos && styles.disabled]}
        onPress={handleRegister}
        disabled={!aceitouTermos}
      >
        <Text style={styles.buttonText}>Avançar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginLinkText}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>© 2024 - Todos os direitos reservados</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 5,
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  inputError: { borderColor: "#d32f2f" },
  error: { color: "#d32f2f", marginBottom: 10, fontSize: 12 },
  checkbox: { marginTop: 10, color: "#d32f2f" },
  checked: { color: "#2e7d32" },
  statusText: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
    fontSize: 14,
  },
  errorText: { color: "#d32f2f" },
  successText: { color: "#2e7d32" },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  disabled: { backgroundColor: "#aaa" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loginLink: { marginTop: 20, alignItems: "center" },
  loginLinkText: { color: "#007bff", fontWeight: "600" },
  footer: { marginTop: 30, textAlign: "center", color: "#999", fontSize: 12 },
});
