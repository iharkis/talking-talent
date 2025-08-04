import { useState, useEffect } from 'react';
import { businessAnalystService } from '../services/businessAnalystService';
import { reviewService } from '../services/reviewService';
import { BusinessAnalyst, HistoricalTrend, PromotionReadiness, BALevel } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/date';
import { 
  Users, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  BarChart3,
  Calendar
} from 'lucide-react';

export function HistoricalAnalysis() {
  const [businessAnalysts, setBusinessAnalysts] = useState<BusinessAnalyst[]>([]);
  const [historicalTrends, setHistoricalTrends] = useState<HistoricalTrend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<BALevel | 'ALL'>('ALL');
  const [trendFilter, setTrendFilter] = useState<'ALL' | 'Improving' | 'Stable' | 'Declining' | 'New'>('ALL');
  const [selectedBA, setSelectedBA] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = () => {
    setLoading(true);
    try {
      const allBAs = businessAnalystService.getAll().filter(ba => ba.isActive);
      setBusinessAnalysts(allBAs);

      const trends = allBAs.map(ba => reviewService.getHistoricalTrend(ba.id));
      setHistoricalTrends(trends);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrends = historicalTrends.filter(trend => {
    const ba = businessAnalysts.find(b => b.id === trend.baId);
    if (!ba) return false;

    const matchesSearch = 
      ba.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ba.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ba.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' || ba.level === levelFilter;
    const matchesTrend = trendFilter === 'ALL' || trend.trend === trendFilter;
    
    return matchesSearch && matchesLevel && matchesTrend;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving': return TrendingUp;
      case 'Declining': return TrendingDown;
      case 'Stable': return Minus;
      case 'New': return Clock;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Improving': return 'text-green-600 bg-green-100 border-green-200';
      case 'Declining': return 'text-red-600 bg-red-100 border-red-200';
      case 'Stable': return 'text-hippo-teal bg-hippo-teal/10 border-hippo-teal/30';
      case 'New': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-hippo-dark-text bg-hippo-light-gray/50 border-hippo-light-gray';
    }
  };

  const getPromotionReadinessIcon = (readiness: PromotionReadiness) => {
    switch (readiness) {
      case PromotionReadiness.READY: return CheckCircle;
      case PromotionReadiness.NEAR_READY: return Clock;
      case PromotionReadiness.NOT_READY: return AlertTriangle;
      default: return Clock;
    }
  };

  const getPromotionReadinessColor = (readiness: PromotionReadiness) => {
    switch (readiness) {
      case PromotionReadiness.READY: return 'text-green-600';
      case PromotionReadiness.NEAR_READY: return 'text-orange-600';
      case PromotionReadiness.NOT_READY: return 'text-red-600';
      default: return 'text-hippo-dark-text/60';
    }
  };

  const getTrendSummary = () => {
    const total = filteredTrends.length;
    const improving = filteredTrends.filter(t => t.trend === 'Improving').length;
    const declining = filteredTrends.filter(t => t.trend === 'Declining').length;
    const stable = filteredTrends.filter(t => t.trend === 'Stable').length;
    const newTrend = filteredTrends.filter(t => t.trend === 'New').length;

    return { total, improving, declining, stable, new: newTrend };
  };

  const summary = getTrendSummary();
  const selectedTrend = selectedBA ? historicalTrends.find(t => t.baId === selectedBA) : null;
  const selectedBAData = selectedBA ? businessAnalysts.find(ba => ba.id === selectedBA) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-hippo-dark-text">Loading historical data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-hippo-dark-text">Historical Analysis</h1>
          <p className="mt-2 text-hippo-dark-text/70">
            Track performance trends and development patterns over time
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-hippo-teal" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-hippo-dark-text">{summary.total}</p>
              <p className="text-sm text-hippo-dark-text/70">Total Analysts</p>
            </div>
          </div>
        </div>

        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-green-600">{summary.improving}</p>
              <p className="text-sm text-hippo-dark-text/70">Improving</p>
            </div>
          </div>
        </div>

        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <div className="flex items-center">
            <Minus className="h-8 w-8 text-hippo-teal" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-hippo-teal">{summary.stable}</p>
              <p className="text-sm text-hippo-dark-text/70">Stable</p>
            </div>
          </div>
        </div>

        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-red-600">{summary.declining}</p>
              <p className="text-sm text-hippo-dark-text/70">Declining</p>
            </div>
          </div>
        </div>

        <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-orange-600">{summary.new}</p>
              <p className="text-sm text-hippo-dark-text/70">New</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-hippo-white rounded-hippo-subtle shadow-hippo-subtle">
        <div className="p-6 border-b border-hippo-light-gray/30">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-hippo-dark-text/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-hippo-light-gray rounded-hippo focus:ring-2 focus:ring-hippo-teal focus:border-hippo-teal transition-all duration-400"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as BALevel | 'ALL')}
                className="px-4 py-3 border border-hippo-light-gray rounded-hippo focus:ring-2 focus:ring-hippo-teal focus:border-hippo-teal transition-all duration-400"
              >
                <option value="ALL">All Levels</option>
                {Object.values(BALevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <select
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value as any)}
                className="px-4 py-3 border border-hippo-light-gray rounded-hippo focus:ring-2 focus:ring-hippo-teal focus:border-hippo-teal transition-all duration-400"
              >
                <option value="ALL">All Trends</option>
                <option value="Improving">Improving</option>
                <option value="Stable">Stable</option>
                <option value="Declining">Declining</option>
                <option value="New">New</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="divide-y divide-hippo-light-gray/30">
          {filteredTrends.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-hippo-dark-text/40" />
              <h3 className="mt-4 text-lg font-medium text-hippo-dark-text">No historical data found</h3>
              <p className="mt-2 text-hippo-dark-text/70">
                {searchTerm || levelFilter !== 'ALL' || trendFilter !== 'ALL'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Historical data will appear here once reviews are completed.'
                }
              </p>
            </div>
          ) : (
            filteredTrends.map(trend => {
              const ba = businessAnalysts.find(b => b.id === trend.baId);
              if (!ba) return null;

              const TrendIcon = getTrendIcon(trend.trend);
              const latestReview = trend.reviews[trend.reviews.length - 1];
              const ReadinessIcon = latestReview ? getPromotionReadinessIcon(latestReview.promotionReadiness) : Clock;

              return (
                <div 
                  key={trend.baId} 
                  className={cn(
                    'p-6 hover:bg-hippo-light-gray/10 transition-colors duration-400 cursor-pointer',
                    selectedBA === trend.baId && 'bg-hippo-teal/5 border-l-4 border-hippo-teal'
                  )}
                  onClick={() => setSelectedBA(selectedBA === trend.baId ? null : trend.baId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-hippo-dark-text">
                          {ba.firstName} {ba.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-hippo-dark-text/60">{ba.level}</span>
                          {ba.email && (
                            <span className="text-sm text-hippo-dark-text/60">{ba.email}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          'inline-flex items-center px-3 py-1 rounded-hippo text-sm font-medium border',
                          getTrendColor(trend.trend)
                        )}>
                          <TrendIcon className="h-4 w-4 mr-1" />
                          {trend.trend}
                        </span>
                      </div>

                      {latestReview && (
                        <div className="flex items-center space-x-2">
                          <ReadinessIcon className={cn('h-4 w-4', getPromotionReadinessColor(latestReview.promotionReadiness))} />
                          <span className={cn('text-sm font-medium', getPromotionReadinessColor(latestReview.promotionReadiness))}>
                            {latestReview.promotionReadiness}
                          </span>
                        </div>
                      )}

                      <div className="text-sm text-hippo-dark-text/60">
                        {trend.reviews.length} review{trend.reviews.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {selectedBA === trend.baId && selectedTrend && (
                    <div className="mt-6 pt-6 border-t border-hippo-light-gray/30">
                      <h4 className="text-lg font-semibold text-hippo-dark-text mb-4">Review History</h4>
                      <div className="space-y-4">
                        {selectedTrend.reviews.map((review, index) => {
                          const ReviewIcon = getPromotionReadinessIcon(review.promotionReadiness);
                          return (
                            <div 
                              key={index}
                              className="bg-hippo-light-gray/20 rounded-hippo-subtle p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <Calendar className="h-4 w-4 text-hippo-dark-text/60" />
                                  <span className="font-medium text-hippo-dark-text">{review.roundName}</span>
                                  <span className="text-sm text-hippo-dark-text/60">
                                    {formatDate(review.date)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <ReviewIcon className={cn('h-4 w-4', getPromotionReadinessColor(review.promotionReadiness))} />
                                  <span className={cn('text-sm font-medium', getPromotionReadinessColor(review.promotionReadiness))}>
                                    {review.promotionReadiness}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-hippo-dark-text/60">Wellbeing Concerns:</span>
                                  <span className={review.concerns.wellbeing ? 'text-red-600' : 'text-green-600'}>
                                    {review.concerns.wellbeing ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-hippo-dark-text/60">Performance Concerns:</span>
                                  <span className={review.concerns.performance ? 'text-red-600' : 'text-green-600'}>
                                    {review.concerns.performance ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-hippo-dark-text/60">Actions:</span>
                                  <span className="text-hippo-dark-text font-medium">{review.actionCount}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}