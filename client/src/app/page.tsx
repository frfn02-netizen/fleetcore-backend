'use client';


import dynamic from 'next/dynamic';

// Mematikan SSR secara eksplisit untuk mencegah error 'window is not defined'
const DynamicMap = dynamic(() => import('@/components/FleetMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-screen bg-gray-100">Memuat Peta Spasial...</div>
});

export default function Dashboard() {
  return (
    <main className="w-full h-screen bg-gray-200 flex flex-col relative">
      {/* Header / Navbar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg border-l-4 border-blue-600">
        <h1 className="text-xl font-bold text-gray-800">FleetCore Command Center</h1>
        <p className="text-sm text-gray-500">Real-Time Vehicle Tracking</p>
      </div>

      {/* Kanvas Peta */}
      <div className="flex-grow w-full h-full">
        <DynamicMap />
      </div>
    </main>
  );
}