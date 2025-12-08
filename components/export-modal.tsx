"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, FileImage, FileCode, Presentation } from "lucide-react"

interface ExportModalProps {
  open: boolean
  onClose: () => void
  chartTitle: string
  onExport: (format: ExportFormat) => Promise<void> | void
}

type ExportFormat = "png" | "svg"

const formats: { value: ExportFormat; label: string; icon: React.ElementType; description: string }[] = [
  { value: "png", label: "PNG", icon: FileImage, description: "High-quality image" },
  { value: "svg", label: "SVG", icon: FileCode, description: "Scalable vector" },
]

export function ExportModal({ open, onClose, chartTitle, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("png")
  const [exported, setExported] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await onExport(format)
      setExported(true)
      setTimeout(() => {
        setExported(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Export failed", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Chart</DialogTitle>
          <DialogDescription>Choose a format to export "{chartTitle}"</DialogDescription>
        </DialogHeader>

        {exported ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-foreground font-medium">Export complete!</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="grid grid-cols-2 gap-3">
                {formats.map(({ value, label, icon: Icon, description }) => (
                  <Label
                    key={value}
                    htmlFor={value}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all
                      ${format === value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
                    `}
                  >
                    <RadioGroupItem value={value} id={value} className="sr-only" />
                    <Icon className={`w-8 h-8 ${format === value ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="text-center">
                      <div className="font-medium text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} className="flex-1" disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
