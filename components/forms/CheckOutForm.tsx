"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { getUserAddresses } from "@/lib/actions/addresses";
import { UserAddress, CartItem } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { toast } from "react-toastify";
import PaymentSection from "./PaymentSection";
import ShippingAddressSection from "./ShippingAddressSection";

export type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  country: string;
  state: string;
  zipCode: number;
  payment: "card" | "paypal";
  billingStreet?: string;
  billingCity?: string;
  billingCountry?: string;
  billingState?: string;
  billingZipCode?: string;
  stripePaymentIntentId?: string;
};

type Props = {
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  shippingMethod: string;
  isCartEmpty: boolean;
  cartItems: CartItem[];
  appliedCouponId?: string;
};

const normalizeLocalPhone = (value?: string): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

const CheckoutForm = ({
  total,
  subtotal,
  discount,
  shippingCost,
  shippingMethod,
  isCartEmpty,
  cartItems,
  appliedCouponId
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const payment = watch("payment");
  const [showBilling, setShowBilling] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      const { data } = await getUserAddresses();
      if (data && data.length > 0) {
        setSavedAddresses(data);
        const defaultAddr = data.find((a) => a.is_default) || data[0];
        applyAddress(defaultAddr);
        setSelectedAddressId(defaultAddr.id);
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
      }
    };
    loadAddresses();
  }, []);

  const applyAddress = (addr: UserAddress) => {
    const normalizedCountry = addr.country?.trim().toLowerCase() || "";

    setValue("firstName", addr.first_name);
    setValue("lastName", addr.last_name);
    setValue("phone", normalizeLocalPhone(addr.phone));
    setValue("street", addr.street_address);
    setValue("city", addr.city);
    setValue("state", addr.state || "");
    setValue("zipCode", Number(addr.zip_code) || (0 as any));
    setValue("country", normalizedCountry);
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      setShowAddressForm(true);
      setValue("street", "");
      setValue("city", "");
      setValue("state", "");
      setValue("zipCode", 0 as any);
      setValue("country", "");
    } else {
      setShowAddressForm(false);
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) applyAddress(addr);
    }
  };

  const onSubmit = async (data: FormData) => {
    const submitData: FormData = { ...data, phone: data.phone.replace(/\D/g, "") };

    if (isCartEmpty) {
      toast.error("Your cart is empty.");
      return;
    }

    if (payment === "card") {
      setSubmitting(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { url, error } = await createCheckoutSession({
          items: cartItems,
          userInfo: {
            first_name: submitData.firstName,
            last_name: submitData.lastName,
            email: submitData.email,
            phone: submitData.phone,
            shipping: {
              street_address: submitData.street,
              city: submitData.city,
              state: submitData.state,
              zip_code: String(submitData.zipCode),
              country: submitData.country,
            }
          },
          shippingMethod: shippingMethod as any,
          subtotal,
          shippingCost,
          discount,
          total,
          userId: user?.id || "guest",
          couponId: appliedCouponId
        });

        if (error) {
          toast.error(error);
          setSubmitting(false);
          return;
        }

        if (url) {
          window.location.href = url;
        }
      } catch (err) {
        toast.error("Failed to initiate checkout");
        setSubmitting(false);
      }
      return;
    }

    if (payment === "paypal") {
      toast.error("PayPal is currently unavailable. Please use a credit/debit card to complete your order.")
      return
    }
  };

  const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="w-full lg:w-2/3"
    >
      <div className="border border-gray-200 rounded p-5 mb-6">
        <h1 className="font-medium mb-5 text-[20px]">Contact Information</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col flex-1">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">First Name *</label>
            <input {...register("firstName", { required: "First name required" })} className="border border-gray-200 rounded p-2 px-3 w-full" />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>
          <div className="flex flex-col flex-1">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Last Name *</label>
            <input {...register("lastName", { required: "Last name required" })} className="border border-gray-200 rounded p-2 px-3 w-full" />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Phone Number *</label>
          <input
            type="tel"
            placeholder="Phone number"
            inputMode="numeric"
            {...register("phone", {
              required: "Phone required",
              validate: (value) => {
                const digits = value.replace(/\D/g, "");
                return digits.length === 10 || "Phone number must be 10 digits";
              },
            })}
            className="border border-gray-200 rounded py-2 px-3"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
        <div className="flex flex-col mt-4">
          <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Email Address *</label>
          <input {...register("email", { required: "Email required", pattern: { value: /^\S+@\S+$/, message: "Invalid email" } })} className="border border-gray-200 rounded p-2 px-3" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="border border-gray-200 rounded p-5 mb-6">
        <h1 className="font-medium mb-5 text-[20px]">Shipping Address</h1>

        <ShippingAddressSection
          register={register}
          errors={errors}
          savedAddresses={savedAddresses}
          selectedAddressId={selectedAddressId}
          onAddressSelect={handleAddressSelect}
          showAddressForm={showAddressForm}
          selectedAddr={selectedAddr}
          watch={watch}
        />

        <label className="flex gap-2 items-center mt-4 cursor-pointer">
          <input type="checkbox" checked={showBilling} onChange={(e) => setShowBilling(e.target.checked)} />
          <span className="text-gray-500 text-sm">Use a different billing address (optional)</span>
        </label>
      </div>

      {showBilling && (
        <div className="border border-gray-200 rounded p-5 mb-6">
          <h1 className="font-medium mb-5 text-[20px]">Billing Address</h1>
          <div className="flex flex-col">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Street Address *</label>
            <input {...register("billingStreet", { required: showBilling ? "Billing street required" : false })} className="border border-gray-200 rounded p-2 px-3" />
          </div>
          <div className="flex flex-col mt-4">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Country *</label>
            <select {...register("billingCountry", { required: showBilling ? "Country required" : false })} className="border border-gray-200 rounded p-2 px-3">
              <option value="">Select Country</option>
              <option value="india">India</option>
              <option value="usa">USA</option>
            </select>
          </div>
          <div className="flex flex-col mt-4">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Town / City *</label>
            <input {...register("billingCity", { required: showBilling ? "City required" : false })} className="border border-gray-200 rounded p-2 px-3" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1 mt-4">
              <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">State</label>
              <input {...register("billingState")} className="border border-gray-200 rounded p-2 px-3" />
            </div>
            <div className="flex flex-col flex-1 mt-4">
              <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Zip Code *</label>
              <input {...register("billingZipCode", { required: showBilling ? "Zip required" : false })} className="border border-gray-200 rounded p-2 px-3" />
            </div>
          </div>
        </div>
      )}

      <PaymentSection
        payment={payment}
        register={register}
        errors={errors}
        submitting={submitting}
        isCartEmpty={isCartEmpty}
      />
    </form>
  );
};

export default CheckoutForm;