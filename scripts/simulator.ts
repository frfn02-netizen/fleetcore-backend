import { io } from 'socket.io-client';

// GANTI DENGAN DATA ASLIMU!
const VEHICLE_ID = 'c114ff1b-b79f-49d3-9d66-bdff31c1e134';
const DRIVER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MzM2MGFjMC1iNzc1LTRiMDEtYjcwOC02ZjJmYzIzNWFlZmEiLCJyb2xlSWQiOjMsImlhdCI6MTc4NTEyMzg3OSwiZXhwIjoxNzg1MjEwMjc5fQ.voNxWu53kyoMyKMdvdrxmviN9ln3pEM4m3YdsYHcjhc'
const socket = io('http://localhost:3001', {
  auth: {
    token: DRIVER_TOKEN,
  },
});

socket.on('connect', () => {
  console.log(`✅ Simulator terhubung ke server dengan ID: ${socket.id}`);
  console.log('🚚 Memulai simulasi perjalanan truk...');

 let currentLat = -6.200000; 
 let currentLng = 106.822000;

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