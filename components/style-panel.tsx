"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Plus, X, Trash2 } from "lucide-react"
import type { ChartStyles } from "@/components/chart-workspace"
import { cn } from "@/lib/utils"
import { ColorPicker } from "@/components/ui/color-picker"

interface StylePanelProps {
  styles: ChartStyles
  onStyleChange: (styles: ChartStyles) => void
  selectedPalette: string
  onPaletteChange: (palette: string) => void
  colorPalettes: Record<string, string[]>
  customPalettes?: Array<{ id: string; colors: string[] }>
  onCustomPalettesChange?: (palettes: Array<{ id: string; colors: string[] }>) => void
}

const DEFAULT_CUSTOM_COLORS = ["#ED2A66", "#FF8A00", "#C6283D", "#FF6B9D", "#FFB347"]

export function StylePanel({
  styles,
  onStyleChange,
  selectedPalette,
  onPaletteChange,
  colorPalettes,
  customPalettes = [],
  onCustomPalettesChange,
}: StylePanelProps) {
  const [isEditingCustom, setIsEditingCustom] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempCustomColors, setTempCustomColors] = useState<string[]>(DEFAULT_CUSTOM_COLORS)

  const handleAddCustomPalette = () => {
    setTempCustomColors(DEFAULT_CUSTOM_COLORS)
    setEditingId(null)
    setIsEditingCustom(true)
  }

  const handleEditCustomPalette = (id: string, colors: string[]) => {
    setTempCustomColors(colors)
    setEditingId(id)
    setIsEditingCustom(true)
  }

  const handleSaveCustomPalette = () => {
    if (onCustomPalettesChange) {
      let newPalettes = [...customPalettes]

      if (editingId) {
        // Update existing palette
        newPalettes = newPalettes.map(p =>
          p.id === editingId ? { ...p, colors: tempCustomColors } : p
        )
      } else {
        // Add new palette
        const newId = `custom-${Date.now()}`
        newPalettes.push({ id: newId, colors: tempCustomColors })
      }

      onCustomPalettesChange(newPalettes)

      // Select the newly created or edited palette
      const paletteId = editingId || newPalettes[newPalettes.length - 1].id
      onPaletteChange(paletteId)
    }
    setIsEditingCustom(false)
    setEditingId(null)
  }

  const handleDeleteCustomPalette = (id: string) => {
    if (onCustomPalettesChange) {
      const newPalettes = customPalettes.filter(p => p.id !== id)
      onCustomPalettesChange(newPalettes)

      // If deleted palette was selected, switch to default
      if (selectedPalette === id) {
        onPaletteChange("sunset")
      }
    }
  }

  const handleCancelCustomPalette = () => {
    setTempCustomColors(DEFAULT_CUSTOM_COLORS)
    setEditingId(null)
    setIsEditingCustom(false)
  }

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...tempCustomColors]
    newColors[index] = color
    setTempCustomColors(newColors)
  }

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto">
      <div>
        <h2 className="font-semibold text-foreground mb-4">Style</h2>
      </div>

      {/* Color Palette */}
      <div className="space-y-3">
        <Label className="text-sm">Color Palette</Label>
        <div className="space-y-2">
          {Object.entries(colorPalettes).map(([name, colors]) => (
            <button
              key={name}
              onClick={() => onPaletteChange(name)}
              className={cn(
                "w-full p-2 rounded-lg border flex items-center gap-3 transition-all",
                selectedPalette === name ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
              )}
            >
              <div className="flex gap-1">
                {colors.slice(0, 5).map((color, i) => (
                  <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-xs capitalize text-foreground">{name}</span>
            </button>
          ))}

          {/* Custom Palettes List */}
          {customPalettes.map((palette) => (
            <div
              key={palette.id}
              className={cn(
                "w-full p-2 rounded-lg border flex items-center gap-3 transition-all group",
                selectedPalette === palette.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
              )}
            >
              <button
                onClick={() => onPaletteChange(palette.id)}
                className="flex-1 flex items-center gap-3"
              >
                <div className="flex gap-1">
                  {palette.colors.slice(0, 5).map((color, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span className="text-xs text-foreground">Custom</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditCustomPalette(palette.id, palette.colors)
                }}
                className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-foreground transition-opacity"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCustomPalette(palette.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Custom Palette Editor */}
          {isEditingCustom && (
            <div className="w-full p-3 rounded-lg border border-primary bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {editingId ? "Edit Custom Palette" : "New Custom Palette"}
                </span>
                <button
                  onClick={handleCancelCustomPalette}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 justify-center">
                {tempCustomColors.map((color, i) => (
                  <ColorPicker
                    key={i}
                    color={color}
                    onChange={(newColor) => handleColorChange(i, newColor)}
                    className="w-9 h-9"
                  />
                ))}
              </div>
              <Button
                onClick={handleSaveCustomPalette}
                size="sm"
                className="w-full"
              >
                {editingId ? "Update Palette" : "Save Custom Palette"}
              </Button>
            </div>
          )}

          {/* Add Custom Button */}
          {!isEditingCustom && (
            <button
              onClick={handleAddCustomPalette}
              className="w-full p-2 rounded-lg border border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Add Custom Palette</span>
            </button>
          )}
        </div>
      </div>

      {/* Toggle Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="grid" className="text-sm">
            Grid Lines
          </Label>
          <Switch
            id="grid"
            checked={styles.showGrid}
            onCheckedChange={(checked) => onStyleChange({ ...styles, showGrid: checked })}
            className="data-[state=unchecked]:bg-muted-foreground/30 data-[state=unchecked]:border data-[state=unchecked]:border-muted-foreground/50"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="legend" className="text-sm">
            Show Legend
          </Label>
          <Switch
            id="legend"
            checked={styles.showLegend}
            onCheckedChange={(checked) => onStyleChange({ ...styles, showLegend: checked })}
            className="data-[state=unchecked]:bg-muted-foreground/30 data-[state=unchecked]:border data-[state=unchecked]:border-muted-foreground/50"
          />
        </div>
      </div>
    </div>
  )
}
