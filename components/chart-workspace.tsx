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
import { ThemeToggle } from "@/components/theme-toggle"
import * as htmlToImage from "html-to-image"

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
  const chartRef = useRef<HTMLDivElement>(null)
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

  const handleExport = async (format: "png" | "svg") => {
    if (!chartRef.current) return

    try {
      const node = chartRef.current

      if (format === "png") {
        const dataUrl = await htmlToImage.toPng(node, {
          quality: 1.0,
          pixelRatio: 2, // Higher quality
        })
        const link = document.createElement("a")
        link.download = `${currentData.title || "chart"}.png`
        link.href = dataUrl
        link.click()
      } else if (format === "svg") {
        // For SVG, convert to canvas first (works better with Recharts)
        const canvas = await htmlToImage.toCanvas(node, {
          quality: 1.0,
          pixelRatio: 2,
        })

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create SVG with embedded PNG image
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64data = reader.result as string

              // Create an SVG with the canvas image embedded
              const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${base64data}"/>
</svg>`

              const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
              const url = URL.createObjectURL(svgBlob)
              const link = document.createElement("a")
              link.download = `${currentData.title || "chart"}.svg`
              link.href = url
              link.click()

              // Clean up
              setTimeout(() => URL.revokeObjectURL(url), 100)
            }
            reader.readAsDataURL(blob)
          }
        }, 'image/png', 1.0)
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={onBack} className="gap-2 hover:bg-card">
            <ArrowLeft className="w-4 h-4" />
            Back to Start
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowExport(true)} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Left Panel - Data */}
        <>
          <div
            className="border-r border-border bg-card overflow-y-auto"
            style={{ width: leftPanelOpen ? `${leftPanelWidth}px` : '48px' }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                {leftPanelOpen && <h2 className="font-semibold text-foreground">Data</h2>}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  className="h-6 w-6"
                >
                  {leftPanelOpen ? (
                    <PanelLeftClose className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {leftPanelOpen && <DataPanel data={currentData} onDataChange={setCurrentData} />}
            </div>
          </div>
          {/* Resize Handle */}
          {leftPanelOpen && (
            <div
              onClick={handleResizeStart}
              className={`w-1 cursor-col-resize transition-colors ${isResizing ? 'bg-primary' : 'bg-border hover:bg-primary'}`}
            />
          )}
        </>

        {/* Center - Chart Preview */}
        <div className="flex-1 p-6 flex items-center justify-center bg-background">
          <ChartPreview ref={chartRef} data={currentData} chartType={chartType} styles={styles} />
        </div>

        {/* Right Panel - Template & Style */}
        <div className="border-l border-border bg-card flex flex-col" style={{ width: rightPanelOpen ? '288px' : '48px' }}>
          <div className="p-4">
            <div className={`flex items-center mb-4 ${rightPanelOpen ? 'justify-between' : 'justify-end'}`}>
              {rightPanelOpen && <h2 className="font-semibold text-foreground">Appearance</h2>}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="h-6 w-6"
              >
                {rightPanelOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {rightPanelOpen && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        chartTitle={currentData.title}
        onExport={handleExport}
      />
    </div>
  )
}
