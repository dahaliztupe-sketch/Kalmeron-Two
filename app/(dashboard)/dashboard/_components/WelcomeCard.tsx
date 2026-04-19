'use client';

import { use } from 'react';

async function fetchStats() {
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { name: "Ahmed", company: "Supertech" };
}

const statsPromise = fetchStats();

export default function WelcomeCard() {
    const stats = use(statsPromise);

    return (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold mb-2">أهلاً بعودتك، {stats.name}</h3>
            <p className="text-neutral-500">مرحلة شركتك &apos;{stats.company}&apos; تتطور بشكل ممتاز.</p>
        </div>
    );
}
