'use client';

import { DashboardLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { useNews } from '@/hooks/useData';
import { LoadingSpinner } from '@/components/common';

export default function UpdatesPage() {
  // Fetch real news with sentiment analysis
  const { articles, isLoading, isError } = useNews(
    'stablecoin OR USDT OR USDC OR DAI OR tether',
    20,
    900000 // 15 minute refresh
  );

  const systemStatus = [
    { name: 'Risk Engine', status: 'Operational' },
    { name: 'Liquidity Monitor', status: 'Operational' },
    { name: 'API Services', status: 'Operational' },
    { name: 'Alert System', status: 'Degraded' },
  ];

  const getSentimentBadgeVariant = (label: string) => {
    switch (label) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return '📈';
      case 'negative':
        return '📉';
      default:
        return '➖';
    }
  };

  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore < 30) return 'success'; // Low risk
    if (riskScore < 60) return 'warning'; // Moderate risk
    return 'danger'; // High risk
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore < 30) return 'Low Risk';
    if (riskScore < 60) return 'Moderate';
    return 'High Risk';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Find featured article (most positive sentiment or most recent)
  const featuredArticle = articles.length > 0 
    ? articles.reduce((best, current) => 
        current.sentiment.score > best.sentiment.score ? current : best
      )
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Market Updates & News</h1>
            <p className="text-textSecondary">
              Latest stablecoin news with AI-powered sentiment analysis
            </p>
          </div>
          <Badge variant="success">Live Updates</Badge>
        </div>

        {/* Featured Article */}
        {isLoading && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-textSecondary">Loading latest news...</span>
              </div>
            </CardBody>
          </Card>
        )}

        {isError && (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <p className="text-danger mb-2">Failed to load news</p>
                <p className="text-textSecondary text-sm">
                  Please check your NewsAPI key in backend .env file
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {!isLoading && !isError && featuredArticle && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>📰 Featured Story</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getSentimentBadgeVariant(featuredArticle.sentiment.label)}>
                    {getSentimentIcon(featuredArticle.sentiment.label)} {featuredArticle.sentiment.label}
                  </Badge>
                  <Badge variant={getRiskBadgeVariant(featuredArticle.riskScore)}>
                    🎯 Risk: {featuredArticle.riskScore}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <h3 className="text-lg font-semibold text-textPrimary mb-2">
                {featuredArticle.title}
              </h3>
              <p className="text-textSecondary mb-4">
                {featuredArticle.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-textTertiary">
                <span>{featuredArticle.source}</span>
                <span>•</span>
                <span>{formatDate(featuredArticle.publishedAt)}</span>
                <span>•</span>
                <a 
                  href={featuredArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Read more →
                </a>
              </div>
            </CardBody>
          </Card>
        )}

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-2 gap-4">
              {systemStatus.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface"
                >
                  <span className="text-textPrimary font-medium">
                    {service.name}
                  </span>
                  <Badge
                    variant={
                      service.status === 'Operational'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* News Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Stablecoin News</CardTitle>
              {!isLoading && (
                <span className="text-sm text-textTertiary">
                  {articles.length} articles
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8 text-textSecondary">
                No news articles available. Check your API configuration.
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border bg-surface hover:shadow-card transition-shadow"
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full ${
                        article.sentiment.label === 'positive'
                          ? 'bg-success'
                          : article.sentiment.label === 'negative'
                          ? 'bg-danger'
                          : 'bg-warning'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-textPrimary">
                          {article.title}
                        </h4>
                        <Badge variant={getSentimentBadgeVariant(article.sentiment.label)}>
                          {getSentimentIcon(article.sentiment.label)} {article.sentiment.label}
                        </Badge>
                        <Badge variant={getRiskBadgeVariant(article.riskScore)}>
                          Risk: {article.riskScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-textSecondary mb-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-textTertiary">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{formatDate(article.publishedAt)}</span>
                        <span>•</span>
                        <span>Sentiment: {article.sentiment.score.toFixed(1)}</span>
                        <span>•</span>
                        <span className={
                          article.riskScore < 30 ? 'text-success' : 
                          article.riskScore < 60 ? 'text-warning' : 
                          'text-danger'
                        }>
                          {getRiskLabel(article.riskScore)}
                        </span>
                        <span>•</span>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Read article
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

      </div>
    </DashboardLayout>
  );
}
