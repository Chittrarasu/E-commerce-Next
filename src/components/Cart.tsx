import useCartStore from "@/store/useCartStore";
import Link from "next/link";
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { cart, totalPrice, removeFromCart } = useCartStore();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl w-80 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
        🛍️ Shopping Cart
      </h2>
      {cart.length === 0 ? (
        <p className="text-gray-500 text-center">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item: CartItem) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-gray-600">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <Button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-xl font-semibold text-gray-900">
            Total:{" "}
            <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
          </div>
          <Link href="/checkout">
            <Button className="mt-5 w-full bg-green-500 text-white hover:bg-green-600">
              Checkout
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
