import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './restaurants.service';
import { CategoryResolver, RestaurantResolver } from './restaurants.resolver';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantRepository, CategoryRepository]),
  ],
  providers: [RestaurantResolver, RestaurantService, CategoryResolver],
})
export class RestaurantsModule {}
