import Image from 'next/image';
import { ReactNode } from 'react';

interface IChatItemErrorProps {
  children: ReactNode;
}

const ChatItemError = ({ children }: IChatItemErrorProps) => {
  return (
    <li className="w-full text-gray-100 bg-gray-800">
      <div className="md:max-w-2xl lg:max-w-xl xl:max-w-3xl py-6 m-auto flex flex-row items-start space-x-4">
        <Image
          src="/assets/chat-gpt-logo.png"
          width={30}
          height={30}
          alt="Chat GPT Logo"
        />

        <div className="relative w-[calc(100%-115px)] flex flex-col gap-1">
          <span className="text-red-500">Ops! Ocorreu um erro: {children}</span>
        </div>
      </div>
    </li>
  );
};

export { ChatItemError };
