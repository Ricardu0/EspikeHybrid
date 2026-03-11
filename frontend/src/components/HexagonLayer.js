/**
 * HexagonLayer.js
 * Camada de hexágonos de criminalidade para o WebMap (Leaflet / react-leaflet).
 *
 * Usado APENAS na versão web. Recebe hexagonosVisiveis do hook useHexagonos
 * e renderiza Polygon do react-leaflet para cada hexágono.
 *
 * Integração em WebMap.js:
 *   import HexagonLayer from './HexagonLayer';
 *   // Dentro de <MapContainer>:
 *   <HexagonLayer hexagonos={hexagonosVisiveis} mapComponents={mapComponents} />
 */

import React, { useMemo } from 'react';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converte coordenadas do JSON [lat, lng] para o formato do Leaflet [lat, lng].
 * Se o JSON já vier como { lat, lng }, também funciona.
 */
function normalizarCoordenadas(coordinates) {
    if (!Array.isArray(coordinates)) return [];
    return coordinates.map(c => {
        if (Array.isArray(c)) return [c[0], c[1]]; // [lat, lng]
        if (c && typeof c === 'object') return [c.lat, c.lng]; // { lat, lng }
        return c;
    });
}

/**
 * Converte cor hex + opacidade em string rgba para fillColor do Leaflet.
 * Ex.: '#B71C1C', 0.65 → 'rgba(183,28,28,0.65)'
 */
function hexParaRgba(hex, opacity) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

// ---------------------------------------------------------------------------
// Componente individual de hexágono
// ---------------------------------------------------------------------------

const Hexagono = React.memo(({ hex, Polygon, onPress }) => {
    const posicoes = useMemo(() => normalizarCoordenadas(hex.coordinates), [hex.coordinates]);

    const pathOptions = useMemo(() => ({
        fillColor: hex.color,
        fillOpacity: hex.fill_opacity ?? 0.55,
        color: hex.color,
        weight: 1,
        opacity: 0.8,
    }), [hex.color, hex.fill_opacity]);

    const eventHandlers = useMemo(() => ({
        click: () => onPress?.(hex),
    }), [hex, onPress]);

    if (!posicoes.length) return null;

    return (
        <Polygon
            positions={posicoes}
            pathOptions={pathOptions}
            eventHandlers={eventHandlers}
        />
    );
});

// ---------------------------------------------------------------------------
// Componente da camada completa
// ---------------------------------------------------------------------------

/**
 * @param {object} props
 * @param {Array}  props.hexagonos      - Lista filtrada de hexágonos visíveis
 * @param {object} props.mapComponents  - Objeto com { Polygon } do react-leaflet
 * @param {Function} [props.onHexPress] - Callback ao clicar num hexágono
 */
const HexagonLayer = ({ hexagonos = [], mapComponents, onHexPress }) => {
    // Só renderiza no web
    if (Platform.OS !== 'web') return null;
    if (!mapComponents?.Polygon) return null;
    if (!hexagonos.length) return null;

    const { Polygon } = mapComponents;

    return (
        <>
            {hexagonos.map(hex => (
                <Hexagono
                    key={hex.id}
                    hex={hex}
                    Polygon={Polygon}
                    onPress={onHexPress}
                />
            ))}
        </>
    );
};

export default HexagonLayer;