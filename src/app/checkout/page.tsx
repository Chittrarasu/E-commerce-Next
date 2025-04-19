"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useCartStore from "@/store/useCartStore";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

interface CheckoutForm {
  name: string;
  phoneNumber: string;
  address: string;
}

export default function Checkout() {
  const { cart, totalPrice, isLoading, initializeCart, clearCart } =
    useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isCartReady, setIsCartReady] = useState(false);
  const router = useRouter();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    const handleHydration = async () => {
      initializeCart();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log("Session:", session, "Session Error:", sessionError);
      if (sessionError || !session) {
        setError("Please log in to continue.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setIsCartReady(true);
      }
    };
    if (typeof window !== "undefined") {
      handleHydration();
    }
  }, [initializeCart, router]);

  const onSubmit = async (data: CheckoutForm) => {
    console.log("Submitting form", data);
    if (!isCartReady || isLoading) {
      setError("Please wait, page is initializing...");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty. Please add items before proceeding.");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user.email) {
      setError("Session expired, please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    try {
      const checkoutDetails = {
        user_email: session.user.email,
        name: data.name,
        phone_number: data.phoneNumber,
        address: data.address,
        items: cart.map((item: CartItem) => ({
          name: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        total_price: totalPrice.toFixed(2),
      };

      const { error: dbError } = await supabase
        .from("checkout")
        .insert(checkoutDetails);
      console.log("Insert result:", dbError);
      if (dbError)
        throw new Error(dbError.message || "Failed to save checkout data.");

      clearCart();
      setSuccess(true);
      console.log("Success:", success);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: unknown) {
      // Use unknown instead of any and narrow the type
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Checkout error:", err);
      // Log to Sentry or similar service
    }
  };

  if (!isCartReady || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl bg-white shadow-2xl rounded-xl border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">
              Your cart is empty.
            </p>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            required
                            className="border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="phoneNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            {...field}
                            required
                            className="border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name="address"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your address"
                          {...field}
                          required
                          className="border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary h-20 resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Order Summary
                  </h2>
                  <ul className="space-y-3">
                    {cart.map((item: CartItem) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-gray-600 text-sm">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xl font-bold text-gray-900 text-right border-t pt-4">
                    Total:{" "}
                    <span className="text-primary">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && (
                  <p className="text-green-500 text-center">
                    Payment successful! Redirecting...
                  </p>
                )}
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => router.push("/")}
                    className="w-full bg-gray-400 text-white hover:bg-gray-500 transition"
                  >
                    Go Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white hover:bg-primary/90 transition"
                    disabled={!isCartReady || isLoading}
                  >
                    Proceed to Pay
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
