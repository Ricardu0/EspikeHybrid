/**
 * SearchBar.js
 * Barra de busca de endereços para o WebMap (Leaflet / react-leaflet).
 *
 * ARQUITETURA:
 *   O componente tem duas partes separadas:
 *   1. <MapFlyTo> — fica DENTRO do MapContainer (usa useMap do react-leaflet)
 *   2. UI (input + dropdown) — renderizada via ReactDOM.createPortal para document.body,
 *      escapando do MapContainer que não suporta DOM arbitrário como filho.
 *
 * Uso em WebMap.js (dentro do MapContainer):
 *   <SearchBar mapComponents={mapComponents} />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import ReactDOM from 'react-dom';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const VIEWBOX       = '-53.1,-25.3,-44.1,-19.7';   // bbox estado SP + arredores
const DEBOUNCE_MS   = 400;
const MAX_RESULTS   = 6;

// ---------------------------------------------------------------------------
// Busca Nominatim
// ---------------------------------------------------------------------------
async function buscarNominatim(query) {
    if (!query || query.trim().length < 3) return [];
    const params = new URLSearchParams({
        q:                 `${query.trim()}, São Paulo, Brasil`,
        format:            'json',
        addressdetails:    '1',
        limit:             String(MAX_RESULTS),
        viewbox:           VIEWBOX,
        bounded:           '0',
        'accept-language': 'pt-BR',
    });
    try {
        const res  = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: { 'User-Agent': 'Espike-App/1.0' },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(item => ({
            label:    item.display_name,
            lat:      parseFloat(item.lat),
            lng:      parseFloat(item.lon),
            type:     item.type,
            category: item.category,
        }));
    } catch (e) {
        console.warn('[SearchBar] Erro Nominatim:', e);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Parte 1: flyTo — precisa estar DENTRO do MapContainer para usar useMap
// ---------------------------------------------------------------------------
function MapFlyTo({ target, useMap }) {
    const map = useMap();
    useEffect(() => {
        if (!target || !map) return;
        map.flyTo([target.lat, target.lng], 14, { duration: 1.2 });
    }, [target]);
    return null;
}

// ---------------------------------------------------------------------------
// Ícone por categoria Nominatim
// ---------------------------------------------------------------------------
function categoryIcon(category, type) {
    if (category === 'highway' || type === 'residential') return '🛣️';
    if (category === 'amenity')  return '🏢';
    if (category === 'shop')     return '🛍️';
    if (type === 'city' || type === 'town') return '🏙️';
    if (type === 'suburb' || type === 'neighbourhood') return '🏘️';
    if (category === 'leisure')  return '🌳';
    return '📍';
}

// ---------------------------------------------------------------------------
// Parte 2: UI — renderizada via portal para document.body
// ---------------------------------------------------------------------------
function SearchUI({ onSelect }) {
    const [query, setQuery]           = useState('');
    const [sugestoes, setSugestoes]   = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [aberto, setAberto]         = useState(false);

    const timerRef     = useRef(null);
    const containerRef = useRef(null);

    // Debounce da busca
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!query || query.trim().length < 3) {
            setSugestoes([]);
            setAberto(false);
            return;
        }
        timerRef.current = setTimeout(async () => {
            setCarregando(true);
            const resultados = await buscarNominatim(query);
            setSugestoes(resultados);
            setAberto(resultados.length > 0);
            setCarregando(false);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timerRef.current);
    }, [query]);

    // Fechar ao clicar fora
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setAberto(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selecionar = useCallback((item) => {
        setQuery(item.label.split(',')[0]);
        setSugestoes([]);
        setAberto(false);
        onSelect(item);
    }, [onSelect]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') setAberto(false);
        else if (e.key === 'Enter' && sugestoes.length > 0) selecionar(sugestoes[0]);
    }, [sugestoes, selecionar]);

    const stopProp = (e) => e.stopPropagation();

    const ui = (
        <div
            ref={containerRef}
            onMouseDown={stopProp}
            onTouchStart={stopProp}
            onWheel={stopProp}
            style={{
                position:  'fixed',
                top:       12,
                left:      '50%',
                transform: 'translateX(-50%)',
                zIndex:    99999,
                width:     360,
                maxWidth:  'calc(100vw - 32px)',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            {/* Input */}
            <div style={{
                display: 'flex', alignItems: 'center',
                background: '#fff', borderRadius: 24,
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                padding: '6px 14px', gap: 8,
            }}>
                <span style={{ fontSize: 15, opacity: 0.5 }}>🔍</span>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => sugestoes.length > 0 && setAberto(true)}
                    placeholder="Buscar bairro, endereço, cidade..."
                    style={{
                        flex: 1, border: 'none', outline: 'none',
                        fontSize: 14, background: 'transparent', color: '#333', minWidth: 0,
                    }}
                />
                {query.length > 0 && (
                    <button
                        onClick={() => { setQuery(''); setSugestoes([]); setAberto(false); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#aaa' }}
                    >✕</button>
                )}
                {carregando && <span style={{ fontSize: 13 }}>⏳</span>}
            </div>

            {/* Dropdown */}
            {aberto && sugestoes.length > 0 && (
                <ul style={{
                    listStyle: 'none', margin: '4px 0 0', padding: 0,
                    background: '#fff', borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    overflow: 'hidden', maxHeight: 280, overflowY: 'auto',
                }}>
                    {sugestoes.map((item, i) => (
                        <li
                            key={i}
                            onClick={() => selecionar(item)}
                            onMouseEnter={e => e.currentTarget.style.background = '#e8f4fd'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '10px 14px', cursor: 'pointer', background: '#fff',
                                borderBottom: '1px solid #f0f0f0',
                            }}
                        >
                            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                                {categoryIcon(item.category, item.type)}
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                                <strong style={{ fontSize: 13, color: '#222' }}>
                                    {item.label.split(',')[0]}
                                </strong>
                                <small style={{
                                    color: '#888', fontSize: 11,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {item.label.split(',').slice(1, 3).join(',').trim()}
                                </small>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    // Portal para document.body — escapa do MapContainer
    return ReactDOM.createPortal(ui, document.body);
}

// ---------------------------------------------------------------------------
// Componente exportado — combina MapFlyTo (dentro do mapa) + SearchUI (portal)
// ---------------------------------------------------------------------------
const SearchBar = ({ mapComponents }) => {
    if (Platform.OS !== 'web') return null;
    if (!mapComponents?.useMap) return null;

    const [flyTarget, setFlyTarget] = useState(null);

    const handleSelect = useCallback((item) => {
        setFlyTarget({ lat: item.lat, lng: item.lng });
    }, []);

    return (
        <>
            {/* Parte dentro do MapContainer — acessa useMap para flyTo */}
            <MapFlyTo target={flyTarget} useMap={mapComponents.useMap} />

            {/* UI renderizada via portal — não é filho do MapContainer no DOM */}
            <SearchUI onSelect={handleSelect} />
        </>
    );
};

export default SearchBar;