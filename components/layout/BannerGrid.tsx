import ButtonText from "./ButtonText";
import chair_2 from '@/app/assets/images/chair.png'
import toaster from '@/app/assets/images/toaster.png'
import drawer from '@/app/assets/images/drawer.png'
import Image from "next/image";

const BannerGrid = () => {
    return (
        <section className="my-10 mx-[30px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px]">
            <div className="flex justify-between flex-col md:flex-row gap-10 font-poppins">
                <div className="relative">
                    <Image
                        src={chair_2}
                        alt="chair"
                        width={648}
                        height={600}
                    />
                    <div className="absolute top-5 left-10">
                        <ButtonText heading={'Living Room'} linkTo={'shop?category=Living%20Room'} text={'Shop Now'} />
                    </div>
                </div>
                <div className="flex flex-col gap-[30px]">
                    <div className="relative">
                        <Image
                            src={drawer}
                            alt="drawer"
                            width={648}
                            height={300}
                        />
                        <div className="absolute bottom-10 left-5"><ButtonText heading={'Bedroom'} linkTo={'shop?category=Bedroom'} text={'Shop Now'} /></div>
                    </div>
                    <div className="relative">
                        <Image
                            src={toaster}
                            alt="toaster"
                            width={648}
                            height={300}
                        />
                        <div className="absolute bottom-10 left-5"><ButtonText heading={'Kitchen'} linkTo={'shop?category=Kitchen'} text={'Shop Now'} /></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default BannerGrid;
