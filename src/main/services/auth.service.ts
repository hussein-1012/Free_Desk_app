// // خدمة المصادقة مع تحديد المحاولات وتأمين الجلسة
// import { UserRepository } from '../repositories/user.repository';
// import { AuditService } from './audit.service';
// import * as bcrypt from 'bcryptjs';
// import * as jwt from 'jsonwebtoken';
// import { ApiResponse, User } from '@shared/types';
// import { loginSchema, userCreateSchema, userUpdateSchema } from '@shared/schemas';

// const JWT_SECRET = process.env.JWT_SECRET || 'shop-mgmt-offline-secret-key-2024';
// const MAX_LOGIN_ATTEMPTS = 5;
// const LOCK_DURATION_MINUTES = 15;

// export class AuthService {
//   private userRepo = new UserRepository();
//   private auditService = new AuditService();

//   async login(credentials: any): Promise<ApiResponse<{ user: User; token: string }>> {
//     try {
//       const validated = loginSchema.parse(credentials);
//       const user = await this.userRepo.findByUsername(validated.username);

//       // التحقق من وجود المستخدم
//       if (!user) {
//         return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
//       }

//       // التحقق من قفل الحساب
//       if (user.lockedUntil && new Date() < user.lockedUntil) {
//         const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
//         return { success: false, error: `الحساب مقفل. يرجى المحاولة بعد ${minutes} دقيقة` };
//       }

//       // التحقق من أن المستخدم نشط
//       if (!user.isActive) {
//         return { success: false, error: 'الحساب غير نشط. يرجى التواصل مع المدير' };
//       }

//       // التحقق من كلمة المرور
//       const isValidPassword = await bcrypt.compare(validated.password, user.password);

//       if (!isValidPassword) {
//         // زيادة عدد المحاولات الفاشلة
//         const attempts = (user.loginAttempts || 0) + 1;
//         const updateData: any = { loginAttempts: attempts };

//         if (attempts >= MAX_LOGIN_ATTEMPTS) {
//           const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
//           updateData.lockedUntil = lockUntil;
//           await this.userRepo.update(user.id, updateData);
//           await this.auditService.log({ userId: user.id, action: 'LOGIN_FAILED', entity: 'User', entityId: user.id, details: { attempts } });
//           return { success: false, error: `تم تجاوز الحد المسموح من المحاولات. الحساب مقفل لمدة ${LOCK_DURATION_MINUTES} دقيقة` };
//         }

//         await this.userRepo.update(user.id, updateData);
//         await this.auditService.log({ userId: user.id, action: 'LOGIN_FAILED', entity: 'User', entityId: user.id });
//         return { success: false, error: `اسم المستخدم أو كلمة المرور غير صحيحة. المحاولات المتبقية: ${MAX_LOGIN_ATTEMPTS - attempts}` };
//       }

//       // تسجيل الدخول ناجح — إعادة تعيين المحاولات
//       await this.userRepo.update(user.id, {
//         loginAttempts: 0,
//         lockedUntil: null,
//         lastLoginAt: new Date(),
//       });

//       const token = jwt.sign(
//         { id: user.id, username: user.username, role: user.role },
//         JWT_SECRET,
//         { expiresIn: '12h' }
//       );

//       const userResponse: User = {
//         id: user.id,
//         username: user.username,
//         name: user.name,
//         role: user.role as any,
//         isActive: user.isActive,
//         lastLoginAt: user.lastLoginAt,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       };

//       await this.auditService.log({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });

//       return { success: true, data: { user: userResponse, token }, message: 'تم تسجيل الدخول بنجاح' };
//     } catch (error: any) {
//       if (error?.errors) {
//         return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
//       }
//       return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
//     }
//   }

//   async createUser(data: any): Promise<ApiResponse<User>> {
//     try {
//       const validated = userCreateSchema.parse(data);
//       const existing = await this.userRepo.findByUsername(validated.username);
//       if (existing) {
//         return { success: false, error: 'اسم المستخدم مستخدم بالفعل' };
//       }

