/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Buat custom tipe ENUM untuk kendaraan
  pgm.sql(`CREATE TYPE vehicle_type AS ENUM ('MOTORCYCLE', 'CAR', 'VAN', 'TRUCK');`);
  pgm.sql(`CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED');`);

  // 2. Buat tabel
  pgm.sql(`
    CREATE TABLE vehicles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      license_plate VARCHAR(20) UNIQUE NOT NULL,
      type vehicle_type NOT NULL,
      capacity_weight_kg INTEGER NOT NULL DEFAULT 0,
      status vehicle_status DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE
    );
  `);

  // 3. Buat Indexing untuk performa pencarian
  pgm.sql(`CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);`);
  pgm.sql(`CREATE INDEX idx_vehicles_status ON vehicles(status);`);
};

exports.down = (pgm) => {
  // Rollback urutannya dibalik: Tabel dulu, baru ENUM-nya
  pgm.sql(`DROP TABLE IF EXISTS vehicles CASCADE;`);
  pgm.sql(`DROP TYPE IF EXISTS vehicle_status;`);
  pgm.sql(`DROP TYPE IF EXISTS vehicle_type;`);
};