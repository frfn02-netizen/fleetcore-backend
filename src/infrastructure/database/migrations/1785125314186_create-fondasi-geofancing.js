export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE geofences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        -- GEOMETRY(Polygon) digunakan untuk menggambar batas area, bukan sekadar titik pusat
        area GEOMETRY(Polygon, 4326) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Indeks GiST wajib untuk operasi ST_Within berkecepatan tinggi
    CREATE INDEX idx_geofences_area ON geofences USING GIST (area);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS geofences CASCADE;
  `);
};