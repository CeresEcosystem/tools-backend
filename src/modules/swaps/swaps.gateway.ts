import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SwapDto } from './dto/swap.dto';

@WebSocketGateway({ namespace: 'swapsocket' })
export class SwapGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newSwap')
  onSwap(@MessageBody() swap: SwapDto) {
    this.server.emit('onSwap', swap);
  }
}
