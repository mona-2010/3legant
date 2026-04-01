import { additionalInfoContent } from "./helpers"

type Props = {
    shortDescription?: string
    measurements?: string | null
    weight?: string | null
}

export default function AdditionalInfoTab({ shortDescription, measurements, weight }: Props) {
    const packaging = [
        measurements ? `Measurements: ${measurements}` : null,
        weight ? `Weight: ${weight}` : null,
    ].filter(Boolean).join("\n")

    return (
        <div className="mt-5">
            <h2 className="font-poppins text-2xl font-[500]">Additional Information</h2>
            <h3 className="font-[600] text-gray-200 uppercase text-sm mt-2 mb-2">Details</h3>
            <p className="text-gray-600">
                {shortDescription || additionalInfoContent.details}
            </p>
            <h3 className="font-[600] text-gray-200 uppercase text-sm mt-2 mb-2">Packaging</h3>
            <p className="whitespace-pre-line text-gray-600">{packaging || additionalInfoContent.packaging}</p>
        </div>
    )
}
