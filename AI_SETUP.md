# AI-Powered Chart Generation Setup

## Quick Start

### 1. Configure API Key

To enable AI-powered data analysis, you need an OpenAI API key:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` and replace `your_openai_api_key_here` with your actual API key:
   ```
   OPENAI_API_KEY=sk-proj-...your-actual-key-here
   ```

### 2. Install Dependencies & Run

```bash
npm install
npm run dev
```

## New Features

### ✨ AI-Powered Data Analysis

Users can now input data in **any format** - not just CSV:

- **Raw text**: "Sales in Jan were 100, Feb 150, Mar 200"
- **CSV format**: Traditional comma-separated values
- **Natural language**: "We had 500 visitors on Monday, 700 on Tuesday..."

The AI will:
1. Extract structured data from the raw text
2. Generate an appropriate chart title
3. Recommend 2-4 chart types with confidence scores
4. Provide reasoning for each recommendation

### 📊 Smart Chart Recommendations

After AI analysis, users see:
- **Recommended charts** (sorted by relevance)
- **Confidence scores** for each recommendation
- **Reasoning** explaining why each chart type is suitable
- **All available chart types** for manual selection

### 🎯 Dual Mode Support

Users can choose between:
- **"Analyze with AI"**: Full AI-powered analysis and recommendations
- **"Manual Mode"**: Traditional CSV input without AI (fallback option)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | Yes (for AI features) |

## File Structure

```
lib/
  ai-service.ts         # AI analysis and recommendation logic
components/
  data-input-screen.tsx # Updated with AI analysis support
  template-selection-screen.tsx # Shows AI recommendations
app/
  page.tsx              # Updated flow orchestration
```

## Error Handling

If the API key is missing or invalid:
- User sees a clear error message
- Can fall back to "Manual Mode" with CSV input
- No disruption to existing functionality

## Development Notes

- Uses GPT-4 Mini for cost-effective analysis
- Temperature set to 0.3 for consistent outputs
- Includes fallback CSV parser for manual mode
- All environment variables are loaded via Next.js config
