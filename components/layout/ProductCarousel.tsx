import ButtonText from "./ButtonText";
import SlideItems from "./ProductSlider";

const ProductCarousel = () => {
	return (
		<>
			<section className="flex justify-between mt-8 mx-[32px] md:mx-[140px] flex-col md:flex-row font-poppins">
				<p className="text-[35px] font-medium max-w-[10%]">New Arrivals</p>
					<div className="flex self-end"><ButtonText text={"More Products"} linkTo={"product"} /></div>
			</section>
			<SlideItems />

		</>
	);
};

export default ProductCarousel;