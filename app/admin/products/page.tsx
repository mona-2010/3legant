"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/actions/products"
import { isProductCategory, Product, ProductCategory } from "@/types"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import ProductFormModal, { ProductForm, emptyForm, slugify } from "./ProductFormModal"

const ITEMS_PER_PAGE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [skuTouched, setSkuTouched] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [colorText, setColorText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE)
  const supabase = createClient()
  const router = useRouter()

  const loadProducts = async () => {
    const { data } = await getProducts({ search: searchQuery || undefined })
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [searchQuery])
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError(null)
    setSlugTouched(false)
    setSkuTouched(false)
    setColorText("")
    setIsModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id)
    setSaveError(null)
    setSlugTouched(true)
    setSkuTouched(!!product.sku)
    const colorArr = Array.isArray(product.color) ? product.color : product.color ? [product.color] : []
    const catArr = (Array.isArray(product.category) ? product.category : product.category ? [product.category] : [])
      .filter((value): value is ProductCategory => isProductCategory(value))
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description || "",
      short_description: product.short_description || "",
      measurements: product.measurements || "",
      weight: product.weight || "",
      price: product.price,
      original_price: product.original_price || 0,
      valid_until: product.valid_until ? new Date(product.valid_until).toISOString().slice(0, 16) : "",
      image: product.image,
      images: product.images || [],
      color: colorArr,
      category: catArr,
      sku: product.sku || "",
      stock: product.stock || 0,
      is_active: product.is_active !== false,
    })
    setColorText(colorArr.join(", "))
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    setSaveError(null)
    const normalizedSlug = slugify(form.slug)
    const normalizedSku = form.sku.trim()

    if (!normalizedSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setSaveError("Slug is required and can only contain letters, numbers, and hyphens.")
      return
    }

    if (!normalizedSku) {
      setSaveError("SKU is required.")
      return
    }

    if (!form.image) { setSaveError("Main image is required."); return }

    setSaving(true)

    // Optimization: We skip manual slug/sku existence checks here and rely on 
    // database UNIQUE constraints. The server action will return an error 
    // if there's a conflict, saving us 2 network round-trips.
    
    const payload = {
      ...form,
      slug: normalizedSlug,
      sku: normalizedSku,
      measurements: form.measurements.trim() || null,
      weight: form.weight.trim() || null,
      valid_until: form.valid_until && form.original_price > form.price ? new Date(form.valid_until).toISOString() : null,
      color: colorText.split(",").map(s => s.trim()).filter(Boolean),
      category: form.category,
    }

    try {
      if (editingId) {
        const { data, error } = await updateProduct(editingId, payload)
        if (error) { setSaveError(error); setSaving(false); return }
        if (data) setProducts(prev => prev.map(p => p.id === data.id ? data : p))
      } else {
        const { data, error } = await createProduct(payload)
        if (error) { setSaveError(error); setSaving(false); return }
        if (data) setProducts(prev => [data, ...prev])
      }

      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const { error } = await deleteProduct(id)
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id))
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProducts = products.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = products.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, products.length)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-6">
        <div>
          <h1 className="text-center lg:text-left text-3xl font-semibold tracking-tight font-poppins text-slate-900">Products</h1>
          <p className="text-center lg:text-left text-sm text-slate-500 mt-1">Manage inventory, pricing, and product visibility.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setCurrentPage(1)
            setSearchQuery(e.target.value)
          }}
          className="border border-slate-200 bg-white rounded-xl px-4 py-2.5 w-full max-w-sm text-sm outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/70">
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-left py-3 px-4">Price</th>
              <th className="text-left py-3 px-4">Stock</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <Image src={product.image} alt={product.title} width={40} height={40} className="rounded object-contain max-h-[50px] min-h-[50px]" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{product.title}</p>
                      <p className="text-slate-400 text-xs">{product.category?.join(", ")}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-900">${product.price}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-slate-400 line-through ml-2 text-xs">${product.original_price}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700">{product.stock ?? "—"}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {product.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => openEdit(product)} className="text-slate-500 hover:text-blue-600 mr-3"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-slate-500">No products found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
        {products.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">Showing {startItem}-{endItem} of {products.length}</p>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setCurrentPage(1)
                  setPageSize(Number(e.target.value))
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 disabled:opacity-50"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-sm text-slate-600">Page {safePage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 disabled:opacity-50"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductFormModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          saving={saving}
          saveError={saveError}
          colorText={colorText}
          setColorText={setColorText}
          slugTouched={slugTouched}
          setSlugTouched={setSlugTouched}
          skuTouched={skuTouched}
          setSkuTouched={setSkuTouched}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
