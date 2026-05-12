/**
 * WebMap.js — Geolocalização Nativa (Pronta para o Tunnel do Expo)
 */

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TYPE_CONFIG, getRatingColor } from '../utils/helpers';
import HexagonLayer from './HexagonLayer';
import SearchBar    from './SearchBar';
import { useHexagonos } from '../hooks/Usehexagonos';

const SP_FALLBACK = { lat: -23.5505, lng: -46.6333 };
const GEO_TIMEOUT = 10000;

const GEO = {
  IDLE:         'idle',
  WAITING:      'waiting',
  OK:           'ok',
  DENIED:       'denied',
  UNAVAILABLE:  'unavailable',
  TIMEOUT:      'timeout',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes mantidos iguais
// ─────────────────────────────────────────────────────────────────────────────
const RegionChangeHandler = ({ useMapEvents, onRegionChange }) => {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter(), b = e.target.getBounds();
      onRegionChange({
        latitude: c.lat, longitude: c.lng,
        latitudeDelta: b.getNorth() - b.getSouth(),
        longitudeDelta: b.getEast() - b.getWest()
      });
    },
    zoomend(e) {
      const c = e.target.getCenter(), b = e.target.getBounds();
      onRegionChange({
        latitude: c.lat, longitude: c.lng,
        latitudeDelta: b.getNorth() - b.getSouth(),
        longitudeDelta: b.getEast() - b.getWest()
      });
    },
  });
  return null;
};

const ResizeHandler = ({ useMap }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handle = () => { try { map.invalidateSize(); } catch (_) {} };
    const t = setTimeout(handle, 300);
    window.addEventListener('resize', handle);
    return () => { clearTimeout(t); window.removeEventListener('resize', handle); };
  }, [map]);
  return null;
};

const MapClickHandler = ({ useMap, onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !onMapClick) return;
    const handle = (e) => onMapClick(e.latlng);
    map.on('click', handle);
    return () => map.off('click', handle);
  }, [map, onMapClick]);
  return null;
};

const FlyToLocation = ({ position, useMap }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !position) return;
    map.flyTo([position.lat, position.lng], 15, { duration: 1.4 });
  }, [map, position]);
  return null;
};

const UserLocationMarker = ({ position, L, Marker, Popup }) => {
  const icon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      className: '',
      html: '<div class="user-location-dot"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
  }, [L]);

  if (!position || !icon || !Marker) return null;
  return (
      <Marker position={[position.lat, position.lng]} icon={icon} zIndexOffset={1000}>
        <Popup>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
            📍 Você está aqui
          </div>
        </Popup>
      </Marker>
  );
};

const OccurrenceMarker = ({ marker, showZones, L, Marker, Popup, Circle, onMarkerClick }) => {
  const icon = useMemo(() => {
    if (!L) return null;
    const type = marker.type || 'Outro';
    const cfg  = TYPE_CONFIG[type] || TYPE_CONFIG.Outro;
    return L.divIcon({
      className: 'marker-wrapper',
      html: `<div class="custom-dot dot-${type.toLowerCase()}" style="color:${cfg.color}"></div>
             <div class="pulse" style="color:${cfg.color}"></div>`,
      iconSize: [24, 24], iconAnchor: [12, 12],
    });
  }, [L, marker.type]);

  if (!icon || !Marker) return null;
  const cfg = TYPE_CONFIG[marker.type] || TYPE_CONFIG.Outro;
  const radius = 120 * (cfg.weight || 1);

  return (
      <React.Fragment>
        <Marker
            position={[marker.coordinate.lat, marker.coordinate.lng]}
            icon={icon}
            eventHandlers={{ click: () => onMarkerClick?.(marker) }}
        >
          <Popup>
            <div style={{ minWidth: 150 }}>
              <strong style={{ color: cfg.color }}>{marker.type}</strong><br />
              <span>{marker.description}</span>
            </div>
          </Popup>
        </Marker>
        {showZones && Circle && (
            <Circle
                center={[marker.coordinate.lat, marker.coordinate.lng]}
                radius={radius}
                pathOptions={{ color: cfg.color, fillColor: cfg.color, fillOpacity: 0.10, weight: 0 }}
            />
        )}
      </React.Fragment>
  );
};

const AreaPolygon = ({ area, Polygon, onAreaClick }) => {
  if (!Polygon) return null;
  const color = getRatingColor(area.ratings?.overall || 0);
  return (
      <Polygon
          positions={area.coordinates}
          pathOptions={{ fillColor: color, color, weight: 2, opacity: 0.8, fillOpacity: 0.3 }}
          eventHandlers={{ click: () => onAreaClick?.(area) }}
      />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook de geolocalização nativa
// ─────────────────────────────────────────────────────────────────────────────
function useGeolocation() {
  const [status, setStatus] = useState(GEO.IDLE);
  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus(GEO.UNAVAILABLE);
      setMessage('Geolocalização não suportada pelo navegador.');
      return;
    }

    setStatus(GEO.WAITING);
    setMessage('Aguardando permissão de localização…');

    navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStatus(GEO.OK);
          setMessage('');
        },
        (err) => {
          if (cancelled) return;
          if (err.code === 1) {
            setStatus(GEO.DENIED);
            setMessage('Permissão negada. O mapa usará o local padrão.');
          } else {
            setStatus(GEO.UNAVAILABLE);
            setMessage('Falha ao obter localização. Tentando novamente...');
          }
        },
        {
          timeout: GEO_TIMEOUT,
          maximumAge: 0,
          enableHighAccuracy: true
        }
    );

    return () => { cancelled = true; };
  }, [retryKey]);

  const retry = useCallback(() => {
    setStatus(GEO.IDLE);
    setPosition(null);
    setMessage('');
    setRetryKey(k => k + 1);
  }, []);

  return { status, position, message, retry };
}

