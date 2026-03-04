import 'server-only';
import type { NewsItem } from '@/lib/types';
import { analyzeSentimentFromTitle, analyzeSentiment } from '@/lib/utils/sentimentAnalysis';

export { analyzeSentiment };

export class NewsService {
  static async getStockNews(symbol: string, limit: number = 5): Promise<NewsItem[]> {
    const apiKey = process.env.POLYGON_API_KEY;

    if (!apiKey || apiKey === 'your_polygon_api_key_here') {
      throw new Error('Polygon API key not configured.');
    }

    try {
      const newsUrl = `https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=${limit}&apikey=${apiKey}`;
      const response = await fetch(newsUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      const newsItems: NewsItem[] = data.results.slice(0, limit).map((article: any) => ({
        headline: article.title,
        sentiment: analyzeSentimentFromTitle(article.title),
        date: article.published_utc,
        source: article.publisher?.name || 'Unknown'
      }));

      return newsItems;
    } catch (error) {
      console.error('Error fetching news:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  static analyzeSentiment = analyzeSentiment;
}
