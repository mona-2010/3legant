import { LiaMoneyBillSolid, LiaShippingFastSolid } from "react-icons/lia";
import { LuLockKeyhole } from "react-icons/lu";
import { IoCallOutline } from "react-icons/io5";

const values = [
	{ icon: <LiaShippingFastSolid />, title: "Free Shipping", desc: "Order above $200" },
	{ icon: <LiaMoneyBillSolid />, title: "Money-back", desc: "30 days guarantee" },
	{ icon: <LuLockKeyhole />, title: "Secure Payments", desc: "Secured by Stripe" },
	{ icon: <IoCallOutline />, title: "24/7 Support", desc: "Phone and Email support" },
];
const Values = () => {
	return (
		<section className="mt-12 mx-[32px] md:mx-[140px]">
			<div className="grid grid-cols-4 py-4 grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) max-lg:grid-cols-2 max-lg:gap-4 max-md:grid-cols-2 md:grid-template-columns: repeat(auto-fit, minmax(292px, 1fr)) max-md:gap-4 max-sm:grid-cols-2 max-sm:gap-2 mt-4 gap-6">
				{values.map((value, index) => (
					<div key={index} className="overflow-hidden max-sm:h-[176px]">
						<div className="text-xl md:text-4xl bg-[#F3F5F7] flex h-[220px] flex-col justify-center px-8 max-sm:px-4 max-sm:py-8">
							{value.icon}
							<p className="max-lg:text-md font-inter text-[20px] py-2 md:py-4 font-medium text-black-shade-1 max-md:text-sm max-sm:font-semibold">
								{value.title}
							</p>
							<p className="max-sm:w-22 font-inter text-sm text-[#6C7275]">
								{value.desc}
							</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default Values;