/**
 * MapComponent.js
 *
 * MUDANÇA: `userLocation` agora é opcional.
 * Para web: não é passado → WebMap resolve geolocalização internamente.
 * Para mobile: pode ser null (WebView usa SP até receber postMessage 'userLocation').
 */

import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

let WebView;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').WebView;
}

import WebMap from './WebMap';
import { generateWebViewHtml } from '../utils/helpers';

const SP_FALLBACK = { lat: -23.5505, lng: -46.6333 };

const MapComponent = ({
                          userLocation,           // opcional — para web não é usado; para mobile vai para o HTML
                          markers,
                          areas,
                          showZones,
                          showHexagons = false,
                          isScreenFocused = true,
                          drawingMode,
                          currentPolygon,
                          onMapClick,
                          onAreaClick,
                          onMarkerClick,
                          webviewRef,
                          onWebViewMessage,
                      }) => {
    // Fallback para geração do HTML mobile (WebView usa SP até geo resolver)
    const mobileLocation = userLocation ?? SP_FALLBACK;

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
            console.error('WebView message error:', err);
        }
    });

    return (
        <View style={styles.mapContainer}>
            {Platform.OS === 'web' ? (
                // Web: WebMap não recebe userLocation — ele mesmo gerencia a geo
                <WebMap
                    markers={markers}
                    areas={areas}
                    showZones={showZones}
                    showHexagons={showHexagons}
                    isScreenFocused={isScreenFocused}
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
                        source={{ html: generateWebViewHtml({ markers, userLocation: mobileLocation, areas }) }}
                        onMessage={handleMessage}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        geolocationEnabled={true}
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