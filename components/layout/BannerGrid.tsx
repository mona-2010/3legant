import ButtonText from "./ButtonText";
import chair_2 from '@/app/assets/images/chair.png'
import toaster from '@/app/assets/images/toaster.png'
import drawer from '@/app/assets/images/drawer.png'
import Image from "next/image";

const BannerGrid = () => {
    return (
        <section className="my-5 mx-[32px] md:mx-[140px]">
            <div className="flex justify-between flex-col md:flex-row gap-10 font-poppins">
                <div className="relative">
                    <Image
                        src={chair_2}
                        alt="chair"
                        width={648}
                        height={600}
                    />
                    <div className="absolute top-15 left-10">
                        <ButtonText heading={'Living Room'} linkTo={'shop'} text={'Shop Now'} />
                    </div>
                </div>
                <div className="flex flex-col gap-[30px]">
                    <div className="relative">
                        <Image
                            src={drawer}
                            alt="drawer"
                            width={648}
                        />
                        <div className="absolute bottom-10 left-5"><ButtonText heading={'Bedroom'} linkTo={'/shop'} text={'Shop Now'} /></div>
                    </div>
                    <div className="relative">
                        <Image
                            src={toaster}
                            alt="toaster"
                            width={648}
                        />
                        <div className="absolute bottom-10 left-5"><ButtonText heading={'Kitchen'} linkTo={'/shop'} text={'Shop Now'} /></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default BannerGrid;