//       const hashedPassword = await bcrypt.hash(validated.password, 10);
//       const user = await this.userRepo.create({ ...validated, password: hashedPassword });

//       return { success: true, data: user as any, message: 'تم إنشاء المستخدم بنجاح' };
//     } catch (error: any) {
//       if (error?.errors) {
//         return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
//       }
//       return { success: false, error: 'فشل في إنشاء المستخدم' };
//     }
//   }

//   async updateUser(id: string, data: any): Promise<ApiResponse<User>> {
//     try {
//       const validated = userUpdateSchema.parse(data);
//       const updateData: any = { ...validated };

//       if (validated.password) {
//         updateData.password = await bcrypt.hash(validated.password, 10);
//       } else {
//         delete updateData.password;
//       }

//       const user = await this.userRepo.update(id, updateData);
//       return { success: true, data: user as any, message: 'تم تحديث بيانات المستخدم بنجاح' };
//     } catch (error: any) {
//       if (error?.errors) {
//         return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
//       }
//       return { success: false, error: 'فشل في تحديث المستخدم' };
//     }
//   }

//   async getUsers(): Promise<ApiResponse<User[]>> {
//     try {
//       const result = await this.userRepo.findMany({ pageSize: 100 });
//       return { success: true, data: result.items as any[] };
//     } catch (error: any) {
//       return { success: false, error: 'فشل في جلب المستخدمين' };
//     }
//   }

//   async unlockUser(id: string): Promise<ApiResponse<void>> {
//     try {
//       await this.userRepo.update(id, { loginAttempts: 0, lockedUntil: null });
//       return { success: true, message: 'تم إلغاء قفل الحساب' };
//     } catch (error: any) {
//       return { success: false, error: 'فشل في إلغاء قفل الحساب' };
//     }
//   }

