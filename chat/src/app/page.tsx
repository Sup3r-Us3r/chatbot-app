'use client';

import { signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import useSWR from 'swr';
import useSWRSubscription from 'swr/subscription';

import { ArrowRightIcon } from '@/components/ArrowRightIcon';
import { ChatItem } from '@/components/ChatItem';
import { ChatItemError } from '@/components/ChatItemError';
import { LogoutIcon } from '@/components/LogoutIcon';
import { MessageIcon } from '@/components/MessageIcon';
import { PlusIcon } from '@/components/PlusIcon';
import { ClientHttp, fetcher } from '@/http/client-http';
import { Chat, Message } from '@prisma/client';

type ChatWithFirstMessage = Chat & {
  messages: Message[];
};

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chatIdParam = searchParams.get('chatId');

  const [chatId, setChatId] = useState<string | null>(chatIdParam);
  const [messageId, setMessageId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const buttonFormSubmit = useRef<HTMLButtonElement>(null);

  const { data: chats, mutate: mutateChats } = useSWR<ChatWithFirstMessage[]>(
    '/chats',
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  );
  const { data: messages, mutate: mutateMessages } = useSWR<Message[]>(
    chatId ? `/chats/${chatId}/messages` : null,
    fetcher,
    {
      fallbackData: [],
      revalidateOnFocus: false,
    },
  );

  const { data: messageLoading, error: messageLoadingError } =
    useSWRSubscription(
      messageId ? `/api/messages/${messageId}/events` : null,
      (path: string, { next }) => {
        const eventSource = new EventSource(path);

        eventSource.onmessage = event => {
          const newMessage = JSON.parse(event.data) as { content: string };

          next(null, newMessage.content);
        };

        eventSource.onerror = event => {
          eventSource.close();

          // @ts-ignore
          next(event.data, null);
        };

        eventSource.addEventListener('end', event => {
          eventSource.close();

          const newMessage = JSON.parse(event.data);

          mutateMessages(messages => [...messages!, newMessage], false);

          next(null, null);
        });

        return () => {
          console.log('CLOSE EVENT SOURCE');
          eventSource.close();
        };
      },
    );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const textArea = event.currentTarget.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
    const message = textArea.value;

    if (!textArea.value) {
      return;
    }

    if (!chatId) {
      const newChat: ChatWithFirstMessage = await ClientHttp.post('/chats', {
        message,
      });

      mutateChats([newChat, ...chats!], false);
      setChatId(newChat.id);
      setMessageId(newChat.messages[0].id);
    } else {
      const newMessage: Message = await ClientHttp.post(
        `/chats/${chatId}/messages`,
        { message },
      );

      mutateMessages([...messages!, newMessage], false);
      setMessageId(newMessage.id);
    }

    textArea.value = '';
  }

  function textAreaOnKeyUp(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (formRef.current && buttonFormSubmit.current) {
        formRef.current.requestSubmit(buttonFormSubmit.current);
      }
    }

    if (event.currentTarget.scrollHeight >= 200) {
      event.currentTarget.style.overflowY = 'scroll';
    } else {
      event.currentTarget.style.overflowY = 'hidden';
      event.currentTarget.style.height = 'auto';
      event.currentTarget.style.height =
        event.currentTarget.scrollHeight + 'px';
    }
  }

  function textAreaOnKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }

  async function logout() {
    await signOut({ redirect: false });

    const { url: logoutUrl } = (await ClientHttp.get(
      `logout-url?${new URLSearchParams({ redirect: window.location.origin })}`,
    )) as { url: string };

    window.location.href = logoutUrl;
  }

  useEffect(() => {
    setChatId(chatIdParam);
  }, [chatIdParam]);

  useLayoutEffect(() => {
    if (!messageLoading) {
      return;
    }

    const chatting = document.querySelector('#chatting') as HTMLUListElement;

    chatting.scrollTop = chatting.scrollHeight;
  }, [messageLoading]);

  return (
    <main className="flex relative w-full h-full overflow-hidden">
      {/* -- sidebar -- */}
      <aside className="flex h-screen flex-col w-[300px] p-2 bg-gray-900">
        {/* -- button new chat -- */}
        <button
          className="flex p-3 gap-3 rounded hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 border border-white/20"
          onClick={() => {
            router.push('/');

            setChatId(null);
            setMessageId(null);
          }}
        >
          <PlusIcon className="w-5 h-5" />
          New chat
        </button>
        {/* -- end button new chat -- */}

        {/* -- chats -- */}
        <div className="flex-grow overflow-y-auto -mr-2 overflow-hidden">
          {chats?.map((chat, key) => (
            <div className="pb-2 text-gray-100 text-sm mr-2" key={key}>
              <button
                className="flex p-3 gap-3 rounded hover:bg-[#3f4679] cursor-pointer hover:pr-4 group w-full"
                type="button"
                onClick={() => router.push(`/?chatId=${chat.id}`)}
              >
                <MessageIcon className="h-5 w-5" />
                <div className="max-h-5 overflow-hidden break-all relative w-full text-left">
                  {chat.messages[0].content}
                  <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-[#3f4679]"></div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <button
          className="flex p-3 mt-1 gap-3 rounded hover:bg-gray-500/10 text-sm text-white"
          onClick={logout}
        >
          <LogoutIcon className="h-5 w-5" />
          Log out
        </button>
      </aside>
      {/* -- end sidebar -- */}

      {/* -- main content */}
      <section className="flex-1 flex-col relative">
        <ul id="chatting" className="h-screen overflow-y-auto bg-gray-800">
          {messages?.map(message => (
            <ChatItem
              key={message.id}
              content={message.content}
              is_from_bot={message.is_from_bot}
            />
          ))}

          {messageLoading && (
            <ChatItem content={messageLoading} is_from_bot loading />
          )}

          {messageLoadingError && (
            <ChatItemError>{messageLoadingError}</ChatItemError>
          )}

          <li className="h-36 bg-gray-800"></li>
        </ul>

        <div className="absolute bottom-0 w-full !bg-transparent bg-gradient-to-b from-gray-800 to-gray-950/40">
          <div className="pt-6 mb-6 mx-auto max-w-3xl">
            <form ref={formRef} onSubmit={onSubmit}>
              <div className="flex flex-col py-3 pl-4 relative text-white bg-gray-700 rounded">
                <textarea
                  className="resize-none pr-14 bg-transparent pl-0 outline-none"
                  placeholder="Type your message..."
                  tabIndex={0}
                  rows={1}
                  onKeyUp={textAreaOnKeyUp}
                  onKeyDown={textAreaOnKeyDown}
                />

                <button
                  ref={buttonFormSubmit}
                  type="submit"
                  className="absolute top-1 text-gray-400 hover:text-gray-500 transition-colors bottom-2.5 rounded md:right-4"
                  disabled={messageLoading}
                >
                  <ArrowRightIcon className="text-white-500 w-8" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      {/* -- main content */}
    </main>
  );
};

export default HomePage;
