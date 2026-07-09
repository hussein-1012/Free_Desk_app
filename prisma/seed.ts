// ============================================================
// بيانات أولية — نظام إدارة المحل
// ============================================================
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('جارٍ تهيئة قاعدة البيانات...');

  // 1. إنشاء المدير الافتراضي
  const adminUsername = 'admin';
  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        name: 'مدير النظام',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('تم إنشاء حساب المدير');
  }

  // 2. الإعدادات الافتراضية
  const defaultSettings = [
    { key: 'business_name',           value: 'محل إدارة الزيوت والغسيل', type: 'string' },
    { key: 'business_address',        value: 'العنوان', type: 'string' },
    { key: 'business_phone',          value: '', type: 'string' },
    { key: 'business_email',          value: '', type: 'string' },
    { key: 'business_logo',           value: '', type: 'string' },
    { key: 'tax_percentage',          value: '15', type: 'number' },
    { key: 'currency',                value: 'الجنيه', type: 'string' },
    { key: 'theme',                   value: 'light', type: 'string' }, // light | dark
    { key: 'invoice_template',        value: 'standard', type: 'string' },
    { key: 'receipt_printer_name',    value: 'Default', type: 'string' },
    { key: 'receipt_printer_width',   value: '80', type: 'number' }, // 80 or 58 mm
    { key: 'session_timeout_minutes', value: '30', type: 'number' },
    { key: 'auto_backup_enabled',     value: 'true', type: 'boolean' },
    { key: 'backup_encryption_key',   value: 'shop-backup-key-2024', type: 'string' },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.setting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.setting.create({ data: setting });
    }
  }
  console.log('تم إنشاء الإعدادات الافتراضية');

  // 3. التصنيفات الافتراضية (عربية)
  const defaultCategories = [
    { name: 'عام', description: 'تصنيف عام' },
    { name: 'زيوت المحركات', description: 'زيوت وشحومات المحركات' },
    { name: 'زيوت ناقل الحركة', description: 'زيوت ناقل الحركة والفتيس' },
    { name: 'زيوت الهيدروليك', description: 'زيوت نظام الهيدروليك' },
    { name: 'سوائل الفرامل', description: 'سوائل وزيوت الفرامل' },
    { name: 'سوائل التبريد', description: 'مياه تبريد المحرك' },
    { name: 'إكسسوارات', description: 'إكسسوارات السيارات والدراجات' },
    { name: 'غسيل سيارات', description: 'خدمات غسيل السيارات' },
  ];

  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({ where: { name: category.name } });
    if (!existing) {
      await prisma.category.create({ data: category });
    }
  }
  console.log('تم إنشاء التصنيفات الافتراضية');

  console.log('✅ اكتملت تهيئة قاعدة البيانات بنجاح');
}

main()
  .catch((e) => {
    console.error('خطأ أثناء تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
