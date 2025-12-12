import { User } from "../models/user-model.ts";

export class UserRepository {
  async findByTelegramId(telegramId: number): Promise<User | null> {
    return await User.findOne({
      where: { telegramId },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  async createOrUpdate(data: {
    telegramId: number;
    username?: string | undefined;
    firstName?: string | undefined;
  }): Promise<User> {
    const [user] = await User.upsert({
      telegramId: data.telegramId,
      username: data.username ?? null,
      firstName: data.firstName ?? null,
    });
    return user;
  }

  async create(data: {
    telegramId: number;
    username?: string;
    firstName?: string;
  }): Promise<User> {
    return await User.create(data);
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;

    return await user.update(data);
  }

  async exists(telegramId: number): Promise<boolean> {
    const count = await User.count({
      where: { telegramId },
    });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
