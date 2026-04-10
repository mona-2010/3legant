"use client";

import Image, { StaticImageData } from "next/image";
import { useState, useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { NewLabel } from "../layout/ProductSlider";

interface Props {
  images: (string | StaticImageData)[];
  price: number;
  valid_until?: string | null;
  originalPrice?: number;
  colorHex?: string;
  isNew?: boolean;
}

export default function ProductImageGallery({
  images,
  price,
  valid_until,
  originalPrice,
  colorHex,
  isNew,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPickedColor, setUserPickedColor] = useState(false);
  const isMountedRef = useRef(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const hasImages = images.length > 0;
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    setUserPickedColor(!!colorHex);
  }, [colorHex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [colorHex]);

  const goNext = () => {
    if (!hasImages) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    if (!hasImages) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) goNext();
    if (isRightSwipe) goPrev();
  };

  const showTint = userPickedColor && !!colorHex && activeIndex === 0;

  return (
    <div className="flex flex-col gap-5 w-full">
      <div
        className="relative w-full h-[350px] md:h-[400px] lg:h-[650px] bg-white flex items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        <NewLabel
          price={price}
          originalPrice={originalPrice}
          validUntil={valid_until}
          isNew={isNew}
        />

        <button
          onClick={goPrev}
          disabled={!hasImages}
          className="cursor-pointer absolute left-4 z-10 bg-white p-3 rounded-full shadow"
          aria-label="Previous image"
        >
          <IoChevronBack />
        </button>

        {hasImages ? (
          <>
            <Image
              src={images[activeIndex]}
              alt="Product"
              fill
              priority
              className="object-contain lg:object-contain mix-blend-multiply max-h-[350px] sm:max-h-[400px] md:max-h-full"
              sizes="(min-width: 1280px) 50vw, (min-width: 768px) 50vw, 100vw"
            />

            {showTint && (
              <div
                className="absolute inset-0 pointer-events-none transition-colors duration-300"
                style={{
                  backgroundColor: colorHex,
                  mixBlendMode: "color",
                }}
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No image available</p>
        )}

        <button
          onClick={goNext}
          disabled={!hasImages}
          className="cursor-pointer absolute right-4 z-10 bg-white p-3 rounded-full shadow"
          aria-label="Next image"
        >
          <IoChevronForward />
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex md:hidden justify-center gap-2 mt-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "bg-black w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="hidden md:flex items-center justify-between gap-[8px]">
        {images
          .filter((_, index) => index !== activeIndex)
          .map((img, index) => {
            const realIndex = images.indexOf(img);
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(realIndex)}
                className="cursor-pointer relative w-[170px] h-[130px] md:h-[167px] bg-gray-100"
                aria-label={`View image ${realIndex + 1}`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${realIndex + 1}`}
                  fill
                  className="object-fit"
                  sizes="(min-width: 768px) 167px, 25vw"
                />
              </button>
            );
          })}
      </div>
    </div>
  );
}