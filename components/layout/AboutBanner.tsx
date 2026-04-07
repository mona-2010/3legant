import ButtonText from "./ButtonText";
import living_room_2 from "../../app/assets/images/living_room.png";
import Image from "next/image";

const AboutBanner = () => {
    return (
        <section className="my-10">
            <div className="flex flex-col lg:flex-row">
                <Image
                    src={living_room_2}
                    alt="couch"
                    height={500}
                    width={500}
                    loading="lazy"
                    className="max-sm:h-96 w-full lg:w-1/2 object-cover"
                />
                <div className="bg-gray-100 w-full lg:w-1/2">
                    <div className="my-14 mx-8 lg:my-40 lg:ml-20">
                        <h5 className="font-poppins my-4 font-[500] text-3xl lg:text-5xl max-w-full md:max-w-[60%]">About us</h5>
                        <h5 className="font-inter text-black text-base font-normal mb-6 lg:text-[20px] max-w-[98%]">
                            <span className="text-[#343839]">3legant</span> is a gift & decorations store based in HCMC, Vietnam. Est since 2019.
                            <p>Our customer service is always prepared to support you 24/7</p>
                        </h5>
                        <ButtonText text={"Shop Now"} linkTo={"shop"} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutBanner;