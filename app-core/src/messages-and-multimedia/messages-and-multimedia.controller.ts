import { Body, Controller, Get, Req, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesAndMultimediaService } from './messages-and-multimedia.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthenticatedGuard } from 'src/guard/auth/authenticated.guard';
import type { Request } from 'express';

@Controller('messages')
export class MessagesAndMultimediaController {
  constructor(private readonly service: MessagesAndMultimediaService) {}


  @UseGuards(AuthenticatedGuard)
  @Post()
  async create(@Body() dto: CreateMessageDto, @Req() req: Request) {
    return this.service.createMessage(dto, (req as any).user);
  }


@UseGuards(AuthenticatedGuard)
  @Get('user/:id')
  async getByUser(@Param('id') id: string, @Req() req: Request) {
    return this.service.getMessagesByUser(id, (req as any).user);
  }
}