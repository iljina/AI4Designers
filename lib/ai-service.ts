import type { ChartType } from "@/app/page"

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
 * Analyzes raw text data using OpenAI and returns structured data
 * along with chart type recommendations.
 */
export async function analyzeDataWithAI(rawText: string): Promise<AIAnalysisResult> {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey === "your_openai_api_key_here") {
        throw new Error(
            "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file."
        )
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a data analysis expert. Your task is to:
1. Extract structured data from raw text
2. Format it as a JSON array of objects
3. Recommend 2-4 suitable chart types
4. Generate an appropriate title

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "data": [{"column1": value, "column2": value}],
  "columns": ["column1", "column2"],
  "recommendations": [
    {
      "type": "bar" | "line" | "area" | "pie",
      "confidence": 0-100,
      "reason": "brief explanation"
    }
  ]
}

Rules:
- Always include at least one label column (string) and one numeric column
- Recommend 2-4 chart types ordered by suitability
- Confidence score from 0-100
- Keep data clean and well-structured`,
                    },
                    {
                        role: "user",
                        content: rawText,
                    },
                ],
                temperature: 0.3,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
                `OpenAI API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
            )
        }

        const result = await response.json()
        const content = result.choices?.[0]?.message?.content

        if (!content) {
            throw new Error("No content received from OpenAI API")
        }

        // Parse the JSON response
        const parsed = JSON.parse(content) as AIAnalysisResult
        parsed.rawAnalysis = content

        // Validate the response
        if (!parsed.title || !parsed.data || !parsed.columns || !parsed.recommendations) {
            throw new Error("Invalid response format from AI")
        }

        return parsed
    } catch (error) {
        console.error("AI Analysis Error:", error)

        if (error instanceof Error) {
            throw error
        }

        throw new Error("Failed to analyze data with AI")
    }
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
