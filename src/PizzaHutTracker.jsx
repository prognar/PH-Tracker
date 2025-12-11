import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Building2, DollarSign, Globe, Users, Calendar, ChevronDown, ChevronUp, Search, Clock, Sparkles, UserMinus, UserPlus, Plus, X, ExternalLink, Briefcase, Edit2, Trash2, Save } from 'lucide-react';
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

const STORAGE_KEYS = {
  EXECUTIVES: 'pizzahut_executives',
  LEADERS: 'pizzahut_current_leadership',
  TIMELINE: 'pizzahut_custom_timeline',
  KEYWORDS: 'pizzahut_custom_keywords'
};

const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save:', e);
  }
};

const PizzaHutTracker = () => {
  const [expandedBuyer, setExpandedBuyer] = useState(null);
  const [sortBy, setSortBy] = useState('likelihood');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('buyers');
  
  const defaultExecs = trackerData.watchList?.executiveMovements?.knownDepartures || [];
  const defaultLeaders = trackerData.watchList?.executiveMovements?.currentLeadership || [];
  
  const [executives, setExecutives] = useState(() => loadFromStorage(STORAGE_KEYS.EXECUTIVES, defaultExecs));
  const [currentLeadership, setCurrentLeadership] = useState(() => loadFromStorage(STORAGE_KEYS.LEADERS, defaultLeaders));
  const [customTimeline, setCustomTimeline] = useState(() => loadFromStorage(STORAGE_KEYS.TIMELINE, []));
  const [customKeywords, setCustomKeywords] = useState(() => loadFromStorage(STORAGE_KEYS.KEYWORDS, []));
  
  const [newKeyword, setNewKeyword] = useState({ phrase: '', category: 'deal', notes: '' });
  
  const [newExecutive, setNewExecutive] = useState({
    name: '', formerRole: '', newRole: '', newCompany: '', significance: '',
    dateAnnounced: new Date().toISOString().split('T')[0], linkedinUrl: ''
  });
  
  const [newLeader, setNewLeader] = useState({ name: '', role: '', linkedinUrl: '', notes: '' });
  
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0], event: '', impact: 'medium', type: 'executive'
  });

  const { buyers, timeline, lastUpdated, estimatedValuation, keyStats, recentNews } = trackerData;
  
  const combinedTimeline = [...timeline, ...customTimeline].sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => { saveToStorage(STORAGE_KEYS.EXECUTIVES, executives); }, [executives]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.LEADERS, currentLeadership); }, [currentLeadership]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.TIMELINE, customTimeline); }, [customTimeline]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.KEYWORDS, customKeywords); }, [customKeywords]);

  const handleAddKeyword = () => {
    if (!newKeyword.phrase) return;
    setCustomKeywords([...customKeywords, { ...newKeyword, id: Date.now().toString() }]);
    setNewKeyword({ phrase: '', category: 'deal', notes: '' });
  };

  const sortedBuyers = [...buyers].sort((a, b) => {
    if (sortBy === 'likelihood') return b.likelihood - a.likelihood;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.type.localeCompare(b.type);
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

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatCurrency = (num) => '$' + (num / 1000000000).toFixed(1) + 'B';

  const getLikelihoodChange = (buyer) => {
    if (!buyer.history || buyer.history.length < 2) return null;
    return buyer.history[buyer.history.length - 1].likelihood - buyer.history[buyer.history.length - 2].likelihood;
  };

  const MiniSparkline = ({ history }) => {
    if (!history || history.length < 2) return null;
    const values = history.slice(-14).map(h => h.likelihood);
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const points = values.map((v, i) => (i / (values.length - 1)) * 60 + ',' + (20 - ((v - min) / range) * 16)).join(' ');
    return <svg width="60" height="24" className="inline-block ml-2"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" /></svg>;
  };

  const handleAddExecutive = () => {
    if (!newExecutive.name || !newExecutive.formerRole) return;
    const exec = { ...newExecutive, id: Date.now().toString() };
    setExecutives([...executives, exec]);
    const evt = {
      id: Date.now().toString(),
      date: exec.dateAnnounced,
      event: exec.name + ' (' + exec.formerRole + ') ' + (exec.newRole ? 'leaves for ' + exec.newRole + ' at ' + exec.newCompany : 'departs Pizza Hut'),
      impact: (exec.newCompany?.toLowerCase().includes('inspire') || exec.newCompany?.toLowerCase().includes('roark')) ? 'high' : 'medium',
      type: 'executive'
    };
    setCustomTimeline([...customTimeline, evt]);
    setNewExecutive({ name: '', formerRole: '', newRole: '', newCompany: '', significance: '', dateAnnounced: new Date().toISOString().split('T')[0], linkedinUrl: '' });
  };

  const handleAddLeader = () => {
    if (!newLeader.name || !newLeader.role) return;
    setCurrentLeadership([...currentLeadership, { ...newLeader, id: Date.now().toString() }]);
    setNewLeader({ name: '', role: '', linkedinUrl: '', notes: '' });
  };

  const handleAddEvent = () => {
    if (!newEvent.event) return;
    setCustomTimeline([...customTimeline, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({ date: new Date().toISOString().split('T')[0], event: '', impact: 'medium', type: 'executive' });
  };

  const getSignificanceColor = (sig) => {
    if (!sig) return 'text-slate-400';
    const l = sig.toLowerCase();
    if (l.includes('critical') || l.includes('key') || l.includes('major')) return 'text-red-400';
    if (l.includes('notable') || l.includes('important')) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans">
      <header className="relative border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <span className="text-2xl">🍕</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Pizza Hut Acquisition Tracker</h1>
                <p className="text-slate-500 text-sm">Strategic Options Review • Goldman Sachs & Barclays Advising</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Clock className="w-4 h-4" /><span>Updated: {formatTimestamp(lastUpdated)}</span></div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Auto-Updated</span>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium">⚡ Active Review</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mt-6 bg-slate-800/50 p-1 rounded-lg w-fit">
            {['buyers', 'executives', 'admin'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (activeTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white')}>
                {tab === 'buyers' && <><Building2 className="w-4 h-4 inline mr-2" />Potential Buyers</>}
                {tab === 'executives' && <><Users className="w-4 h-4 inline mr-2" />Executive Tracker</>}
                {tab === 'admin' && <><Edit2 className="w-4 h-4 inline mr-2" />Add Data</>}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-5 gap-4">
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><DollarSign className="w-4 h-4" />Est. Valuation</div>
            <div className="text-2xl font-semibold text-white">{formatCurrency(estimatedValuation.low)} - {formatCurrency(estimatedValuation.high)}</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Globe className="w-4 h-4" />Global Units</div>
            <div className="text-2xl font-semibold text-white">{keyStats.globalUnits.toLocaleString()}</div>
            <div className="text-xs text-slate-500">{keyStats.usUnits.toLocaleString()} US / {keyStats.intlUnits.toLocaleString()} Int'l</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><TrendingDown className="w-4 h-4" />US Market Share</div>
            <div className="text-2xl font-semibold text-red-400">{keyStats.usMarketShare}%</div>
            <div className="text-xs text-slate-500">Down from 22.6% (2019)</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Building2 className="w-4 h-4" />% of YUM Profit</div>
            <div className="text-2xl font-semibold text-white">{keyStats.operatingProfitShare}%</div>
            <div className="text-xs text-slate-500">Smallest of 3 brands</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><AlertCircle className="w-4 h-4" />Decline Streak</div>
            <div className="text-2xl font-semibold text-red-400">{keyStats.consecutiveQuartersDecline} Qtrs</div>
            <div className="text-xs text-slate-500">Consecutive SSS decline</div>
          </div>
        </section>

        {/* BUYERS TAB */}
        {activeTab === 'buyers' && (
          <>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-slate-400" />Potential Buyers<span className="text-sm font-normal text-slate-500">({filteredBuyers.length} tracked)</span></h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Search buyers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600" />
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                    <option value="likelihood">Sort by Likelihood</option>
                    <option value="name">Sort by Name</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4">
                {filteredBuyers.map((buyer) => {
                  const change = getLikelihoodChange(buyer);
                  return (
                    <div key={buyer.id} className={'bg-slate-800/30 backdrop-blur border rounded-xl overflow-hidden transition-all cursor-pointer hover:bg-slate-800/50 ' + (expandedBuyer === buyer.id ? 'border-slate-600' : 'border-slate-700/50')} onClick={() => setExpandedBuyer(expandedBuyer === buyer.id ? null : buyer.id)}>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16">
                              <svg className="w-16 h-16 -rotate-90"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-700" /><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={buyer.likelihood * 1.76 + ' 176'} className={buyer.likelihood >= 70 ? 'text-emerald-500' : buyer.likelihood >= 40 ? 'text-amber-500' : 'text-slate-500'} /></svg>
                              <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold text-white">{buyer.likelihood}%</span></div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-white">{buyer.name}</h3>
                                {getTrendIcon(buyer.trend)}
                                {change !== null && change !== 0 && <span className={'text-xs font-medium ' + (change > 0 ? 'text-emerald-400' : 'text-red-400')}>{change > 0 ? '+' : ''}{change}%</span>}
                                <MiniSparkline history={buyer.history} />
                              </div>
                              <p className="text-slate-400 text-sm">{buyer.type}</p>
                              {buyer.estimatedBid && <p className="text-slate-500 text-xs mt-1">Est. bid: {buyer.estimatedBid}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {buyer.keyMetrics && <div className="hidden md:flex gap-4 text-sm">
                              {buyer.keyMetrics.aum && <div className="text-right"><div className="text-slate-500 text-xs">AUM</div><div className="text-white">{buyer.keyMetrics.aum}</div></div>}
                              {buyer.keyMetrics.restaurantFocus && <div className="text-right"><div className="text-slate-500 text-xs">Focus</div><div className="text-white">{buyer.keyMetrics.restaurantFocus}</div></div>}
                            </div>}
                            {expandedBuyer === buyer.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                        </div>
                      </div>
                      {expandedBuyer === buyer.id && (
                        <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">
                          <p className="text-slate-300 text-sm mb-4">{buyer.rationale}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div><h4 className="text-emerald-400 text-sm font-medium mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Pros</h4><ul className="space-y-1">{buyer.pros.map((pro, i) => <li key={i} className="text-slate-400 text-sm flex items-start gap-2"><span className="text-emerald-500 mt-1">+</span> {pro}</li>)}</ul></div>
                            <div><h4 className="text-red-400 text-sm font-medium mb-2 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Cons</h4><ul className="space-y-1">{buyer.cons.map((con, i) => <li key={i} className="text-slate-400 text-sm flex items-start gap-2"><span className="text-red-500 mt-1">−</span> {con}</li>)}</ul></div>
                          </div>
                          {buyer.history && buyer.history.length > 1 && (
                            <div className="pt-2">
                              <button onClick={(e) => { e.stopPropagation(); setShowHistory(showHistory === buyer.id ? null : buyer.id); }} className="text-slate-400 text-xs hover:text-slate-300 flex items-center gap-1"><Clock className="w-3 h-3" />{showHistory === buyer.id ? 'Hide' : 'Show'} history</button>
                              {showHistory === buyer.id && <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">{[...buyer.history].reverse().map((h, i) => <div key={i} className="flex items-center gap-2 text-xs"><span className="text-slate-500 w-20">{formatDate(h.date)}</span><span className="text-white font-medium w-8">{h.likelihood}%</span><span className="text-slate-400">{h.note}</span></div>)}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            <div className="grid grid-cols-2 gap-6">
              <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6"><Calendar className="w-5 h-5 text-slate-400" />Key Events Timeline</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {combinedTimeline.map((signal, i) => (
                    <div key={signal.id || i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={'w-3 h-3 rounded-full ' + (signal.impact === 'high' ? 'bg-red-500' : signal.impact === 'medium' ? 'bg-amber-500' : 'bg-slate-500')} />
                        {i < combinedTimeline.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-2" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-500 text-xs font-mono">{signal.date}</span>
                          <span className={'px-2 py-0.5 rounded text-xs border ' + getImpactBadge(signal.impact)}>{signal.impact}</span>
                          {signal.type === 'executive' && <span className="px-2 py-0.5 rounded text-xs border bg-purple-500/20 text-purple-300 border-purple-500/30">exec</span>}
                        </div>
                        <p className="text-white text-sm">{signal.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6"><AlertCircle className="w-5 h-5 text-slate-400" />What to Monitor</h2>
                <div className="space-y-5">
                  {WHAT_TO_WATCH.map((cat, i) => (
                    <div key={i}><h3 className="text-slate-300 font-medium text-sm mb-2">{cat.category}</h3><ul className="space-y-1.5">{cat.items.map((item, j) => <li key={j} className="text-slate-400 text-sm flex items-start gap-2"><span className="text-slate-600 mt-1">→</span> {item}</li>)}</ul></div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {/* EXECUTIVES TAB */}
        {activeTab === 'executives' && (
          <div className="space-y-6">
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2"><UserMinus className="w-5 h-5 text-red-400" />Executive Departures<span className="text-sm font-normal text-slate-500">({executives.length} tracked)</span></h2>
              </div>
              <div className="space-y-4">
                {executives.map((exec) => (
                  <div key={exec.id || exec.name} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-semibold">{exec.name}</h3>
                          {exec.linkedinUrl && <a href={exec.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><ExternalLink className="w-4 h-4" /></a>}
                        </div>
                        <p className="text-slate-400 text-sm mt-1"><span className="text-slate-500">Former:</span> {exec.formerRole}</p>
                        {exec.newRole && <p className="text-slate-400 text-sm"><span className="text-slate-500">Now:</span> {exec.newRole} at <span className="text-white">{exec.newCompany}</span></p>}
                        {exec.significance && <p className={'text-sm mt-2 ' + getSignificanceColor(exec.significance)}>⚡ {exec.significance}</p>}
                        {exec.dateAnnounced && <p className="text-slate-500 text-xs mt-2">Announced: {exec.dateAnnounced}</p>}
                      </div>
                      {exec.id && <button onClick={() => setExecutives(executives.filter(e => e.id !== exec.id))} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </div>
                ))}
                {executives.length === 0 && <div className="text-center py-8 text-slate-500">No departures tracked. Use Add Data tab to add entries.</div>}
              </div>
            </section>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6"><Briefcase className="w-5 h-5 text-emerald-400" />Current Leadership to Watch</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentLeadership.map((leader) => (
                  <div key={leader.id || leader.name} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{leader.name}</h3>
                          {leader.linkedinUrl && <a href={leader.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><ExternalLink className="w-3 h-3" /></a>}
                        </div>
                        <p className="text-slate-400 text-sm">{leader.role}</p>
                        {leader.notes && <p className="text-slate-500 text-xs mt-1">{leader.notes}</p>}
                      </div>
                      {leader.id && <button onClick={() => setCurrentLeadership(currentLeadership.filter(l => l.id !== leader.id))} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><Search className="w-5 h-5 text-slate-400" />Live News Searches</h2>
              <p className="text-slate-400 text-sm mb-4">Click to search Google News for executive movements:</p>
              <div className="grid md:grid-cols-2 gap-3">
                <a href="https://news.google.com/search?q=%22former+Pizza+Hut%22+OR+%22ex-Pizza+Hut%22" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-blue-400" />"Former Pizza Hut" mentions</a>
                <a href="https://news.google.com/search?q=%22Pizza+Hut%22+%22leaves%22+OR+%22departs%22" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-blue-400" />Pizza Hut departure news</a>
                <a href="https://news.google.com/search?q=%22Pizza+Hut%22+%22appoints%22+OR+%22names%22+OR+%22hires%22" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-emerald-400" />New Pizza Hut hires</a>
                <a href="https://www.linkedin.com/company/pizza-hut/people/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-blue-500" />Pizza Hut LinkedIn People</a>
              </div>
            </section>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-300 text-sm"><strong>Note:</strong> Data added here saves to your browser's local storage and persists across sessions.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><UserMinus className="w-5 h-5 text-red-400" />Add Executive Departure</h3>
                <div className="space-y-4">
                  <div><label className="block text-slate-400 text-sm mb-1">Name *</label><input type="text" value={newExecutive.name} onChange={(e) => setNewExecutive({...newExecutive, name: e.target.value})} placeholder="e.g., John Smith" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">Former Role *</label><input type="text" value={newExecutive.formerRole} onChange={(e) => setNewExecutive({...newExecutive, formerRole: e.target.value})} placeholder="e.g., VP of Marketing" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-slate-400 text-sm mb-1">New Role</label><input type="text" value={newExecutive.newRole} onChange={(e) => setNewExecutive({...newExecutive, newRole: e.target.value})} placeholder="e.g., CMO" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                    <div><label className="block text-slate-400 text-sm mb-1">New Company</label><input type="text" value={newExecutive.newCompany} onChange={(e) => setNewExecutive({...newExecutive, newCompany: e.target.value})} placeholder="e.g., Inspire Brands" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  </div>
                  <div><label className="block text-slate-400 text-sm mb-1">Why significant?</label><input type="text" value={newExecutive.significance} onChange={(e) => setNewExecutive({...newExecutive, significance: e.target.value})} placeholder="e.g., CRITICAL - Went to top acquirer" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-slate-400 text-sm mb-1">Date</label><input type="date" value={newExecutive.dateAnnounced} onChange={(e) => setNewExecutive({...newExecutive, dateAnnounced: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-600" /></div>
                    <div><label className="block text-slate-400 text-sm mb-1">LinkedIn</label><input type="url" value={newExecutive.linkedinUrl} onChange={(e) => setNewExecutive({...newExecutive, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  </div>
                  <button onClick={handleAddExecutive} disabled={!newExecutive.name || !newExecutive.formerRole} className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-4 h-4 inline mr-2" />Add Departure</button>
                </div>
              </section>
              <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5 text-emerald-400" />Add Person to Watch</h3>
                <div className="space-y-4">
                  <div><label className="block text-slate-400 text-sm mb-1">Name *</label><input type="text" value={newLeader.name} onChange={(e) => setNewLeader({...newLeader, name: e.target.value})} placeholder="e.g., Jane Doe" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">Current Role *</label><input type="text" value={newLeader.role} onChange={(e) => setNewLeader({...newLeader, role: e.target.value})} placeholder="e.g., SVP Operations" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">LinkedIn URL</label><input type="url" value={newLeader.linkedinUrl} onChange={(e) => setNewLeader({...newLeader, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">Notes</label><input type="text" value={newLeader.notes} onChange={(e) => setNewLeader({...newLeader, notes: e.target.value})} placeholder="e.g., Key decision maker" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-slate-600" /></div>
                  <button onClick={handleAddLeader} disabled={!newLeader.name || !newLeader.role} className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-4 h-4 inline mr-2" />Add Person</button>
                </div>
              </section>
            </div>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-amber-400" />Add Timeline Event</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div><label className="block text-slate-400 text-sm mb-1">Date</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none" /></div>
                <div className="md:col-span-2"><label className="block text-slate-400 text-sm mb-1">Event *</label><input type="text" value={newEvent.event} onChange={(e) => setNewEvent({...newEvent, event: e.target.value})} placeholder="e.g., Flynn announces interest" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                <div className="flex gap-2">
                  <div className="flex-1"><label className="block text-slate-400 text-sm mb-1">Impact</label><select value={newEvent.impact} onChange={(e) => setNewEvent({...newEvent, impact: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                  <div className="flex items-end"><button onClick={handleAddEvent} disabled={!newEvent.event} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-300 font-medium disabled:opacity-50"><Plus className="w-4 h-4" /></button></div>
                </div>
              </div>
              {customTimeline.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-2">Custom Events</h4>
                  <div className="space-y-2">
                    {customTimeline.map((evt) => (
                      <div key={evt.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2 group">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-xs font-mono">{evt.date}</span>
                          <span className={'px-2 py-0.5 rounded text-xs border ' + getImpactBadge(evt.impact)}>{evt.impact}</span>
                          <span className="text-white text-sm">{evt.event}</span>
                        </div>
                        <button onClick={() => setCustomTimeline(customTimeline.filter(e => e.id !== evt.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Search className="w-5 h-5 text-blue-400" />Add Keywords/Phrases to Track</h3>
              <p className="text-slate-400 text-sm mb-4">Add search terms for the news scraper to monitor:</p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2"><label className="block text-slate-400 text-sm mb-1">Keyword/Phrase *</label><input type="text" value={newKeyword.phrase} onChange={(e) => setNewKeyword({...newKeyword, phrase: e.target.value})} placeholder='e.g., "Pizza Hut financing" or "Roark pizza deal"' className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                <div><label className="block text-slate-400 text-sm mb-1">Category</label><select value={newKeyword.category} onChange={(e) => setNewKeyword({...newKeyword, category: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none"><option value="deal">Deal Process</option><option value="buyer">Buyer Activity</option><option value="executive">Executive</option><option value="franchisee">Franchisee</option><option value="financial">Financial</option><option value="other">Other</option></select></div>
                <div className="flex gap-2">
                  <div className="flex-1"><label className="block text-slate-400 text-sm mb-1">Notes</label><input type="text" value={newKeyword.notes} onChange={(e) => setNewKeyword({...newKeyword, notes: e.target.value})} placeholder="Optional" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  <div className="flex items-end"><button onClick={handleAddKeyword} disabled={!newKeyword.phrase} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 font-medium disabled:opacity-50"><Plus className="w-4 h-4" /></button></div>
                </div>
              </div>
              {customKeywords.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-2">Custom Keywords ({customKeywords.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {customKeywords.map((kw) => (
                      <div key={kw.id} className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1.5 group">
                        <span className={'px-2 py-0.5 rounded text-xs ' + (kw.category === 'deal' ? 'bg-amber-500/20 text-amber-300' : kw.category === 'buyer' ? 'bg-emerald-500/20 text-emerald-300' : kw.category === 'executive' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-500/20 text-slate-300')}>{kw.category}</span>
                        <span className="text-white text-sm">{kw.phrase}</span>
                        {kw.notes && <span className="text-slate-500 text-xs">({kw.notes})</span>}
                        <button onClick={() => setCustomKeywords(customKeywords.filter(k => k.id !== kw.id))} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 ml-1"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-slate-500 text-xs">These keywords will be used when you manually run news searches. To add them to the automated scraper, copy from the export below and update scripts/local-update.js</p>
              </div>
            </section>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Save className="w-5 h-5 text-slate-400" />Export Your Data</h3>
              <p className="text-slate-400 text-sm mb-4">Copy this JSON to back up or share your custom data:</p>
              <textarea readOnly value={JSON.stringify({ executives: executives.filter(e => e.id), currentLeadership: currentLeadership.filter(l => l.id), customTimeline, customKeywords }, null, 2)} className="w-full h-48 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-300 text-xs font-mono focus:outline-none" />
            </section>
          </div>
        )}

        {activeTab === 'buyers' && (
          <section className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Assessment</h2>
            <p className="text-slate-300 leading-relaxed"><strong className="text-white">Most Likely:</strong> PE acquisition, Roark Capital/Inspire Brands frontrunner (hired ex-PH CBO David Graves). RBI strong strategic alternative.</p>
            <p className="text-slate-300 leading-relaxed mt-3"><strong className="text-white">Timeline:</strong> 6-12 months. Watch for NDA signings, management presentations, financing commitments.</p>
            <p className="text-slate-400 text-xs mt-4">Disclaimer: For informational purposes only, not investment advice.</p>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">Auto-updated daily • Data from SEC filings, press releases, and industry reporting</div>
      </footer>
    </div>
  );
};

export default PizzaHutTracker;
