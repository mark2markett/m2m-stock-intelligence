# Stock Analysis Pro

Professional stock analysis platform with AI-powered insights and comprehensive technical analysis.

## Features

- **Real-time market data** from Polygon.io API
- **15+ technical indicators** (RSI, MACD, Bollinger Bands, ATR, ADX, etc.)
- **AI-powered analysis** using GPT-4o
- **Professional PDF reports** 
- **News sentiment analysis**
- **Support/resistance level detection**
- **Trade setup classification**

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Polygon.io API key (free tier available)
- OpenAI API key

## Quick Start

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <your-repo-url>
   cd stock-analysis-pro
   
   # Or extract from downloaded zip file
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env file with your API keys
   nano .env  # or use your preferred editor
   ```

4. **Add your API keys to .env file**
   ```
   VITE_POLYGON_API_KEY=your_actual_polygon_api_key
   VITE_OPENAI_API_KEY=your_actual_openai_api_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser to http://localhost:5173**

## API Keys Setup

### Polygon.io API Key
1. Go to [polygon.io](https://polygon.io)
2. Sign up for free account (includes 5 API calls/minute)
3. Go to Dashboard → API Keys
4. Copy your API key to `.env` file

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add billing information
3. Go to API Keys section
4. Create new API key
5. Copy key to `.env` file

## Building for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## Deployment Options

### Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Vercel
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Traditional Web Server
1. Build the project: `npm run build`
2. Upload contents of `dist` folder to your web server
3. Configure environment variables on your server

## Environment Variables

| Variable | Description | Required |
|----------|-------------|-----------|
| `VITE_POLYGON_API_KEY` | Polygon.io API key for market data | Yes |
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI analysis | Yes |

## Performance Notes

- Analysis typically takes 10-15 seconds
- Uses caching to improve performance
- Optimized for mobile and desktop

## Support

For issues or questions, check the browser console for error messages and ensure your API keys are correctly configured.