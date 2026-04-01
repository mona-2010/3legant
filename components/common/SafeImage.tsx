"use client"

import Image, { type ImageProps } from "next/image"
import { useMemo, useState } from "react"

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string | ImageProps["src"]
  fallbackSrc: ImageProps["src"]
}

export default function SafeImage({ src, fallbackSrc, alt, ...props }: SafeImageProps) {
  const normalizedSrc = useMemo(() => {
    if (typeof src !== "string") return src
    const value = src.trim()
    return value.length > 0 ? value : fallbackSrc
  }, [src, fallbackSrc])

  const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(normalizedSrc)

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}
