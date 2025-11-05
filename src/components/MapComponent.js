import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import WebMap from "./WebMap";
import { generateWebViewHtml } from "../utils/helpers";

const MapComponent = ({
  userLocation,
  markers,
  areas,
  showZones,
  drawingMode,
  currentPolygon,
  onMapClick,
  onAreaClick,
  onMarkerClick,
  webviewRef
}) => {
  return (
    <View style={styles.mapContainer}>
      {Platform.OS === "web" ? (
        <WebMap
          userLocation={userLocation}
          markers={markers}
          areas={areas}
          showZones={showZones}
          drawingMode={drawingMode}
          currentPolygon={currentPolygon}
          onMapClick={onMapClick}
          onAreaClick={onAreaClick}
          onMarkerClick={onMarkerClick}
        />
      ) : (
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          style={styles.map}
          source={{ html: generateWebViewHtml({ markers, userLocation, areas }) }}
          onMessage={(e) => {
            try {
              const data = JSON.parse(e.nativeEvent.data);
              if (data?.type === "mapClick" && data?.lat && data?.lng) {
                onMapClick({ lat: data.lat, lng: data.lng });
              } else if (data?.type === "areaClick" && data?.areaId) {
                const area = areas.find(a => a.id === data.areaId);
                if (area) onAreaClick(area);
              }
            } catch (err) {
              console.error("Error parsing WebView message:", err);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="always"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    width: "100%",
    minHeight: 400,
  },
  map: {
    flex: 1,
    width: "100%",
    minHeight: 400,
  },
});

export default MapComponent;
