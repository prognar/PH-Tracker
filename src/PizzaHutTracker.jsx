import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Building2, DollarSign, Globe, Users, Calendar, ChevronDown, ChevronUp, Search, Clock, Sparkles } from 'lucide-react';
import trackerData from './data.json';

const WHAT_TO_WATCH = [
  {
    category: "Official Announcements",
    items: [
      "Yum! Brands 8-K filings (SEC)",
      "Press releases from Yum! investor relations",
      "Goldman Sachs/Barclays deal announcements",
      "Management comments on earnings calls"
    ]
  },
  {
    category: "Deal Signals",
    items: [
      "Private equity fundraising announcements",
      "Financing activity (debt facilities being arranged)",
      "Executive movements to/from Pizza Hut",
      "Franchisee communications or town halls"
    ]
  },
  {
    category: "Market Indicators",
    items: [
      "YUM stock price movements on no news",
      "Unusual options activity in YUM",
      "Competitor stock reactions",
      "Credit default swap spreads"
    ]
  },
  {
    category: "Industry Intelligence",
    items: [
      "Restaurant Business Online M&A coverage",
      "Nation's Restaurant News deal tracker",
      "PE Hub and PitchBook deal alerts",
      "Bloomberg/Reuters deal rumors"
    ]
  }
];

