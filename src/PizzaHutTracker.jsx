import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Building2, DollarSign, Globe, Users, Calendar, ChevronDown, ChevronUp, Search, Clock, Sparkles, UserMinus, UserPlus, Plus, X, ExternalLink, Briefcase, Edit2, Trash2, Save, CheckCircle2 } from 'lucide-react';
import trackerData from './data.json';

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
  } catch { return fallback; }
};

const saveToStorage = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error('Failed to save:', e); }
};

// ─── Deal Announced Banner ────────────────────────────────────────────────────
const DealBanner = () => {
  const d = trackerData.confirmedDeal;
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8" style={{background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #b91c1c 100%)'}}>
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)'}} />
      <div className="relative px-8 py-7">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              <span className="text-emerald-300 text-sm font-bold tracking-widest uppercase">Deal Announced · June 16, 2026</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">Pizza Hut → LongRange Capital</h2>
            <p className="text-emerald-200 text-sm">{d.asset} · Yum! Brands Divestiture · Expected Close {d.expectedClose}</p>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">{d.dealValueLongRange}</div>
              <div className="text-emerald-300 text-xs uppercase tracking-wider mt-1">LongRange Pays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">{d.totalYumNetProceeds.split('(')[0].trim()}</div>
              <div className="text-emerald-300 text-xs uppercase tracking-wider mt-1">Total Yum Net Proceeds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">~$2.7B</div>
              <div className="text-emerald-300 text-xs uppercase tracking-wider mt-1">Combined (incl. China)</div>
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-emerald-700/50">
          <p className="text-emerald-100 text-sm italic leading-relaxed max-w-3xl">
            "{d.bobBerlinQuote}"
          </p>
          <p className="text-emerald-300 text-xs mt-2 font-semibold">— {d.buyerFounder}, LongRange Capital</p>
        </div>
      </div>
    </div>
  );
};

