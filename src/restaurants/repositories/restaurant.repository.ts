import { PAGE_SIZE } from 'src/common/common.constants';
import { EntityRepository, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async paginatedFindAndCount(
    page: number,
    where?: object,
  ): Promise<[Restaurant[], number]> {
    const [restaurants, totalResults] = await this.findAndCount({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      order: {
        isPromoted: 'DESC',
      },
    });
    return [restaurants, totalResults];
  }
}
