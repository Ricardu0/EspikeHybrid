/**
 * WebMap.js — com hexágonos + SearchBar via portal.
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

import { TYPE_CONFIG, getRatingColor } from '../utils/helpers';
import HexagonLayer from './HexagonLayer';
import SearchBar    from './SearchBar';
import { useHexagonos } from '../hooks/Usehexagonos';

const WebMap = ({
                  userLocation,
                  markers = [],
                  areas = [],
                  showZones = true,
                  currentPolygon = [],
                  onMapClick,
                  onAreaClick,
                  onMarkerClick,
                }) => {
  const [isClient, setIsClient]           = useState(false);
  const [mapComponents, setMapComponents] = useState(null);

  const mapContainerRef = useRef(null); // ref para o <div> container — posiciona a SearchBar

  // ── Hexágonos ─────────────────────────────────────────────────────────────
  const { hexagonosVisiveis, atualizarRegiao } = useHexagonos();

  // ── Setup Leaflet ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;

    setIsClient(true);

    const setupLeafletCSS = () => {
      if (typeof document === 'undefined') return;
      try {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css'; link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
          document.head.appendChild(link);
        }
        if (!document.getElementById('leaflet-custom-css')) {
          const style = document.createElement('style');
          style.id = 'leaflet-custom-css';
          style.innerHTML = `
            .leaflet-container { width:100%!important; height:100%!important; background:#f8f9fa; }
            .marker-wrapper { position:relative; width:24px; height:24px; }
            .custom-dot { width:12px; height:12px; border-radius:50%; display:block; position:relative; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,.3); }
            .dot-crime { background:#ff4444; }
            .dot-acidente { background:#ffaa00; }
            .dot-outro { background:#44aa44; }
            .pulse { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:12px; height:12px; border-radius:50%; background:currentColor; opacity:0.45; animation:pulse 1.4s infinite; }
            @keyframes pulse { 0%{transform:translate(-50%,-50%) scale(1);opacity:0.7} 70%{transform:translate(-50%,-50%) scale(2.6);opacity:0} 100%{opacity:0} }
          `;
          document.head.appendChild(style);
        }
      } catch (error) { console.warn('CSS setup failed:', error); }
    };

    try {
      const RL = require('react-leaflet');
      const L  = require('leaflet');
      setupLeafletCSS();
      setMapComponents({
        MapContainer: RL.MapContainer,
        TileLayer:    RL.TileLayer,
        Marker:       RL.Marker,
        Popup:        RL.Popup,
        Circle:       RL.Circle,
        Polygon:      RL.Polygon,
        useMap:       RL.useMap,
        useMapEvents: RL.useMapEvents,
        L,
      });
    } catch (error) { console.error('Failed to load Leaflet:', error); }
  }, []);

  if (Platform.OS !== 'web') return null;

  // ── Handlers internos ao MapContainer ────────────────────────────────────
  const RegionChangeHandler = () => {
    if (!mapComponents?.useMapEvents) return null;
    mapComponents.useMapEvents({
      moveend(e) {
        const map = e.target, center = map.getCenter(), bounds = map.getBounds();
        atualizarRegiao({
          latitude: center.lat, longitude: center.lng,
          latitudeDelta:  bounds.getNorth() - bounds.getSouth(),
          longitudeDelta: bounds.getEast()  - bounds.getWest(),
        });
      },
      zoomend(e) {
        const map = e.target, center = map.getCenter(), bounds = map.getBounds();
        atualizarRegiao({
          latitude: center.lat, longitude: center.lng,
          latitudeDelta:  bounds.getNorth() - bounds.getSouth(),
          longitudeDelta: bounds.getEast()  - bounds.getWest(),
        });
      },
    });
    return null;
  };

  const ResizeHandler = () => {
    if (!mapComponents?.useMap) return null;
    const map = mapComponents.useMap();
    useEffect(() => {
      if (!map) return;
      const handle = () => { try { map.invalidateSize(); } catch (e) {} };
      const t = setTimeout(handle, 300);
      window.addEventListener('resize', handle);
      return () => { clearTimeout(t); window.removeEventListener('resize', handle); };
    }, [map]);
    return null;
  };

  const SimpleMapClickHandler = () => {
    if (!mapComponents?.useMap) return null;
    const map = mapComponents.useMap();
    useEffect(() => {
      if (!map || !onMapClick) return;
      const handle = (e) => onMapClick(e.latlng);
      map.on('click', handle);
      return () => map.off('click', handle);
    }, [map, onMapClick]);
    return null;
  };

  const CustomMarker = ({ marker, showZones }) => {
    if (!mapComponents?.L) return null;
    const { L, Marker, Popup, Circle } = mapComponents;
    const icon = useMemo(() => {
      const type = marker.type || 'outro';
      const cfg  = TYPE_CONFIG[type] || TYPE_CONFIG.outro;
      return L.divIcon({
        className: 'marker-wrapper',
        html: `<div class="custom-dot dot-${type.toLowerCase()}" style="color:${cfg.color}"></div>
               <div class="pulse" style="color:${cfg.color}"></div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      });
    }, [L, marker.type]);
    const circleStyle = useMemo(() => {
      const cfg = TYPE_CONFIG[marker.type] || TYPE_CONFIG.outro;
      return { color: cfg.color, fillColor: cfg.color, fillOpacity: 0.12, weight: 0 };
    }, [marker.type]);
    const radius = useMemo(() => 120 * (TYPE_CONFIG[marker.type]?.weight || 1), [marker.type]);
    if (!icon) return null;
    return (
        <React.Fragment>
          <Marker position={[marker.coordinate.lat, marker.coordinate.lng]} icon={icon}
                  eventHandlers={{ click: () => onMarkerClick?.(marker) }}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong style={{ color: TYPE_CONFIG[marker.type]?.color }}>{marker.type}</strong><br />
                <span>{marker.description}</span>
                {marker.createdAt && <><br /><small style={{ color: '#666' }}>{new Date(marker.createdAt).toLocaleDateString()}</small></>}
              </div>
            </Popup>
          </Marker>
          {showZones && <Circle center={[marker.coordinate.lat, marker.coordinate.lng]} radius={radius} pathOptions={circleStyle} />}
        </React.Fragment>
    );
  };

  const CustomArea = ({ area }) => {
    if (!mapComponents?.Polygon) return null;
    const { Polygon } = mapComponents;
    const polygonStyle = useMemo(() => {
      const rating = area.ratings?.overall || 0;
      return { fillColor: getRatingColor(rating), color: getRatingColor(rating), weight: 2, opacity: 0.8, fillOpacity: 0.3 };
    }, [area.ratings?.overall]);
    return <Polygon key={area.id} positions={area.coordinates} pathOptions={polygonStyle}
                    eventHandlers={{ click: () => onAreaClick?.(area) }} />;
  };

  if (!isClient || !mapComponents) {
    return <View style={styles.fallback}><Text>Carregando mapa...</Text></View>;
  }

  const { MapContainer, TileLayer, Polygon } = mapComponents;

  try {
    return (
        <div ref={mapContainerRef} style={{ flex: 1, height: '100%', width: '100%' }}>
          <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={14}
              style={{ height: '100vh', width: '100%' }}
              attributionControl={false}
              zoomControl={false}
          >
            <ResizeHandler />
            <RegionChangeHandler />

            {/* SearchBar: MapFlyTo fica aqui dentro; a UI vai via portal para body */}
            <SearchBar mapComponents={mapComponents} />

            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors &amp; CARTO'
            />

            <SimpleMapClickHandler />

            <HexagonLayer hexagonos={hexagonosVisiveis} mapComponents={mapComponents} />

            {areas.map(area => <CustomArea key={area.id} area={area} />)}

            {currentPolygon.length > 0 && (
                <Polygon positions={currentPolygon}
                         pathOptions={{ fillColor: 'blue', color: 'blue', weight: 2, opacity: 0.8, fillOpacity: 0.3 }} />
            )}

            {markers.map(marker => (
                <CustomMarker key={marker.id} marker={marker} showZones={showZones} />
            ))}
          </MapContainer>
        </div>
    );
  } catch (error) {
    console.error('Error rendering map:', error);
    return <View style={styles.fallback}><Text>Erro ao carregar o mapa</Text></View>;
  }
};

const styles = StyleSheet.create({
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
});

export default WebMap;