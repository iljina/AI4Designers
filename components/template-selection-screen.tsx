"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { BarChart3, LineChart, AreaChart, PieChart, Check } from "lucide-react"
import { useState } from "react"
import type { ChartType } from "@/app/page"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

interface TemplateSelectionScreenProps {
  onSelect: (template: ChartType) => void
  onBack: () => void
}

const templates: { type: ChartType; name: string; icon: React.ElementType; description: string }[] = [
  { type: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare values across categories" },
  { type: "line", name: "Line Chart", icon: LineChart, description: "Show trends over time" },
  { type: "area", name: "Area Chart", icon: AreaChart, description: "Visualize cumulative data" },
  { type: "pie", name: "Pie Chart", icon: PieChart, description: "Display proportions" },
]

export function TemplateSelectionScreen({ onSelect, onBack }: TemplateSelectionScreenProps) {
  const [selected, setSelected] = useState<ChartType>("bar")

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <Image src="/logo.svg" alt="ChartFlow" width={140} height={35} priority />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Choose a template</h1>
            <p className="text-muted-foreground">Select the chart type that best represents your data</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.type}
                onClick={() => setSelected(template.type)}
                className={cn(
                  "p-6 rounded-xl border-2 text-left transition-all",
                  "hover:border-primary/50 hover:bg-card",
                  selected === template.type ? "border-primary bg-card" : "border-border bg-background",
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <template.icon
                    className={cn("w-10 h-10", selected === template.type ? "text-primary" : "text-muted-foreground")}
                  />
                  {selected === template.type && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onBack} className="flex-1 hover:bg-card">
              Back
            </Button>
            <Button onClick={() => onSelect(selected)} className="flex-1">
              Create Chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
