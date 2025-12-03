"use client"

import { cn } from "@/lib/utils"

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
    className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
    return (
        <div className={cn("relative w-12 h-12", className)}>
            <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
                className="w-full h-full rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                style={{ backgroundColor: color }}
            />
        </div>
    )
}
