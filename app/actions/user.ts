'use server';

import { z } from 'zod';
// import { db } from '@/lib/firebase';

const UserSchema = z.object({
  name: z.string().min(1),
  startupStage: z.enum(['idea', 'validation', 'launch', 'growth', 'scale']),
});

export async function updateUserProfile(prevState: any, formData: FormData) {
  try {
    const validated = UserSchema.parse({
      name: formData.get('name'),
      startupStage: formData.get('startupStage'),
    });
    
    // mock Firestore update
    console.log("Updating profile in Firestore: ", validated);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Validation failed" };
  }
}
