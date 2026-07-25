/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE vehicle_tracking_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        -- Menyimpan titik koordinat (Longitude, Latitude) dengan format SRID 4326 (WGS 84 standar GPS)
        location GEOMETRY(Point, 4326) NOT NULL,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Indeks B-Tree standar untuk pencarian berdasarkan kendaraan
    CREATE INDEX idx_tracking_history_vehicle_id ON vehicle_tracking_history(vehicle_id);

    -- Indeks GiST (Generalized Search Tree) KHUSUS untuk kueri spasial berkecepatan tinggi di PostGIS
    CREATE INDEX idx_tracking_history_location ON vehicle_tracking_history USING GIST (location);

    -- Indeks untuk rentang waktu (sering digunakan saat memfilter riwayat perjalanan dari tanggal X ke Y)
    CREATE INDEX idx_tracking_history_recorded_at ON vehicle_tracking_history(recorded_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS vehicle_tracking_history CASCADE;
  `);
};