export class CartProductModel {
  product_id: number;
  product_name: string;
  price: number;
}

export class CartProductWithImagesModel extends CartProductModel {
  images: string[];
}
