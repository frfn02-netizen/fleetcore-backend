import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '@/domain/user/repository';
import { User } from '@/domain/user/entity';
import { env } from '@/shared/config/env';

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  // 1. Tambahkan fungsi register yang selama ini dicari oleh router
  async register(email: string, pass: string, roleId: number): Promise<Omit<User, 'password_hash'>> {
    // Cek apakah email sudah terdaftar
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Hash password menggunakan bcrypt dengan cost factor 10
    const hashedPassword = await bcrypt.hash(pass, 10);

    // Simpan ke database melalui repository
    const newUser = await this.userRepository.create({
      email,
      password_hash: hashedPassword,
      role_id: roleId,
    });

    // Kembalikan data user tanpa password_hash demi keamanan
    const { password_hash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // 2. Fungsi login yang sudah ada sebelumnya
  async login(email: string, pass: string): Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Buat JWT Token yang berlaku selama 1 hari
    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}