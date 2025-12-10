"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { DataInputScreen } from "@/components/data-input-screen"
import { TemplateSelectionScreen } from "@/components/template-selection-screen"
import { ChartWorkspace } from "@/components/chart-workspace"
import type { AIAnalysisResult } from "@/lib/ai-service"
import { ChartType, ChartData, ChartStyles, SavedChart } from "@/lib/chart-storage"

export default function Home() {
  const [step, setStep] = useState<"welcome" | "data" | "template" | "workspace">("welcome")
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ChartType>("bar")
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)

  // State for restoring saved charts
  const [activeChartId, setActiveChartId] = useState<string | undefined>()
  const [activeChartStyles, setActiveChartStyles] = useState<ChartStyles | undefined>()

  const handleStart = () => {
    setStep("data")
    setActiveChartId(undefined)
    setActiveChartStyles(undefined)
  }

  const handleLoadChart = (chart: SavedChart) => {
    setChartData(chart.data)
    setSelectedTemplate(chart.type)
    setActiveChartId(chart.id)
    setActiveChartStyles(chart.styles)
    setStep("workspace")
  }

  const handleDataSubmit = (data: ChartData) => {
    setChartData(data)
    setStep("template")
  }

  const handleAIAnalysis = (analysis: AIAnalysisResult) => {
    setAiAnalysis(analysis)
    setChartData({
      title: analysis.title,
      data: analysis.data,
      columns: analysis.columns,
    })
    // Auto-select the top recommendation if available
    if (analysis.recommendations.length > 0) {
      setSelectedTemplate(analysis.recommendations[0].type)
    }
    setStep("template")
  }

  const handleTemplateSelect = (template: ChartType) => {
    setSelectedTemplate(template)
    setStep("workspace")
  }

  const handleBack = () => {
    if (step === "data") setStep("welcome")
    if (step === "template") setStep("data")
    if (step === "workspace") setStep("welcome")
  }

  return (
    <main className="min-h-screen bg-background">
      {step === "welcome" && <WelcomeScreen onStart={handleStart} onLoadChart={handleLoadChart} />}
      {step === "data" && (
        <DataInputScreen onSubmit={handleDataSubmit} onAnalyze={handleAIAnalysis} onBack={handleBack} />
      )}
      {step === "template" && (
        <TemplateSelectionScreen
          onSelect={handleTemplateSelect}
          onBack={handleBack}
          recommendations={aiAnalysis?.recommendations}
        />
      )}
      {step === "workspace" && chartData && (
        <ChartWorkspace
          key={activeChartId || "new-chart"} // Force remount if ID changes
          chartData={chartData}
          chartType={selectedTemplate}
          initialId={activeChartId}
          initialStyles={activeChartStyles}
          onChartTypeChange={setSelectedTemplate}
          onBack={handleBack}
        />
      )}
    </main>
  )
}
