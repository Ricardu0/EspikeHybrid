import React, { useEffect } from "react";
import { Platform } from "react-native";

import MapClickHandler from "./MapClickHandler";
import { TYPE_CONFIG, getRatingColor } from "../utils/helpers";

let MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap, L;

// imports condicionais (só carregam no web)
if (Platform.OS === "web") {
  const RL = require("react-leaflet");
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  Circle = RL.Circle;
  Polygon = RL.Polygon;
  useMap = RL.useMap;
  L = require("leaflet");

  // injeta CSS do leaflet e custom apenas uma vez
  if (typeof document !== "undefined" && !document.getElementById("leaflet-custom-css")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet/dist/leaflet.css";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "leaflet-custom-css";
    style.innerHTML = `
      .leaflet-container { width: 100% !important; height: 100% !important; background: #f8f9fa; }
      .marker-wrapper { position: relative; width: 24px; height: 24px; }
      .custom-dot { width: 12px; height: 12px; border-radius: 50%; display: block; position: relative; }
      .dot-crime { background: #ff4444; }
      .dot-acidente { background: #ffaa00; }
      .dot-outro { background: #44aa44; }
      .pulse { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 12px; height: 12px; border-radius: 50%; background: currentColor; opacity:0.45; animation: pulse 1.4s infinite; }
      @keyframes pulse { 0% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; } 70% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; } 100% { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }
}

// componente auxiliar pra corrigir tiles cortados
const ResizeHandler = () => {
  if (Platform.OS !== "web" || !useMap) return null;
  const map = useMap();

  useEffect(() => {
    const t = setTimeout(() => {
      try { map.invalidateSize(); } catch (e) {}
    }, 250);

    const onResize = () => {
      try { map.invalidateSize(); } catch (e) {}
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  return null;
};

const WebMap = ({
  userLocation,
  markers,
  areas,
  showZones,
  currentPolygon,
  onMapClick,
  onAreaClick,
  onMarkerClick
}) => {
  if (Platform.OS !== "web") return null;

  const circleStyle = (type) => {
    const cfg = TYPE_CONFIG[type] || { color: "#999", weight: 1 };
    return { color: cfg.color, fillColor: cfg.color, fillOpacity: 0.12, weight: 0 };
  };

  const radiusForType = (type) => {
    const weight = TYPE_CONFIG[type]?.weight || 1;
    return 120 * weight;
  };

  const polygonStyle = (area) => {
    const rating = area.ratings?.overall || 0;
    return {
      fillColor: getRatingColor(rating),
      color: getRatingColor(rating),
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.3,
    };
  };

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

      <MapClickHandler onMapClick={onMapClick} />

      {areas.map((area) => (
        <Polygon
          key={area.id}
          positions={area.coordinates}
          pathOptions={polygonStyle(area)}
          eventHandlers={{ click: () => onAreaClick(area) }}
        />
      ))}

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

      {markers.map((m) => {
        const icon = L.divIcon({
          className: "marker-wrapper",
          html: `<div class="custom-dot ${
            m.type === "Crime"
              ? "dot-crime"
              : m.type === "Acidente"
              ? "dot-acidente"
              : "dot-outro"
          }" style="color:${TYPE_CONFIG[m.type].color}"></div>
          <div class="pulse" style="color:${TYPE_CONFIG[m.type].color}"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        return (
          <React.Fragment key={m.id}>
            <Marker
              position={[m.coordinate.lat, m.coordinate.lng]}
              icon={icon}
              eventHandlers={{ click: () => onMarkerClick(m) }}
            >
              <Popup>
                <strong>{m.type}</strong>
                <br />
                <span>{m.description}</span>
              </Popup>
            </Marker>

            {showZones && (
              <Circle
                center={[m.coordinate.lat, m.coordinate.lng]}
                radius={radiusForType(m.type)}
                pathOptions={circleStyle(m.type)}
              />
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default WebMap;
