"use client"; // Ensure this line is at the top of the file
import ProductList from "@/components/ProductList";
import Cart from "@/components/Cart";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/types";

export default function Home() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-center text-gray-700 flex items-center justify-center gap-2">
          🛍️ E-Commerce Store
        </h1>
        {user && (
          <Button
            onClick={handleLogout}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </Button>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <ProductList products={products} error={error ?? undefined} />
        </div>
        <div className="w-full md:w-1/3">
          <Cart />
        </div>
      </div>
    </div>
  );
}
