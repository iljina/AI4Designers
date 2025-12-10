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
import { useToast } from "@/components/ui/use-toast"

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

  const { toast } = useToast()

  const handleExport = async (format: "png" | "svg") => {
    if (!chartRef.current) return

    toast({
      title: "Starting export...",
      description: "Preparing your file for download.",
    })

    try {
      if (format === "png") {
        const node = chartRef.current
        const filter = (node: HTMLElement) => {
          const exclusionClasses = ["resize-handle", "control-overlay"]
          return !exclusionClasses.some((classname) => node.classList?.contains(classname))
        }

        // Simple delay to ensure fonts/layout are ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        const dataUrl = await htmlToImage.toPng(node, {
          quality: 1.0,
          pixelRatio: 2,
          filter: filter,
          backgroundColor: window.getComputedStyle(node).backgroundColor || '#ffffff',
        })
        const link = document.createElement("a")
        link.download = `${currentData.title || "chart"}.png`
        link.href = dataUrl
        link.click()

        toast({
          title: "Export successful",
          description: "Your PNG file has been downloaded.",
        })
      } else if (format === "svg") {
        const node = chartRef.current
        const originalSvg = node.querySelector('svg')
        if (!originalSvg) throw new Error("Chart SVG not found")

        // 1. Clone the SVG
        const clonedSvg = originalSvg.cloneNode(true) as SVGElement

        // 2. Ensure namespace
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        // 3. Inline styles for standard elements
        const allElements = clonedSvg.querySelectorAll('*')
        allElements.forEach((el) => {
          const computedStyle = window.getComputedStyle(el as Element)
          const props = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'opacity']
          let inlineStyle = ''
          props.forEach(prop => {
            const val = computedStyle.getPropertyValue(prop)
            if (val) inlineStyle += `${prop}:${val};`
          })
          if (inlineStyle) (el as HTMLElement).setAttribute('style', inlineStyle)
        })

        // 4. Manually construct Legend if needed
        if (styles.showLegend) {
          let legendItems: Array<{ label: string, color: string }> = []

          if (['pie', 'donut'].includes(chartType)) {
            legendItems = currentData.data.map((row, i) => ({
              label: String(row[currentData.columns[0]]),
              color: styles.colorPalette[i % styles.colorPalette.length]
            }))
          } else {
            legendItems = currentData.columns.slice(1).map((col, i) => ({
              label: col,
              color: styles.colorPalette[i % styles.colorPalette.length]
            }))
          }

          const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          let currentX = 20
          // Use baseVal.height if available, else clientHeight, else fallback
          const svgHeight = originalSvg.viewBox?.baseVal?.height || originalSvg.clientHeight || 300
          const legendY = svgHeight + 20

          legendItems.forEach(item => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
            rect.setAttribute('x', String(currentX))
            rect.setAttribute('y', String(legendY))
            rect.setAttribute('width', '12')
            rect.setAttribute('height', '12')
            rect.setAttribute('rx', '2')
            rect.setAttribute('fill', item.color)
            legendGroup.appendChild(rect)

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.setAttribute('x', String(currentX + 16))
            text.setAttribute('y', String(legendY + 10))
            text.setAttribute('font-family', 'sans-serif')
            text.setAttribute('font-size', '12px')
            const isDark = document.documentElement.classList.contains('dark')
            text.setAttribute('fill', isDark ? '#ffffff' : '#000000')
            text.textContent = item.label
            legendGroup.appendChild(text)

            currentX += 20 + (item.label.length * 8) + 20
          })

          clonedSvg.appendChild(legendGroup)

          const currentViewBox = clonedSvg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, originalSvg.clientWidth, originalSvg.clientHeight]
          const newHeight = parseFloat(String(currentViewBox[3])) + 50
          clonedSvg.setAttribute('viewBox', `${currentViewBox[0]} ${currentViewBox[1]} ${currentViewBox[2]} ${newHeight}`)
          clonedSvg.setAttribute('height', String(originalSvg.clientHeight + 50))
        }

        const serializer = new XMLSerializer()
        const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(clonedSvg)
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.download = `${currentData.title || "chart"}.svg`
        link.href = url
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)

        toast({
          title: "Export successful",
          description: "Your SVG file (vector) has been downloaded.",
        })
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export failed",
        description: "There was an error generating your file. Please try again.",
        variant: "destructive",
      })
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
