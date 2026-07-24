import bcrypt from 'bcrypt';
import { IUserRepository } from '@/domain/user/repository';
import { SafeUser } from '@/domain/user/entity';

export class AuthService {
  // Dependency Injection: Service ini membutuhkan Repository,
  // tapi dia tidak peduli apakah itu Postgres, MySQL, atau Mock (untuk testing).
  constructor(private readonly userRepository: IUserRepository) {}

  async register(email: string, plainPassword: string, roleId: number): Promise<SafeUser> {
    // 1. Cek apakah user dengan email tersebut sudah terdaftar
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // 2. Hash password menggunakan bcrypt dengan cost factor (salt rounds) = 10
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    // 3. Simpan ke database melalui repository
    const newUser = await this.userRepository.create({
      email,
      password_hash: passwordHash,
      role_id: roleId,
    });

    // 4. Return data yang aman (buang password_hash sebelum dikirim ke luar)
    const { password_hash, ...safeUserData } = newUser;
    return safeUserData;
  }
}