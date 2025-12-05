# �� Guia da Lógica - Initialpage Component

## 📋 Visão Geral da Lógica

O `Initialpage` implementa um **sistema de mapa interativo** com funcionalidades de registro de ocorrências. A lógica principal gira em torno de:

1. **Renderização condicional** Web vs Mobile
2. **Gerenciamento de estado** para ocorrências
3. **Comunicação bidirecional** entre React Native e WebView
4. **Sistema de marcadores** com animações
5. **Formulários modais** para registro

## 🔄 Fluxo Principal da Aplicação

### **1. Inicialização**
```typescript
// Estados iniciais
const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
const [selectedMarker, setSelectedMarker] = useState(null);
const [showZones, setShowZones] = useState(true);
const [occurrenceData, setOccurrenceData] = useState({
  description: "",
  type: "Crime",
  coord: null
});
const [markers, setMarkers] = useState([...]); // Dados hardcoded
```

### **2. Detecção de Plataforma**
```typescript
// Lógica condicional Web vs Mobile
if (Platform.OS === "web") {
  // Usa React Leaflet
  return <WebMapComponent />;
} else {
  // Usa WebView com Leaflet
  return <MobileMapComponent />;
}
```

### **3. Sistema de Marcadores**

#### **Configuração de Tipos**
```typescript
const TYPE_CONFIG = {
  Crime: { color: "#ff4444", weight: 3 },      // Vermelho - Peso 3
  Acidente: { color: "#ffaa00", weight: 2 },   // Laranja - Peso 2
  Outro: { color: "#44aa44", weight: 1 },      // Verde - Peso 1
};
```

#### **Criação de Ícones Personalizados**
```typescript
// Para Web (React Leaflet)
const icon = L.divIcon({
  className: "marker-wrapper",
  html: `
    <div class="custom-dot ${typeClass}"></div>
    <div class="pulse"></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Para Mobile (WebView)
const iconHtml = `
  <div class="custom-dot ${typeClass}" style="color:${color}"></div>
  <div class="pulse" style="color:${color}"></div>
`;
```

#### **Zonas de Risco (Círculos)**
```typescript
// Cálculo do raio baseado no peso do tipo
const radiusForType = (type) => {
  const weight = TYPE_CONFIG[type]?.weight || 1;
  return 120 * weight; // 120m × peso (1-3)
};

// Estilo dos círculos
const circleStyle = (type) => {
  const cfg = TYPE_CONFIG[type] || { color: "#999", weight: 1 };
  return {
    color: cfg.color,
    fillColor: cfg.color,
    fillOpacity: 0.12,
    weight: 0
  };
};
```

## �� Lógica de Interação

### **1. Clique no Mapa**

#### **Web (React Leaflet)**
```typescript
// Componente para capturar cliques
const MapClickHandler = ({ onMapClick }) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) { 
        onMapClick(e.latlng); 
      },
    });
    return null;
  };
  return <MapEvents />;
};

// Uso no mapa
<MapClickHandler 
  onMapClick={(latlng) => 
    openOccurrenceFormWithCoord({ 
      lat: latlng.lat, 
      lng: latlng.lng 
    })
  } 
/>
```

#### **Mobile (WebView)**
```typescript
// HTML gerado com handler de clique
const generateWebViewHtml = ({ markers, userLocation }) => {
  return `
    <script>
      map.on('click', function(e) {
        var msg = JSON.stringify({
          type: 'mapClick',
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        }
      });
    </script>
  `;
};

// Handler no React Native
<WebView
  onMessage={(e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data?.type === "mapClick") {
        openOccurrenceFormWithCoord({ 
          lat: data.lat, 
          lng: data.lng 
        });
      }
    } catch (err) {}
  }}
