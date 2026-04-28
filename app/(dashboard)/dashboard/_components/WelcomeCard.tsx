'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeCard() {
    const t = useTranslations('Dashboard.welcomeCard');
    const tDash = useTranslations('Dashboard');
    const tStagesRaw = useTranslations('Dashboard.stages');
    const tStages = tStagesRaw as unknown as (k: string) => string;
    const { user, dbUser } = useAuth();

    const fullName = dbUser?.name || user?.displayName || tDash('defaultName');
    const firstName = fullName.split(' ')[0];

    const stageKey = dbUser?.startup_stage;
    const stageLabel = (() => {
        if (!stageKey) return tDash('subtitle');
        try {
            return tStages(stageKey);
        } catch {
            return stageKey;
        }
    })();

    return (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold mb-2">{t('greeting', { name: firstName })}</h3>
            <p className="text-neutral-500">{t('stageMessage', { company: stageLabel })}</p>
        </div>
    );
}
