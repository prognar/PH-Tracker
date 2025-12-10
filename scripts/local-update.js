#!/usr/bin/env node

/**
 * Pizza Hut Tracker - Local Update Script
 * 
 * Scrapes news sources for Pizza Hut acquisition updates
 * Run daily via cron job, then push to GitHub
 * 
 * Usage:
 *   node scripts/local-update.js
 * 
 * Cron example (runs at 8 AM daily):
 *   0 8 * * * cd /path/to/pizza-hut-tracker && node scripts/local-update.js && git add . && git commit -m "Daily update" && git push
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// News sources to check
const NEWS_SOURCES = [
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=Pizza+Hut+sale+acquisition+Yum+Brands&hl=en-US&gl=US&ceid=US:en",
    type: "rss"
  },
  {
    name: "Google News - Roark",
    url: "https://news.google.com/rss/search?q=Roark+Capital+Pizza+Hut&hl=en-US&gl=US&ceid=US:en",
    type: "rss"
  },
  {
    name: "Google News - RBI",
    url: "https://news.google.com/rss/search?q=Restaurant+Brands+International+Pizza&hl=en-US&gl=US&ceid=US:en",
    type: "rss"
  }
];

// Keywords that indicate significant news
const HIGH_IMPACT_KEYWORDS = [
  "acquires pizza hut", "to buy pizza hut", "pizza hut sold", "pizza hut deal",
  "pizza hut acquisition", "bid for pizza hut", "offer for pizza hut",
  "pizza hut buyer", "yum sells pizza hut", "pizza hut sale complete"
];

const MEDIUM_IMPACT_KEYWORDS = [
  "pizza hut strategic", "pizza hut review", "pizza hut talks",
  "roark pizza", "apollo pizza hut", "inspire brands pizza",
  "restaurant brands pizza", "pizza hut interested", "pizza hut bidder"
];

// Load buyer keywords from data.json
function loadBuyerKeywords() {
  try {
    const dataPath = path.join(__dirname, "../src/data.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    const keywords = {};
    for (const buyer of data.buyers) {
      if (buyer.newsKeywords) {
        keywords[buyer.id] = buyer.newsKeywords;
      }
    }
    return keywords;
  } catch (e) {
    // Fallback if data.json can't be read
    return {
      "roark-inspire": ["roark capital", "inspire brands"],
      "flynn-group": ["flynn group", "flynn restaurant", "greg flynn"],
      "rbi": ["restaurant brands international", "burger king owner"],
      "apollo": ["apollo global", "apollo management"],
      "blackstone": ["blackstone pizza", "blackstone restaurant"],
      "sycamore": ["sycamore partners"],
      "triartisan-yadav": ["triartisan", "yadav enterprises"],
      "middle-east-swf": ["sovereign wealth", "middle east pizza"],
      "sun-holdings": ["sun holdings"],
      "asian-strategic": ["yum china pizza"]
    };
  }
}

const BUYER_KEYWORDS = loadBuyerKeywords();

// Fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

// Parse RSS feed for news items
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const linkRegex = /<link>([\s\S]*?)<\/link>/;
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  const descRegex = /<description>([\s\S]*?)<\/description>/;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (titleRegex.exec(item) || [])[1] || "";
    const link = (linkRegex.exec(item) || [])[1] || "";
    const pubDate = (pubDateRegex.exec(item) || [])[1] || "";
    const description = (descRegex.exec(item) || [])[1] || "";

    // Clean up CDATA and HTML entities
    const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    const cleanDesc = description.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();

    items.push({
      title: cleanTitle,
      link: link.trim(),
      date: pubDate ? new Date(pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      description: cleanDesc
    });
  }

  return items;
}

// Analyze news item for relevance and impact
function analyzeNewsItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  
  // Check for high impact keywords
  for (const keyword of HIGH_IMPACT_KEYWORDS) {
    if (text.includes(keyword)) {
      return { relevant: true, impact: "high" };
    }
  }
  
  // Check for medium impact keywords
  for (const keyword of MEDIUM_IMPACT_KEYWORDS) {
    if (text.includes(keyword)) {
      return { relevant: true, impact: "medium" };
    }
  }
  
  // Check if it mentions Pizza Hut in acquisition context
  if (text.includes("pizza hut") && 
      (text.includes("sale") || text.includes("buy") || text.includes("acqui") || 
       text.includes("deal") || text.includes("bid") || text.includes("offer"))) {
    return { relevant: true, impact: "low" };
  }
  
  return { relevant: false, impact: null };
}

// Detect which buyer is mentioned
function detectBuyer(text) {
  const lowerText = text.toLowerCase();
  
  for (const [buyerId, keywords] of Object.entries(BUYER_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return buyerId;
      }
    }
  }
  
  return null;
}

// Determine sentiment (positive = more likely to buy, negative = less likely)
function detectSentiment(text) {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ["confirms", "in talks", "interested", "bidding", "considering", "frontrunner", "leading", "close to", "nearing"];
  const negativeWords = ["denies", "pulls out", "withdraws", "not interested", "unlikely", "rejects", "walks away", "falls through"];
  
  let score = 0;
  for (const word of positiveWords) {
    if (lowerText.includes(word)) score++;
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) score--;
  }
  
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

// Main update function
async function updateTracker() {
  const dataPath = path.join(__dirname, "../src/data.json");
  const currentData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  const today = new Date().toISOString().split("T")[0];
  
  console.log("🍕 Pizza Hut Tracker - Local Update");
  console.log("===================================");
  console.log(`📅 Date: ${today}\n`);
  
  // Collect all news items
  const allNewsItems = [];
  
  for (const source of NEWS_SOURCES) {
    console.log(`🔍 Fetching ${source.name}...`);
    try {
      const content = await fetchUrl(source.url);
      const items = parseRSS(content);
      console.log(`   Found ${items.length} items`);
      allNewsItems.push(...items);
    } catch (error) {
      console.log(`   ⚠️ Error: ${error.message}`);
    }
  }
  
  // Filter to recent items (last 48 hours)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentItems = allNewsItems.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= twoDaysAgo;
  });
  
  console.log(`\n📰 Found ${recentItems.length} items from last 48 hours`);
  
  // Analyze each item
  const relevantNews = [];
  const buyerMentions = {};
  
  for (const item of recentItems) {
    const analysis = analyzeNewsItem(item);
    
    if (analysis.relevant) {
      const buyerId = detectBuyer(`${item.title} ${item.description}`);
      const sentiment = detectSentiment(`${item.title} ${item.description}`);
      
      relevantNews.push({
        ...item,
        impact: analysis.impact,
        buyerId,
        sentiment
      });
      
      if (buyerId) {
        if (!buyerMentions[buyerId]) {
          buyerMentions[buyerId] = { positive: 0, negative: 0, neutral: 0, mentions: 0 };
        }
        buyerMentions[buyerId][sentiment]++;
        buyerMentions[buyerId].mentions++;
      }
      
      console.log(`\n✅ Relevant: ${item.title.substring(0, 60)}...`);
      console.log(`   Impact: ${analysis.impact} | Buyer: ${buyerId || 'none'} | Sentiment: ${sentiment}`);
    }
  }
  
  // Determine if we should update
  if (relevantNews.length === 0) {
    console.log("\nℹ️ No significant news found today");
    currentData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
    console.log("✅ Timestamp updated");
    return;
  }
  
  console.log("\n📊 Updating tracker data...");
  
  // Add new events to timeline (avoid duplicates)
  const existingEvents = new Set(currentData.timeline.map(e => e.event.toLowerCase().substring(0, 50)));
  
  for (const news of relevantNews) {
    const eventText = news.title.substring(0, 100);
    if (!existingEvents.has(eventText.toLowerCase().substring(0, 50))) {
      currentData.timeline.unshift({
        date: news.date,
        event: eventText,
        impact: news.impact,
        type: "news"
      });
      existingEvents.add(eventText.toLowerCase().substring(0, 50));
    }
  }
  
  // Keep only last 50 events
  currentData.timeline = currentData.timeline.slice(0, 50);
  
  // Update buyer likelihoods based on mentions and sentiment
  for (const [buyerId, mentions] of Object.entries(buyerMentions)) {
    const buyer = currentData.buyers.find(b => b.id === buyerId);
    if (!buyer) continue;
    
    let likelihoodChange = 0;
    let reason = "";
    
    // Calculate change based on sentiment
    if (mentions.positive > mentions.negative) {
      likelihoodChange = Math.min(mentions.positive * 3, 10); // Max +10
      reason = `Positive news coverage (${mentions.positive} positive mention${mentions.positive > 1 ? 's' : ''})`;
    } else if (mentions.negative > mentions.positive) {
      likelihoodChange = -Math.min(mentions.negative * 5, 15); // Max -15
      reason = `Negative news coverage (${mentions.negative} negative mention${mentions.negative > 1 ? 's' : ''})`;
    } else if (mentions.mentions > 0) {
      likelihoodChange = 2; // Neutral mention still shows activity
      reason = `Mentioned in news (${mentions.mentions} mention${mentions.mentions > 1 ? 's' : ''})`;
    }
    
    if (likelihoodChange !== 0) {
      const newLikelihood = Math.max(5, Math.min(95, buyer.likelihood + likelihoodChange));
      
      // Add to history
      buyer.history.push({
        date: today,
        likelihood: newLikelihood,
        note: reason
      });
      
      // Keep only last 90 days
      buyer.history = buyer.history.slice(-90);
      
      // Update current values
      const oldLikelihood = buyer.likelihood;
      buyer.likelihood = newLikelihood;
      buyer.trend = likelihoodChange > 0 ? "up" : likelihoodChange < 0 ? "down" : "stable";
      
      console.log(`   ${buyer.name}: ${oldLikelihood}% → ${newLikelihood}% (${likelihoodChange > 0 ? '+' : ''}${likelihoodChange})`);
    }
  }
  
  // Sort buyers by likelihood
  currentData.buyers.sort((a, b) => b.likelihood - a.likelihood);
  
  // Update timestamp
  currentData.lastUpdated = new Date().toISOString();
  
  // Add summary to recent news
  const summary = `Found ${relevantNews.length} relevant news item${relevantNews.length > 1 ? 's' : ''}. ` +
    (Object.keys(buyerMentions).length > 0 
      ? `Buyers mentioned: ${Object.keys(buyerMentions).map(id => currentData.buyers.find(b => b.id === id)?.name || id).join(', ')}.`
      : 'No specific buyers mentioned.');
  
  currentData.recentNews = currentData.recentNews || [];
  currentData.recentNews.unshift({
    date: today,
    summary: summary
  });
  currentData.recentNews = currentData.recentNews.slice(0, 30);
  
  // Save
  fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
  
  console.log("\n✅ Tracker updated successfully!");
  console.log(`   Summary: ${summary}`);
}

// Run
updateTracker().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
