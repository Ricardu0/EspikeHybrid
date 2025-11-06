import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

import { TYPE_CONFIG, getRatingColor } from "../utils/helpers";

const WebMap = ({
  userLocation,
  markers = [],
  areas = [],
  showZones = true,
  currentPolygon = [],
  onMapClick,
  onAreaClick,
  onMarkerClick
}) => {
  const [isClient, setIsClient] = useState(false);
  const [mapComponents, setMapComponents] = useState(null);

  useEffect(() => {
    // ⛔️ CRÍTICO: Só executa no client-side WEB
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;
    
    setIsClient(true);
    
    const setupLeafletCSS = () => {
      // ⛔️ CRÍTICO: Só executa se document existir
      if (typeof document === "undefined") return;
      
      try {
        const existingLeafletCSS = document.getElementById("leaflet-css");
        const existingCustomCSS = document.getElementById("leaflet-custom-css");
        
        if (!existingLeafletCSS) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (!existingCustomCSS) {
          const style = document.createElement("style");
          style.id = "leaflet-custom-css";
          style.innerHTML = `
            .leaflet-container { 
              width: 100% !important; 
              height: 100% !important; 
              background: #f8f9fa; 
            }
            .marker-wrapper { 
              position: relative; 
              width: 24px; 
              height: 24px; 
            }
            .custom-dot { 
              width: 12px; 
              height: 12px; 
              border-radius: 50%; 
              display: block; 
              position: relative;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .dot-crime { background: #ff4444; }
            .dot-acidente { background: #ffaa00; }
            .dot-outro { background: #44aa44; }
            .pulse { 
              position: absolute; 
              left: 50%; 
              top: 50%; 
              transform: translate(-50%,-50%); 
              width: 12px; 
              height: 12px; 
              border-radius: 50%; 
              background: currentColor; 
              opacity: 0.45; 
              animation: pulse 1.4s infinite; 
            }
            @keyframes pulse { 
              0% { 
                transform: translate(-50%,-50%) scale(1); 
                opacity: 0.7; 
              } 
              70% { 
                transform: translate(-50%,-50%) scale(2.6); 
                opacity: 0; 
              } 
              100% { 
                opacity: 0; 
              } 
            }
          `;
          document.head.appendChild(style);
        }
      } catch (error) {
        console.warn("CSS setup failed:", error);
      }
    };

    try {
      // ⛔️ CRÍTICO: Só carrega Leaflet se estivermos no navegador
      const RL = require("react-leaflet");
      const L = require("leaflet");
      
      setupLeafletCSS();

      setMapComponents({
        MapContainer: RL.MapContainer,
        TileLayer: RL.TileLayer,
        Marker: RL.Marker,
        Popup: RL.Popup,
        Circle: RL.Circle,
        Polygon: RL.Polygon,
        useMap: RL.useMap,
        L
      });
    } catch (error) {
      console.error("Failed to load Leaflet:", error);
    }
  }, []);

  // ⛔️ CRÍTICO: Se não for web, retorna NULL IMEDIATAMENTE
  if (Platform.OS !== "web") {
    return null;
  }

  // Componente para redimensionar o mapa - SÓ EXECUTA NO WEB
  const ResizeHandler = () => {
    if (!mapComponents?.useMap) return null;
    
    const map = mapComponents.useMap();
    
    useEffect(() => {
      if (!map) return;

      const handleResize = () => {
        try {
          map.invalidateSize();
        } catch (e) {
          // Ignora erros de redimensionamento
        }
      };

      const timer = setTimeout(handleResize, 300);
      
      window.addEventListener("resize", handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }, [map]);

    return null;
  };

  // Componente para lidar com clicks - SÓ EXECUTA NO WEB
  const SimpleMapClickHandler = () => {
    if (!mapComponents?.useMap) return null;
    
    const map = mapComponents.useMap();
    
    useEffect(() => {
      if (!map || !onMapClick) return;

      const handleClick = (e) => {
        onMapClick(e.latlng);
      };

      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }, [map, onMapClick]);

    return null;
  };

  // Componente para marcadores - SÓ EXECUTA NO WEB
  const CustomMarker = ({ marker, showZones }) => {
    if (!mapComponents?.L) return null;

    const { L, Marker, Popup, Circle } = mapComponents;

    const icon = useMemo(() => {
      const type = marker.type || "outro";
      const config = TYPE_CONFIG[type] || TYPE_CONFIG.outro;
      
      return L.divIcon({
        className: "marker-wrapper",
        html: `
          <div class="custom-dot dot-${type.toLowerCase()}" style="color:${config.color}"></div>
          <div class="pulse" style="color:${config.color}"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    }, [L, marker.type]);

    const circleStyle = useMemo(() => {
      const config = TYPE_CONFIG[marker.type] || TYPE_CONFIG.outro;
      return { 
        color: config.color, 
        fillColor: config.color, 
        fillOpacity: 0.12, 
        weight: 0 
      };
    }, [marker.type]);

    const radius = useMemo(() => {
      const weight = TYPE_CONFIG[marker.type]?.weight || 1;
      return 120 * weight;
    }, [marker.type]);

    if (!icon) return null;

    return (
      <React.Fragment>
        <Marker
          position={[marker.coordinate.lat, marker.coordinate.lng]}
          icon={icon}
          eventHandlers={{ 
            click: () => onMarkerClick?.(marker) 
          }}
        >
          <Popup>
            <div style={{ minWidth: 150 }}>
              <strong style={{ color: TYPE_CONFIG[marker.type]?.color }}>
                {marker.type}
              </strong>
              <br />
              <span>{marker.description}</span>
              {marker.createdAt && (
                <>
                  <br />
                  <small style={{ color: '#666' }}>
                    {new Date(marker.createdAt).toLocaleDateString()}
                  </small>
                </>
              )}
            </div>
          </Popup>
        </Marker>

        {showZones && (
          <Circle
            center={[marker.coordinate.lat, marker.coordinate.lng]}
            radius={radius}
            pathOptions={circleStyle}
          />
        )}
      </React.Fragment>
    );
  };

  // Componente para áreas - SÓ EXECUTA NO WEB
  const CustomArea = ({ area }) => {
    if (!mapComponents?.Polygon) return null;

    const { Polygon } = mapComponents;

    const polygonStyle = useMemo(() => {
      const rating = area.ratings?.overall || 0;
      return {
        fillColor: getRatingColor(rating),
        color: getRatingColor(rating),
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.3,
      };
    }, [area.ratings?.overall]);

    return (
      <Polygon
        key={area.id}
        positions={area.coordinates}
        pathOptions={polygonStyle}
        eventHandlers={{ 
          click: () => onAreaClick?.(area) 
        }}
      />
    );
  };

  // ⛔️ CRÍTICO: Fallback se ainda não carregou
  if (!isClient || !mapComponents) {
    return (
      <View style={styles.fallback}>
        <Text>Carregando mapa...</Text>
      </View>
    );
  }

  const {
    MapContainer,
    TileLayer,
    Polygon
  } = mapComponents;

  try {
    return (
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
        attributionControl={false}
        zoomControl={false}
      >
        <ResizeHandler />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &amp; CARTO'
        />

        <SimpleMapClickHandler />

        {/* Áreas existentes */}
        {areas.map((area) => (
          <CustomArea
            key={area.id}
            area={area}
          />
        ))}

        {/* Polígono em desenho */}
        {currentPolygon.length > 0 && (
          <Polygon
            positions={currentPolygon}
            pathOptions={{
              fillColor: "blue",
              color: "blue",
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.3,
            }}
          />
        )}

        {/* Marcadores personalizados */}
        {markers.map((marker) => (
          <CustomMarker
            key={marker.id}
            marker={marker}
            showZones={showZones}
          />
        ))}
      </MapContainer>
    );
  } catch (error) {
    console.error("Error rendering map:", error);
    return (
      <View style={styles.fallback}>
        <Text>Erro ao carregar o mapa</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default WebMap;