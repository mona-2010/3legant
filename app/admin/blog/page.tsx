"use client"

import { useEffect, useState } from "react"
import { BlogPost } from "@/types"
import { createClient } from "@/lib/supabase/client"
import { BLOG_IMAGES_BUCKET } from "@/lib/blogs/images"
import { createBlog, deleteBlog, getAdminBlogs, updateBlog } from "@/lib/actions/blogs"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react"
import BlogFormModal, { BlogForm, BlogImageSlot, emptyBlogForm, slugify } from "./BlogFormModal"

const ITEMS_PER_PAGE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BlogForm>(emptyBlogForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE)
  const [uploadingSlot, setUploadingSlot] = useState<BlogImageSlot | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | undefined>()

  const supabase = createClient()

  const loadBlogs = async () => {
    const { data } = await getAdminBlogs()
    if (data) setBlogs(data)
    setLoading(false)
  }

  useEffect(() => {
    loadBlogs()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyBlogForm)
    setSaveError(null)
    setSlugTouched(false)
    setIsModalOpen(true)
  }

  const openEdit = (blog: BlogPost) => {
    setEditingId(blog.id)
    setSaveError(null)
    setSlugTouched(true)
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      cover_image_path: blog.cover_image_path || "",
      gallery_image_paths: blog.gallery_image_paths && blog.gallery_image_paths.length > 0 ? blog.gallery_image_paths : ["", "", ""],
      author: blog.author || "",
      published_at: blog.published_at ? new Date(blog.published_at).toISOString().slice(0, 16) : "",
      is_published: blog.is_published,
      is_featured: blog.is_featured,
      sections: [
        ...(blog.sections || []),
        { heading: "", paragraph: "" },
        { heading: "", paragraph: "" },
        { heading: "", paragraph: "" },
        { heading: "", paragraph: "" },
        { heading: "", paragraph: "" },
      ].slice(0, 5),
    })
    setIsModalOpen(true)
  }

  const handleUploadImage = async (slot: BlogImageSlot, file: File, index?: number) => {
    setSaveError(null)

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setSaveError("Only JPG, PNG, and WEBP images are allowed.")
      return
    }

    const slugBase = slugify(form.slug || form.title || "blog") || "blog"
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase()
    const slotLabel = slot === "cover" ? "cover" : `gallery-${index ?? 0}`
    const objectPath = `${slugBase}/${slotLabel}-${Date.now()}.${extension}`

    setUploadingSlot(slot)
    if (index !== undefined) setUploadingIndex(index)

    const { error } = await supabase
      .storage
      .from(BLOG_IMAGES_BUCKET)
      .upload(objectPath, file, { upsert: false })

    setUploadingSlot(null)
    setUploadingIndex(undefined)

    if (error) {
      setSaveError(error.message)
      return
    }

    if (slot === "cover") {
      setForm((prev) => ({ ...prev, cover_image_path: objectPath }))
      return
    }

    if (slot === "gallery" && index !== undefined) {
      setForm((prev) => {
        const updated = [...prev.gallery_image_paths]
        updated[index] = objectPath
        return { ...prev, gallery_image_paths: updated }
      })
    }
  }

  const handleSave = async () => {
    setSaveError(null)
    const normalizedSlug = slugify(form.slug)

    if (!normalizedSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setSaveError("Slug is required and can only contain letters, numbers, and hyphens.")
      return
    }

    if (!form.cover_image_path) {
      setSaveError("Please upload a cover image from the blog bucket.")
      return
    }

    const filledGalleryImages = form.gallery_image_paths.filter((path) => path.trim())
    if (filledGalleryImages.length < 3) {
      setSaveError("Please upload at least 3 gallery images.")
      return
    }

    const hasInvalidSection = form.sections.some((section) => !section.heading.trim() || !section.paragraph.trim())
    if (hasInvalidSection) {
      setSaveError("All 5 sections require both heading and paragraph.")
      return
    }

    setSaving(true)

    let slugQuery = supabase.from("blogs").select("id").eq("slug", normalizedSlug)
    if (editingId) slugQuery = slugQuery.neq("id", editingId)

    const { data: existingSlug, error: slugError } = await slugQuery.maybeSingle()
    if (slugError) {
      setSaveError(slugError.message)
      setSaving(false)
      return
    }

    if (existingSlug) {
      setSaveError("Slug already exists.")
      setSaving(false)
      return
    }

    const payload = {
      title: form.title.trim(),
      slug: normalizedSlug,
      excerpt: form.excerpt.trim(),
      content: "",
      cover_image: "",
      cover_image_path: form.cover_image_path,
      gallery_image_paths: filledGalleryImages,
      sections: form.sections.map((section) => ({
        heading: section.heading.trim(),
        paragraph: section.paragraph.trim(),
      })),
      author: form.author.trim(),
      published_at: form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString(),
      is_published: form.is_published,
      is_featured: form.is_featured,
    }

    if (editingId) {
      const { data, error } = await updateBlog(editingId, payload)
      if (error) {
        setSaveError(error)
        setSaving(false)
        return
      }
      if (data) setBlogs((prev) => prev.map((blog) => (blog.id === data.id ? data : blog)))
    } else {
      const { data, error } = await createBlog(payload)
      if (error) {
        setSaveError(error)
        setSaving(false)
        return
      }
      if (data) setBlogs((prev) => [data, ...prev])
    }

    setSaving(false)
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return
    const { error } = await deleteBlog(id)
    if (!error) {
      setBlogs((prev) => prev.filter((blog) => blog.id !== id))
    }
  }

  if (loading) return <p className="text-gray-500">Loading blogs...</p>

  const filteredBlogs = blogs.filter((blog) => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return true
    return (
      blog.title.toLowerCase().includes(needle) ||
      blog.slug.toLowerCase().includes(needle) ||
      (blog.author || "").toLowerCase().includes(needle)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedBlogs = filteredBlogs.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = filteredBlogs.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, filteredBlogs.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-poppins text-slate-900">Blogs</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage blog content for the storefront.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors">
          <Plus size={16} /> Add Blog
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search blogs..."
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
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/70">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Slug</th>
                <th className="text-left py-3 px-4">Author</th>
                <th className="text-left py-3 px-4">Published At</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Featured</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlogs.map((blog) => (
                <tr key={blog.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{blog.title}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{blog.slug}</td>
                  <td className="py-3 px-4 text-slate-700">{blog.author || "-"}</td>
                  <td className="py-3 px-4 text-slate-700">{new Date(blog.published_at).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${blog.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {blog.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${blog.is_featured ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {blog.is_featured ? "Featured" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => openEdit(blog)} className="text-slate-500 hover:text-blue-600 mr-3"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(blog.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {filteredBlogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">No blogs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredBlogs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">Showing {startItem}-{endItem} of {filteredBlogs.length}</p>
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
        <BlogFormModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          saving={saving}
          saveError={saveError}
          slugTouched={slugTouched}
          setSlugTouched={setSlugTouched}
          uploadingSlot={uploadingSlot}
          uploadingIndex={uploadingIndex}
          onUploadImage={handleUploadImage}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
