'use client';

import { Connect } from '@stacks/connect-react';
import { ReactNode } from 'react';
import { userSession } from '@/lib/stacks';
import { AppConfig, UserSession } from '@stacks/connect';

export function StacksProvider({ children }: { children: ReactNode }) {
    // Fallback if imported userSession is null (shouldn't happen on client usually, but safe to handle)
    const session = userSession || new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data']) });

    const authOptions = {
        appDetails: {
            name: 'Stacks Content Payment',
            icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
        },
        redirectTo: '/',
        onFinish: () => {
            window.location.reload();
        },
        userSession: session,
    };

    return (
        <Connect authOptions={authOptions}>
            {children}
        </Connect>
    );
}
