'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginPage = () => {
  const router = useRouter();
  const { status: authStatus } = useSession();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/');
    }

    if (authStatus === 'unauthenticated') {
      signIn('keycloak');
    }
  }, [authStatus, router]);

  return <></>;
};

export default LoginPage;
