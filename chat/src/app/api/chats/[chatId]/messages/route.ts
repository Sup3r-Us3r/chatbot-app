import { JWT } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from '@/app/api/helpers';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(
  async (
    _request: NextRequest,
    token: JWT,
    { params }: { params: { chatId: string } },
  ) => {
    const chat = await prisma.chat.findFirstOrThrow({
      where: {
        id: params.chatId,
      },
    });

    if (chat.user_id !== token.sub) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        chat_id: params.chatId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return NextResponse.json(messages);
  },
);

export const POST = withAuth(
  async (
    request: NextRequest,
    token: JWT,
    { params }: { params: { chatId: string } },
  ) => {
    const chat = await prisma.chat.findUniqueOrThrow({
      where: {
        id: params.chatId,
      },
    });

    if (chat.user_id !== token.sub) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const body = await request.json();
    const messageCreated = await prisma.message.create({
      data: {
        chat_id: chat.id,
        content: body.message,
      },
    });

    return NextResponse.json(messageCreated);
  },
);
