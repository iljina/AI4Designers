"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ChevronLeft, ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react"
import { ChartPreview } from "@/components/chart-preview"
import { DataPanel } from "@/components/data-panel"
import { TemplateSidebar } from "@/components/template-sidebar"
import { StylePanel } from "@/components/style-panel"
import { ExportModal } from "@/components/export-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import * as htmlToImage from "html-to-image"
import { ChartType, ChartData, ChartStyles, saveChart } from "@/lib/chart-storage"

interface ChartWorkspaceProps {
  chartData: ChartData
  chartType: ChartType
  initialId?: string
  initialStyles?: ChartStyles
  onChartTypeChange: (type: ChartType) => void
  onBack: () => void
}

const colorPalettes = {
  sunset: ["#F5055C", "#F68E1E", "#D1052E", "#F45D94", "#FEB922"],
  ocean: ["#0075B6", "#04B6D2", "#5A96F9", "#82E2F7", "#7A61FF"],
  nature: ["#217C76", "#3BC9A0", "#EDC05D", "#F39D52", "#F76648"],
  rainbow: ["#FF62B0", "#C68DFF", "#748DFF", "#3FA8F4", "#12E29B"],
  monochrome: ["#63738A", "#C4CCD6", "#323C4E", "#9BA5B4", "#4F596B"],
}

export function ChartWorkspace({
  chartData,
  chartType,
  initialId,
  initialStyles,
  onChartTypeChange,
  onBack
}: ChartWorkspaceProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Use a ref for ID to persist across re-renders without triggering them
  const chartIdRef = useRef(initialId || `chart-${Date.now()}`)

  const [styles, setStyles] = useState<ChartStyles>(initialStyles || {
    colorPalette: colorPalettes.sunset,
    showGrid: true,
    showLegend: true,
  })
  const [currentData, setCurrentData] = useState(chartData)
  const [showExport, setShowExport] = useState(false)

  // Initialize palette selection based on loaded styles or default
  const [selectedPalette, setSelectedPalette] = useState<string>(() => {
    if (initialStyles) {
      // Try to find if the loaded palette matches a preset
      const preset = Object.entries(colorPalettes).find(([_, colors]) =>
        JSON.stringify(colors) === JSON.stringify(initialStyles.colorPalette)
      )
      return preset ? preset[0] : "custom" // customized if not matching preset
    }
    return "sunset"
  })

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      saveChart({
        id: chartIdRef.current,
        title: currentData.title || "Untitled Chart",
        data: currentData,
        type: chartType,
        styles: styles,
        lastModified: Date.now()
      })
    }, 1000) // Debounce save by 1s

    return () => clearTimeout(timer)
  }, [currentData, chartType, styles])

  const [customPalettes, setCustomPalettes] = useState<Array<{ id: string; colors: string[] }>>([])
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [leftPanelWidth, setLeftPanelWidth] = useState(256) // 256px = w-64
  const [isResizing, setIsResizing] = useState(false)

  /* Load custom palettes from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("chart_custom_palettes")
      if (saved) {
        setCustomPalettes(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load custom palettes", e)
    }
  }, [])

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
    try {
      localStorage.setItem("chart_custom_palettes", JSON.stringify(palettes))
    } catch (e) {
      console.error("Failed to save custom palettes", e)
    }
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
      // Find the chart container div
      const node = chartRef.current

      // Filter out elements that should not be in the export (e.g. any resize handles or control overlays if they exist)
      // For now, we assume chartRef points to the container wrapping the chart and legend

      const filter = (node: HTMLElement) => {
        const exclusionClasses = ["resize-handle", "control-overlay"]
        return !exclusionClasses.some((classname) => node.classList?.contains(classname))
      }

      if (format === "png") {
        // Simple delay to ensure fonts/layout are ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        const dataUrl = await htmlToImage.toPng(node, {
          quality: 1.0,
          pixelRatio: 2,
          filter: filter,
          backgroundColor: window.getComputedStyle(node).backgroundColor || '#ffffff', // Ensure background is captured
        })
        const link = document.createElement("a")
        link.download = `${currentData.title || "chart"}.png`
        link.href = dataUrl
        link.click()
      } else if (format === "svg") {
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Use html-to-image for SVG as well to capture HTML legends
        const dataUrl = await htmlToImage.toSvg(node, {
          filter: filter,
          backgroundColor: window.getComputedStyle(node).backgroundColor || '#ffffff',
        })

        const link = document.createElement("a")
        link.download = `${currentData.title || "chart"}.svg`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card dark:bg-[#150E10]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 bg-[#F0F0F0] hover:bg-[#E5E5E5] dark:bg-[#291D20] dark:hover:bg-[#2D2629]">
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
            className="border-r border-border bg-card dark:bg-[#150E10] overflow-y-auto"
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
        <div className="border-l border-border bg-card dark:bg-[#150E10] flex flex-col" style={{ width: rightPanelOpen ? '288px' : '48px' }}>
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
