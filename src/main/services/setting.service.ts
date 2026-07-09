import { SettingRepository } from '../repositories/setting.repository';
import { ApiResponse, Setting } from '@shared/types';

export class SettingService {
  private settingRepo = new SettingRepository();

  async getSettings(): Promise<ApiResponse<Record<string, string>>> {
    try {
      const result = await this.settingRepo.findMany({ pageSize: 100 });
      const settingsMap: Record<string, string> = {};
      result.items.forEach((item) => {
        settingsMap[item.key] = item.value;
      });
      return { success: true, data: settingsMap };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب الإعدادات' };
    }
  }

  async getSettingByKey(key: string): Promise<ApiResponse<Setting>> {
    try {
      const setting = await this.settingRepo.findByKey(key);
      if (!setting) return { success: false, error: 'الإعداد غير موجود' };
      return { success: true, data: setting };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب الإعداد' };
    }
  }

  async updateSetting(key: string, value: string): Promise<ApiResponse<Setting>> {
    try {
      const setting = await this.settingRepo.updateByKey(key, value);
      return { success: true, data: setting, message: 'تم تحديث الإعداد بنجاح' };
    } catch (error: any) {
      return { success: false, error: 'فشل في تحديث الإعداد' };
    }
  }

  async updateSettings(settings: Record<string, string>): Promise<ApiResponse<void>> {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.settingRepo.updateByKey(key, value);
      }
      return { success: true, message: 'تم حفظ الإعدادات بنجاح' };
    } catch (error: any) {
      return { success: false, error: 'فشل في حفظ الإعدادات' };
    }
  }
}