/>
```

### **2. Abertura do Formulário**
```typescript
const openOccurrenceFormWithCoord = (latlng) => {
  setOccurrenceData({ 
    description: "", 
    type: "Crime", 
    coord: latlng 
  });
  setShowOccurrenceForm(true);
};
```

### **3. Submissão do Formulário**
```typescript
const submitOccurrence = () => {
  // Validação
  if (!occurrenceData.description) {
    Alert.alert("Erro", "Preencha a descrição");
    return;
  }
  
  // Geração de coordenadas
  const coord = occurrenceData.coord || {
    lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
    lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
  };
  
  // Criação do novo marcador
  const newMarker = {
    id: Date.now(),
    type: occurrenceData.type,
    description: occurrenceData.description,
    coordinate: { lat: coord.lat, lng: coord.lng }
  };
  
  // Atualização do estado
  setMarkers(prev => [...prev, newMarker]);
  
  // Sincronização com WebView (Mobile)
  if (Platform.OS !== "web" && webviewRef.current) {
    const script = `
      (function(){
        if(window.__handleAddMarker){
          window.__handleAddMarker(${JSON.stringify(newMarker)});
        }
      })();
      true;
    `;
    webviewRef.current.injectJavaScript(script);
  }
  
  // Limpeza e feedback
  setShowOccurrenceForm(false);
  setOccurrenceData({ description: "", type: "Crime", coord: null });
  setSelectedMarker(newMarker);
  Alert.alert("Sucesso", "Ocorrência registrada!");
};
```

## 🔄 Lógica de Sincronização WebView

### **1. Geração de HTML Dinâmico**
```typescript
function generateWebViewHtml({ markers = [], userLocation }) {
  // Mapeamento de marcadores para JavaScript
  const markersJs = markers.map(m => {
    const col = m.type === "Crime" ? "#ff4444" : 
                m.type === "Acidente" ? "#ffaa00" : "#44aa44";
    const weight = m.type === "Crime" ? 3 : 
                   m.type === "Acidente" ? 2 : 1;
    const radius = 120 * weight;
    
    return `
      (function(){
        var ic = L.divIcon({
          className: 'marker-wrapper',
          html: '<div class="custom-dot ${m.type==="Crime"?"dot-crime":m.type==="Acidente"?"dot-acidente":"dot-outro"}" style="color:${col}"></div><div class="pulse" style="color:${col}"></div>',
          iconSize: [24,24],
          iconAnchor: [12,12]
        });
        var mm = L.marker([${m.coordinate.lat}, ${m.coordinate.lng}], {icon: ic})
          .addTo(map)
          .bindPopup(${JSON.stringify(`<b>${m.type}</b><br/>${m.description}`)});
        var c = L.circle([${m.coordinate.lat}, ${m.coordinate.lng}], {
          radius: ${radius},
          color: '${col}',
          fillColor: '${col}',
          fillOpacity: 0.12,
          weight: 0
        }).addTo(map);
        window.__circles = window.__circles || [];
        window.__circles.push(c);
      })();
    `;
  }).join("\n");
  
  // Retorna HTML completo
  return `<!doctype html>...${markersJs}...`;
}
```

### **2. Funções Globais no WebView**
```typescript
// Adicionar marcador via JavaScript injetado
window.__handleAddMarker = function(m) {
  try {
    var col = m.type === 'Crime' ? '#ff4444' : 
              m.type === 'Acidente' ? '#ffaa00' : '#44aa44';
    var weight = m.type === 'Crime' ? 3 : 
                 m.type === 'Acidente' ? 2 : 1;
    var radius = 120 * weight;
    
    var ic = L.divIcon({
      className: 'marker-wrapper',
      html: '<div class="custom-dot" style="color:'+col+'"></div><div class="pulse" style="color:'+col+'"></div>',
      iconSize: [24,24],
      iconAnchor: [12,12]
    });
    
    var mk = L.marker([m.coordinate.lat, m.coordinate.lng], { icon: ic })
      .addTo(map)
      .bindPopup('<b>'+m.type+'</b><br/>'+m.description);
      
    var c = L.circle([m.coordinate.lat, m.coordinate.lng], {
      radius: radius,
      color: col,
      fillColor: col,
      fillOpacity: 0.12,
      weight: 0
    }).addTo(map);
    
    window.__circles.push(c);
    map.setView([m.coordinate.lat, m.coordinate.lng], map.getZoom());
  } catch(e) {}
};

