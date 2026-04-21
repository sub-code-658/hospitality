import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KATHMANDU_CENTER, MAP_CONFIG } from '../../utils/constants';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });

  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

const MapPicker = ({
  position,
  setPosition,
  height = '300px',
  showInstructions = true
}) => {
  const [localPosition, setLocalPosition] = useState(position || KATHMANDU_CENTER);

  useEffect(() => {
    if (position) {
      setLocalPosition(position);
    }
  }, [position]);

  const handlePositionChange = (newPos) => {
    setLocalPosition(newPos);
    if (setPosition) {
      setPosition(newPos);
    }
  };

  return (
    <div className="relative">
      <div className="h-64 rounded-xl overflow-hidden">
        <MapContainer
          center={localPosition}
          zoom={MAP_CONFIG.defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={localPosition} setPosition={handlePositionChange} />
        </MapContainer>
      </div>
      {showInstructions && (
        <p className="text-white/50 text-sm mt-2">
          Click on the map to set the event location
        </p>
      )}
    </div>
  );
};

export default MapPicker;