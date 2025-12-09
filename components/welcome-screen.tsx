"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Zap, Sparkles, ArrowRight } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/ui/brand-logo"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Create stunning charts in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Upload your data, pick a template, and export beautiful visualizations instantly.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-left">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="p-4 rounded-xl bg-card dark:bg-[#150E10] border border-border">
              <benefit.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <Button size="lg" onClick={onStart} className="gap-2 px-8">
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
