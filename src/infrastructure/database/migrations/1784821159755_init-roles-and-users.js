/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Create Roles Table
  pgm.sql(`
    CREATE TABLE roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Insert Default Roles
  pgm.sql(`
    INSERT INTO roles (name, description) VALUES 
      ('SUPER_ADMIN', 'Full system access'),
      ('FLEET_MANAGER', 'Manages fleet, vehicles, and drivers'),
      ('DRIVER', 'Vehicle operator'),
      ('USER', 'General customer tracking shipments');
  `);

  // 3. Create Users Table
  pgm.sql(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE,
      
      CONSTRAINT fk_user_role
        FOREIGN KEY(role_id) 
        REFERENCES roles(id)
        ON DELETE RESTRICT
    );
  `);

  // 4. Create Indexes for Performance
  pgm.sql(`
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_role_id ON users(role_id);
    CREATE INDEX idx_users_deleted_at ON users(deleted_at);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS users CASCADE;`);
  pgm.sql(`DROP TABLE IF EXISTS roles CASCADE;`);
};