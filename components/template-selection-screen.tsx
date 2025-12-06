"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { BarChart3, LineChart, AreaChart, PieChart, Check, Sparkles } from "lucide-react"
import { useState } from "react"
import type { ChartType } from "@/app/page"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ChartRecommendation } from "@/lib/ai-service"

interface TemplateSelectionScreenProps {
  onSelect: (template: ChartType) => void
  onBack: () => void
  recommendations?: ChartRecommendation[]
}

const templates: { type: ChartType; name: string; icon: React.ElementType; description: string }[] = [
  { type: "bar", name: "Bar Chart", icon: BarChart3, description: "Compare values across categories" },
  { type: "line", name: "Line Chart", icon: LineChart, description: "Show trends over time" },
  { type: "area", name: "Area Chart", icon: AreaChart, description: "Visualize cumulative data" },
  { type: "pie", name: "Pie Chart", icon: PieChart, description: "Display proportions" },
]

export function TemplateSelectionScreen({ onSelect, onBack, recommendations }: TemplateSelectionScreenProps) {
  const [selected, setSelected] = useState<ChartType>("bar")

  // Sort templates by recommendations if available
  const sortedTemplates = recommendations
    ? [...templates].sort((a, b) => {
      const aRec = recommendations.find((r) => r.type === a.type)
      const bRec = recommendations.find((r) => r.type === b.type)
      const aConf = aRec?.confidence || 0
      const bConf = bRec?.confidence || 0
      return bConf - aConf
    })
    : templates

  const getRecommendation = (type: ChartType) => {
    return recommendations?.find((r) => r.type === type)
  }

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
            <p className="text-muted-foreground">
              {recommendations
                ? "AI recommends these chart types for your data"
                : "Select the chart type that best represents your data"}
            </p>
          </div>

          {recommendations && recommendations.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
              <Sparkles className="w-4 h-4" />
              <span>AI Recommendations (sorted by relevance)</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {sortedTemplates.map((template) => {
              const recommendation = getRecommendation(template.type)
              const isRecommended = !!recommendation

              return (
                <button
                  key={template.type}
                  onClick={() => setSelected(template.type)}
                  className={cn(
                    "p-6 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                    "hover:border-primary/50 hover:bg-card",
                    selected === template.type ? "border-primary bg-card" : "border-border bg-background",
                    isRecommended && "ring-2 ring-purple-500/20"
                  )}
                >
                  {isRecommended && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full border border-purple-500/30">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">{recommendation.confidence}%</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <template.icon
                      className={cn(
                        "w-10 h-10",
                        selected === template.type
                          ? "text-primary"
                          : isRecommended
                            ? "text-purple-600"
                            : "text-muted-foreground"
                      )}
                    />
                    {selected === template.type && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>

                  {recommendation && (
                    <p className="text-xs text-purple-600 mt-2 italic line-clamp-2">{recommendation.reason}</p>
                  )}
                </button>
              )
            })}
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
