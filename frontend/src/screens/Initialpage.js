import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";

import MapComponent from "../components/MapComponent";
import FloatingButtons from "../components/FloatingButtons";
import OccurrenceForm from "../components/OcurrenceForm";
import AreaRatingForm from "../components/AreaRatingForm";
import Legend from "../components/Legend";
import  {useOccurrences} from "../hooks/useOcurrences"; // 👈 Hook de API

const Initialpage = ({ navigation }) => {
  // === Ocorrências vindas da API ===
  const { occurrences: markers, loading, error, addOccurrence } = useOccurrences();

  // === Estados locais ===
  const [localLoading, setLocalLoading] = useState(false);
  const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showZones, setShowZones] = useState(true);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);

  const [occurrenceData, setOccurrenceData] = useState({
    description: "",
    type: "Crime",
    coord: null,
  });

  const [areaRatingData, setAreaRatingData] = useState({
    overall: 0,
    risk: 0,
    lighting: 0,
    infrastructure: 0,
    policing: 0,
    comments: "",
  });

  const [areas, setAreas] = useState([
    {
      id: 1,
      name: "Praça Central",
      coordinates: [
        [-23.5505, -46.6333],
        [-23.5515, -46.6333],
        [-23.5515, -46.6343],
        [-23.5505, -46.6343],
      ],
      ratings: {
        overall: 4,
        risk: 3,
        lighting: 4,
        infrastructure: 5,
        policing: 2,
        comments: "Boa infraestrutura mas policiamento insuficiente",
      },
    },
  ]);

  const userLocation = { lat: -23.5505, lng: -46.6333 };
  const webviewRef = useRef();

  // === Mostrar erros da API ===
  useEffect(() => {
    if (error) {
      Alert.alert("Erro", `Falha ao carregar ocorrências: ${error}`);
    }
  }, [error]);

  // === Ações ===
  const navigateToChatbot = () => {
    navigation.navigate("ChatbotScreen");
  };

  const openOccurrenceFormWithCoord = (latlng) => {
    setOccurrenceData({ description: "", type: "Crime", coord: latlng });
    setShowOccurrenceForm(true);
  };

  // === Enviar ocorrência via API ===
  const submitOccurrence = async () => {
    if (!occurrenceData.description) {
      Alert.alert("Erro", "Preencha a descrição");
      return;
    }

    setLocalLoading(true);
    try {
      const coord =
        occurrenceData.coord || {
          lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
          lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
        };

      const occurrenceToSave = {
        description: occurrenceData.description,
        type: occurrenceData.type,
        coord: coord,
      };

      // Chama API
      const newMarker = await addOccurrence(occurrenceToSave);

      setShowOccurrenceForm(false);
      setOccurrenceData({ description: "", type: "Crime", coord: null });
      setSelectedMarker(newMarker);

      // Atualiza mapa
      if (Platform.OS !== "web" && webviewRef.current) {
        const script = `(function(){ if(window.__handleAddMarker){ window.__handleAddMarker(${JSON.stringify(
          newMarker
        )}); }})(); true;`;
        webviewRef.current.injectJavaScript(script);
      }

      Alert.alert("Sucesso", "Ocorrência registrada!");
    } catch (err) {
      Alert.alert("Erro", "Não foi possível registrar a ocorrência");
    } finally {
      setLocalLoading(false);
    }
  };

  const submitAreaRating = () => {
    if (!areaRatingData.overall) {
      Alert.alert("Erro", "Avaliação geral é obrigatória");
      return;
    }

    const updatedAreas = areas.map((area) => {
      if (area.id === selectedArea.id) {
        return { ...area, ratings: areaRatingData };
      }
      return area;
    });

    setAreas(updatedAreas);
    setShowAreaForm(false);
    setAreaRatingData({
      overall: 0,
      risk: 0,
      lighting: 0,
      infrastructure: 0,
      policing: 0,
      comments: "",
    });
    Alert.alert("Sucesso", "Avaliação registrada!");
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setAreaRatingData(
      area.ratings || {
        overall: 0,
        risk: 0,
        lighting: 0,
        infrastructure: 0,
        policing: 0,
        comments: "",
      }
    );
    setShowAreaForm(true);
  };

  const handleMapClick = (latlng) => {
    if (drawingMode) {
      setCurrentPolygon((prev) => [...prev, [latlng.lat, latlng.lng]]);
    } else {
      openOccurrenceFormWithCoord({ lat: latlng.lat, lng: latlng.lng });
    }
  };

  const finishDrawing = () => {
    if (currentPolygon.length < 3) {
      Alert.alert("Erro", "Um polígono precisa de pelo menos 3 pontos");
      return;
    }

    const newArea = {
      id: Date.now(),
      name: `Área ${areas.length + 1}`,
      coordinates: [...currentPolygon, currentPolygon[0]],
      ratings: {
        overall: 0,
        risk: 0,
        lighting: 0,
        infrastructure: 0,
        policing: 0,
        comments: "",
      },
    };

    setAreas((prev) => [...prev, newArea]);
    setCurrentPolygon([]);
    setDrawingMode(false);
    Alert.alert("Sucesso", "Área criada! Agora você pode avaliá-la.");
  };

  // === Render ===
  return (
    <View style={styles.pageWrapper}>
      <View style={styles.mapWrapper}>
        <MapComponent
          userLocation={userLocation}
          markers={markers}
          areas={areas}
          showZones={showZones}
          drawingMode={drawingMode}
          currentPolygon={currentPolygon}
          onMapClick={handleMapClick}
          onAreaClick={handleAreaClick}
          onMarkerClick={setSelectedMarker}
          webviewRef={webviewRef}
        />

        <Legend
          showZones={showZones}
          setShowZones={setShowZones}
          drawingMode={drawingMode}
          setDrawingMode={setDrawingMode}
          onFinishDrawing={finishDrawing}
          webviewRef={webviewRef}
        />
      </View>

      <FloatingButtons
        navigation={navigation}
        onAddOccurrence={() => {
          setOccurrenceData({ description: "", type: "Crime", coord: null });
          setShowOccurrenceForm(true);
        }}
        drawingMode={drawingMode}
        setDrawingMode={setDrawingMode}
        navigateToChatbot={navigateToChatbot}
      />

      <OccurrenceForm
        visible={showOccurrenceForm}
        onClose={() => setShowOccurrenceForm(false)}
        occurrenceData={occurrenceData}
        setOccurrenceData={setOccurrenceData}
        onSubmit={submitOccurrence}
        loading={localLoading} // 👈 Mostra "Registrando..."
      />

      <AreaRatingForm
        visible={showAreaForm}
        onClose={() => setShowAreaForm(false)}
        areaRatingData={areaRatingData}
        setAreaRatingData={setAreaRatingData}
        selectedArea={selectedArea}
        onSubmit={submitAreaRating}
      />

      <View style={{ height: 6 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    padding: 1,
    backgroundColor: "#fff",
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#eee",
  },
});

export default Initialpage;
