"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react"
import type { ChartType, ChartData } from "@/app/page"
import { ChartPreview } from "@/components/chart-preview"
import { DataPanel } from "@/components/data-panel"
import { TemplateSidebar } from "@/components/template-sidebar"
import { StylePanel } from "@/components/style-panel"
import { ExportModal } from "@/components/export-modal"

interface ChartWorkspaceProps {
  chartData: ChartData
  chartType: ChartType
  onChartTypeChange: (type: ChartType) => void
  onBack: () => void
}

export interface ChartStyles {
  colorPalette: string[]
  showGrid: boolean
  showLegend: boolean
}

const colorPalettes = {
  default: ["#ED2A66", "#FF8A00", "#C6283D", "#FF6B9D", "#FFB347"],
  ocean: ["#0077b6", "#00b4d8", "#90e0ef", "#caf0f8", "#03045e"],
  sunset: ["#FF2D6D", "#FF8A00", "#FFB347", "##FF6B9D", "#C6283D"],
  forest: ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2"],
  monochrome: ["#450C23", "#6B1A3A", "#8B2A4A", "#AB3A5A", "#CB4A6A"],
}

export function ChartWorkspace({ chartData, chartType, onChartTypeChange, onBack }: ChartWorkspaceProps) {
  const [styles, setStyles] = useState<ChartStyles>({
    colorPalette: colorPalettes.default,
    showGrid: true,
    showLegend: true,
  })
  const [currentData, setCurrentData] = useState(chartData)
  const [showExport, setShowExport] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState<string>("default")
  const [customPalettes, setCustomPalettes] = useState<Array<{ id: string; colors: string[] }>>([])
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [leftPanelWidth, setLeftPanelWidth] = useState(256) // 256px = w-64
  const [isResizing, setIsResizing] = useState(false)

  const handlePaletteChange = (palette: string) => {
    setSelectedPalette(palette)

    // Check if it's a custom palette
    const customPalette = customPalettes.find(p => p.id === palette)
    if (customPalette) {
      setStyles((prev) => ({ ...prev, colorPalette: customPalette.colors }))
    } else if (palette in colorPalettes) {
      setStyles((prev) => ({ ...prev, colorPalette: colorPalettes[palette as keyof typeof colorPalettes] }))
    }
  }

  const handleCustomPalettesChange = (palettes: Array<{ id: string; colors: string[] }>) => {
    setCustomPalettes(palettes)
  }

  // Handle resizing with click-to-toggle behavior
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX
        // Limit width between 200px and 600px
        if (newWidth >= 200 && newWidth <= 600) {
          setLeftPanelWidth(newWidth)
        }
      }
    }

    const handleGlobalClick = () => {
      if (isResizing) {
        setIsResizing(false)
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      // Add a small delay to avoid the initial click triggering the close immediately
      setTimeout(() => window.addEventListener('click', handleGlobalClick), 0)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleGlobalClick)
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(!isResizing)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={onBack} className="gap-2 hover:bg-card hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Start
          </Button>
        </div>
        <Button onClick={() => setShowExport(true)} className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Left Panel - Data */}
        {leftPanelOpen && (
          <>
            <div
              className="border-r border-border bg-card p-4 space-y-4 overflow-y-auto"
              style={{ width: `${leftPanelWidth}px` }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Data</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(false)}
                  className="h-6 w-6"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </div>
              <DataPanel data={currentData} onDataChange={setCurrentData} />
            </div>
            {/* Resize Handle */}
            <div
              onClick={handleResizeStart}
              className={`w-1 cursor-col-resize transition-colors ${isResizing ? 'bg-primary' : 'bg-border hover:bg-primary'}`}
            />
          </>
        )}

        {/* Toggle Left Panel Button */}
        {!leftPanelOpen && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setLeftPanelOpen(true)}
              className="rounded-l-none h-16"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Center - Chart Preview */}
        <div className="flex-1 p-6 flex items-center justify-center bg-background">
          <ChartPreview data={currentData} chartType={chartType} styles={styles} />
        </div>

        {/* Toggle Right Panel Button */}
        {!rightPanelOpen && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setRightPanelOpen(true)}
              className="rounded-r-none h-16"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Right Panel - Template & Style */}
        {rightPanelOpen && (
          <div className="w-72 border-l border-border bg-card flex flex-col">
            <div className="p-4 pb-0 flex items-center justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(false)}
                className="h-6 w-6"
              >
                <PanelRightClose className="w-4 h-4" />
              </Button>
            </div>
            <TemplateSidebar selectedType={chartType} onTypeChange={onChartTypeChange} />
            <StylePanel
              styles={styles}
              onStyleChange={setStyles}
              selectedPalette={selectedPalette}
              onPaletteChange={handlePaletteChange}
              colorPalettes={colorPalettes}
              customPalettes={customPalettes}
              onCustomPalettesChange={handleCustomPalettesChange}
            />
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal open={showExport} onClose={() => setShowExport(false)} chartTitle={currentData.title} />
    </div>
  )
}
