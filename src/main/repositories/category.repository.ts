import { BaseRepository } from './base.repository';
import { Category } from '@shared/types';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('category');
  }

  async getHierarchy(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  }

  protected getSearchFields(): string[] {
    return ['name', 'description'];
  }
}
