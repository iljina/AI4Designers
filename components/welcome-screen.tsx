import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Zap, Sparkles, ArrowRight, Clock, Trash2 } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/ui/brand-logo"
import { SavedChart, getSavedCharts, deleteChart, clearAllCharts } from "@/lib/chart-storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface WelcomeScreenProps {
  onStart: () => void
  onLoadChart: (chart: SavedChart) => void
}

export function WelcomeScreen({ onStart, onLoadChart }: WelcomeScreenProps) {
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([])

  useEffect(() => {
    setSavedCharts(getSavedCharts())
  }, [])

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSavedCharts(deleteChart(id))
  }

  const handleClearAll = () => {
    clearAllCharts()
    setSavedCharts([])
  }

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Create professional charts in seconds, not hours",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Smart suggestions for colors and formatting",
    },
    {
      icon: BarChart3,
      title: "Beautiful Output",
      description: "Export clean, presentation-ready graphics",
    },
  ]
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Create stunning charts in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Upload your data, pick a template, and export beautiful visualizations instantly.
          </p>

          <Button size="lg" onClick={onStart} className="gap-2 px-8 mt-4">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-4 md:grid-cols-3 text-left max-w-4xl mx-auto">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="p-4 rounded-xl bg-card dark:bg-[#150E10] border border-border">
              <benefit.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Saved Charts Section */}
        {savedCharts.length > 0 && (
          <div className="w-full text-left space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Charts
              </h2>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors">
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your saved charts from this browser. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedCharts.map((chart) => (
                <div
                  key={chart.id}
                  onClick={() => onLoadChart(chart)}
                  className="group relative p-4 h-32 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="w-full">
                    <h3 className="font-medium line-clamp-2 pr-6 text-foreground leading-snug" title={chart.title}>
                      {chart.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground capitalize">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{chart.type}</span>
                    <span>{new Date(chart.lastModified).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                    onClick={(e: React.MouseEvent) => handleDelete(e, chart.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
