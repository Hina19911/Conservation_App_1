// src/components/MapView.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Vite
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Toronto as a default center (change if you want)
const center = [43.6532, -79.3832];

export default function MapView() {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Map</h5>
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          style={{ height: 320, width: '100%', borderRadius: 8 }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>Our base location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
