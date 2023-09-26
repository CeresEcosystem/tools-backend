import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SwapDto } from './dto/swap.dto';
import { Swap } from './entity/swaps.entity';

@WebSocketGateway({ namespace: 'swapsocket' })
export class SwapGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newSwap')
  onSwap(@MessageBody() swap: Swap) {
    this.server.emit(swap.inputAssetId, swap);
    this.server.emit(swap.outputAssetId, swap);
  }
}
