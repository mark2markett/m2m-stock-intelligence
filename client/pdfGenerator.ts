import jsPDF from 'jspdf';
import type { AnalysisReport, StockData, TechnicalIndicators, NewsItem } from '@/lib/types';
import { analyzeSentiment } from '@/lib/utils/sentimentAnalysis';

const M2M_DISCLAIMER = "EDUCATIONAL ANALYSIS ONLY - This is a market observation for educational purposes. It is not a recommendation to buy or sell any security. Trading options involves significant risk of loss. This analysis reflects one possible interpretation of market data and should not be acted upon without your own independent research.";

export class PDFGenerator {
  private static addPageHeader(doc: jsPDF, pageNum: number) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 229, 155);
    doc.text('M2M STOCK INTELLIGENCE', 20, 10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Educational Market Analysis', 75, 10);
    doc.text(`Page ${pageNum}`, 185, 10, { align: 'right' });
    doc.setDrawColor(30, 41, 59);
    doc.line(20, 12, 190, 12);
    doc.setTextColor(0, 0, 0);
  }

  static async generateReport(
    report: AnalysisReport,
    stockData: StockData,
    indicators: TechnicalIndicators,
    newsData: NewsItem[]
  ): Promise<Blob> {
    const doc = new jsPDF();
    let pageNum = 1;
    let yPosition = 20;

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * lineHeight));
      });
      return y + (lines.length * lineHeight);
    };

    // Page 1 Header
    this.addPageHeader(doc, pageNum);
    yPosition = 18;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('M2M Stock Intelligence Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
    doc.text(`${stockData.symbol} - ${stockData.name}`, 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;

    // Prominent disclaimer box before any analysis
    doc.setFillColor(255, 245, 230);
    doc.setDrawColor(200, 150, 50);
    const disclaimerLines = doc.splitTextToSize(M2M_DISCLAIMER, 160);
    const disclaimerHeight = disclaimerLines.length * 4 + 8;
    doc.rect(20, yPosition, 170, disclaimerHeight, 'FD');
    yPosition += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    disclaimerLines.forEach((line: string) => {
      doc.text(line, 25, yPosition);
      yPosition += 4;
    });
    doc.setFont('helvetica', 'normal');
    yPosition += 8;

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
    doc.text(`Volatility Regime: ${report.volatilityRegime} | News Sentiment: ${newsData.length > 0 ? analyzeSentiment(newsData) : 'Neutral'}`, 25, yPosition);
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

    // Page 2: Detailed analysis
    doc.addPage();
    pageNum++;
    this.addPageHeader(doc, pageNum);
    yPosition = 18;

    // Disclaimer before recommendations section
    doc.setFillColor(255, 245, 230);
    doc.setDrawColor(200, 150, 50);
    doc.rect(20, yPosition, 170, 12, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATIONAL ANALYSIS - Not investment advice. See full disclaimer on page 1.', 25, yPosition + 5);
    doc.setFont('helvetica', 'normal');
    yPosition += 18;

    // Detailed Analysis Sections
    report.sections.forEach((section, index) => {
      if (yPosition > 250) {
        doc.addPage();
        pageNum++;
        this.addPageHeader(doc, pageNum);
        yPosition = 18;
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

    // Full disclaimer on final page
    if (yPosition > 220) {
      doc.addPage();
      pageNum++;
      this.addPageHeader(doc, pageNum);
      yPosition = 18;
    } else {
      yPosition += 15;
    }

    doc.setFillColor(255, 245, 230);
    doc.setDrawColor(200, 150, 50);
    const finalDisclaimerLines = doc.splitTextToSize(M2M_DISCLAIMER, 160);
    const finalDisclaimerHeight = finalDisclaimerLines.length * 4 + 10;
    doc.rect(20, yPosition, 170, finalDisclaimerHeight, 'FD');
    yPosition += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    finalDisclaimerLines.forEach((line: string) => {
      doc.text(line, 25, yPosition);
      yPosition += 4;
    });

    return doc.output('blob');
  }
}
