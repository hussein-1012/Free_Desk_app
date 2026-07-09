import { ProductRepository } from '../repositories/product.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ApiResponse, PaginatedResult, QueryParams, Product, Category } from '@shared/types';
import { productSchema, categorySchema } from '@shared/schemas';

export class ProductService {
  private productRepo = new ProductRepository();
  private categoryRepo = new CategoryRepository();

  // Products CRUD
  async getProducts(params: QueryParams): Promise<ApiResponse<PaginatedResult<Product>>> {
    try {
      const result = await this.productRepo.findMany({
        ...params,
        filters: { isActive: true, ...params.filters },
      });
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productRepo.findById(id);
      if (!product) return { success: false, error: 'Product not found' };
      return { success: true, data: product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createProduct(data: any): Promise<ApiResponse<Product>> {
    try {
      const validated = productSchema.parse(data);
      const product = await this.productRepo.create(validated);
      return { success: true, data: product, message: 'Product created successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateProduct(id: string, data: any): Promise<ApiResponse<Product>> {
    try {
      const validated = productSchema.parse(data);
      const product = await this.productRepo.update(id, validated);
      return { success: true, data: product, message: 'Product updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productRepo.delete(id);
      return { success: true, data: product, message: 'Product deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getLowStockProducts(minLimit?: number): Promise<ApiResponse<Product[]>> {
    try {
      const products = await this.productRepo.getLowStock(minLimit);
      return { success: true, data: products };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async findProductByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    try {
      const product = await this.productRepo.findByBarcode(barcode);
      if (!product) return { success: false, error: 'Product with this barcode not found' };
      return { success: true, data: product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Categories CRUD
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const result = await this.categoryRepo.getHierarchy();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createCategory(data: any): Promise<ApiResponse<Category>> {
    try {
      const validated = categorySchema.parse(data);
      const category = await this.categoryRepo.create(validated);
      return { success: true, data: category, message: 'Category created successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateCategory(id: string, data: any): Promise<ApiResponse<Category>> {
    try {
      const validated = categorySchema.parse(data);
      const category = await this.categoryRepo.update(id, validated);
      return { success: true, data: category, message: 'Category updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteCategory(id: string): Promise<ApiResponse<Category>> {
    try {
      const category = await this.categoryRepo.delete(id);
      return { success: true, data: category, message: 'Category deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
