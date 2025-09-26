import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const Features = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Conheça nosso aplicativo</Text>
        </View>

        {/* Seção Como Funciona */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Como funciona?</Text>
          <Text style={styles.paragraph}>
            O aplicativo oferece diversas funcionalidades para auxiliar na sua segurança:
          </Text>
        </View>

        {/* Lista de Funcionalidades */}
        <View style={styles.featuresList}>
          {/* Item 1 */}
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>1. Mapa Interativo</Text>
            <Text style={styles.featureDescription}>
              Visualize áreas de maior e menor risco em tempo real.
            </Text>
          </View>

          {/* Item 2 */}
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>2. Botão de Alerta</Text>
            <Text style={styles.featureDescription}>
              Notifique situações de perigo ou que causem transtornos.
            </Text>
          </View>

          {/* Item 3 */}
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>3. Criação de Ocorrências (Moderadores)</Text>
            <Text style={styles.featureDescription}>
              Registre eventos de forma detalhada e com cautela nas informações.
            </Text>
          </View>
        </View>
        
        {/* Botão para voltar ao Menu */}
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
    backgroundColor: '#ffffff',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: isWeb ? 60 : 40,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: isWeb ? 42 : 32,
    fontWeight: '800',
    color: '#2196F3',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  subtitle: {
    fontSize: isWeb ? 24 : 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: isWeb ? 18 : 16,
    color: '#666',
    lineHeight: 26,
  },
  featuresList: {
    marginTop: 10,
  },
  featureItem: {
    marginBottom: 25,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  featureTitle: {
    fontSize: isWeb ? 20 : 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: isWeb ? 17 : 15,
    color: '#555',
    lineHeight: 24,
  },
  backButton: {
    marginTop: 40,
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default Features; 
