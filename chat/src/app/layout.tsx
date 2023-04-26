import '../styles/global.css';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { SessionProvider } from '@/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Chatbot App',
  description:
    'This application is a Chatbot that uses the OpenAI API to maintain a conversation, it has an interface similar to ChatGPT itself.',
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
