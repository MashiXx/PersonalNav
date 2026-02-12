import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(username: string, password: string, fullName: string, email: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }]
    });

    if (existingUser) {
      throw new Error('flash.duplicateUser');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      fullName,
      email
    });

    return await this.userRepository.save(user);
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
