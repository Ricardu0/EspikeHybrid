import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

// Estrutura de dados para armazenar o conteúdo de cada página
const termsData = [
  {
    page: 1,
    content: [
      { title: 'Aceitação dos Termos', text: 'Ao acessar e usar este serviço, você confirma que leu, entendeu e concorda em estar vinculado por estes Termos de Uso.' },
      { title: 'Alterações nos Termos', text: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Sua decisão de continuar a visitar e usar o serviço após tais alterações constitui sua aceitação das novas condições.' },
      { title: 'Privacidade e Proteção de Dados Pessoais', text: 'Respeitamos a privacidade dos nossos usuários. Qualquer informação pessoal coletada é tratada em conformidade com a LGPD.' },
      { title: 'Comunicações', text: 'Ao criar uma conta conosco, você concorda em receber comunicações eletrônicas de nossa parte, incluindo e-mails, mensagens de texto, chamadas e notificações push.' },
      { title: 'Uso do Serviço', text: 'Você concorda em usar o serviço apenas para fins legais e de maneira que não infrinja os direitos de terceiros ou restrinja o uso do serviço por qualquer terceiro.' },
    ],
  },
  {
    page: 2,
    content: [
      { title: 'Conteúdo do Usuário', text: 'Você é responsável por todo o conteúdo que transmite ou carrega no serviço e afirma possuir todos os direitos necessários para tal conteúdo.' },
      { title: 'Conduta do Usuário', text: 'Você concorda em não usar o serviço para enviar ou disponibilizar qualquer material que seja ilegal, prejudicial, ameaçador, abusivo, assediante, difamatório, vulgar, obsceno, invasivo da privacidade de outro ou de outra forma censurável.' },
      { title: 'Direitos Autorais e Propriedade Intelectual', text: 'O serviço e seus conteúdos originais, características e funcionalidades são e permanecerão de propriedade exclusiva dos proprietários do serviço e seus licenciadores.' },
      { title: 'Terminação', text: 'Reservamo-nos o direito de encerrar ou suspender seu acesso ao serviço, sem aviso prévio, por qualquer motivo, incluindo violação dos Termos.' },
    ],
  },
  {
    page: 3,
    content: [
      { title: 'Isenção de Garantias', text: 'O serviço é fornecido \'como está\' e \'conforme disponível\' e não garantimos que o serviço será ininterrupto ou livre de erros.' },
      { title: 'Limitação de Responsabilidade', text: 'Em nenhum caso, o serviço ou seus diretores, funcionários ou agentes serão responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu uso ou incapacidade de usar o serviço.' },
      { title: 'Lei Aplicável', text: 'Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar o conflito de disposições legais.' },
      { title: 'Alterações', text: 'Reservamo-nos o direito de alterar ou substituir estes Termos a qualquer momento. Se uma revisão for material, forneceremos um aviso com pelo menos 30 dias de antecedência antes que os novos termos entrem em vigor.' },
      { title: 'Contato', text: 'Para quaisquer questões ou dúvidas sobre estes Termos, entre em contato conosco, presencialmente.' },
    ],
  },
];

const { width } = Dimensions.get('window');
const isWeb = width > 768;

const Userterms = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = termsData.length;
  const currentContent = termsData.find(item => item.page === currentPage)?.content || [];

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationNav, currentPage === 1 && styles.paginationDisabled]}
        disabled={currentPage === 1}
        onPress={() => setCurrentPage(currentPage - 1)}
      >
        <Text style={styles.paginationNavText}>Anterior</Text>
      </TouchableOpacity>

      {termsData.map(item => (
        <TouchableOpacity
          key={item.page}
          style={[styles.pageButton, currentPage === item.page && styles.activePageButton]}
          onPress={() => setCurrentPage(item.page)}
        >
          <Text style={[styles.pageButtonText, currentPage === item.page && styles.activePageButtonText]}>
            {item.page}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.paginationNav, currentPage === totalPages && styles.paginationDisabled]}
        disabled={currentPage === totalPages}
        onPress={() => setCurrentPage(currentPage + 1)}
      >
        <Text style={styles.paginationNavText}>Próxima</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Termos de Usuário</Text>
          <Text style={styles.pageIndicator}>Página {currentPage} de {totalPages}</Text>
        </View>

        {currentContent.map((item, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.subtitle}>{item.title}</Text>
            <Text style={styles.paragraph}>{item.text}</Text>
          </View>
        ))}
        
        {renderPagination()}

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

// Estilos (reaproveitando o que já fizemos e adicionando novos)
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
  pageIndicator: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginBottom: 25,
  },
  subtitle: {
    fontSize: isWeb ? 22 : 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: isWeb ? 17 : 15,
    color: '#555',
    lineHeight: 25,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  paginationNav: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  paginationNavText: {
    fontSize: 16,
    color: '#333',
  },
  paginationDisabled: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activePageButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  pageButtonText: {
    fontSize: 16,
    color: '#333',
  },
  activePageButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Userterms;