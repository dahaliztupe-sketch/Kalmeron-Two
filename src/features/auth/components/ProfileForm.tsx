'use client';

import { useActionState } from 'react';
import { updateUserProfile } from '@/app/actions/user';

const initialState = { success: false, error: null };

export function ProfileForm({ user }: { user: any }) {
  const [state, formAction, isPending] = useActionState(updateUserProfile, initialState);
  
  return (
    <form action={formAction} className="space-y-4">
      <input name="name" defaultValue={user?.name || ''} className="w-full p-3 rounded-lg bg-black/20 text-white placeholder-neutral-400 border border-white/10" placeholder="الاسم الكامل" />
      
      <select name="startupStage" defaultValue={user?.startupStage || 'idea'} className="w-full p-3 rounded-lg bg-black/20 text-white border border-white/10">
        <option value="idea">فكرة (Idea)</option>
        <option value="validation">تحقق (Validation)</option>
        <option value="launch">إطلاق (Launch)</option>
        <option value="growth">نمو (Growth)</option>
        <option value="scale">أبعاد (Scale)</option>
      </select>

      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.success && <p className="text-green-400">تم تحديث الملف الشخصي بنجاح</p>}
      
      <button 
        type="submit" 
        disabled={isPending}
        className="px-6 py-3 w-full bg-gradient-to-r from-[#D4AF37] to-[#0A66C2] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
      </button>
    </form>
  );
}
