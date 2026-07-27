'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// Titik Geofence Monas yang kita tanam di PostGIS, dikonversi ke format [Lat, Lng] untuk Leaflet
const GEOFENCE_COORDS: [number, number][] = [
  [-6.174, 106.825],
  [-6.174, 106.831],
  [-6.179, 106.831],
  [-6.179, 106.825],
];

export default function FleetMap() {
  const centerPosition: [number, number] = [-6.175442, 106.827203];
  
  // State untuk menyimpan titik koordinat truk secara dinamis
  const [truckPosition, setTruckPosition] = useState<[number, number] | null>(null);

   useEffect(() => {
    const socket = io('http://localhost:3001', {
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MzM2MGFjMC1iNzc1LTRiMDEtYjcwOC02ZjJmYzIzNWFlZmEiLCJyb2xlSWQiOjMsImlhdCI6MTc4NTEyMzg3OSwiZXhwIjoxNzg1MjEwMjc5fQ.voNxWu53kyoMyKMdvdrxmviN9ln3pEM4m3YdsYHcjhc' 
      }
    });

    socket.on('connect', () => {
      console.log('✅ Radar Dashboard Terhubung ke Server FleetCore');
    });

    // HANYA ADA SATU LISTENER INI
    socket.on('location_update', (data: { vehicleId: string; lng: number; lat: number }) => {
      console.log('📡 DATA RADAR DITERIMA:', data); 
      setTruckPosition([data.lat, data.lng]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={centerPosition} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}>
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap'
        />

        {/* Proyeksi Visual Area Geofence (Kotak Merah) */}
        <Polygon positions={GEOFENCE_COORDS} color="red" fillOpacity={0.1} />

        {/* Pin Truk Dinamis: Hanya dirender jika ada data masuk */}
        {truckPosition && (
          <Marker position={truckPosition}>
            <Popup>Aset Terlacak</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}