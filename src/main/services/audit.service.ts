// خدمة سجل العمليات (Audit Log)
import { getPrismaClient } from '../database/prisma-client';

export class AuditService {
  private get db() {
    return getPrismaClient();
  }

  /**
   * تسجيل عملية حساسة في السجل
   */
  async log(params: {
    userId: string;
    action: string;     // CREATE | UPDATE | DELETE | LOGIN | LOGOUT | LOGIN_FAILED | SETTINGS_CHANGE
    entity: string;     // اسم الجدول أو الكيان
    entityId?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.db.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          details: params.details ? JSON.stringify(params.details) : null,
        },
      });
    } catch (err) {
      // لا نوقف تنفيذ العملية الرئيسية بسبب فشل السجل
      console.error('Audit log error:', err);
    }
  }

  async getAuditLogs(params: { page?: number; pageSize?: number; userId?: string; entity?: string }) {
    const { page = 1, pageSize = 50, userId, entity } = params;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;

    const [items, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, username: true } } },
      }),
      this.db.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