// ─── Confirmed Deal Terms ─────────────────────────────────────────────────────
const DealTermsPanel = () => {
  const d = trackerData.confirmedDeal;
  const terms = [
    { label: 'Buyer', value: d.buyer },
    { label: 'Buyer HQ', value: d.buyerHQ },
    { label: 'Seller', value: d.seller },
    { label: 'Asset', value: d.asset },
    { label: 'LongRange Deal Value', value: d.dealValueLongRange },
    { label: 'Total Yum Net Proceeds', value: d.totalYumNetProceeds },
    { label: 'China Transaction', value: d.chinaNote },
    { label: 'Combined Value', value: d.totalCombinedValue },
    { label: 'Earn-Out', value: d.earnOut },
    { label: 'Yum One-Time Expenses', value: d.yumOneTimeExpenses },
    { label: 'Yum Stock Buyback', value: d.yumStockBuyback },
    { label: 'Deal Financing', value: d.financing },
    { label: 'Legal Counsel', value: d.legalCounselLegal },
    { label: 'Franchise Counsel', value: d.legalCounselFranchise },
    { label: 'Announced', value: d.announcedDate },
    { label: 'Expected Close', value: d.expectedClose },
    { label: 'Yum Q2 Call (more details)', value: d.yumQ2Call },
    { label: 'Closing Conditions', value: d.closingConditions },
  ];
  return (
    <div className="bg-slate-800/30 backdrop-blur border border-emerald-700/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        Confirmed Deal Terms
      </h3>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
        {terms.map(({ label, value }) => (
          <div key={label} className="flex flex-col border-b border-slate-700/30 pb-2">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{label}</span>
            <span className="text-slate-200 text-sm mt-0.5 leading-snug">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Next Steps Panel ─────────────────────────────────────────────────────────
const NextStepsPanel = () => {
  const steps = trackerData.confirmedDeal?.nextSteps || [];
  const getImpactColor = (impact) => impact === 'high' ? 'bg-emerald-500' : 'bg-amber-500';
  return (
    <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-emerald-400" />
        What Happens Next
      </h3>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-700" />
        {steps.map((step, i) => (
          <div key={i} className="relative mb-5 last:mb-0">
            <div className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getImpactColor(step.impact)}`} />
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{step.date}</div>
            <div className="text-white font-semibold text-sm mt-0.5">{step.event}</div>
            <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{step.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PizzaHutTracker = () => {
  const [expandedBuyer, setExpandedBuyer] = useState(null);
  const [sortBy, setSortBy] = useState('likelihood');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistory, setShowHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('deal');

  const defaultExecs = trackerData.watchList?.executiveMovements?.knownDepartures || [];
  const defaultLeaders = trackerData.watchList?.executiveMovements?.currentLeadership || [];

  const [executives, setExecutives] = useState(() => loadFromStorage(STORAGE_KEYS.EXECUTIVES, defaultExecs));
  const [currentLeadership, setCurrentLeadership] = useState(() => loadFromStorage(STORAGE_KEYS.LEADERS, defaultLeaders));
  const [customTimeline, setCustomTimeline] = useState(() => loadFromStorage(STORAGE_KEYS.TIMELINE, []));
  const [customKeywords, setCustomKeywords] = useState(() => loadFromStorage(STORAGE_KEYS.KEYWORDS, []));

  const [newKeyword, setNewKeyword] = useState({ phrase: '', category: 'deal', notes: '' });
  const [newExecutive, setNewExecutive] = useState({ name: '', formerRole: '', newRole: '', newCompany: '', significance: '', dateAnnounced: new Date().toISOString().split('T')[0], linkedinUrl: '' });
  const [newLeader, setNewLeader] = useState({ name: '', role: '', linkedinUrl: '', notes: '' });
  const [newEvent, setNewEvent] = useState({ date: new Date().toISOString().split('T')[0], event: '', impact: 'medium', type: 'executive' });

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

  const longrange = buyers.find(b => b.id === 'longrange-capital');
  const bidHistory = buyers.filter(b => ['longrange-capital', 'sycamore', 'apollo'].includes(b.id));
  const otherBuyers = buyers.filter(b => !['longrange-capital', 'sycamore', 'apollo'].includes(b.id));

  const sortedOtherBuyers = [...otherBuyers].sort((a, b) => {
    if (sortBy === 'likelihood') return b.likelihood - a.likelihood;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.type.localeCompare(b.type);
  }).filter(buyer =>
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
      low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      milestone: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return colors[impact] || colors.low;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

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
      impact: 'medium', type: 'executive'
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

  const BuyerCard = ({ buyer, showExpand = true }) => {
    const isLongrange = buyer.id === 'longrange-capital';
    const change = getLikelihoodChange(buyer);
    const circlePct = Math.min(buyer.likelihood, 100);
    const circleColor = buyer.likelihood === 100 ? 'text-emerald-500' : buyer.likelihood >= 40 ? 'text-amber-500' : 'text-slate-600';
    return (
      <div
        className={'bg-slate-800/30 backdrop-blur border rounded-xl overflow-hidden transition-all ' + (showExpand ? 'cursor-pointer hover:bg-slate-800/50 ' : '') + (expandedBuyer === buyer.id ? 'border-slate-600' : isLongrange ? 'border-emerald-700/60' : 'border-slate-700/50')}
        onClick={() => showExpand && setExpandedBuyer(expandedBuyer === buyer.id ? null : buyer.id)}
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-700" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={circlePct * 1.76 + ' 176'} className={circleColor} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${buyer.likelihood === 100 ? 'text-emerald-400' : 'text-white'}`}>{buyer.likelihood}%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{buyer.name}</h3>
                  {getTrendIcon(buyer.trend)}
                  {change !== null && change !== 0 && <span className={'text-xs font-medium ' + (change > 0 ? 'text-emerald-400' : 'text-red-400')}>{change > 0 ? '+' : ''}{change}%</span>}
                  {isLongrange && <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-full font-bold">✓ WINNER</span>}
                  {buyer.likelihood === 0 && !isLongrange && <span className="px-2 py-0.5 bg-slate-500/20 border border-slate-500/30 text-slate-400 text-xs rounded-full">OUT</span>}
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
                {buyer.keyMetrics.status && <div className="text-right"><div className="text-slate-500 text-xs">Status</div><div className={buyer.likelihood === 100 ? 'text-emerald-300 text-xs font-bold' : 'text-slate-300 text-xs'}>{buyer.keyMetrics.status}</div></div>}
              </div>}
              {showExpand && (expandedBuyer === buyer.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />)}
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
                <p className="text-slate-500 text-sm">LongRange Capital · Definitive Agreement Signed · June 16, 2026</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Clock className="w-4 h-4" /><span>Updated: {formatTimestamp(lastUpdated)}</span></div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> DEAL ANNOUNCED</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mt-6 bg-slate-800/50 p-1 rounded-lg w-fit flex-wrap">
            {[
              { id: 'deal', label: 'Deal & Next Steps', icon: <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-400" /> },
              { id: 'news', label: 'News', icon: <AlertCircle className="w-4 h-4 inline mr-1" /> },
              { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4 inline mr-1" /> },
              { id: 'bidhistory', label: 'Bid History', icon: <Building2 className="w-4 h-4 inline mr-1" /> },
              { id: 'executives', label: 'People to Watch', icon: <Users className="w-4 h-4 inline mr-1" /> },
              { id: 'admin', label: 'Add Data', icon: <Edit2 className="w-4 h-4 inline mr-1" /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (activeTab === tab.id ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white')}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats bar */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><DollarSign className="w-4 h-4" />Deal Value</div>
            <div className="text-2xl font-semibold text-emerald-400">$1.5B</div>
            <div className="text-xs text-slate-500">LongRange · ex-China</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><DollarSign className="w-4 h-4" />Combined Value</div>
            <div className="text-2xl font-semibold text-white">~$2.7B</div>
            <div className="text-xs text-slate-500">incl. China ($1.2B)</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Globe className="w-4 h-4" />Global Units</div>
            <div className="text-2xl font-semibold text-white">{keyStats.globalUnits.toLocaleString()}</div>
            <div className="text-xs text-slate-500">108 countries</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><TrendingDown className="w-4 h-4" />US Comp Decline</div>
            <div className="text-2xl font-semibold text-red-400">{keyStats.consecutiveQuartersDecline} Qtrs</div>
            <div className="text-xs text-slate-500">Consecutive SSS decline</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Calendar className="w-4 h-4" />Expected Close</div>
            <div className="text-2xl font-semibold text-emerald-400">Q3 2026</div>
            <div className="text-xs text-slate-500">Regulatory approval pending</div>
          </div>
        </section>

        {/* DEAL TAB */}
        {activeTab === 'deal' && (
          <>
            <DealBanner />
            <div className="grid md:grid-cols-2 gap-6">
              <DealTermsPanel />
              <NextStepsPanel />
            </div>
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Why Yum Sold</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">{trackerData.confirmedDeal.yumRationale}</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pizza Hut's US comparable sales have declined for <strong className="text-red-400">10 consecutive quarters</strong>, and the brand accounted for only 12% of Yum's total revenue in 2025 — the smallest of Yum's three brands. Despite this, Yum posted Q1 2026 net income of $432M (up 71% YoY), indicating the divestiture is a portfolio pruning exercise rather than a distressed sale. Yum also authorized a $4 billion stock buyback using proceeds.
              </p>
            </div>
          </>
        )}

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <>
            {recentNews && recentNews.length > 1 && (
              <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Latest News
                  <span className="text-sm font-normal text-slate-500">({recentNews.filter(a => a.title).length} articles)</span>
                </h2>
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                  {recentNews.filter(a => a.title).map((article, i) => (
                    <a key={i} href={article.link} target="_blank" rel="noopener noreferrer"
                      className="block bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 rounded-lg p-4 transition-all group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 text-xs font-mono">{article.date}</span>
                            {article.impact && <span className={'px-2 py-0.5 rounded text-xs border ' + getImpactBadge(article.impact)}>{article.impact}</span>}
                            {article.source && <span className="text-slate-500 text-xs">{article.source}</span>}
                          </div>
                          <h3 className="text-white text-sm font-medium group-hover:text-amber-300 transition-colors line-clamp-2">{article.title}</h3>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6"><Calendar className="w-5 h-5 text-slate-400" />Key Events Timeline</h2>
            <div className="space-y-4 max-h-[700px] overflow-y-auto">
              {combinedTimeline.map((signal, i) => (
                <div key={signal.id || i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={'w-3 h-3 rounded-full ' + (signal.type === 'milestone' ? 'bg-emerald-500' : signal.impact === 'high' ? 'bg-red-500' : signal.impact === 'medium' ? 'bg-amber-500' : 'bg-slate-500')} />
                    {i < combinedTimeline.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-2" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-xs font-mono">{signal.date}</span>
                      <span className={'px-2 py-0.5 rounded text-xs border ' + getImpactBadge(signal.type === 'milestone' ? 'milestone' : signal.impact)}>{signal.type === 'milestone' ? 'milestone' : signal.impact}</span>
                      {signal.type === 'executive' && <span className="px-2 py-0.5 rounded text-xs border bg-purple-500/20 text-purple-300 border-purple-500/30">exec</span>}
                    </div>
                    <p className="text-white text-sm">{signal.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BID HISTORY TAB */}
        {activeTab === 'bidhistory' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><Building2 className="w-5 h-5 text-emerald-400" />Final Bidders</h2>
              <div className="grid gap-4">
                {bidHistory.map(buyer => <BuyerCard key={buyer.id} buyer={buyer} />)}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-slate-400" />Other Tracked Buyers <span className="text-sm font-normal text-slate-500">(all out)</span></h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600" />
                  </div>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                    <option value="likelihood">Sort by Likelihood</option>
                    <option value="name">Sort by Name</option>
                    <option value="type">Sort by Type</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4">
                {sortedOtherBuyers.map(buyer => <BuyerCard key={buyer.id} buyer={buyer} />)}
              </div>
            </section>
          </div>
        )}

        {/* EXECUTIVES TAB */}
        {activeTab === 'executives' && (
          <div className="space-y-6">
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6"><Briefcase className="w-5 h-5 text-emerald-400" />Current Leadership & People to Watch</h2>
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
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6"><UserMinus className="w-5 h-5 text-red-400" />Executive Departures Tracked</h2>
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
                {executives.length === 0 && <div className="text-center py-8 text-slate-500">No departures tracked. Use Add Data tab.</div>}
              </div>
            </section>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4"><Search className="w-5 h-5 text-slate-400" />Live News Searches</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <a href="https://news.google.com/search?q=LongRange+Capital+Pizza+Hut" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-emerald-400" />LongRange Capital news</a>
                <a href="https://news.google.com/search?q=%22Pizza+Hut%22+%22LongRange%22" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-emerald-400" />Pizza Hut + LongRange coverage</a>
                <a href="https://news.google.com/search?q=%22Pizza+Hut%22+%22appoints%22+OR+%22names%22+OR+%22hires%22" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg text-slate-300 hover:text-white transition-all"><ExternalLink className="w-4 h-4 text-blue-400" />New Pizza Hut hires</a>
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
                    <div><label className="block text-slate-400 text-sm mb-1">New Role</label><input type="text" value={newExecutive.newRole} onChange={(e) => setNewExecutive({...newExecutive, newRole: e.target.value})} placeholder="e.g., CMO" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                    <div><label className="block text-slate-400 text-sm mb-1">New Company</label><input type="text" value={newExecutive.newCompany} onChange={(e) => setNewExecutive({...newExecutive, newCompany: e.target.value})} placeholder="e.g., Inspire Brands" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  </div>
                  <div><label className="block text-slate-400 text-sm mb-1">Why significant?</label><input type="text" value={newExecutive.significance} onChange={(e) => setNewExecutive({...newExecutive, significance: e.target.value})} placeholder="e.g., CRITICAL - Went to LongRange" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-slate-400 text-sm mb-1">Date</label><input type="date" value={newExecutive.dateAnnounced} onChange={(e) => setNewExecutive({...newExecutive, dateAnnounced: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none" /></div>
                    <div><label className="block text-slate-400 text-sm mb-1">LinkedIn</label><input type="url" value={newExecutive.linkedinUrl} onChange={(e) => setNewExecutive({...newExecutive, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  </div>
                  <button onClick={handleAddExecutive} disabled={!newExecutive.name || !newExecutive.formerRole} className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-4 h-4 inline mr-2" />Add Departure</button>
                </div>
              </section>
              <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5 text-emerald-400" />Add Person to Watch</h3>
                <div className="space-y-4">
                  <div><label className="block text-slate-400 text-sm mb-1">Name *</label><input type="text" value={newLeader.name} onChange={(e) => setNewLeader({...newLeader, name: e.target.value})} placeholder="e.g., Jane Doe" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">Current Role *</label><input type="text" value={newLeader.role} onChange={(e) => setNewLeader({...newLeader, role: e.target.value})} placeholder="e.g., SVP Operations" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">LinkedIn URL</label><input type="url" value={newLeader.linkedinUrl} onChange={(e) => setNewLeader({...newLeader, linkedinUrl: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  <div><label className="block text-slate-400 text-sm mb-1">Notes</label><input type="text" value={newLeader.notes} onChange={(e) => setNewLeader({...newLeader, notes: e.target.value})} placeholder="e.g., Key transition contact" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
                  <button onClick={handleAddLeader} disabled={!newLeader.name || !newLeader.role} className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-4 h-4 inline mr-2" />Add Person</button>
                </div>
              </section>
            </div>
            <section className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-amber-400" />Add Timeline Event</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div><label className="block text-slate-400 text-sm mb-1">Date</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none" /></div>
                <div className="md:col-span-2"><label className="block text-slate-400 text-sm mb-1">Event *</label><input type="text" value={newEvent.event} onChange={(e) => setNewEvent({...newEvent, event: e.target.value})} placeholder="e.g., Regulatory approval received" className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none" /></div>
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
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Save className="w-5 h-5 text-slate-400" />Export Your Data</h3>
              <textarea readOnly value={JSON.stringify({ executives: executives.filter(e => e.id), currentLeadership: currentLeadership.filter(l => l.id), customTimeline, customKeywords }, null, 2)} className="w-full h-48 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-300 text-xs font-mono focus:outline-none" />
            </section>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          Deal Announced June 16, 2026 · LongRange Capital acquires Pizza Hut (ex-China) from Yum! Brands · Expected close Q3 2026
        </div>
      </footer>
    </div>
  );
};

export default PizzaHutTracker;
