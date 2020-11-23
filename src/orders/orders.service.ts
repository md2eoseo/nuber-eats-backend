import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async createOrder(
    customer: User,
    { items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      // const newOrder = await this.orders.create({customer, dishes})
      // await this.orders.save(newOrder)
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Could not create order' };
    }
  }
}
