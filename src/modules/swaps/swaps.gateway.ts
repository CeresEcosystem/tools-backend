import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SwapDto } from './dto/swap.dto';

@WebSocketGateway({ namespace: 'swapsocket', cors: { origin: '*' } })
export class SwapGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newSwap')
  onSwap(@MessageBody() swap: SwapDto) {
    this.server.emit(swap.inputAssetId, swap);
    this.server.emit(swap.outputAssetId, swap);
  }
}
