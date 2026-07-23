// Bentuk data asli dari database
export interface User {
  id: string; // UUID adalah string di TypeScript
  email: string;
  password_hash: string;
  role_id: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Data yang dibutuhkan untuk membuat user baru (tanpa ID atau timestamp, karena di-generate DB)
export type CreateUserDTO = Omit<User, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'deleted_at'>;

// Bentuk data yang aman dikembalikan ke API (TIDAK BOLEH MENGANDUNG PASSWORD HASH)
export type SafeUser = Omit<User, 'password_hash'>;