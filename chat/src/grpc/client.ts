import path from 'path';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import { ProtoGrpcType as ChatProtoGrpcType } from './rpc/chat';

const packageDefinition = protoLoader.loadSync(
  path.resolve(process.cwd(), 'proto', 'chat.proto'),
);

const proto = grpc.loadPackageDefinition(
  packageDefinition,
) as unknown as ChatProtoGrpcType;

const chatClient = new proto.pb.ChatService(
  'localhost:50052',
  grpc.credentials.createInsecure(),
);

export { chatClient };
