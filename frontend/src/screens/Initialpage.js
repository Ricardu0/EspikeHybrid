import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  Text
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import MapComponent    from '../components/MapComponent';
import FloatingButtons from '../components/FloatingButtons';
import OccurrenceForm  from '../components/OcurrenceForm';
import AreaRatingForm  from '../components/AreaRatingForm';
import Legend          from '../components/Legend';
import { useOccurrences } from '../hooks/useOcurrences';
import { useHexagonos }   from '../hooks/Usehexagonos';
import { areaService }    from '../services/areaService';

const Initialpage = ({ navigation }) => {
  const isScreenFocused = useIsFocused();

  const { occurrences: markers, error, addOccurrence } = useOccurrences();
  const { hexagonosVisiveis, atualizarRegiao } = useHexagonos();

  const [mobileUserLocation, setMobileUserLocation] = useState(null);
  const [localLoading, setLocalLoading]             = useState(false);
  const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
  const [showAreaForm, setShowAreaForm]             = useState(false);
  const [selectedMarker, setSelectedMarker]         = useState(null);
  const [selectedArea, setSelectedArea]             = useState(null);
  const [showZones, setShowZones]                   = useState(true);
  const [showHexagons, setShowHexagons]             = useState(false);
  const [drawingMode, setDrawingMode]               = useState(false);
  const [currentPolygon, setCurrentPolygon]         = useState([]);

  const [occurrenceData, setOccurrenceData] = useState({
    description: '', type: 'Crime', coord: null,
  });
  const [areaRatingData, setAreaRatingData] = useState({
    overall: 0, risk: 0, lighting: 0, infrastructure: 0, policing: 0, comments: '',
  });
  const [areas, setAreas] = useState([]);

  // Carrega áreas do backend ao montar a tela
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await areaService.getAll();
        if (Array.isArray(data)) setAreas(data);
      } catch (e) {
        console.warn('Initialpage: erro ao carregar áreas', e);
      }
    };
    fetchAreas();
  }, []);

  const webviewRef = useRef();

  useEffect(() => {
    if (error) Alert.alert('Erro', `Falha ao carregar ocorrências: ${error}`);
  }, [error]);

  useEffect(() => {
    if (Platform.OS === 'web' || !webviewRef.current) return;
    const script = `
      (function(){
        try {
          window.atualizarHexagonos(${JSON.stringify(hexagonosVisiveis)});
          if(window.hexagonosLayer && !${showHexagons}){
            window.hexagonosLayer.remove();
          }
        } catch(e) {}
      })(); true;
    `;
    webviewRef.current.injectJavaScript(script);
  }, [hexagonosVisiveis, showHexagons]);

  const navigateToChatbot = () => navigation.navigate('ChatbotScreen');

  const openOccurrenceFormWithCoord = (latlng) => {
    setOccurrenceData({ description: '', type: 'Crime', coord: latlng });
    setShowOccurrenceForm(true);
  };

  const submitOccurrence = async () => {
    if (!occurrenceData.description) {
      Alert.alert('Erro', 'Preencha a descrição');
      return;
    }
    setLocalLoading(true);
    try {
      const fallback = mobileUserLocation ?? { lat: -23.5505, lng: -46.6333 };
      const coord = occurrenceData.coord || {
        lat: fallback.lat + (Math.random() - 0.5) * 0.01,
        lng: fallback.lng + (Math.random() - 0.5) * 0.01,
      };
      const newMarker = await addOccurrence({
        description: occurrenceData.description,
        type: occurrenceData.type,
        coord,
      });
      setShowOccurrenceForm(false);
      setOccurrenceData({ description: '', type: 'Crime', coord: null });
      setSelectedMarker(newMarker);

      if (Platform.OS !== 'web' && webviewRef.current) {
        const script = `(function(){ if(window.__handleAddMarker){ window.__handleAddMarker(${JSON.stringify(newMarker)}); }})(); true;`;
        webviewRef.current.injectJavaScript(script);
      }
      Alert.alert('Sucesso', 'Ocorrência registrada!');
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a ocorrência');
    } finally {
      setLocalLoading(false);
    }
  };

  const submitAreaRating = async () => {
    if (!areaRatingData.overall) { Alert.alert('Erro', 'Avaliação geral é obrigatória'); return; }
    const areaId = selectedArea?._id || selectedArea?.id;
    if (areaId && typeof areaId === 'string' && areaId.length === 24) {
      // É um ID real do MongoDB — envia para API
      try {
        const updated = await areaService.rateArea(areaId, areaRatingData);
        setAreas(prev => prev.map(a => (a._id === areaId || a.id === areaId) ? { ...a, ...updated } : a));
        Alert.alert('Sucesso', 'Avaliação registrada!');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível salvar sua avaliação.');
        return;
      }
    } else {
      // Área local (mock) — só atualiza estado
      setAreas(prev => prev.map(a =>
        a.id === selectedArea.id ? { ...a, ratings: areaRatingData } : a
      ));
      Alert.alert('Sucesso', 'Avaliação registrada!');
    }
    setShowAreaForm(false);
    setAreaRatingData({ overall: 0, risk: 0, lighting: 0, infrastructure: 0, policing: 0, comments: '' });
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setAreaRatingData(area.ratings || { overall: 0, risk: 0, lighting: 0, infrastructure: 0, policing: 0, comments: '' });
    setShowAreaForm(true);
  };

  const handleMapClick = (latlng) => {
    if (drawingMode) {
      setCurrentPolygon(prev => [...prev, [latlng.lat, latlng.lng]]);
    } else {
      openOccurrenceFormWithCoord({ lat: latlng.lat, lng: latlng.lng });
    }
  };

  const finishDrawing = async () => {
    if (currentPolygon.length < 3) {
      Alert.alert('Erro', 'Uma zona precisa de pelo menos 3 pontos');
      return;
    }
    const closedPolygon = [...currentPolygon, currentPolygon[0]];
    const areaName = `Zona ${areas.length + 1}`;
    try {
      // Salva no banco de dados
      const created = await areaService.create({
        name: areaName,
        coordinates: closedPolygon,
      });
      // Usa o objeto retornado pelo backend (tem _id real)
      setAreas(prev => [...prev, created]);
      setCurrentPolygon([]);
      setDrawingMode(false);
      Alert.alert('Sucesso', `Zona "${areaName}" criada e salva!`);
    } catch (e) {
      console.error('Erro ao salvar zona:', e);
      // Mostra a mensagem exata do backend para facilitar diagnóstico
      const msg = e?.message || 'Erro desconhecido';
      Alert.alert('Erro ao salvar zona', `Detalhes: ${msg}\n\nSe aparecer "Acesso negado", faça logout e login novamente para atualizar suas permissões.`);
    }
  };

  const handleWebViewMessage = (e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data?.type === 'userLocation' && data?.lat && data?.lng) {
        setMobileUserLocation({ lat: data.lat, lng: data.lng });
        return;
      }
      if (data?.type === 'regionChange') {
        atualizarRegiao({
          latitude: data.latitude, longitude: data.longitude,
          latitudeDelta: data.latitudeDelta, longitudeDelta: data.longitudeDelta,
        });
        return;
      }
      if (data?.type === 'mapClick' && data?.lat && data?.lng) {
        handleMapClick({ lat: data.lat, lng: data.lng });
      } else if (data?.type === 'areaClick' && data?.areaId) {
        const area = areas.find(a => a.id === data.areaId);
        if (area) handleAreaClick(area);
      }
    } catch (err) {
      console.error('WebView message parse error:', err);
    }
  };

  return (
      <View style={styles.pageWrapper}>
        <View style={styles.mapWrapper}>
          <MapComponent
              userLocation={Platform.OS !== 'web' ? mobileUserLocation : undefined}
              markers={markers}
              areas={areas}
              showZones={showZones}
              showHexagons={showHexagons}
              isScreenFocused={isScreenFocused}
              drawingMode={drawingMode}
              currentPolygon={currentPolygon}
              onMapClick={handleMapClick}
              onAreaClick={handleAreaClick}
              onMarkerClick={setSelectedMarker}
              webviewRef={webviewRef}
              onWebViewMessage={handleWebViewMessage}
          />

          <Legend
              showZones={showZones}
              setShowZones={setShowZones}
              showHexagons={showHexagons}
              setShowHexagons={setShowHexagons}
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
              onFinishDrawing={finishDrawing}
              webviewRef={webviewRef}
          />
        </View>

        <FloatingButtons
            navigation={navigation}
            onAddOccurrence={() => {
              setOccurrenceData({ description: '', type: 'Crime', coord: null });
              setShowOccurrenceForm(true);
            }}
            drawingMode={drawingMode}
            setDrawingMode={setDrawingMode}
            navigateToChatbot={navigateToChatbot}
        />

        {/* Botão para Reporte com Foto */}
        <TouchableOpacity
            style={styles.fabPhotoReport}
            onPress={() => navigation.navigate('PhotoReportScreen')}
            activeOpacity={0.8}
        >
          <Text style={styles.fabPhotoReportText}>📸</Text>
        </TouchableOpacity>

        <OccurrenceForm
            visible={showOccurrenceForm}
            onClose={() => setShowOccurrenceForm(false)}
            occurrenceData={occurrenceData}
            setOccurrenceData={setOccurrenceData}
            onSubmit={submitOccurrence}
            loading={localLoading}
        />

        <AreaRatingForm
            visible={showAreaForm}
            onClose={() => setShowAreaForm(false)}
            areaRatingData={areaRatingData}
            setAreaRatingData={setAreaRatingData}
            selectedArea={selectedArea}
            onSubmit={submitAreaRating}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, padding: 1, backgroundColor: '#fff' },
  mapWrapper:  { flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f0f4f8', borderWidth: 1, borderColor: '#eee' },
  fabPhotoReport: {
    position: 'absolute',
    right: 25,
    bottom: 180, // Posicionado acima do botão de chatbot/ocorrência padrão
    backgroundColor: '#5856D6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabPhotoReportText: {
    fontSize: 24,
  },
});

export default Initialpage;