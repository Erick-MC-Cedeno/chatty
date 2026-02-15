import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Multimedia, MultimediaDocument } from './schemas/multimedia.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MessagesAndMultimediaService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Multimedia.name) private multimediaModel: Model<MultimediaDocument>,
    private readonly userService: UserService,
  ) {}



  // Create a new message, with optional auth payload for sender validation
  async createMessage(dto: CreateMessageDto, authOrSender?: any) {
    let senderId: string | undefined;

    // if auth payload provided, perform validation and determine senderId
    if (authOrSender && typeof authOrSender !== 'string') {
      const authPayload = authOrSender;
      let authUserId: string | undefined;
      if (authPayload) {
        if (authPayload._id) authUserId = authPayload._id.toString();
        else if (authPayload.id) authUserId = authPayload.id.toString();
        else if (authPayload.email) {
          const u = await this.userService.getUserByEmail(authPayload.email);
          if (u) authUserId = u._id?.toString();
        }
      }

      if (!authUserId) throw new UnauthorizedException('Could not determine authenticated user');

      senderId = dto.senderId || authUserId;

      if (!senderId || !Types.ObjectId.isValid(senderId)) {
        throw new BadRequestException('Invalid senderId');
      }

      if (!dto.receiverId || !Types.ObjectId.isValid(dto.receiverId)) {
        throw new BadRequestException('Invalid receiverId');
      }

      if (senderId !== authUserId) {
        throw new BadRequestException('Sender ID does not match authenticated user');
      }

      const sender = await this.userService.getUserById(senderId);
      if (!sender) throw new NotFoundException('Sender not found');

      const receiver = await this.userService.getUserById(dto.receiverId);
      if (!receiver) throw new NotFoundException('Receiver not found');
    } else {
      // called with explicit sender id (string)
      senderId = authOrSender as string;
      if (!senderId || !Types.ObjectId.isValid(senderId)) {
        throw new BadRequestException('Invalid senderId');
      }
    }

    const sender = new Types.ObjectId(senderId);
    const receiver = new Types.ObjectId(dto.receiverId);

    const created = await this.messageModel.create({
      content: dto.content,
      type: dto.type,
      sender,
      receiver,
      multimediaUrl: dto.multimediaUrl,
    });

    const doc = await this.messageModel
      .findById(created._id)
      .select('_id content type sender receiver createdAt updatedAt')
      .lean()
      .exec() as any;

    if (!doc) throw new NotFoundException('Message not found');

    return {
      _id: doc._id,
      content: doc.content,
      type: doc.type,
      sender: doc.sender?.toString(),
      receiver: doc.receiver?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  

  // Get messages for a user, with optional auth payload for access control
  async getMessagesByUser(userId: string, authPayload?: any) {
    // if authPayload is provided, validate access
    if (authPayload) {
      let authUserId: string | undefined;
      if (authPayload) {
        if (authPayload._id) authUserId = authPayload._id.toString();
        else if (authPayload.id) authUserId = authPayload.id.toString();
        else if (authPayload.email) {
          const u = await this.userService.getUserByEmail(authPayload.email);
          if (u) authUserId = u._id?.toString();
        }
      }

      if (!authUserId) throw new UnauthorizedException('Could not determine authenticated user');

      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user id');
      }

      if (userId !== authUserId) {
        throw new BadRequestException('Cannot access messages for another user');
      }

      const user = await this.userService.getUserById(userId);
      if (!user) throw new NotFoundException('User not found');
    }

    const id = new Types.ObjectId(userId);
    const docs = await this.messageModel
      .find({ $or: [{ sender: id }, { receiver: id }] })
      .select('_id content type sender receiver createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any[];

    return docs.map((doc: any) => ({
      _id: doc._id,
      content: doc.content,
      type: doc.type,
      sender: doc.sender?.toString(),
      receiver: doc.receiver?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }



  // Multimedia handling
  async saveMultimedia(data: { url: string; type: string; ownerId: string; description?: string; messageId?: string }) {
    const owner = new Types.ObjectId(data.ownerId);
    const message = data.messageId ? new Types.ObjectId(data.messageId) : undefined;

    const created = await this.multimediaModel.create({
      url: data.url,
      type: data.type,
      owner,
      description: data.description,
      message,
    });

    return this.multimediaModel.findById(created._id).populate('owner').exec();
  }

  
}