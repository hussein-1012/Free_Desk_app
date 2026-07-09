import { getDatabasePath } from '../database/prisma-client';
import { dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { ApiResponse } from '@shared/types';

export class BackupService {
  async createManualBackup(): Promise<ApiResponse<string>> {
    try {
      const dbPath = getDatabasePath();
      if (!fs.existsSync(dbPath)) {
        return { success: false, error: 'ملف قاعدة البيانات المصدر غير موجود' };
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const defaultFilename = `backup-${timestamp}.sqlite`;

      const result = await dialog.showSaveDialog({
        title: 'حفظ نسخة احتياطية من قاعدة البيانات',
        defaultPath: path.join(app.getPath('documents'), defaultFilename),
        filters: [{ name: 'قواعد بيانات SQLite', extensions: ['sqlite', 'db'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, message: 'تم إلغاء عملية النسخ الاحتياطي من قبل المستخدم' };
      }

      fs.copyFileSync(dbPath, result.filePath);
      return { success: true, data: result.filePath, message: 'تم إنشاء النسخة الاحتياطية بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء إنشاء النسخة الاحتياطية' };
    }
  }

  async restoreFromBackup(): Promise<ApiResponse<void>> {
    try {
      const dbPath = getDatabasePath();

      const result = await dialog.showOpenDialog({
        title: 'اختر ملف النسخة الاحتياطية للاستعادة',
        properties: ['openFile'],
        filters: [{ name: 'قواعد بيانات SQLite', extensions: ['sqlite', 'db'] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'تم إلغاء عملية الاستعادة من قبل المستخدم' };
      }

      const backupFilePath = result.filePaths[0];

      // Confirm restore because it overwrites all data
      const choice = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['نعم، استبدل البيانات', 'إلغاء'],
        defaultId: 1,
        title: 'تأكيد استعادة قاعدة البيانات',
        message: 'هل أنت متأكد من رغبتك في استعادة هذه النسخة الاحتياطية؟',
        detail: 'سيؤدي هذا إلى استبدال قاعدة البيانات الحالية بالكامل بالنسخة الاحتياطية المحددة. ستفقد جميع البيانات الحالية غير المحفوظة.',
      });

      if (choice.response !== 0) {
        return { success: false, message: 'تم إلغاء عملية الاستعادة' };
      }

      // Close the current Prisma connection or tell user to restart app after overwrite.
      // Copy backup file over current db file
      fs.copyFileSync(backupFilePath, dbPath);

      // Force reload the app to reinitialize DB connection
      return { success: true, message: 'تم استعادة قاعدة البيانات بنجاح. يرجى إعادة تشغيل التطبيق لتطبيق التغييرات.' };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء استعادة قاعدة البيانات' };
    }
  }

  async runAutoBackup(): Promise<void> {
    try {
      const dbPath = getDatabasePath();
      if (!fs.existsSync(dbPath)) return;

      const backupDir = path.join(app.getPath('userData'), 'auto_backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Keep only last 5 backups
      const files = fs.readdirSync(backupDir)
        .map(file => ({ name: file, time: fs.statSync(path.join(backupDir, file)).mtime.getTime() }))
        .sort((a, b) => a.time - b.time);

      while (files.length >= 5) {
        const oldest = files.shift();
        if (oldest) {
          fs.unlinkSync(path.join(backupDir, oldest.name));
        }
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `auto-backup-${timestamp}.sqlite`);
      fs.copyFileSync(dbPath, backupPath);
      console.log('Automated database backup created at:', backupPath);
    } catch (err) {
      console.error('Failed to run automated backup:', err);
    }
  }
}
