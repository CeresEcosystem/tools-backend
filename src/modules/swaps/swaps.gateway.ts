import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SwapDto } from './dto/swap.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'swapsocket', cors: { origin: '*' } })
export class SwapGateway {
  private readonly logger = new Logger(SwapGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newSwap')
  onSwap(@MessageBody() swap: SwapDto): void {
    if (!this.server) {
      this.logger.error('WebSocketServer uninitialized');

      return;
    }

    this.server.emit(swap.inputAssetId, swap);
    this.server.emit(swap.outputAssetId, swap);
  }
}
