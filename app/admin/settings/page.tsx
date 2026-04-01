"use client"

import { useEffect, useState } from "react"
import { getStoreSettings, updateStoreSetting } from "@/lib/actions/settings"
import { toast } from "react-toastify"
import { Save, RefreshCw, X } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data, error } = await getStoreSettings()
    if (error) {
      toast.error(error)
    } else if (data) {
      setSettings(data)
    }
    setLoading(false)
  }

  const handleSave = async (key: string, value: any) => {
    setSaving(true)
    const { error } = await updateStoreSetting(key, value)
    if (error) {
      toast.error(error)
    } else {
      toast.success(`${key.replace(/_/g, " ")} updated`)
      await loadSettings()
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Store Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure store policies and operational parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cancellation Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Cancellation Policy</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cancellation Refund Window (Days)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={settings.cancellation_refund_days || 0}
                  onChange={(e) => setSettings({ ...settings, cancellation_refund_days: e.target.value })}
                  className="flex-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                  placeholder="e.g. 3"
                />
                <button
                  onClick={() => handleSave("cancellation_refund_days", settings.cancellation_refund_days)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Orders cancelled within this number of days from placement will be automatically eligible for a refund.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Refund Policy</h2>
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Refund Request Window (Days)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={settings.refund_request_days || 0}
                  onChange={(e) => setSettings({ ...settings, refund_request_days: e.target.value })}
                  className="flex-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                  placeholder="e.g. 30"
                />
                <button
                  onClick={() => handleSave("refund_request_days", settings.refund_request_days)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Users can request a refund within this number of days after the order is delivered or placed.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dynamic Refund Rules
              </label>
              <div className="space-y-3">
                {Array.isArray(settings.refund_policy_rules) && settings.refund_policy_rules.map((rule: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-sm flex-1">
                      Within <span className="font-semibold">{rule.days}</span> days → <span className="font-semibold text-emerald-600">{rule.rate}%</span> refund
                    </div>
                    <button
                      onClick={() => {
                        const newRules = settings.refund_policy_rules.filter((_: any, i: number) => i !== index)
                        handleSave("refund_policy_rules", newRules)
                      }}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Days"
                      id="new-rule-days"
                      className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">DAYS</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Rate"
                      id="new-rule-rate"
                      className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">%</span>
                  </div>
                  <button
                    onClick={() => {
                      const daysInput = document.getElementById("new-rule-days") as HTMLInputElement
                      const rateInput = document.getElementById("new-rule-rate") as HTMLInputElement
                      const days = parseInt(daysInput.value)
                      const rate = parseInt(rateInput.value)
                      
                      if (isNaN(days) || isNaN(rate)) {
                        toast.error("Please enter valid days and rate")
                        return
                      }
                      
                      const newRules = [...(settings.refund_policy_rules || []), { days, rate }]
                      handleSave("refund_policy_rules", newRules)
                      daysInput.value = ""
                      rateInput.value = ""
                    }}
                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Define how much to refund based on how many days have passed since the order was placed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
