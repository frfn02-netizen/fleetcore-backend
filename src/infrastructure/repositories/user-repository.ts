import { IUserRepository } from '@/domain/user/repository';
import { User, CreateUserDTO } from '@/domain/user/entity';
import { dbPool } from '@/infrastructure/database/postgres';

export class PostgresUserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    // Kita pastikan user yang sudah di-soft delete tidak bisa login
    const query = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1';
    const result = await dbPool.query(query, [email]);
    
    return result.rows[0] || null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, role_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.email, data.password_hash, data.role_id];
    const result = await dbPool.query(query, values);
    
    return result.rows[0];
  }
}