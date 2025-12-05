import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

export default function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    user_type: "user",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [errors, setErrors] = useState({});

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
      newErrors.terms = "Você precisa aceitar os termos de uso";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = () => {
    if (validateForm()) {
      Alert.alert("Sucesso", "Usuário registrado (mock)");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Insira os seus dados {"\n"} nos campos abaixo:</Text>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={user.email}
        onChangeText={(text) => setUser({ ...user, email: text })}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={user.phone}
        onChangeText={(text) => setUser({ ...user, phone: text })}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={user.cpf}
        onChangeText={(text) => setUser({ ...user, cpf: text })}
      />
      {errors.cpf && <Text style={styles.error}>{errors.cpf}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={user.password}
        onChangeText={(text) => setUser({ ...user, password: text })}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

      {/* Termos */}
      <TouchableOpacity onPress={() => setAceitouTermos(!aceitouTermos)}>
        <Text style={[styles.checkbox, aceitouTermos && styles.checked]}>
          {aceitouTermos ? "☑" : "☐"} Aceito os termos de uso (obrigatório)
        </Text>
      </TouchableOpacity>
      {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

      {/* Botão */}
      <TouchableOpacity
        style={[styles.button, (!aceitouTermos) && styles.disabled]}
        onPress={handleRegister}
        disabled={!aceitouTermos}
      >
        <Text style={styles.buttonText}>Avançar</Text>
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
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 5,
    borderRadius: 8,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  checkbox: {
    marginTop: 10,
    color: "red",
  },
  checked: {
    color: "green",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  disabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    color: "#666",
  },
});
