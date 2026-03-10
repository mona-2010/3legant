"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { NewLabel } from "../layout/ProductSlider";

interface Props {
  images: (string | StaticImageData)[];
  price: number;
  originalPrice?: number;
  isNew?: boolean;
}

export default function ProductImageGallery({
  images,
  price,
  originalPrice,
  isNew,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="relative w-full h-[600px] bg-gray-100 flex items-center justify-center">
        <NewLabel price={price} originalPrice={originalPrice} isNew={isNew} />

        <button
          onClick={prev}
          className="absolute left-4 z-10 bg-white p-3 rounded-full shadow"
        >
          <IoChevronBack />
        </button>

        <Image
          src={images[activeIndex]}
          alt="Product"
          fill
          priority
          className="object-cover"
          sizes="527px"
        />

        <button
          onClick={next}
          className="absolute right-4 z-10 bg-white p-3 rounded-full shadow"
        >
          <IoChevronForward />
        </button>
      </div>

      <div className="flex justify-between gap-[13px]">
        {images
          .filter((_, index) => index !== activeIndex)
          .map((img, index) => {
            const realIndex = images.indexOf(img);

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(realIndex)}
                className="relative w-[167px] h-[167px] bg-gray-100"
              >
                <Image
                  src={img}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  sizes="167px"
                />
              </button>
            );
          })}
      </div>
    </div>
  );
}