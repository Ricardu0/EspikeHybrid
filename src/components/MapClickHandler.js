import { useMapEvents } from "react-leaflet";

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) { 
      onMapClick(e.latlng); 
    },
  });
  return null;
};

export default MapClickHandler;