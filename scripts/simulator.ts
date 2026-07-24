import { io } from 'socket.io-client';

// GANTI DENGAN DATA ASLIMU!
const DRIVER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MzM2MGFjMC1iNzc1LTRiMDEtYjcwOC02ZjJmYzIzNWFlZmEiLCJyb2xlSWQiOjMsImlhdCI6MTc4NDg3Njk3OSwiZXhwIjoxNzg0OTYzMzc5fQ._3uTTaWm9kW28Jx2nlT39RC2xMcn2M1JiNo-w_Vt9So'; 
const VEHICLE_ID = 'c114ff1b-b79f-49d3-9d66-bdff31c1e134'; 

const socket = io('http://localhost:3000', {
  auth: {
    token: DRIVER_TOKEN,
  },
});

socket.on('connect', () => {
  console.log(`✅ Simulator terhubung ke server dengan ID: ${socket.id}`);
  console.log('🚚 Memulai simulasi perjalanan truk...');

  // Koordinat awal (Misal: Monas, Jakarta)
  let currentLat = -6.175392;
  let currentLng = 106.827153;

  // Tembakkan koordinat setiap 2 detik
  setInterval(() => {
    // Simulasi truk bergerak lurus perlahan ke arah Tenggara
    currentLat -= 0.00005;
    currentLng += 0.00005;

    socket.emit('update_location', {
      vehicleId: VEHICLE_ID,
      lat: currentLat,
      lng: currentLng,
    });

    console.log(`📍 Transmit GPS -> Lat: ${currentLat.toFixed(6)}, Lng: ${currentLng.toFixed(6)}`);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error(`❌ Koneksi ditolak: ${error.message}`);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('🔌 Koneksi terputus dari server.');
});