"use client"

import { useEffect, useState } from "react"
import { deleteAdminContactMessage, getAdminContactMessages } from "@/lib/actions/contact"
import { ContactMessage } from "@/types"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

const ITEMS_PER_PAGE = 5
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(ITEMS_PER_PAGE)

  useEffect(() => {
    getAdminContactMessages().then(({ data }) => {
      setMessages(data || [])
      setLoading(false)
    })
  }, [])

  const handleDelete = async (messageId: string) => {
    if (!confirm("Delete this contact message?")) return
    setDeletingId(messageId)
    const { error } = await deleteAdminContactMessage(messageId)
    if (!error) {
      setMessages((prev) => prev.filter((message) => message.id !== messageId))
    }
    setDeletingId(null)
  }

  if (loading) return <p className="text-gray-500">Loading contact messages...</p>

  const totalPages = Math.max(1, Math.ceil(messages.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedMessages = messages.slice((safePage - 1) * pageSize, safePage * pageSize)
  const startItem = messages.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, messages.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold font-poppins tracking-tight text-slate-900">Contact Messages</h1>
          <p className="text-sm text-slate-500 mt-1">Review customer inquiries and follow up quickly.</p>
        </div>
        <p className="text-sm text-slate-500 rounded-full bg-slate-100 px-3 py-1">Total: {messages.length}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-50/70">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Message</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map((msg) => (
                <tr key={msg.id} className="border-b border-slate-100 text-sm align-top hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">{new Date(msg.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{msg.full_name}</td>
                  <td className="py-3 px-4 text-slate-700">{msg.email}</td>
                  <td className="py-3 px-4 max-w-xl whitespace-pre-wrap text-slate-700">{msg.message}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">No contact messages yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">Showing {startItem}-{endItem} of {messages.length}</p>
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
    </div>
  )
}