// Toggle de zonas de risco
window.__toggleZones = function(show) {
  try {
    window.__circles.forEach(function(c){
      if(show) { 
        c.addTo(map); 
      } else { 
        map.removeLayer(c); 
      }
    });
  } catch(e) {}
};
```

## 🎨 Lógica de Estilos e Animações

### **1. CSS Dinâmico Injetado**
```typescript
// Injeção de estilos no Web
if (typeof document !== "undefined" && !document.getElementById("leaflet-custom-css")) {
  const style = document.createElement("style");
  style.id = "leaflet-custom-css";
  style.innerHTML = `
    .leaflet-container { 
      background: #f8f9fa; 
      border-radius: 8px; 
    }
    .custom-dot { 
      width: 12px; 
      height: 12px; 
      border-radius: 50%; 
      display: block; 
      position: relative; 
      box-shadow: 0 0 0 2px rgba(0,0,0,0.06); 
    }
    .dot-crime { background: #ff4444; }
    .dot-acidente { background: #ffaa00; }
    .dot-outro { background: #44aa44; }
    .pulse { 
      position: absolute; 
      left: 50%; 
      top: 50%; 
      transform: translate(-50%,-50%); 
      width: 12px; 
      height: 12px; 
      border-radius: 50%; 
      background: currentColor; 
      opacity: 0.45; 
      animation: pulse 1.4s infinite; 
    }
    @keyframes pulse { 
      0% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; } 
      70% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; } 
      100% { opacity: 0; } 
    }
  `;
  document.head.appendChild(style);
}
```

### **2. Toggle de Zonas de Risco**
```typescript
// Web - Renderização condicional
{showZones && (
  <Circle 
    center={[m.coordinate.lat, m.coordinate.lng]} 
    radius={radiusForType(m.type)} 
    pathOptions={circleStyle(m.type)} 
  />
)}

// Mobile - JavaScript injetado
const toggleZones = () => {
  setShowZones(prev => {
    const next = !prev;
    if (webviewRef.current) {
      const script = `
        if(window.__toggleZones){ 
          window.__toggleZones(${next}); 
        } 
        true;
      `;
      webviewRef.current.injectJavaScript(script);
    }
    return next;
  });
};
```

## �� Lógica de Controles de Interface

### **1. Botões Flutuantes**
```typescript
// Botão de adicionar ocorrência
<TouchableOpacity 
  style={styles.addOccurrenceButton} 
  onPress={() => {
    setOccurrenceData({ description: "", type: "Crime", coord: null });
    setShowOccurrenceForm(true);
  }}
>
  <Text style={styles.addOccurrenceButtonText}>＋</Text>
</TouchableOpacity>

// Botão de menu
<TouchableOpacity
  style={styles.menuButtonLeft}
  onPress={() => navigation.navigate("Menu")}
  accessibilityLabel="Abrir menu"
>
  <Text style={styles.menuButtonLeftText}>☰</Text>
