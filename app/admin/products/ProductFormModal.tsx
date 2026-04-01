"use client"

import { useState, useRef, useCallback } from "react"
import { X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import ProductDetailsSection from "./ProductDetailsSection"
import ProductImagesSection from "./ProductImagesSection"
import { ProductForm, emptyForm, slugify } from "./productFormShared"

export type { ProductForm }
export { emptyForm, slugify }

type Props = {
  form: ProductForm
  setForm: (fn: (prev: ProductForm) => ProductForm) => void
  editingId: string | null
  saving: boolean
  saveError: string | null
  colorText: string
  setColorText: (v: string) => void
  slugTouched: boolean
  setSlugTouched: (v: boolean) => void
  skuTouched: boolean
  setSkuTouched: (v: boolean) => void
  onSave: () => void
  onClose: () => void
}

export default function ProductFormModal({
  form, setForm, editingId, saving, saveError,
  colorText, setColorText,
  slugTouched, setSlugTouched,
  skuTouched, setSkuTouched,
  onSave, onClose,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragActiveMain, setDragActiveMain] = useState(false)
  const [dragActiveAdditional, setDragActiveAdditional] = useState(false)
  const mainImageRef = useRef<HTMLInputElement>(null)
  const additionalImagesRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${ext}`
    const filePath = `products/${fileName}`
    const { error } = await supabase.storage.from("products").upload(filePath, file)
    if (error) return null
    const { data } = supabase.storage.from("products").getPublicUrl(filePath)
    return data.publicUrl
  }

  const resetFileInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.value = ""
  }

  const handleMainImageFiles = async (files: FileList | File[]) => {
    const file = files[0]
    if (!file) return

    setUploading(true)
    const url = await uploadFile(file)
    if (url) setForm(prev => ({ ...prev, image: url }))
    setUploading(false)
  }

  const handleAdditionalImageFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    if (form.images.length >= 3) {
      return
    }

    setUploading(true)
    const remainingSlots = 3 - form.images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    const urls: string[] = []

    for (const file of filesToUpload) {
      const url = await uploadFile(file)
      if (url) urls.push(url)
    }

    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }))
    setUploading(false)
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    await handleMainImageFiles(e.target.files)
    resetFileInput(mainImageRef)
  }

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    await handleAdditionalImageFiles(e.target.files)
    resetFileInput(additionalImagesRef)
  }

  const handleDrag = useCallback((e: React.DragEvent, type: "main" | "additional") => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === "main") setDragActiveMain(true)
      else setDragActiveAdditional(true)
    } else if (e.type === "dragleave") {
      if (type === "main") setDragActiveMain(false)
      else setDragActiveAdditional(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, type: "main" | "additional") => {
    e.preventDefault()
    e.stopPropagation()
    if (type === "main") {
      setDragActiveMain(false)
      if (e.dataTransfer.files?.length) {
        handleMainImageFiles(e.dataTransfer.files)
      }
    } else {
      setDragActiveAdditional(false)
      if (e.dataTransfer.files?.length) {
        handleAdditionalImageFiles(e.dataTransfer.files)
      }
    }
  }, [form.images.length])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the information below to {editingId ? "update" : "create"} the product.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
          <ProductDetailsSection
            form={form}
            setForm={setForm}
            colorText={colorText}
            setColorText={setColorText}
            slugTouched={slugTouched}
            setSlugTouched={setSlugTouched}
            skuTouched={skuTouched}
            setSkuTouched={setSkuTouched}
          />

          <ProductImagesSection
            form={form}
            setForm={setForm}
            uploading={uploading}
            dragActiveMain={dragActiveMain}
            dragActiveAdditional={dragActiveAdditional}
            mainImageRef={mainImageRef}
            additionalImagesRef={additionalImagesRef}
            onMainInputChange={handleMainImageUpload}
            onAdditionalInputChange={handleAdditionalImagesUpload}
            onDrag={handleDrag}
            onDrop={handleDrop}
          />
        </div>

        <div className="px-8 py-5 border-t bg-gray-50/50 flex items-center justify-between">
          <div className="flex-1">
            {saveError && (
              <div className="flex items-center gap-2 text-red-600 text-sm animate-pulse">
                <X size={14} className="border border-red-600 rounded-full" />
                {saveError}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || !form.title || !form.slug || !form.image || !form.price}
              className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editingId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
