"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";
import slider1 from "@/app/assets/images/Living-Room.jpg";
import slider2 from "@/app/assets/images/Living-Room2.jpg";
import slider3 from "@/app/assets/images/living_room.png";
import slider4 from "@/app/assets/images/Living-Room5.jpg";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

const ImageSlider = () => {
  const images = [
    slider1.src,
    slider2.src,
    slider3.src,
    slider4.src,
  ];

  return (
    <section className="mx-[32px] md:mx-[50px] lg:mx-[80px] xl:mx-[140px] relative">
      <button className="custom-prev w-8 h-8 md:w-14 md:h-14 flex justify-center items-center rounded-full absolute z-40 top-1/2 -translate-y-1/2 bg-white left-10">
        <ArrowLeft />
      </button>

      <button className="custom-next w-8 h-8 md:w-14 md:h-14 flex justify-center items-center rounded-full absolute z-40 top-1/2 -translate-y-1/2 bg-white right-10">
        <ArrowRight />
      </button>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        loop
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
        }}
        speed={500}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        pagination={{
          el: ".pagination",
          clickable: true,
          bulletClass: "swiper-pagination-bullet",
          bulletActiveClass: "swiper-pagination-bullet-active",
        }}
        className="w-full"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-[536px] max-sm:h-[315px]">
              <Image
                width={1120}
                height={536}
                src={img}
                loading="lazy"
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="pagination absolute bottom-8 inset-x-0 mx-auto w-fit z-50 flex items-center justify-center gap-3 max-sm:bottom-4">
      </div>
    </section >
  );
};

export default ImageSlider;