</TouchableOpacity>
```

### **2. Formulário Modal**
```typescript
<Modal visible={showOccurrenceForm} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.formModal}>
      <Text style={styles.formTitle}>Registrar Ocorrência</Text>
      
      {/* Seleção de tipo */}
      <View style={styles.row}>
        {["Crime","Acidente","Outro"].map(t => (
          <TouchableOpacity 
            key={t} 
            style={[
              styles.typeButton, 
              occurrenceData.type===t && styles.typeButtonActive
            ]} 
            onPress={() => setOccurrenceData({...occurrenceData, type: t})}
          >
            <Text style={[
              styles.typeButtonText, 
              occurrenceData.type===t && styles.typeButtonTextActive
            ]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Campo de descrição */}
      <TextInput 
        style={[styles.textInput, { height: 80 }]} 
        placeholder="Descreva o que aconteceu" 
        multiline 
        value={occurrenceData.description} 
        onChangeText={t => setOccurrenceData({...occurrenceData, description: t})} 
      />
      
      {/* Coordenadas */}
      {occurrenceData.coord ? (
        <Text style={styles.hint}>
          Local selecionado: {occurrenceData.coord.lat.toFixed(5)}, {occurrenceData.coord.lng.toFixed(5)}
        </Text>
      ) : (
        <Text style={styles.hint}>
          Clique no mapa para escolher o local (ou deixe em branco)
        </Text>
      )}
      
      {/* Botões de ação */}
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]} 
          onPress={submitOccurrence}
        >
          <Text style={styles.actionButtonText}>Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: "#f44336", marginLeft: 8 }]} 
          onPress={() => setShowOccurrenceForm(false)}
        >
          <Text style={styles.actionButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

## �� Lógica de Responsividade

### **1. Detecção de Plataforma**
```typescript
// Renderização condicional baseada na plataforma
{Platform.OS === "web" ? (
  <WebMapComponent />
) : (
  <MobileMapComponent />
)}
```

### **2. Estilos Adaptativos**
```typescript
const styles = StyleSheet.create({
  // Estilos base
  pageWrapper: { flex: 1, padding: 6, backgroundColor: "#fff" },
  mapWrapper: { flex: 1, borderRadius: 8, overflow: "hidden" },
  
  // Botões flutuantes
  addOccurrenceButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    // ... outros estilos
  },
  
  // Legendas responsivas
  legend: { 
    position: "absolute", 
    left: 12, 
    top: 12, 
    // ... estilos para web
  },
  legendMobile: { 
    position: "absolute", 
    left: 12, 
    top: 12, 
    // ... estilos para mobile
  }
});
```

## �� Pontos-Chave da Lógica

### **1. Gerenciamento de Estado**
- **Estados locais** para cada funcionalidade
- **Sincronização** entre WebView e React Native
- **Validação** antes de submeter dados

### **2. Comunicação Bidirecional**
- **WebView → RN**: `postMessage` para cliques no mapa
- **RN → WebView**: `injectJavaScript` para adicionar marcadores

### **3. Renderização Condicional**
- **Web**: React Leaflet com componentes nativos
- **Mobile**: WebView com HTML gerado dinamicamente

### **4. Persistência de Dados**
- **Atual**: Apenas em memória (perdido ao recarregar)
- **Futuro**: Integrar com API/AsyncStorage

## 🚀 Como Implementar no Futuro

### **1. Estrutura Básica**
```typescript
// 1. Criar estados iniciais
const [showForm, setShowForm] = useState(false);
const [markers, setMarkers] = useState([]);

// 2. Implementar detecção de plataforma
if (Platform.OS === "web") {
  return <WebMap />;
} else {
  return <MobileMap />;
}
```

### **2. Sistema de Marcadores**
```typescript
// 1. Configurar tipos
const TYPE_CONFIG = { /* ... */ };

// 2. Criar ícones personalizados
const createIcon = (type) => { /* ... */ };

// 3. Renderizar marcadores
{markers.map(marker => (
  <Marker key={marker.id} position={[lat, lng]} icon={icon}>
    <Popup>{marker.description}</Popup>
  </Marker>
))}
```

### **3. Formulário de Ocorrências**
```typescript
// 1. Estado do formulário
const [formData, setFormData] = useState({ /* ... */ });

// 2. Validação
const validateForm = () => { /* ... */ };

// 3. Submissão
const submitForm = () => { /* ... */ };
```

### **4. Sincronização WebView**
```typescript
// 1. Gerar HTML dinâmico
const generateHTML = (markers) => { /* ... */ };

// 2. Injetar JavaScript
webviewRef.current.injectJavaScript(script);

// 3. Capturar mensagens
<WebView onMessage={handleMessage} />
```

---

**📝 Nota**: Este guia cobre toda a lógica atual do `Initialpage`. Use como referência para implementar funcionalidades similares em outros projetos ou para entender como o componente funciona internamente.