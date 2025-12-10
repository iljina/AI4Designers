"use client"

import type React from "react"

import { BarChart3, LineChart, AreaChart, PieChart, CircleDot, Droplets, Radar, LayoutGrid, Grid } from "lucide-react"
import type { ChartType } from "@/lib/chart-storage"
import { cn } from "@/lib/utils"

interface TemplateSidebarProps {
  selectedType: ChartType
  onTypeChange: (type: ChartType) => void
}

const chartTypes: { type: ChartType; icon: React.ElementType; name: string }[] = [
  { type: "bar", icon: BarChart3, name: "Bar" },
  { type: "line", icon: LineChart, name: "Line" },
  { type: "area", icon: AreaChart, name: "Area" },
  { type: "pie", icon: PieChart, name: "Pie" },
  { type: "donut", icon: CircleDot, name: "Donut" },
  { type: "bubble", icon: Droplets, name: "Bubble" },
  { type: "radar", icon: Radar, name: "Radar" },
  { type: "treemap", icon: LayoutGrid, name: "Treemap" },
]

export function TemplateSidebar({ selectedType, onTypeChange }: TemplateSidebarProps) {
  return (
    <div className="p-4 border-b border-border">
      <h2 className="font-semibold text-foreground mb-4">Chart Type</h2>
      <div className="grid grid-cols-3 gap-2">
        {chartTypes.map(({ type, icon: Icon, name }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={cn(
              "p-3 rounded-lg border text-center transition-all",
              selectedType === type
                ? "border-primary bg-primary/10"
                : "border-border bg-background text-muted-foreground hover:border-primary/50",
            )}
          >
            <Icon className={cn("w-5 h-5 mx-auto mb-1", selectedType === type ? "text-primary" : "")} />
            <span className={cn("text-xs", selectedType === type ? "text-foreground" : "")}>{name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
