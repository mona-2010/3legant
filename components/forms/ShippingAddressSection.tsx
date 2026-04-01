"use client"

import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { FormData } from "./CheckOutForm";
import { UserAddress } from "@/types";

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  savedAddresses: UserAddress[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
  showAddressForm: boolean;
  selectedAddr: UserAddress | undefined;
  watch?: UseFormWatch<FormData>;
}
export default function ShippingAddressSection({
  register, errors, savedAddresses, selectedAddressId,
  onAddressSelect, showAddressForm, selectedAddr, watch,
}: Props) {
  type CountryKey = "india" | "usa" | "canada";
  type StateMap = { [state: string]: string[] };
  type CountryStateCity = {
    [key in CountryKey]: {
      states: StateMap;
    }
  };
  const COUNTRY_STATE_CITY: CountryStateCity = {
    india: {
      states: {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Delhi": ["New Delhi", "Dwarka", "Rohini"],
        "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
      }
    },
    usa: {
      states: {
        "California": ["Los Angeles", "San Francisco", "San Diego"],
        "Texas": ["Houston", "Dallas", "Austin"],
        "New York": ["New York City", "Buffalo", "Rochester"],
        "Florida": ["Miami", "Orlando", "Tampa"],
        "Illinois": ["Chicago", "Springfield", "Naperville"],
      }
    },
    canada: {
      states: {
        "Ontario": ["Toronto", "Ottawa", "Hamilton"],
        "Quebec": ["Montreal", "Quebec City", "Laval"],
        "British Columbia": ["Vancouver", "Victoria", "Kelowna"],
      }
    }
  };

  let selectedCountry = "";
  let selectedState = "";
  if (watch) {
    selectedCountry = watch("country");
    selectedState = watch("state");
  }
  return (
    <>
      {savedAddresses.length > 0 && (
        <div className="flex flex-col mb-4">
          <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Saved Addresses</label>
          <select
            value={selectedAddressId}
            onChange={(e) => onAddressSelect(e.target.value)}
            className="border border-gray-200 rounded p-2 px-3"
          >
            {savedAddresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.street_address}, {addr.city}{addr.is_default ? " (Default)" : ""}
              </option>
            ))}
            <option value="new">+ Enter a new address</option>
          </select>
        </div>
      )}

      {!showAddressForm && selectedAddr ? (
        <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 space-y-1">
          <p className="font-medium">{selectedAddr.first_name} {selectedAddr.last_name}</p>
          <p>{selectedAddr.street_address}</p>
          <p>{selectedAddr.city}{selectedAddr.state ? `, ${selectedAddr.state}` : ""} {selectedAddr.zip_code}</p>
          <p>{selectedAddr.country}</p>
          {selectedAddr.phone && <p>{selectedAddr.phone}</p>}
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Street Address *</label>
            <input {...register("street", { required: "Street required" })} className="border border-gray-200 rounded p-2" />
            {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
          </div>
          <div className="flex flex-col mt-4">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Country *</label>
            <select {...register("country", { required: "Country required" })} className="border border-gray-200 rounded p-2">
              <option value="">Select Country</option>
              <option value="india">India</option>
              <option value="usa">USA</option>
              <option value="canada">Canada</option>
            </select>
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
          <div className="flex flex-col mt-4">
            <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">State *</label>
            <select {...register("state", { required: "State required" })} className="border border-gray-200 rounded p-2" disabled={!selectedCountry}>
              <option value="">Select State</option>
              {selectedCountry && COUNTRY_STATE_CITY[selectedCountry as CountryKey]?.states &&
                Object.keys(COUNTRY_STATE_CITY[selectedCountry as CountryKey].states).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
            </select>
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1 mt-4">
              <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Town / City *</label>
              <select {...register("city", { required: "City required" })} className="border border-gray-200 rounded p-2" disabled={!selectedState}>
                <option value="">Select City</option>
                {selectedCountry && selectedState && COUNTRY_STATE_CITY[selectedCountry as CountryKey]?.states[selectedState]?.map((city: string) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>
            <div className="flex flex-col flex-1 mt-4">
              <label className="uppercase text-[12px] text-gray-400 font-medium mb-1">Zip Code *</label>
              <input {...register("zipCode", { required: "Zip code required" })} className="border border-gray-200 rounded p-2 px-3" />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
            </div>
          </div>
        </>
      )}
    </>
  )
}
