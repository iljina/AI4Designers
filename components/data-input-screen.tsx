"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, HelpCircle, Upload, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ChartData } from "@/app/page"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/ui/brand-logo"
import { analyzeDataWithAI, parseCSVFallback, type AIAnalysisResult } from "@/lib/ai-service"

interface DataInputScreenProps {
  onSubmit: (data: ChartData) => void
  onAnalyze: (result: AIAnalysisResult) => void
  onBack: () => void
}
// ... (CSV constants remain implicitly the same, but I need to focus on replacement area)

// I will target a larger block to clean up the mess


const sampleCSV = `Month,Sales,Expenses
January,4000,2400
February,3000,1398
March,2000,9800
April,2780,3908
May,1890,4800
June,2390,3800`

const complexCSV = `Month,Revenue,Cost,Profit,Margin
Jan,5000,3000,2000,40
Feb,6000,3500,2500,41
Mar,7500,4000,3500,46
Apr,8000,4200,3800,47
May,7200,3800,3400,47
Jun,8500,4500,4000,47
Jul,9000,4800,4200,46
Aug,9500,5000,4500,47
Sep,8800,4600,4200,47
Oct,9200,4900,4300,46
Nov,10500,5500,5000,47
Dec,12000,6000,6000,50`

export function DataInputScreen({ onSubmit, onAnalyze, onBack }: DataInputScreenProps) {
  const [title, setTitle] = useState("")
  const [rawData, setRawData] = useState("")
  const [error, setError] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleContinue = async () => {
    if (!rawData.trim()) {
      setError("Please enter your data")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      // Try AI analysis first
      const result = await analyzeDataWithAI(rawData)
      setTitle(result.title)
      onAnalyze(result)
    } catch (err) {
      console.error("AI analysis failed, falling back to manual mode:", err)

      // Fallback to manual CSV parsing
      if (!title.trim()) {
        setError("Please enter a chart title for manual mode")
        setIsAnalyzing(false)
        return
      }

      try {
        const parsed = parseCSVFallback(rawData)
        setError("")
        onSubmit({
          title: title.trim(),
          data: parsed.data,
          columns: parsed.columns,
        })
      } catch (parseErr) {
        setError("Could not analyze data with AI or parse as CSV. Please check your data format.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadSimple = () => {
    setRawData(sampleCSV)
    setTitle("Monthly Sales Report")
  }

  const loadComplex = () => {
    setRawData(complexCSV)
    setTitle("Annual Financial Overview")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Enter your data</h1>
            <p className="text-muted-foreground">Add your data in any format - AI will analyze it</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-2 mb-8">
              <Label htmlFor="title">Chart Title (optional)</Label>
              <Input
                id="title"
                placeholder="e.g., Quarterly Revenue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="data">Data (any format)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Paste raw text, CSV data, or describe your data in plain language. AI will extract and structure it.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm text-muted-foreground">
                  Try sample data:{" "}
                  <button
                    onClick={loadSimple}
                    className="text-foreground hover:underline transition-colors"
                  >
                    Simple
                  </button>
                  {" | "}
                  <button
                    onClick={loadComplex}
                    className="text-foreground hover:underline transition-colors"
                  >
                    Complex
                  </button>
                </div>
              </div>
              <Textarea
                id="data"
                placeholder={`Enter your data in any format:\n\nCSV format:\nMonth,Value\nJan,100\nFeb,150\n\nOr raw text:\nSales in Jan were 100, Feb 150, Mar 200`}
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                disabled={isAnalyzing}
              />
            </div>

            <div className="flex gap-2 items-center">
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv,.txt,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const text = e.target?.result as string
                      setRawData(text)
                    }
                    reader.readAsText(file)
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 border border-border hover:bg-card hover:border-primary/50"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports DOC, XLS, CSV - AI auto-formatting
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button onClick={handleContinue} className="w-full gap-2" disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
