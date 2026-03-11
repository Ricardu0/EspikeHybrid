/**
 * MapComponent.js — versão atualizada.
 *
 * Alteração: aceita prop `onWebViewMessage` para centralizar o tratamento de
 * mensagens da WebView no Initialpage (regionChange, mapClick, areaClick).
 * A prop `hexagonos` foi removida — os hexágonos são injetados via
 * injectJavaScript pelo Initialpage, não passados ao HTML gerado.
 */

import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

import WebMap from './WebMap';
import { generateWebViewHtml } from '../utils/helpers';

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
                        webviewRef,
                        onWebViewMessage,   // ← handler centralizado vindo do Initialpage
                      }) => {

  // Fallback: se nenhum handler externo for passado, trata mapClick/areaClick
  const handleMessage = onWebViewMessage ?? ((e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data?.type === 'mapClick' && data?.lat && data?.lng) {
        onMapClick?.({ lat: data.lat, lng: data.lng });
      } else if (data?.type === 'areaClick' && data?.areaId) {
        const area = areas?.find(a => a.id === data.areaId);
        if (area) onAreaClick?.(area);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  });

  return (
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
            // Web: WebMap consome useHexagonos internamente — nenhuma prop extra necessária
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
            WebView && (
                <WebView
                    ref={webviewRef}
                    originWhitelist={['*']}
                    style={styles.map}
                    source={{
                      // HTML estático: sem hexágonos — injetados depois via injectJavaScript
                      html: generateWebViewHtml({ markers, userLocation, areas }),
                    }}
                    onMessage={handleMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    mixedContentMode="always"
                />
            )
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: { flex: 1, width: '100%', minHeight: 400 },
  map:          { flex: 1, width: '100%', minHeight: 400 },
});

export default MapComponent;