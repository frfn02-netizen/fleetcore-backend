import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '@/domain/user/repository';
import { SafeUser } from '@/domain/user/entity';
import { env } from '@/shared/config/env';

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  // ... biarkan metode register() yang sudah ada di sini ...

  async login(email: string, plainPassword: string): Promise<{ user: SafeUser; token: string }> {
    // 1. Cari user berdasarkan email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Verifikasi password hash
    const isPasswordMatch = await bcrypt.compare(plainPassword, user.password_hash);
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    // 3. Generate JWT Token (Tiket masuk)
    // Payload berisi id dan role_id agar mempermudah otorisasi nanti
    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      env.JWT_SECRET,
      { expiresIn: '1d' } // Token kadaluarsa dalam 1 hari
    );

    // 4. Return data aman dan token
    const { password_hash, ...safeUserData } = user;
    
    return {
      user: safeUserData,
      token,
    };
  }
}