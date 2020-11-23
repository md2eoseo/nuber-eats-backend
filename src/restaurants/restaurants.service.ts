import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Raw } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

const PAGE_SIZE = 5;

@Injectable()
export class RestaurantService {
  constructor(
    private readonly restaurants: RestaurantRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: "You can't edit restaurant you don't own" };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Could not edit restaurant' };
    }
  }

  async deleteRestaurant(
    owner: User,
    { id }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(id);
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete restaurant you don't own",
        };
      }
      await this.restaurants.delete(id);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Could not delete restaurant' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories };
    } catch (e) {
      return { ok: false, error: 'Could not load categories' };
    }
  }

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne(
        { slug },
        { relations: ['restaurants'] },
      );
      if (!category) {
        return { ok: false, error: 'Category not found' };
      }
      const [
        restaurants,
        totalResults,
      ] = await this.restaurants.paginatedFindAndCount(page, { category });
      category.restaurants = restaurants;
      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / PAGE_SIZE),
      };
    } catch (e) {
      return { ok: false, error: 'Could not find category' };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [
        restaurants,
        totalResults,
      ] = await this.restaurants.paginatedFindAndCount(page);
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / PAGE_SIZE),
        totalResults,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      return { ok: true, restaurant };
    } catch (e) {
      return { ok: false, error: 'Could not load restaurant' };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [
        restaurants,
        totalResults,
      ] = await this.restaurants.paginatedFindAndCount(page, {
        name: Raw((name) => `${name} ILIKE '%${query}%'`),
      });
      if (!restaurants) {
        return { ok: false, error: 'Restaurants not found' };
      }
      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalResults / PAGE_SIZE),
        totalResults,
      };
    } catch (e) {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }
}
