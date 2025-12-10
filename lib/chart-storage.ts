export type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "bubble"

export interface ChartData {
    title: string
    data: Array<Record<string, string | number>>
    columns: string[]
}

export interface ChartStyles {
    colorPalette: string[]
    showGrid: boolean
    showLegend: boolean
}

export interface SavedChart {
    id: string
    title: string
    data: ChartData
    type: ChartType
    styles: ChartStyles
    lastModified: number
}

const STORAGE_KEY = 'chartyaka_history'

export const getSavedCharts = (): SavedChart[] => {
    if (typeof window === 'undefined') return []
    try {
        const item = localStorage.getItem(STORAGE_KEY)
        return item ? JSON.parse(item) : []
    } catch (error) {
        console.error('Error loading charts:', error)
        return []
    }
}

export const saveChart = (chart: SavedChart) => {
    try {
        const charts = getSavedCharts()
        const index = charts.findIndex(c => c.id === chart.id)
        if (index >= 0) {
            charts[index] = chart
        } else {
            charts.unshift(chart)
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
    } catch (error) {
        console.error('Error saving chart:', error)
    }
}

export const deleteChart = (id: string) => {
    try {
        const charts = getSavedCharts().filter(c => c.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(charts))
        return charts
    } catch (error) {
        console.error('Error deleting chart:', error)
        return []
    }
}

export const clearAllCharts = () => {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Error clearing charts:', error)
    }
}
