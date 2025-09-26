import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

// O componente recebe a propriedade 'navigation' automaticamente do React Navigation
const Aboutus = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quem Somos?</Text>
        </View>

        {/* Seção Missão */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Nossa Missão</Text>
          <Text style={styles.paragraph}>
            Nossa missão é adquirir e aplicar conhecimentos na área de 
            desenvolvimento de software, com o objetivo de criar soluções 
            tecnológicas eficientes e inovadoras. Valorizamos a aprendizagem 
            contínua e a colaboração, acreditando que a troca de ideias e 
            experiências é essencial para o crescimento pessoal e profissional.
          </Text>
        </View>

        {/* Seção Visão */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Nossa Visão</Text>
          <Text style={styles.paragraph}>
            Aspiramos a nos tornar profissionais de destaque no mercado de 
            tecnologia, reconhecidos pela qualidade e inovação dos nossos projetos. 
            Queremos contribuir para o desenvolvimento da indústria de software no 
            Brasil, ajudando a resolver problemas reais com soluções criativas e 
            eficazes.
          </Text>
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
    color: '#2196F3', // Azul principal do projeto
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
    borderBottomWidth: 2,
    borderBottomColor: '#FF9800', // Laranja do projeto
    paddingBottom: 5,
  },
  paragraph: {
    fontSize: isWeb ? 18 : 16,
    color: '#666',
    lineHeight: 26,
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

export default Aboutus;