import { create } from "zustand";
import { CartItem } from "@/types";

interface CartState {
  cart: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  initializeCart: () => void;
}

const getCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (e) {
    console.error("Error parsing cart from localStorage:", e);
    return [];
  }
};

const useCartStore = create<CartState>((set) => ({
  cart: [],
  totalPrice: 0,
  isLoading: true,
  initializeCart: () => {
    if (typeof window !== "undefined") {
      const initialCart = getCartFromStorage();
      const initialTotal = initialCart.reduce(
        (t, i) => t + i.price * (i.quantity || 1),
        0
      );
      set({ cart: initialCart, totalPrice: initialTotal, isLoading: false });
    }
  },
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      let updatedCart: CartItem[];
      if (existingItem) {
        updatedCart = state.cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [
          ...state.cart,
          { ...product, quantity: product.quantity || 1 },
        ];
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return {
        cart: updatedCart,
        totalPrice: updatedCart.reduce(
          (t, i) => t + i.price * (i.quantity || 1),
          0
        ),
        isLoading: false,
      };
    }),
  removeFromCart: (productId) =>
    set((state) => {
      const item = state.cart.find((i) => i.id === productId);
      if (!item) return state;
      const updatedCart =
        item.quantity > 1
          ? state.cart.map((i) =>
              i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
            )
          : state.cart.filter((i) => i.id !== productId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return {
        cart: updatedCart,
        totalPrice: updatedCart.reduce(
          (t, i) => t + i.price * (i.quantity || 1),
          0
        ),
        isLoading: false,
      };
    }),
  clearCart: () =>
    set(() => {
      localStorage.removeItem("cart");
      return { cart: [], totalPrice: 0, isLoading: false };
    }),
}));

export default useCartStore;
