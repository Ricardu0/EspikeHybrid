/**
 * HexagonLayer.js
 * Camada de hexágonos de criminalidade para o WebMap (Leaflet / react-leaflet).
 *
 * MUDANÇAS UI/UX:
 *   - Aceita prop `showHexagons` (boolean, default false). Se false, nada é renderizado.
 *   - Fill opacity reduzida de 0.55 → 0.18 (borda visível, mapa base legível).
 *   - Opacity da borda reduzida de 0.8 → 0.55 para visual mais suave.
 *   - O estado padrão da camada é DESATIVADO — o usuário ativa via toggle na Legend.
 */

import React, { useMemo } from 'react';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizarCoordenadas(coordinates) {
    if (!Array.isArray(coordinates)) return [];
    return coordinates.map(c => {
        if (Array.isArray(c)) return [c[0], c[1]];
        if (c && typeof c === 'object') return [c.lat, c.lng];
        return c;
    });
}

// ---------------------------------------------------------------------------
// Componente individual de hexágono
// ---------------------------------------------------------------------------

const Hexagono = React.memo(({ hex, Polygon, onPress }) => {
    const posicoes = useMemo(() => normalizarCoordenadas(hex.coordinates), [hex.coordinates]);

    const pathOptions = useMemo(() => ({
        // Fill bem transparente: mapa base fica legível
        fillColor:   hex.color,
        fillOpacity: hex.fill_opacity != null
            ? Math.min(hex.fill_opacity * 0.32, 0.22)   // escala: max 0.22
            : 0.18,
        // Borda discreta para delimitar o hexágono
        color:   hex.color,
        weight:  1.2,
        opacity: 0.50,
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
 * @param {object}   props
 * @param {Array}    props.hexagonos      - Lista filtrada de hexágonos visíveis
 * @param {object}   props.mapComponents  - Objeto com { Polygon } do react-leaflet
 * @param {boolean}  [props.showHexagons=false] - Controla visibilidade da camada
 * @param {Function} [props.onHexPress]  - Callback ao clicar num hexágono
 */
const HexagonLayer = ({ hexagonos = [], mapComponents, showHexagons = false, onHexPress }) => {
    if (Platform.OS !== 'web') return null;
    if (!showHexagons) return null;          // ← camada desativada por padrão
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