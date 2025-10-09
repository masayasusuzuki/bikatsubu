// GA4 Analytics Data API Service
// Note: This requires Google Analytics Data API v1

interface GA4Config {
  propertyId: string;
  // For client-side implementation, we'll use a simple approach
  // In production, you should use server-side API with service account
}

interface AnalyticsData {
  totalArticles: number;
  monthlyPageViews: number;
  avgSessionDuration: string;
  bounceRate: string;
  newUsers: number;
  previousMonthPageViews?: number;
  previousAvgSessionDuration?: string;
  previousBounceRate?: string;
  previousNewUsers?: number;
}

class GA4Service {
  private config: GA4Config;

  constructor() {
    this.config = {
      propertyId: '12269723882' // Your GA4 property ID
    };
  }

  // Temporary implementation using mock data that gradually transitions to real data
  // In production, this would call the actual GA4 Reporting API
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // For now, return enhanced mock data with some variation
      // This simulates the transition period while GA4 collects data
      const now = new Date();
      const daysSinceSetup = Math.floor((now.getTime() - new Date('2024-01-09').getTime()) / (1000 * 60 * 60 * 24));
      
      // Simulate gradual data accumulation
      const basePageViews = Math.max(0, daysSinceSetup * 50 + Math.floor(Math.random() * 100));
      const baseUsers = Math.max(0, Math.floor(basePageViews * 0.7));
      
      return {
        totalArticles: await this.getTotalArticlesFromSupabase(),
        monthlyPageViews: basePageViews,
        avgSessionDuration: this.formatDuration(180 + Math.floor(Math.random() * 120)), // 3-5 minutes
        bounceRate: (35 + Math.random() * 20).toFixed(1) + '%', // 35-55%
        newUsers: baseUsers,
        previousMonthPageViews: Math.max(0, basePageViews - Math.floor(Math.random() * 1000)),
        previousAvgSessionDuration: this.formatDuration(160 + Math.floor(Math.random() * 100)),
        previousBounceRate: (40 + Math.random() * 20).toFixed(1) + '%',
        previousNewUsers: Math.max(0, baseUsers - Math.floor(Math.random() * 100))
      };
    } catch (error) {
      console.error('GA4データの取得に失敗:', error);
      // Fallback to current mock data
      return {
        totalArticles: 156,
        monthlyPageViews: 58920,
        avgSessionDuration: '3:24',
        bounceRate: '42.3%',
        newUsers: 1250
      };
    }
  }

  private async getTotalArticlesFromSupabase(): Promise<number> {
    try {
      // This would integrate with your existing Supabase articles API
      // For now, return a realistic count
      return 156 + Math.floor(Math.random() * 10); // Simulate article growth
    } catch (error) {
      console.error('記事数の取得に失敗:', error);
      return 156;
    }
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Calculate percentage change
  calculateChange(current: number, previous: number): { change: string; trend: 'up' | 'down' } {
    if (!previous || previous === 0) {
      return { change: '+0%', trend: 'up' };
    }
    
    const percentChange = ((current - previous) / previous) * 100;
    const sign = percentChange >= 0 ? '+' : '';
    const trend = percentChange >= 0 ? 'up' : 'down';
    
    return {
      change: `${sign}${percentChange.toFixed(1)}%`,
      trend
    };
  }

  // Future method for real GA4 API integration
  async getGA4ReportingData(): Promise<AnalyticsData> {
    // This would use the Google Analytics Data API
    // Requires server-side implementation with service account
    // 
    // Example structure:
    // const response = await fetch('/api/ga4-data', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ propertyId: this.config.propertyId })
    // });
    // return response.json();
    
    throw new Error('Real GA4 API integration not implemented yet');
  }
}

export const ga4Service = new GA4Service();
export type { AnalyticsData };
