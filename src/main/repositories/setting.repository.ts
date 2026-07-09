import { BaseRepository } from './base.repository';
import { Setting } from '@shared/types';

export class SettingRepository extends BaseRepository<Setting> {
  constructor() {
    super('setting');
  }

  async findByKey(key: string): Promise<Setting | null> {
    const res = await this.prisma.setting.findUnique({
      where: { key },
    });
    return res as Setting | null;
  }

  async updateByKey(key: string, value: string): Promise<Setting> {
    const res = await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return res as Setting;
  }
}
