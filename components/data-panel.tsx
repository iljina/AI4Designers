"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ChartData } from "@/lib/chart-storage"

interface DataPanelProps {
  data: ChartData
  onDataChange: (data: ChartData) => void
}

export function DataPanel({ data, onDataChange }: DataPanelProps) {
  const csvString = [
    data.columns.join(","),
    ...data.data.map((row) => data.columns.map((col) => row[col]).join(",")),
  ].join("\n")

  const handleCsvChange = (csv: string) => {
    try {
      const lines = csv.trim().split("\n")
      if (lines.length < 2) return

      const headers = lines[0].split(",").map((h) => h.trim())
      const parsedData = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const row: Record<string, string | number> = {}
        headers.forEach((header, i) => {
          const num = Number.parseFloat(values[i])
          row[header] = isNaN(num) ? values[i] : num
        })
        return row
      })

      onDataChange({
        ...data,
        data: parsedData,
        columns: headers,
      })
    } catch {
      // Invalid CSV, ignore
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-2 mb-4 flex-shrink-0">
        <Label htmlFor="chart-title" className="text-sm">
          Title
        </Label>
        <Input
          id="chart-title"
          value={data.title}
          onChange={(e) => onDataChange({ ...data, title: e.target.value })}
          className="text-sm bg-background"
        />
      </div>

      <div className="space-y-2 flex-1 flex flex-col min-h-0">
        <Label htmlFor="chart-data" className="text-sm flex-shrink-0">
          CSV Data
        </Label>
        <Textarea
          id="chart-data"
          value={csvString}
          onChange={(e) => handleCsvChange(e.target.value)}
          className="flex-1 font-mono text-xs bg-background resize-none"
        />
      </div>
    </div>
  )
}
