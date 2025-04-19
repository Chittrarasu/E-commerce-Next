"use client";
import Image from "next/image";
import useCartStore from "@/store/useCartStore";
import { Product, CartItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductListProps {
  products: Product[];
  error?: string; // Add error prop for handling fetch errors
}

export default function ProductList({ products, error }: ProductListProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return <p className="text-center text-red-500 mt-6">{error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        🛒 Products
      </h2>
      <div className="mb-6">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center transform transition duration-300 hover:scale-105"
          >
            <Image
              src={product.image}
              alt={product.title}
              width={160} // Consider dynamic sizing if image dimensions vary
              height={160}
              className="object-contain"
            />
            <h3 className="mt-4 font-semibold text-lg text-gray-900">
              {product.title}
            </h3>
            <p className="text-gray-600 text-lg">${product.price.toFixed(2)}</p>
            <Button
              onClick={() => addToCart({ ...product, quantity: 1 } as CartItem)}
              className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
            >
              Add to Cart
            </Button>
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && searchQuery && (
        <p className="text-center text-gray-500 mt-4">No products found.</p>
      )}
    </div>
  );
}
