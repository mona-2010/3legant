import ButtonText from "./ButtonText";
import living_room_2 from "../../app/assets/images/living_room.png";
import Image from "next/image";

const Banner = () => {
    return (
        <section className="my-10">
            <div className="flex flex-col lg:flex-row">
                <Image
                    src={living_room_2}
                    alt="couch"
                    className="max-sm:h-96 w-full lg:w-1/2 object-cover"
                />
                <div className="bg-gray-100 w-full lg:w-1/2">
                    <div className="my-14 mx-8 lg:my-40 lg:ml-20">
                        <p className="text-blue-500 font-inter text-base font-bold">
                            SALE UP TO 35% OFF
                        </p>
                        <h5 className="my-4 font-[550] text-3xl lg:text-5xl max-w-full md:max-w-[60%]">HUNDREDS of New lower prices!</h5>
                        <p className="font-inter text-chinese-black text-base font-normal mb-6 lg:text-[20px] max-w-[90%] md:max-w-[70%]">
                            It’s more affordable than ever to give every room in your home a
                            stylish makeover
                        </p>
                        <ButtonText text={"Shop Now"} linkTo={"shop"} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banner;