//   async verifyToken(token: string): Promise<ApiResponse<User>> {
//     try {
//       const decoded = jwt.verify(token, JWT_SECRET) as any;
//       const user = await this.userRepo.findByUsername(decoded.username);
//       if (!user || !user.isActive) {
//         return { success: false, error: 'الجلسة منتهية. يرجى تسجيل الدخول مجدداً' };
//       }
//       return { success: true, data: user as any };
//     } catch {
//       return { success: false, error: 'الجلسة منتهية. يرجى تسجيل الدخول مجدداً' };
//     }
//   }
// }
// خدمة المصادقة مع تحديد المحاولات وتأمين الجلسة
import { UserRepository } from '../repositories/user.repository';
import { AuditService } from './audit.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { ApiResponse, User } from '@shared/types';
import { loginSchema, userCreateSchema, userUpdateSchema } from '@shared/schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'shop-mgmt-offline-secret-key-2024';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export class AuthService {
  private userRepo = new UserRepository();
  private auditService = new AuditService();

  async login(credentials: any): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const validated = loginSchema.parse(credentials);
      const user = await this.userRepo.findByUsername(validated.username);

      // التحقق من وجود المستخدم
      if (!user) {
        return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      }

      // التحقق من قفل الحساب
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        return { success: false, error: `الحساب مقفل. يرجى المحاولة بعد ${minutes} دقيقة` };
      }

      // التحقق من أن المستخدم نشط
      if (!user.isActive) {
        return { success: false, error: 'الحساب غير نشط. يرجى التواصل مع المدير' };
      }

      // التحقق من كلمة المرور
      const isValidPassword = await bcrypt.compare(validated.password, user.password);

      if (!isValidPassword) {
        // زيادة عدد المحاولات الفاشلة
        const attempts = (user.loginAttempts || 0) + 1;
        const updateData: any = { loginAttempts: attempts };

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
          updateData.lockedUntil = lockUntil;
          await this.userRepo.update(user.id, updateData);
          await this.auditService.log({ userId: user.id, action: 'LOGIN_FAILED', entity: 'User', entityId: user.id, details: { attempts } });
          return { success: false, error: `تم تجاوز الحد المسموح من المحاولات. الحساب مقفل لمدة ${LOCK_DURATION_MINUTES} دقيقة` };
        }

        await this.userRepo.update(user.id, updateData);
        await this.auditService.log({ userId: user.id, action: 'LOGIN_FAILED', entity: 'User', entityId: user.id });
        return { success: false, error: `اسم المستخدم أو كلمة المرور غير صحيحة. المحاولات المتبقية: ${MAX_LOGIN_ATTEMPTS - attempts}` };
      }

      // تسجيل الدخول ناجح — إعادة تعيين المحاولات
      await this.userRepo.update(user.id, {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      const userResponse: User = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role as any,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await this.auditService.log({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });

      return { success: true, data: { user: userResponse, token }, message: 'تم تسجيل الدخول بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  }

  async createUser(data: any): Promise<ApiResponse<User>> {
    try {
      const validated = userCreateSchema.parse(data);
      const existing = await this.userRepo.findByUsername(validated.username);
      if (existing) {
        return { success: false, error: 'اسم المستخدم مستخدم بالفعل' };
      }

      const hashedPassword = await bcrypt.hash(validated.password, 10);
      const user = await this.userRepo.create({ ...validated, password: hashedPassword });

      return { success: true, data: user as any, message: 'تم إنشاء المستخدم بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في إنشاء المستخدم' };
    }
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<User>> {
    try {
      const validated = userUpdateSchema.parse(data);
      const updateData: any = { ...validated };

      if (validated.password) {
        updateData.password = await bcrypt.hash(validated.password, 10);
      } else {
        delete updateData.password;
      }

      const user = await this.userRepo.update(id, updateData);
      return { success: true, data: user as any, message: 'تم تحديث بيانات المستخدم بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في تحديث المستخدم' };
    }
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const result = await this.userRepo.findMany({ pageSize: 100 });
      return { success: true, data: result.items as any[] };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب المستخدمين' };
    }
  }

  async deleteUser(id: string, requestedBy?: string): Promise<ApiResponse<void>> {
    try {
      const user = await this.userRepo.findById(id);
      if (!user) {
        return { success: false, error: 'المستخدم غير موجود' };
      }

      // منع المستخدم من حذف حسابه الخاص عن طريق الخطأ
      if (requestedBy && requestedBy === id) {
        return { success: false, error: 'لا يمكنك حذف حسابك الخاص' };
      }

      await this.userRepo.delete(id);

      // نسجل في الـ audit log بس لو معروف مين اللي طلب الحذف
      if (requestedBy) {
        await this.auditService.log({ userId: requestedBy, action: 'DELETE_USER', entity: 'User', entityId: id });
      }

      return { success: true, message: 'تم حذف المستخدم بنجاح' };
    } catch (error: any) {
      // Prisma foreign key constraint violation (المستخدم مرتبط بسجلات أخرى مثل الفواتير)
      if (error?.code === 'P2003' || error?.code === 'P2014') {
        return { success: false, error: 'لا يمكن حذف هذا المستخدم لأنه مرتبط بسجلات أخرى (مثل فواتير أو عمليات سابقة)' };
      }
      return { success: false, error: 'فشل في حذف المستخدم' };
    }
  }

  async unlockUser(id: string): Promise<ApiResponse<void>> {
    try {
      await this.userRepo.update(id, { loginAttempts: 0, lockedUntil: null });
      return { success: true, message: 'تم إلغاء قفل الحساب' };
    } catch (error: any) {
      return { success: false, error: 'فشل في إلغاء قفل الحساب' };
    }
  }

  async verifyToken(token: string): Promise<ApiResponse<User>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await this.userRepo.findByUsername(decoded.username);
      if (!user || !user.isActive) {
        return { success: false, error: 'الجلسة منتهية. يرجى تسجيل الدخول مجدداً' };
      }
      return { success: true, data: user as any };
    } catch {
      return { success: false, error: 'الجلسة منتهية. يرجى تسجيل الدخول مجدداً' };
    }
  }
}