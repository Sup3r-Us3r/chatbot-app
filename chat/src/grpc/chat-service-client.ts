import { Metadata } from '@grpc/grpc-js';

import { chatClient } from './client';
import { ChatServiceClient as GrpcChatServiceClient } from './rpc/pb/ChatService';

interface IChatStreamParams {
  chat_id?: string;
  user_id: string;
  message: string;
}

class ChatServiceClient {
  private authorization = '123456';

  constructor(private chatClient: GrpcChatServiceClient) {}

  chatStream(data: IChatStreamParams) {
    const metadata = new Metadata();

    metadata.set('authorization', this.authorization);

    const stream = this.chatClient.chatStream(
      {
        chatId: data.chat_id,
        userId: data.user_id,
        userMessage: data.message,
      },
      metadata,
    );

    return stream;
  }
}

class ChatServiceClientFactory {
  static create() {
    return new ChatServiceClient(chatClient);
  }
}

export { ChatServiceClient, ChatServiceClientFactory };
