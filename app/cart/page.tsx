"use client"
import { Header } from "@/components/dynamicComponents";
import CheckoutDetail from "@/components/layout/CheckoutDetail";
import CompleteOrder from "@/components/layout/CompleteOrder";
import Footer from "@/components/layout/Footer";
import ShoppingCart from "@/components/layout/ShoppingCart";
import StepIndicator from "@/components/layout/StepIndicator";
import { useState } from "react";
import tray1 from '@/app/assets/images/tray1.png'
import tray2 from '@/app/assets/images/tray2.png'
import tablelamp from '@/app/assets/images/tablelamp.png'
import { StaticImageData } from "next/image";

export type CartItem = {
    id: number;
    name: string;
    color: string;
    price: number;
    quantity: number;
    image: StaticImageData;
};

export const initialCartItems: CartItem[] = [
    { id: 1, name: "Tray Table", color: "Black", price: 19, quantity: 2, image: tray1},
    { id: 2, name: "Tray Table", color: "Red", price: 19, quantity: 2, image: tray2 },
    { id: 3, name: "Tray Table", color: "Black", price: 19, quantity: 2, image: tablelamp },
];

export default function Page() {
    const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
    const [shippingCost, setShippingCost] = useState(0);

    const updateQuantity = (id: number, type: "inc" | "dec") => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + (type === "inc" ? 1 : -1)) }
                    : item
            )
        );
    };

    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + shippingCost;

    const removeItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id))
    }
    return (
        <div>
            <Header />
            <h1 className="mt-10 font-poppins text-center text-[56px]">Cart</h1>
            <div>
                <StepIndicator activeStep={activeStep} />

                {activeStep === 1 && (
                    <ShoppingCart
                        cartItems={cartItems}
                        updateQuantity={updateQuantity}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        setShippingCost={setShippingCost}
                        total={total}
                        onCheckout={() => setActiveStep(2)}
                        removeItem={removeItem}
                    />
                )}

                {activeStep === 2 && (
                    <CheckoutDetail
                        cartItems={cartItems}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        total={total}
                        updateQuantity={updateQuantity}
                        onValidSubmit={() => setActiveStep(3)}
                        removeItem={removeItem}
                    />
                )}

                {activeStep === 3 && (
                    <CompleteOrder total={total} />
                )}</div>
            <Footer />
        </div>
    );
}