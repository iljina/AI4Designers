import type { ChartType } from "@/lib/chart-storage"

export interface AIAnalysisResult {
    title: string
    data: Array<Record<string, string | number>>
    columns: string[]
    recommendations: ChartRecommendation[]
    rawAnalysis: string
}

export interface ChartRecommendation {
    type: ChartType
    confidence: number
    reason: string
}

/**
 * Fallback parser for CSV-like data if AI fails
 */
export function parseCSVFallback(csvText: string): {
    data: Array<Record<string, string | number>>
    columns: string[]
} {
    const lines = csvText.trim().split("\n")
    if (lines.length < 2) {
        throw new Error("Invalid CSV format")
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const row: Record<string, string | number> = {}
        headers.forEach((header, i) => {
            const num = Number.parseFloat(values[i])
            row[header] = isNaN(num) ? values[i] : num
        })
        return row
    })

    return { data, columns: headers }
}
