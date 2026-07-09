import { BaseRepository } from './base.repository';
import { User } from '@shared/types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  async findByUsername(username: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  protected getSearchFields(): string[] {
    return ['username', 'name'];
  }
}
