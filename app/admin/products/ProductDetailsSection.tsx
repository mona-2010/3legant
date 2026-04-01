"use client"

import { Check } from "lucide-react"
import {
  ProductForm,
  SetProductForm,
  slugify,
  generateSKU,
  parseDecimalField,
  parseIntegerField,
  displayNumberInput,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
} from "./productFormShared"

type Props = {
  form: ProductForm
  setForm: SetProductForm
  colorText: string
  setColorText: (v: string) => void
  slugTouched: boolean
  setSlugTouched: (v: boolean) => void
  skuTouched: boolean
  setSkuTouched: (v: boolean) => void
}

const inputClassName =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"

export default function ProductDetailsSection({
  form,
  setForm,
  colorText,
  setColorText,
  slugTouched,
  setSlugTouched,
  skuTouched,
  setSkuTouched,
}: Props) {
  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
      sku: skuTouched ? prev.sku : generateSKU(title, prev.sku),
    }))
  }

  const handleSlugChange = (slug: string) => {
    setSlugTouched(true)
    setForm((prev) => ({ ...prev, slug: slugify(slug) }))
  }

  const handleSkuChange = (sku: string) => {
    setSkuTouched(true)
    setForm((prev) => ({ ...prev, sku }))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Product Title *</label>
          <input
            className={inputClassName}
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Luxurious Velvet Sofa"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Slug *</label>
          <input
            className={`${inputClassName} bg-gray-50/50`}
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="luxurious-velvet-sofa"
          />
          <p className="text-[11px] text-gray-400">Auto-generated until manually edited.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Detailed Description</label>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-28 resize-none"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your product in detail..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Short Summary</label>
        <textarea
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all h-20 resize-none"
          value={form.short_description}
          onChange={(e) => setForm((prev) => ({ ...prev, short_description: e.target.value }))}
          placeholder="A brief overview for product cards..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Measurements</label>
          <input
            className={inputClassName}
            value={form.measurements}
            onChange={(e) => setForm((prev) => ({ ...prev, measurements: e.target.value }))}
            placeholder="Ex: 17 1/2 x 20 5/8 in"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Weight</label>
          <input
            className={inputClassName}
            value={form.weight}
            onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
            placeholder="Ex: 7 lb 8 oz"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Price *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              value={displayNumberInput(form.price)}
              onChange={(e) => setForm((prev) => ({ ...prev, price: parseDecimalField(e.target.value) }))}
              placeholder="0.00"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Original Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              value={displayNumberInput(form.original_price)}
              onChange={(e) => setForm((prev) => ({ ...prev, original_price: parseDecimalField(e.target.value) }))}
              placeholder="0.00"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Offer Expiry</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all disabled:bg-gray-50 disabled:text-gray-400"
            value={form.valid_until}
            onChange={(e) => setForm((prev) => ({ ...prev, valid_until: e.target.value }))}
            disabled={!(form.original_price > form.price)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Stock Count</label>
          <input
            type="number"
            className={inputClassName}
            value={displayNumberInput(form.stock)}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: parseIntegerField(e.target.value) }))}
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Categories</label>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-3">
            {PRODUCT_CATEGORIES.map((category) => {
              const checked = form.category.includes(category)
              return (
                <label key={category} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        category: checked
                          ? prev.category.filter((value) => value !== category)
                          : [...prev.category, category],
                      }))
                    }
                  />
                  <span>{PRODUCT_CATEGORY_LABELS[category]}</span>
                </label>
              )
            })}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Available Colors</label>
          <input
            className={inputClassName}
            value={colorText}
            onChange={(e) => setColorText(e.target.value)}
            placeholder="Ex: Black, White, Oak"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">SKU Number</label>
          <input
            className={`${inputClassName} ${!skuTouched ? "bg-gray-50/50" : ""}`}
            value={form.sku}
            onChange={(e) => handleSkuChange(e.target.value)}
            placeholder="Ex: SKU-12345"
          />
          <p className="text-[11px] text-gray-400">Auto-generated until manually edited.</p>
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${form.is_active ? "bg-black border-black" : "border-gray-300 group-hover:border-gray-400"}`}>
              {form.is_active && <Check size={12} className="text-white" />}
            </div>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="hidden"
            />
            <span className="text-sm font-medium text-gray-700">Publicly Visible</span>
          </label>
        </div>
      </div>
    </>
  )
}
