"use client";
import { useForm } from "react-hook-form";

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
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
};

type Props = {
  onValidSubmit: () => void;
};

const CheckoutForm = ({ onValidSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const payment = watch("payment");

  return (
    <form
      onSubmit={handleSubmit(onValidSubmit)}
      noValidate
      className="w-full lg:w-2/3"
    >
      <div className="border border-gray-200 rounded p-5 mb-6">
        <h1 className="font-medium mb-5 text-[20px]">Contact Information</h1>

        <div className="flex gap-4">
          <div className="flex flex-col flex-1">
            <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
              First Name *
            </label>
            <input
              {...register("firstName", { required: "First name required" })}
              className="border border-gray-200 rounded p-2 px-3 w-full"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col flex-1">
            <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
              Last Name *
            </label>
            <input
              {...register("lastName", { required: "Last name required" })}
              className="border border-gray-200 rounded p-2 px-3 w-full"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col mt-4">
          <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
            Phone Number *
          </label>
          <input
            {...register("phone", { required: "Phone required" })}
            className="border border-gray-200 rounded p-2 px-3"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex flex-col mt-4">
          <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
            Email Address *
          </label>
          <input
            {...register("email", {
              required: "Email required",
              pattern: {
                value: /^\S+@\S+$/,
                message: "Invalid email",
              },
            })}
            className="border border-gray-200 rounded p-2 px-3"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded p-5 mb-6">
        <h1 className="font-medium mb-5 text-[20px]">Shipping Address</h1>

        <div className="flex flex-col">
          <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
            Street Address *
          </label>
          <input
            {...register("street", { required: "Street required" })}
            className="border border-gray-200 rounded p-2 px-3"
          />
          {errors.street && (
            <p className="text-red-500 text-sm mt-1">
              {errors.street.message}
            </p>
          )}
        </div>

        <div className="flex flex-col mt-4">
          <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
            Country *
          </label>
          <select
            {...register("country", { required: "Country required" })}
            className="border border-gray-200 rounded p-2 px-3"
          >
            <option value="">Country</option>
            <option value="india">India</option>
            <option value="usa">USA</option>
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        <div className="flex flex-col mt-4">
          <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
            Town / City *
          </label>
          <input
            {...register("city", { required: "City required" })}
            className="border border-gray-200 rounded p-2 px-3"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col flex-1 mt-4">
            <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
              State *
            </label>
            <input
              {...register("state", { required: "State required" })}
              className="border border-gray-200 rounded p-2 px-3"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">
                {errors.state.message}
              </p>
            )}
          </div>
          <div className="flex flex-col flex-1 mt-4">
            <label className="uppercase text-[12px] text-gray-200 font-medium mb-1">
              Zip Code *
            </label>
            <input
              {...register("zipCode", { required: "Zip code required" })}
              className="border border-gray-200 rounded p-2 px-3"
            />
            {errors.zipCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.zipCode.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center mt-4">
          <input type="checkbox" />
          <p className="text-gray-200">
            Use a different billing address (optional)
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded p-5">
        <h1 className="font-medium mb-5 text-[20px]">Payment</h1>

        <div className="flex gap-2 items-center border border-gray-200 p-3 rounded">
          <input
            type="radio"
            value="card"
            {...register("payment", { required: "Select payment method" })}
          />
          Pay by Card Credit
        </div>

        <div className="flex gap-2 items-center border border-gray-200 p-3 rounded mt-3">
          <input type="radio" value="paypal" {...register("payment")} />
          Paypal
        </div>

        {errors.payment && (
          <p className="text-red-500 text-sm mt-2">{errors.payment.message}</p>
        )}

        {payment === "card" && (
          <>
            <hr className="my-6" />
            <label
              htmlFor="cardNumber"
              className="uppercase text-[12px] text-gray-200 font-medium"
            >
              Card Number *
            </label>
            <input
              {...register("cardNumber", { required: "Card number required" })}
              placeholder="1234 1234 1234 1234"
              className="border border-gray-200 rounded p-2 w-full mt-2 mb-3"
            />

            <div className="flex gap-4">
              <div className="flex flex-col flex-1 gap-2">
                <label
                  htmlFor="expirationdate"
                  className="uppercase text-[12px] text-gray-200 font-medium"
                >
                  Expiration Date *
                </label>
                <input
                  {...register("expiry", { required: "Expiry required" })}
                  placeholder="MM/YY"
                  className="border border-gray-200 rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <label
                  htmlFor="cvc"
                  className="uppercase text-[12px] text-gray-200 font-medium"
                >
                  CVC *
                </label>
                <input
                  {...register("cvc", { required: "CVC required" })}
                  placeholder="CVC"
                  className="border border-gray-200 rounded p-2 w-full"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-black text-white py-3 mt-6 w-full rounded-lg"
        >
          Place Order
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;