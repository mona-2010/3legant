"use client"

import SafeImage from "@/components/common/SafeImage"
import blogFallbackImage from "@/app/assets/images/blog-1.png"
import { getBlogImageUrl } from "@/lib/blogs/images"
import { Check, Loader2, X } from "lucide-react"
import { useMemo, useState } from "react"
import type { Dispatch, SetStateAction } from "react"

export type BlogImageSlot = "cover" | "gallery"

export type BlogSectionForm = {
  heading: string
  paragraph: string
}

export type BlogForm = {
  title: string
  slug: string
  excerpt: string
  cover_image_path: string
  gallery_image_paths: string[]
  author: string
  published_at: string
  is_published: boolean
  is_featured: boolean
  sections: BlogSectionForm[]
}

const emptySection = (): BlogSectionForm => ({ heading: "", paragraph: "" })

export const emptyBlogForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  cover_image_path: "",
  gallery_image_paths: ["", "", ""],
  author: "",
  published_at: "",
  is_published: false,
  is_featured: false,
  sections: [emptySection(), emptySection(), emptySection(), emptySection(), emptySection()],
}

export const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

type Props = {
  form: BlogForm
  setForm: Dispatch<SetStateAction<BlogForm>>
  editingId: string | null
  saving: boolean
  saveError: string | null
  slugTouched: boolean
  setSlugTouched: (value: boolean) => void
  uploadingSlot: BlogImageSlot | null
  uploadingIndex?: number
  onUploadImage: (slot: BlogImageSlot, file: File, index?: number) => Promise<void>
  onRemoveImage: (slot: BlogImageSlot, index?: number) => Promise<void>
  onSave: () => void
  onClose: () => void
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export default function BlogFormModal({
  form,
  setForm,
  editingId,
  saving,
  saveError,
  slugTouched,
  setSlugTouched,
  uploadingSlot,
  uploadingIndex,
  onUploadImage,
  onRemoveImage,
  onSave,
  onClose,
}: Props) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [draggedZone, setDraggedZone] = useState<string | null>(null)

  const handleDragEnter = (zone: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedZone(zone)
  }

  const handleDragOver = (zone: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedZone !== zone) {
      setDraggedZone(zone)
    }
  }

  const handleDragLeave = (zone: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const related = e.relatedTarget as Node | null
    if (related && e.currentTarget.contains(related)) {
      return
    }
    if (draggedZone === zone) {
      setDraggedZone(null)
    }
  }

  const handleDrop = (slot: BlogImageSlot, index?: number) => async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedZone(null)

    const file = e.dataTransfer.files?.[0]
    if (!file || !ALLOWED_TYPES.includes(file.type)) {
      return
    }

    await onUploadImage(slot, file, index)
  }

  const imageUrls = useMemo(() => {
    return {
      cover: getBlogImageUrl(form.cover_image_path),
      gallery: form.gallery_image_paths.map((path) => getBlogImageUrl(path)),
    }
  }, [form.cover_image_path, form.gallery_image_paths])

  const updateSection = (index: number, field: keyof BlogSectionForm, value: string) => {
    const nextSections = form.sections.map((section, idx) => {
      if (idx !== index) return section
      return { ...section, [field]: value }
    })
    setForm({ ...form, sections: nextSections })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? "Edit Blog" : "Create Blog"}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage post metadata and markdown content.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex gap-2 border border-gray-200 rounded-xl p-1 w-fit">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!isPreviewOpen ? "bg-black text-white" : "text-gray-600"}`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isPreviewOpen ? "bg-black text-white" : "text-gray-600"}`}
            >
              Preview
            </button>
          </div>

          {isPreviewOpen ? (
            <div className="space-y-6">
              <SafeImage src={imageUrls.cover || blogFallbackImage} fallbackSrc={blogFallbackImage} alt={form.title || "Cover"} width={1400} height={700} className="w-full h-auto rounded-lg" />

              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{form.sections[0]?.heading || "Section 1 heading"}</h1>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{form.sections[0]?.paragraph || "Section 1 paragraph preview..."}</p>
                </div>

                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{form.sections[1]?.heading || "Section 2 heading"}</h1>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{form.sections[1]?.paragraph || "Section 2 paragraph preview..."}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageUrls.gallery.slice(0, 2).map((url, idx) => (
                    <SafeImage
                      key={idx}
                      src={url || blogFallbackImage}
                      fallbackSrc={blogFallbackImage}
                      alt={`Gallery ${idx + 1}`}
                      width={700}
                      height={700}
                      className="w-full h-auto rounded-lg"
                    />
                  ))}
                </div>

                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{form.sections[2]?.heading || "Section 3 heading"}</h1>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{form.sections[2]?.paragraph || "Section 3 paragraph preview..."}</p>
                </div>

                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{form.sections[3]?.heading || "Section 4 heading"}</h1>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{form.sections[3]?.paragraph || "Section 4 paragraph preview..."}</p>
                </div>

                <div className="w-full md:w-1/2">
                  {imageUrls.gallery[2] && (
                    <SafeImage
                      src={imageUrls.gallery[2] || blogFallbackImage}
                      fallbackSrc={blogFallbackImage}
                      alt="Gallery 3"
                      width={700}
                      height={700}
                      className="w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">{form.sections[4]?.heading || "Section 5 heading"}</h1>
                  <p className="text-gray-700 mt-2 whitespace-pre-line">{form.sections[4]?.paragraph || "Section 5 paragraph preview..."}</p>
                </div>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Title *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  const nextSlug = !slugTouched ? slugify(title) : form.slug
                  setForm({ ...form, title, slug: nextSlug })
                }}
                placeholder="Write a title"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Slug *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setForm({ ...form, slug: slugify(e.target.value) })
                }}
                placeholder="my-blog-post"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Author</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Author name"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Cover Image (Bucket Upload) *</label>
              <div
                onDragEnter={handleDragEnter("cover")}
                onDragOver={handleDragOver("cover")}
                onDragLeave={handleDragLeave("cover")}
                onDrop={handleDrop("cover")}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  draggedZone === "cover"
                    ? "border-black bg-black/5"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                }`}
              >
                <input
                  type="file"
                  id="cover-input"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    await onUploadImage("cover", file)
                    if (e.currentTarget) e.currentTarget.value = ""
                  }}
                  className="hidden"
                />
                <label htmlFor="cover-input" className="block cursor-pointer pointer-events-none">
                  <p className="text-sm text-gray-700 font-medium">Drag image here or click to upload cover image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                </label>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-500 break-all">{form.cover_image_path || "No cover image uploaded yet"}</p>
                {form.cover_image_path && (
                  <button
                    type="button"
                    onClick={() => void onRemoveImage("cover")}
                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Gallery Images (Exactly 3) *</label>
              </div>
              <div className="space-y-2">
                {[0, 1, 2].map((idx) => {
                  const path = form.gallery_image_paths[idx] || ""
                  return (
                  <div key={idx} className="space-y-1.5 border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-600">Gallery Image {idx + 1}</label>
                      {path && (
                        <button
                          type="button"
                          onClick={() => void onRemoveImage("gallery", idx)}
                          className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div
                      onDragEnter={handleDragEnter(`gallery-${idx}`)}
                      onDragOver={handleDragOver(`gallery-${idx}`)}
                      onDragLeave={handleDragLeave(`gallery-${idx}`)}
                      onDrop={handleDrop("gallery", idx)}
                      className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
                        draggedZone === `gallery-${idx}`
                          ? "border-black bg-black/5"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300"
                      } ${
                        uploadingSlot === "gallery" && uploadingIndex === idx ? "opacity-50" : ""
                      }`}
                    >
                      <input
                        type="file"
                        id={`gallery-input-${idx}`}
                        accept="image/png,image/jpeg,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          await onUploadImage("gallery", file, idx)
                          if (e.currentTarget) e.currentTarget.value = ""
                        }}
                        disabled={uploadingSlot === "gallery" && uploadingIndex === idx}
                        className="hidden"
                      />
                      <label htmlFor={`gallery-input-${idx}`} className="block cursor-pointer pointer-events-none">
                        <p className="text-xs text-gray-700 font-medium">Drag image here or click to upload/replace image</p>
                      </label>
                    </div>
                    {uploadingSlot === "gallery" && uploadingIndex === idx && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        Uploading...
                      </p>
                    )}
                    {path && (
                      <p className="text-xs text-gray-500">{path.split("/").pop() || path}</p>
                    )}
                  </div>
                )})}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Excerpt</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm min-h-[90px] outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short summary shown in listings"
              />
            </div>

            {form.sections.map((section, idx) => (
              <div key={idx} className="space-y-1.5 md:col-span-2 border border-gray-100 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Section {idx + 1}</p>
                <label className="text-sm font-semibold text-gray-700">Heading (H1) *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={section.heading}
                  onChange={(e) => updateSection(idx, "heading", e.target.value)}
                  placeholder={`Section ${idx + 1} heading`}
                />
                <label className="text-sm font-semibold text-gray-700">Paragraph *</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm min-h-[110px] outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  value={section.paragraph}
                  onChange={(e) => updateSection(idx, "paragraph", e.target.value)}
                  placeholder={`Section ${idx + 1} paragraph`}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Publish Date</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2 justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.is_published ? "bg-black border-black" : "border-gray-300"}`}>
                  {form.is_published && <Check size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="hidden"
                />
                <span className="text-sm text-gray-700 font-medium">Published</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.is_featured ? "bg-black border-black" : "border-gray-300"}`}>
                  {form.is_featured && <Check size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="hidden"
                />
                <span className="text-sm text-gray-700 font-medium">Featured</span>
              </label>
            </div>
          </div>
          )}

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          {uploadingSlot && <p className="text-sm text-gray-600">Uploading {uploadingSlot.replace("_", " ")} image...</p>}
        </div>

        <div className="px-8 py-5 border-t bg-gray-50/50 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.title || !form.slug}
            className="px-8 py-2.5 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editingId ? "Update Blog" : "Create Blog"}
          </button>
        </div>
      </div>
    </div>
  )
}
