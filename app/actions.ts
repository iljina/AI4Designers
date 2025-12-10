"use server"

import { AIAnalysisResult } from "@/lib/ai-service"

export async function analyzeData(rawText: string): Promise<AIAnalysisResult> {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey === "your_openai_api_key_here") {
        throw new Error("OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.")
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
      "type": "bar" | "line" | "area" | "pie" | "donut" | "bubble" | "radar" | "treemap",
      "confidence": 0-100,
      "reason": "brief explanation"
    }
  ]
}

Rules:
- **CRITICAL**: If the input contains dates or timestamps (e.g., logs, time-series), **PRIORITIZE** aggregating by time (e.g., "Revenue by Month", "Log Counts by Day", "Activity by Hour"). This provides the most valuable trend view.
- **ENABLE MULTI-SERIES**: If there is a categorical field (like Region, Department, Device), **PIVOT** the data so that each category becomes its own column.
  - BAD: \`[{ "month": "Jan", "region": "North America", "sales": 100 }, { "month": "Jan", "region": "Europe", "sales": 80 }]\`
  - GOOD: \`[{ "month": "Jan", "North America": 100, "Europe": 80 }]\`
  - This allows the chart to show multiple comparing lines/bars, which is much richer than a single line.
- **Target Data Density**: Aim for **12-30 data points** (rows) in the result.
- **AGGREGATION**: If the input is a raw list of transactions (>20 rows), you **MUST** aggregate. Do not return raw rows.
- Always include at least one label column (string) and one numeric column.
- Recommend 2-4 chart types ordered by suitability.
- Confidence score from 0-100.
- Keep data clean and well-structured.`,
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
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`)
        }

        const result = await response.json()
        const content = result.choices?.[0]?.message?.content

        if (!content) {
            throw new Error("No content received from OpenAI API")
        }

        // Clean markdown code blocks if present (often GPT wraps JSON in ```json ... ```)
        let jsonContent = content
        if (content.trim().startsWith("```")) {
            jsonContent = content.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "")
        }

        // Parse the JSON response
        const parsed = JSON.parse(jsonContent) as AIAnalysisResult
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
