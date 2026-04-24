'use server';

import { z } from 'zod';
import { adminDb, adminAuth } from '@/src/lib/firebase-admin';
import { headers } from 'next/headers';
import { createRequestLogger } from '@/src/lib/logger';

const UserSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  startupStage: z.enum(['idea', 'validation', 'launch', 'growth', 'scale']),
});

export async function updateUserProfile(_prevState: any, formData: FormData) {
  const log = createRequestLogger(crypto.randomUUID());
  try {
    const validated = UserSchema.parse({
      name: formData.get('name'),
      startupStage: formData.get('startupStage'),
    });

    const h = await headers();
    const auth = h.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return { success: false, error: 'يجب تسجيل الدخول' };
    }
    const token = auth.split(' ')[1]!;
    let uid: string;
    try {
      const dec = await adminAuth.verifyIdToken(token);
      uid = dec.uid;
    } catch {
      return { success: false, error: 'جلستك انتهت، أعد تسجيل الدخول.' };
    }

    if (!adminDb?.collection) {
      return { success: false, error: 'الخدمة غير متاحة حالياً.' };
    }

    await adminDb.collection('users').doc(uid).set(
      {
        name: validated.name,
        startupStage: validated.startupStage,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return { success: true, error: null };
  } catch (error: any) {
    log.warn({ msg: 'updateUserProfile failed', err: error?.message });
    if (error?.name === 'ZodError') {
      return { success: false, error: 'تحقق من البيانات المدخلة.' };
    }
    return { success: false, error: 'فشل تحديث الملف الشخصي.' };
  }
}
