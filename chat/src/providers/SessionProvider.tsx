'use client';

import { Session } from 'next-auth';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ISessionProviderProps {
  session: Session | null;
  children: ReactNode;
}

const SessionProvider = ({ session, children }: ISessionProviderProps) => {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
};

export { SessionProvider };
