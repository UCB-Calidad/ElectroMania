import { ProductModel } from '../model/Product.model';
import { PageProductResponseModel } from '../model/PageProductResponse.model';

export class PageProductMapper {
  toResponse(page: number, products: ProductModel[]): PageProductResponseModel {
    const response = new PageProductResponseModel();
    response.page = page;
    response.content = products;
    response.max_size_per_page = 20;
    response.totalElements = products.length;
    return response;
  }
}
