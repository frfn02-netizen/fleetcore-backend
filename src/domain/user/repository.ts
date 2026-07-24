import { User, CreateUserDTO } from './entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}