const PizzaHutTracker = () => {
  const [expandedBuyer, setExpandedBuyer] = useState(null);
  const [sortBy, setSortBy] = useState('likelihood');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(null);

  const { buyers, timeline, lastUpdated, estimatedValuation, keyStats, recentNews } = trackerData;

  const sortedBuyers = [...buyers].sort((a, b) => {
    if (sortBy === 'likelihood') return b.likelihood - a.likelihood;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  const filteredBuyers = sortedBuyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buyer.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-amber-400" />;
  };

  const getImpactBadge = (impact) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      low: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };
    return colors[impact] || colors.low;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (num) => {
    return `$${(num / 1000000000).toFixed(1)}B`;
  };

  // Calculate likelihood change from history
  const getLikelihoodChange = (buyer) => {
    if (!buyer.history || buyer.history.length < 2) return null;
    const current = buyer.history[buyer.history.length - 1].likelihood;
    const previous = buyer.history[buyer.history.length - 2].likelihood;
    return current - previous;
  };

  // Mini sparkline component for history
  const MiniSparkline = ({ history }) => {
    if (!history || history.length < 2) return null;
    
    const values = history.slice(-14).map(h => h.likelihood);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 60;
      const y = 20 - ((v - min) / range) * 16;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="24" className="inline-block ml-2">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-slate-400"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      
      {/* Header */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <span className="text-2xl">🍕</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Pizza Hut Acquisition Tracker
                  </h1>
                  <p className="text-slate-500 text-sm">Strategic Options Review • Goldman Sachs & Barclays Advising</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Auto-updated: {formatDate(lastUpdated)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI-Powered Daily Updates
                </span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium">
                  ⚡ Active Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Recent News Banner */}
        {recentNews && recentNews.length > 0 && (
          <section className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-blue-400 text-sm font-medium mb-1">Latest Update - {formatDate(recentNews[0].date)}</div>
                <p className="text-slate-300 text-sm">{recentNews[0].summary}</p>
              </div>
            </div>
          </section>
        )}

        {/* Key Stats */}
        <section className="grid grid-cols-4 gap-4">
          {[
            { label: "Est. Valuation", value: `${formatCurrency(estimatedValuation.low)} - ${formatCurrency(estimatedValuation.high)}`, icon: DollarSign, color: "emerald" },
            { label: "Global Units", value: `~${(keyStats.globalUnits / 1000).toFixed(0)}K`, icon: Globe, color: "blue" },
            { label: "US Market Share", value: `${keyStats.usMarketShare}%`, icon: TrendingDown, color: "red", sub: "↓ from 22.6% (2019)" },
            { label: "Operating Profit Share", value: `~${keyStats.operatingProfitShare}%`, icon: Building2, color: "purple", sub: "of Yum! total" }
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-2xl blur-xl group-hover:from-slate-600/30 transition-all" />
              <div className="relative bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all">
                <stat.icon className={`w-5 h-5 text-slate-400 mb-3`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
                {stat.sub && <div className="text-slate-600 text-xs mt-1">{stat.sub}</div>}
              </div>
            </div>
          ))}
        </section>

        {/* Potential Buyers Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Potential Buyers Ranked
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search buyers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
              >
                <option value="likelihood">Sort by Likelihood</option>
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredBuyers.map((buyer) => {
              const change = getLikelihoodChange(buyer);
              
              return (
                <div
                  key={buyer.id}
                  className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedBuyer(expandedBuyer === buyer.id ? null : buyer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 -rotate-90">
                            <circle
                              cx="32" cy="32" r="28"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="text-slate-700"
                            />
                            <circle
                              cx="32" cy="32" r="28"
                              fill="none"
                              stroke={buyer.likelihood >= 70 ? '#10b981' : buyer.likelihood >= 50 ? '#f59e0b' : '#64748b'}
                              strokeWidth="4"
                              strokeDasharray={`${buyer.likelihood * 1.76} 176`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{buyer.likelihood}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{buyer.name}</h3>
                            {getTrendIcon(buyer.trend)}
                            {change !== null && change !== 0 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${change > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {change > 0 ? '+' : ''}{change}
                              </span>
                            )}
                            <MiniSparkline history={buyer.history} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">{buyer.type}</span>
                            <span className="text-slate-500 text-sm">Est. bid: {buyer.estimatedBid}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {expandedBuyer === buyer.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedBuyer === buyer.id && (
                    <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 space-y-4">
                      <p className="text-slate-300 text-sm leading-relaxed">{buyer.rationale}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" /> Pros
                          </h4>
                          <ul className="space-y-1">
                            {buyer.pros.map((pro, i) => (
                              <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                                <span className="text-emerald-500 mt-1">•</span> {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-red-400 text-sm font-medium mb-2 flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" /> Cons
                          </h4>
                          <ul className="space-y-1">
                            {buyer.cons.map((con, i) => (
                              <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span> {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2">
                        {Object.entries(buyer.keyMetrics).map(([key, value]) => (
                          <div key={key} className="px-3 py-2 bg-slate-900/50 rounded-lg">
                            <div className="text-slate-500 text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="text-white text-sm font-medium">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* History Section */}
                      {buyer.history && buyer.history.length > 1 && (
                        <div className="pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHistory(showHistory === buyer.id ? null : buyer.id);
                            }}
                            className="text-slate-400 text-xs hover:text-slate-300 flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            {showHistory === buyer.id ? 'Hide' : 'Show'} likelihood history
                          </button>
                          
                          {showHistory === buyer.id && (
                            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                              {[...buyer.history].reverse().map((h, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-500 w-20">{formatDate(h.date)}</span>
                                  <span className="text-white font-medium w-8">{h.likelihood}%</span>
                                  <span className="text-slate-400">{h.note}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline and What to Watch */}
        <div className="grid grid-cols-2 gap-6">
          {/* Key Events Timeline */}
          <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-slate-400" />
              Key Events Timeline
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {timeline.map((signal, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${signal.impact === 'high' ? 'bg-red-500' : signal.impact === 'medium' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-2" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-xs font-mono">{signal.date}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${getImpactBadge(signal.impact)}`}>
                        {signal.impact}
                      </span>
                    </div>
                    <p className="text-white text-sm">{signal.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What to Watch */}
          <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              What to Monitor
            </h2>
            <div className="space-y-5">
              {WHAT_TO_WATCH.map((category, i) => (
                <div key={i}>
                  <h3 className="text-slate-300 font-medium text-sm mb-2">{category.category}</h3>
                  <ul className="space-y-1.5">
                    {category.items.map((item, j) => (
                      <li key={j} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-slate-600 mt-1">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Summary */}
        <section className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Assessment</h2>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Most Likely Outcome:</strong> Private equity acquisition, with Roark Capital/Inspire Brands as the frontrunner given their restaurant-focused strategy and lack of a pizza concept. 
              Restaurant Brands International remains a strong strategic alternative that could offer synergies with their global franchise infrastructure.
            </p>
            <p className="text-slate-300 leading-relaxed mt-3">
              <strong className="text-white">Timeline Expectations:</strong> No deadline has been set. Expect 6-12 months for the process to conclude. 
              Watch for leaks about NDA signings, management presentations, and financing commitments as indicators the process is advancing.
            </p>
            <p className="text-slate-400 text-xs mt-4">
              Disclaimer: This tracker is for informational purposes only and does not constitute investment advice. 
              Likelihood percentages are AI-generated estimates based on publicly available information and may not reflect actual probabilities.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          Auto-updated daily via Claude AI • Data compiled from SEC filings, press releases, and industry reporting
        </div>
      </footer>
    </div>
  );
};

export default PizzaHutTracker;
