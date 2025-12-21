export type ProductCategory = 'nino' | 'nina';
export type ExpenseType = 'mercancia' | 'operativo' | 'fijo';
export type AppRole = 'admin' | 'user';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  category: ProductCategory;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
}

export interface ProductWithSizes extends Product {
  product_sizes: ProductSize[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_type: ExpenseType;
  expense_date: string;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sale_date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface CartItem {
  product: ProductWithSizes;
  size: string;
  quantity: number;
}

export interface Configuracion {
  id: string;
  clave: string;
  valor: number;
  created_at: string;
  updated_at: string;
}
