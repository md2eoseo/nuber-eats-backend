import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const cleanedCategoryName = name.trim().toLowerCase();
    const categorySlug = cleanedCategoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      const categoryName =
        cleanedCategoryName.charAt(0).toUpperCase() +
        cleanedCategoryName.slice(1);
      category = await this.save(
        this.create({ name: categoryName, slug: categorySlug }),
      );
    }
    return category;
  }
}
