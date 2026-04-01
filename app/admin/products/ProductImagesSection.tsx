"use client"

import Image from "next/image"
import { Plus, Trash2, Upload, Loader2 } from "lucide-react"
import { RefObject } from "react"
import { ProductForm, SetProductForm } from "./productFormShared"

type Props = {
  form: ProductForm
  setForm: SetProductForm
  uploading: boolean
  dragActiveMain: boolean
  dragActiveAdditional: boolean
  mainImageRef: RefObject<HTMLInputElement | null>
  additionalImagesRef: RefObject<HTMLInputElement | null>
  onMainInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdditionalInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrag: (e: React.DragEvent, type: "main" | "additional") => void
  onDrop: (e: React.DragEvent, type: "main" | "additional") => void
}

export default function ProductImagesSection({
  form,
  setForm,
  uploading,
  dragActiveMain,
  dragActiveAdditional,
  mainImageRef,
  additionalImagesRef,
  onMainInputChange,
  onAdditionalInputChange,
  onDrag,
  onDrop,
}: Props) {
  return (
    <>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Main Product Image *</label>
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${dragActiveMain ? "border-black bg-gray-50" : form.image ? "border-gray-200" : "border-gray-200 hover:border-gray-300"}`}
          onDragEnter={(e) => onDrag(e, "main")}
          onDragLeave={(e) => onDrag(e, "main")}
          onDragOver={(e) => onDrag(e, "main")}
          onDrop={(e) => onDrop(e, "main")}
          onClick={() => mainImageRef.current?.click()}
        >
          <input
            ref={mainImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onMainInputChange}
          />

          {form.image ? (
            <div className="relative group w-full max-w-[200px] aspect-square rounded-xl overflow-hidden shadow-md">
              <Image src={form.image} alt="Main" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setForm((prev) => ({ ...prev, image: "" }))
                  }}
                  className="bg-white text-red-600 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-gray-50 rounded-full text-gray-400">
                {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {uploading ? "Uploading..." : "Click or drag your image here"}
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (max. 10MB)</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
          Additional Images
          <span className="text-[11px] font-normal text-gray-400">{form.images.length}/3 selected</span>
        </label>
        <div
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all min-h-[140px] flex gap-4 flex-wrap items-center justify-center ${dragActiveAdditional ? "border-black bg-gray-50" : "border-gray-200"}`}
          onDragEnter={(e) => onDrag(e, "additional")}
          onDragLeave={(e) => onDrag(e, "additional")}
          onDragOver={(e) => onDrag(e, "additional")}
          onDrop={(e) => onDrop(e, "additional")}
        >
          <input
            ref={additionalImagesRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onAdditionalInputChange}
          />

          {form.images.map((url, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))
                  }}
                  className="bg-white text-red-600 rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {form.images.length < 3 && (
            <button
              type="button"
              onClick={() => additionalImagesRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-400"
            >
              <Plus size={20} />
              <span className="text-[10px] font-medium">Add Image</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
