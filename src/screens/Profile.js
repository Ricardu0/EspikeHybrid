import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const Profile = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = () => {
    // Lógica de atualização (será implementada no futuro)
    console.log("Tentativa de atualização dos dados:", { name, email, phone });
    alert("Funcionalidade de troca de dados a ser implementada!");
  };

  const handleDelete = () => {
    // Lógica de deleção (será implementada no futuro)
    console.log("Tentativa de deletar a conta:", email);
    alert("Funcionalidade de deleção de conta a ser implementada!");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Alterar Informações</Text>
          <Text style={styles.subtitle}>
            Lembre-se de colocar o email quando for fazer alterações na sua conta!
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Nova Senha"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry // Esconde a senha
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar Nova Senha"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry // Esconde a senha
          />
        </View>
        
        {/* Botões de Ação */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleUpdate} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Trocar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Deletar</Text>
          </TouchableOpacity>
        </View>

        {/* Botão para voltar */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Voltar ao Menu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: isWeb ? 50 : 30,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: isWeb ? 38 : 30,
    fontWeight: '800',
    color: '#2196F3', // Azul principal
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isWeb ? 17 : 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: '80%',
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#FF9800', // Laranja principal
    borderRadius: 25,
    paddingVertical: 15,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#f44336', // Um tom de vermelho para a ação de deletar
    borderRadius: 25,
    paddingVertical: 15,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 50,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default Profile;