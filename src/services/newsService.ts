import { NewsItem } from '../types';

export class NewsService {
  // Get recent news for a stock using Polygon.io news API
  static async getStockNews(symbol: string, limit: number = 5): Promise<NewsItem[]> {
    console.log(`Fetching news for ${symbol} from Polygon.io`);
    console.log(`🗞️ Requested ${limit} news articles for ${symbol}`);
    
    const apiKey = import.meta.env.VITE_POLYGON_API_KEY;
    
    if (!apiKey || apiKey === 'your_polygon_api_key_here') {
      console.error('Polygon API key not configured for news');
      throw new Error('Polygon API key not configured. Please add your API key to the .env file.');
    }

    try {
      // Get news from Polygon.io
      const newsUrl = `https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=${limit}&apikey=${apiKey}`;
      console.log('Fetching news from:', newsUrl);
      
      const response = await fetch(newsUrl);
      
      if (!response.ok) {
        console.error(`News API error: ${response.status}`);
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('News API response:', data);
      console.log(`📰 Polygon returned ${data.results?.length || 0} news articles`);
      
      if (!data.results || data.results.length === 0) {
        console.warn('No news results from Polygon.io');
        console.log(`⚠️ No news found for ${symbol} - this could be normal for less active stocks`);
        return [];
      }
      
      // Convert Polygon news to our format and analyze sentiment
      const newsItems: NewsItem[] = data.results.slice(0, limit).map((article: any) => ({
        headline: article.title,
        sentiment: this.analyzeSentimentFromTitle(article.title),
        date: article.published_utc,
        source: article.publisher?.name || 'Unknown'
      }));
      
      console.log(`✅ Processed ${newsItems.length} news items:`, newsItems.map(n => ({
        headline: n.headline.substring(0, 50) + '...',
        sentiment: n.sentiment,
        source: n.source
      })));
      
      return newsItems;
      
    } catch (error) {
      console.error('Error fetching news from Polygon.io:', error);
      throw error; // Don't fall back to mock data
    }
  }
  
  // Simple sentiment analysis based on keywords
  private static analyzeSentimentFromTitle(title: string): 'Positive' | 'Negative' | 'Neutral' {
    const positiveWords = ['beats', 'exceeds', 'strong', 'growth', 'up', 'gains', 'bullish', 'upgrade', 'buy', 'outperforms', 'record', 'high'];
    const negativeWords = ['misses', 'falls', 'down', 'drops', 'weak', 'decline', 'bearish', 'downgrade', 'sell', 'loss', 'low', 'concern'];
    
    const lowerTitle = title.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerTitle.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerTitle.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }
  
  // Analyze overall sentiment
  static analyzeSentiment(news: NewsItem[]): 'Positive' | 'Neutral' | 'Negative' {
    if (news.length === 0) return 'Neutral';
    
    const sentimentScores = {
      'Positive': 1,
      'Neutral': 0,
      'Negative': -1
    };
    
    const totalScore = news.reduce((sum, item) => sum + sentimentScores[item.sentiment], 0);
    const avgScore = totalScore / news.length;
    
    if (avgScore > 0.2) return 'Positive';
    if (avgScore < -0.2) return 'Negative';
    return 'Neutral';
  }
}