// ─────────────────────────────────────────────────────────────────────────────
// Banner de status
// ─────────────────────────────────────────────────────────────────────────────
const GeoBanner = ({ status, message, onRetry }) => {
  if (status === GEO.IDLE || status === GEO.OK || status === GEO.DENIED) return null;

  const isLoading = status === GEO.WAITING;
  const isError   = [GEO.UNAVAILABLE, GEO.TIMEOUT].includes(status);

  let bg = isLoading ? '#e8f4fd' : '#fff3cd';
  let border = isLoading ? '#bee5eb' : '#ffc107';
  let color = isLoading ? '#0c5460' : '#856404';

  return (
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, background: bg, color, border: `1px solid ${border}`,
        borderRadius: 10, padding: '8px 14px', maxWidth: 380, width: 'max-content',
        fontFamily: 'system-ui, sans-serif', fontSize: 13,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{message}</span>
        </div>
        {isError && (
            <button onClick={onRetry} style={{
              marginTop: 8, padding: '4px 12px', borderRadius: 6,
              background: '#007AFF', color: '#fff', border: 'none', cursor: 'pointer',
            }}>Tentar novamente</button>
        )}
      </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
const WebMap = ({ markers = [], areas = [], showZones = true, showHexagons = false, isScreenFocused = true, currentPolygon = [], onMapClick, onAreaClick, onMarkerClick }) => {
  const [mapComponents, setMapComponents] = useState(null);
  const { hexagonosVisiveis, atualizarRegiao } = useHexagonos();
  const { status: geoStatus, position: userPos, message: geoMsg, retry: geoRetry } = useGeolocation();

  const handleRegionChange = useCallback((r) => atualizarRegiao(r), [atualizarRegiao]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-custom-css')) {
      const style = document.createElement('style'); style.id = 'leaflet-custom-css';
      style.innerHTML = `
        .leaflet-container { width:100%!important; height:100%!important; background:#f0f0f0; }
        .marker-wrapper { position:relative; width:24px; height:24px; }
        .custom-dot { width:12px; height:12px; border-radius:50%; display:block; position:relative; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,.3); }
        .dot-crime { background:#ff4444; } .dot-acidente { background:#ffaa00; } .dot-outro { background:#44aa44; }
        .pulse { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:12px; height:12px; border-radius:50%; background:currentColor; opacity:0.45; animation:markerPulse 1.4s infinite; }
        @keyframes markerPulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.7; } 70% { transform:translate(-50%,-50%) scale(2.6); opacity:0; } 100% { opacity:0; } }
        .user-location-dot { width:16px; height:16px; border-radius:50%; background:#007AFF; border:3px solid #fff; box-shadow:0 0 0 4px rgba(0,122,255,0.30); }
      `;
      document.head.appendChild(style);
    }

    try {
      const RL = require('react-leaflet'); const L = require('leaflet');
      setMapComponents({ MapContainer: RL.MapContainer, TileLayer: RL.TileLayer, Marker: RL.Marker, Popup: RL.Popup, Circle: RL.Circle, Polygon: RL.Polygon, useMap: RL.useMap, useMapEvents: RL.useMapEvents, L });
    } catch (e) { console.error('[WebMap] Falha ao carregar Leaflet:', e); }
  }, []);

  if (Platform.OS !== 'web') return null;

  if (!mapComponents) {
    return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando mapa…</Text>
        </View>
    );
  }

  const { MapContainer, TileLayer, Polygon, useMap, useMapEvents, L, Marker, Popup, Circle } = mapComponents;

  // Define o centro inicial. Se pegou a geolocalização, usa ela. Senão, usa o fallback de SP.
  const initialCenter = userPos ? [userPos.lat, userPos.lng] : [SP_FALLBACK.lat, SP_FALLBACK.lng];

  return (
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <GeoBanner status={geoStatus} message={geoMsg} onRetry={geoRetry} />

        <MapContainer center={initialCenter} zoom={13} style={{ height: '100vh', width: '100%' }} attributionControl={false} zoomControl={false}>
          <ResizeHandler useMap={useMap} />
          <RegionChangeHandler useMapEvents={useMapEvents} onRegionChange={handleRegionChange} />
          <MapClickHandler useMap={useMap} onMapClick={onMapClick} />

          {geoStatus === GEO.OK && <FlyToLocation position={userPos} useMap={useMap} />}
          <SearchBar mapComponents={mapComponents} visible={isScreenFocused} />

          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <HexagonLayer hexagonos={hexagonosVisiveis} mapComponents={mapComponents} showHexagons={showHexagons} />

          {showZones && areas.map(area => <AreaPolygon key={area._id || area.id} area={area} Polygon={Polygon} onAreaClick={onAreaClick} />)}
          {currentPolygon.length > 0 && <Polygon positions={currentPolygon} pathOptions={{ fillColor: '#2196F3', color: '#2196F3', weight: 2, opacity: 0.9, fillOpacity: 0.25 }} />}
          {markers.map(marker => <OccurrenceMarker key={marker.id} marker={marker} showZones={showZones} L={L} Marker={Marker} Popup={Popup} Circle={Circle} onMarkerClick={onMarkerClick} />)}
          {geoStatus === GEO.OK && <UserLocationMarker position={userPos} L={L} Marker={Marker} Popup={Popup} />}
        </MapContainer>
      </div>
  );
};

const styles = StyleSheet.create({ loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' }, loadingText: { fontSize: 15, color: '#555', marginTop: 12 } });

export default WebMap;