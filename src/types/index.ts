export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
