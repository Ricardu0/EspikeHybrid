# 📋 Documentação - Initialpage Component

## �� Visão Geral

O componente `Initialpage` é uma tela principal que implementa um **mapa interativo** para visualização e registro de ocorrências de segurança. É um componente React Native que funciona tanto em **Web** (usando React Leaflet) quanto em **Mobile** (usando WebView com Leaflet).

## 🚀 Funcionalidades Principais

- 🗺️ **Mapa Interativo** com marcadores de ocorrências
- �� **Sistema de Registro** de novas ocorrências
- 🎯 **Zonas de Risco** com círculos coloridos
- 📱 **Multiplataforma** (Web + Mobile)
- 🎨 **Interface Moderna** com controles flutuantes
- �� **Sincronização** entre WebView e React Native

## 📊 Estrutura de Dados

### Tipos de Ocorrência
```typescript
const TYPE_CONFIG = {
  Crime: { color: "#ff4444", weight: 3 },      // 🔴 Vermelho - Peso 3
  Acidente: { color: "#ffaa00", weight: 2 },   // �� Laranja - Peso 2  
  Outro: { color: "#44aa44", weight: 1 },      // 🟢 Verde - Peso 1
};
```

### Estados do Componente
```typescript
// Formulário de ocorrência
const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);

// Marcador selecionado
const [selectedMarker, setSelectedMarker] = useState(null);

// Toggle zonas de risco
const [showZones, setShowZones] = useState(true);

// Dados do formulário
const [occurrenceData, setOccurrenceData] = useState({
  description: "",
  type: "Crime",
  coord: null
});

// Lista de marcadores
const [markers, setMarkers] = useState([...]);
```

## 🏗️ Arquitetura

### Web (React Leaflet)
```jsx
<MapContainer center={[lat, lng]} zoom={14}>
  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
  <MapClickHandler onMapClick={handleMapClick} />
  {markers.map(marker => (
    <Marker key={marker.id} position={[lat, lng]} icon={customIcon}>
      <Popup>{marker.description}</Popup>
    </Marker>
  ))}
</MapContainer>
```

### Mobile (WebView)
```jsx
<WebView
  ref={webviewRef}
  source={{ html: generateWebViewHtml({ markers, userLocation }) }}
  onMessage={handleWebViewMessage}
/>
```

## 🎨 Sistema de Marcadores

### Ícones Personalizados
- **Pontos coloridos** baseados no tipo de ocorrência
- **Animação de pulso** para chamar atenção
- **Tamanho**: 24x24px com âncora centralizada
- **Classes CSS**: `.dot-crime`, `.dot-acidente`, `.dot-outro`

### Zonas de Risco
```typescript
// Cálculo do raio baseado no peso
const radiusForType = (type) => {
  const weight = TYPE_CONFIG[type]?.weight || 1;
  return 120 * weight; // 120m × peso (1-3)
};
```

## 📝 Formulário de Ocorrência

### Campos
- **Tipo**: Seleção entre Crime, Acidente, Outro
- **Descrição**: Campo multilinha obrigatório
- **Localização**: Coordenadas do clique no mapa (opcional)

### Validações
- ✅ Descrição obrigatória
- ✅ Coordenadas automáticas se não fornecidas
- ✅ Feedback visual para campos obrigatórios

## 🎛️ Interface de Usuário

### Controles Flutuantes
- **➕ Botão Adicionar** (inferior direito): Abre formulário
- **☰ Botão Menu** (inferior esquerdo): Navega para menu

### Legenda
- **Cores dos tipos** de ocorrência
- **Toggle zonas** de risco
- **Posicionamento** responsivo

## �� Funções Principais

### `openOccurrenceFormWithCoord(latlng)`
Abre formulário com coordenadas pré-selecionadas.

### `submitOccurrence()`
Processa nova ocorrência:
1. Valida dados obrigatórios
2. Gera coordenadas se necessário
3. Adiciona marcador ao estado
4. Sincroniza com WebView (mobile)
5. Mostra feedback de sucesso

### `generateWebViewHtml({ markers, userLocation })`
Gera HTML completo para WebView:
- Configuração do mapa Leaflet
- Marcadores e círculos existentes
- Handlers de clique e comunicação
- Estilos CSS inline

## 🎨 Estilos CSS

### Animação de Pulso
```css
.pulse {
  animation: pulse 1.4s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
  70% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; }
  100% { opacity: 0; }
}
```

### Marcadores Customizados
```css
.custom-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.06);
}
```

## 📦 Dependências

### Principais
- `react-native` - Framework base
- `react-native-webview` - Para mobile
- `react-leaflet` - Para web
- `leaflet` - Biblioteca de mapas

### Estilos
- `leaflet/dist/leaflet.css` - Estilos base

## �� Como Usar

```tsx
import Initialpage from './Initialpage';

// Em um navigator do React Navigation
<Stack.Screen 
  name="Initialpage" 
  component={Initialpage} 
  options={{ title: 'Mapa de Ocorrências' }}
/>
```

## ⚡ Performance

1. **Lazy Loading**: Leaflet carregado apenas no web
2. **WebView Otimizada**: HTML gerado dinamicamente
3. **Estados Locais**: Gerenciamento eficiente
4. **Renderização Condicional**: Componentes por plataforma

## ♿ Acessibilidade

- Labels de acessibilidade nos botões
- Suporte a leitores de tela
- Contraste adequado nas cores
- Tamanhos de toque apropriados (56px mínimo)

## ⚠️ Limitações

1. **WebView Mobile**: Performance varia entre dispositivos
2. **Coordenadas**: Localização fixa de São Paulo como padrão
3. **Persistência**: Dados não persistem entre sessões
4. **Offline**: Requer conexão para tiles do mapa

## �� Melhorias Futuras

- [ ] Persistência com AsyncStorage
- [ ] Geolocalização real do usuário
- [ ] Filtros por tipo de ocorrência
- [ ] Busca por localização
- [ ] Modo offline com tiles locais
- [ ] Notificações push

## 📋 Exemplo de Uso Completo

```tsx
// Exemplo de como integrar o componente
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Initialpage" 
          component={Initialpage}
          options={{ 
            title: 'Mapa de Ocorrências',
            headerStyle: { backgroundColor: '#006eff' },
            headerTintColor: '#fff'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```
**📝 Nota**: Esta documentação cobre todas as funcionalidades principais do componente. Para implementações específicas ou dúvidas sobre integração, consulte a seção de uso ou as funções auxiliares detalhadas.
---