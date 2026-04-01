import Image, { ImageProps } from "next/image"

type Props = ImageProps & {
  colorHex?: string | null
}

export default function TintedProductImage({ colorHex, ...imageProps }: Props) {
  return (
    <>
      <Image {...imageProps} />
      {colorHex && (
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-300"
          style={{
            backgroundColor: colorHex,
            opacity:0.5,
            mixBlendMode: "color",
          }}
          aria-hidden="true"
        />
      )}
    </>
  )
}