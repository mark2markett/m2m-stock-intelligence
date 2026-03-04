import jsPDF from 'jspdf';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem } from '../types';
import { NewsService } from './newsService';

export class PDFGenerator {
  static async generateReport(
    report: AnalysisReport,
    stockData: StockData,
    indicators: TechnicalIndicators,
    newsData: NewsItem[]
  ): Promise<Blob> {
    console.log('Generating PDF report...');
    
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * lineHeight));
      });
      return y + (lines.length * lineHeight);
    };
    
    // Title and Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Stock Analysis Report', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(16);
    doc.text(`${stockData.symbol} - ${stockData.name}`, 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 15;
    
    // Executive Summary Box
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(248, 250, 252);
    const summaryHeight = 40;
    doc.rect(20, yPosition, 170, summaryHeight, 'F');
    doc.rect(20, yPosition, 170, summaryHeight, 'S');
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 25, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Current Price: $${stockData.price.toFixed(2)} (${stockData.change >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%)`, 25, yPosition);
    yPosition += 5;
    doc.text(`Setup Stage: ${report.setupStage} | Quality: ${report.tradeQuality} | Confidence: ${report.confidenceScore}/100`, 25, yPosition);
    yPosition += 5;
    doc.text(`Volatility Regime: ${report.volatilityRegime} | News Sentiment: ${newsData.length > 0 ? NewsService.analyzeSentiment(newsData) : 'Neutral'}`, 25, yPosition);
    yPosition += 5;
    doc.text(`Support: $${indicators.bollingerBands.lower.toFixed(2)} | Resistance: $${indicators.bollingerBands.upper.toFixed(2)}`, 25, yPosition);
    yPosition += 15;
    
    // Technical Indicators Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Indicators', 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const indicators_data = [
      [`RSI (14)`, `${indicators.rsi.toFixed(1)}`, indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'],
      [`MACD`, `${indicators.macd.macd.toFixed(3)}`, indicators.macd.macd > indicators.macd.signal ? 'Bullish' : 'Bearish'],
      [`EMA 20/50`, `$${indicators.ema20.toFixed(2)} / $${indicators.ema50.toFixed(2)}`, indicators.ema20 > indicators.ema50 ? 'Bullish' : 'Bearish'],
      [`ATR (14)`, `${indicators.atr.toFixed(2)}`, report.volatilityRegime + ' Vol'],
      [`ADX (14)`, `${indicators.adx.toFixed(1)}`, indicators.adx > 25 ? 'Strong Trend' : 'Weak Trend'],
      [`Stochastic`, `%K: ${indicators.stochastic.k.toFixed(1)}`, indicators.stochastic.k > 80 ? 'Overbought' : indicators.stochastic.k < 20 ? 'Oversold' : 'Neutral']
    ];
    
    indicators_data.forEach(([indicator, value, interpretation]) => {
      doc.text(indicator, 25, yPosition);
      doc.text(value, 80, yPosition);
      doc.text(interpretation, 130, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // Add new page for detailed analysis
    doc.addPage();
    yPosition = 20;
    
    // Detailed Analysis Sections
    report.sections.forEach((section, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${section.title}`, 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(section.content, 20, yPosition, 170);
      yPosition += 10;
    });
    
    // Add disclaimer on final page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 20;
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const disclaimer = "DISCLAIMER: This analysis is for informational purposes only and does not constitute financial advice. Trading stocks involves risk and you may lose money. Past performance does not guarantee future results. Consult with a qualified financial advisor before making investment decisions.";
    addWrappedText(disclaimer, 20, yPosition, 170, 4);
    
    console.log('PDF generation completed');
    
    return doc.output('blob');
  }
}