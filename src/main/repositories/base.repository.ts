import { getPrismaClient } from '../database/prisma-client';
import { QueryParams, PaginatedResult } from '@shared/types';

export class BaseRepository<T> {
  protected prisma = getPrismaClient();
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  async findMany(params: QueryParams = {}): Promise<PaginatedResult<T>> {
    const { page = 1, pageSize = 20, search, sortBy, sortOrder = 'asc', filters = {} } = params;
    const skip = (page - 1) * pageSize;

    let where: Record<string, any> = { ...filters };

    // Basic search handling (can be overridden by subclass repositories)
    if (search) {
      const searchFields = this.getSearchFields();
      if (searchFields.length > 0) {
        where.OR = searchFields.map((field) => ({
          [field]: { contains: search },
        }));
      }
    }

    const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;

    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<T> {
    return this.model.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  // Subclasses override this to specify which fields to search on
  protected getSearchFields(): string[] {
    return [];
  }
}
