# 🍕 Pizza Hut Acquisition Tracker

An auto-updating dashboard tracking potential buyers and developments in the Yum! Brands strategic review of Pizza Hut.

## Features

- **Daily Auto-Updates**: Scrapes Google News RSS for Pizza Hut acquisition news
- **Keyword Analysis**: Detects buyer mentions and sentiment automatically
- **Historical Tracking**: Stores likelihood changes over time with sparkline visualizations
- **Comprehensive Coverage**: Tracks 7 potential buyers with pros/cons analysis
- **No API Required**: Uses free RSS feeds - no Anthropic API key needed!

## Quick Start

### 1. Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

Then connect your repo to Vercel - it auto-deploys.

### 2. Set Up Daily Updates (Local Cron)

#### Windows (Task Scheduler)

1. Open **Task Scheduler** (search in Start menu)
2. Click **Create Basic Task**
3. Name: `Pizza Hut Tracker Update`
4. Trigger: **Daily** at 8:00 AM (or your preferred time)
5. Action: **Start a program**
6. Program: Browse to `update.bat` in your project folder
7. **Start in**: Set to your project folder path (e.g., `C:\Users\YourName\PH-Tracker`)
8. Click Finish

#### Mac/Linux (Cron)

```bash
# Make script executable
chmod +x update.sh

# Edit crontab
crontab -e

# Add this line (runs at 8 AM daily):
0 8 * * * /full/path/to/pizza-hut-tracker/update.sh >> /full/path/to/pizza-hut-tracker/update.log 2>&1
```

### 3. Test It Manually

```bash
npm install
npm run update
```

## How It Works

1. **Update script runs** (via cron/Task Scheduler)
2. **Scrapes Google News RSS** for Pizza Hut acquisition keywords
3. **Analyzes headlines** for:
   - Relevance (is it about the sale?)
   - Impact (high/medium/low)
   - Buyer mentions (Roark, Apollo, RBI, etc.)
   - Sentiment (positive/negative/neutral)
4. **Updates `data.json`** with new events and adjusted likelihood scores
5. **Commits and pushes** to GitHub
6. **Vercel auto-deploys** the updated site

## Likelihood Score Changes

The script adjusts buyer likelihood based on news:

| Sentiment | Change |
|-----------|--------|
| Positive mention | +3% per mention (max +10%) |
| Negative mention | -5% per mention (max -15%) |
| Neutral mention | +2% (shows activity) |

## Project Structure

```
pizza-hut-tracker/
├── src/
│   ├── data.json          # All tracker data (auto-updated)
│   ├── PizzaHutTracker.jsx # React component
│   ├── main.jsx
│   └── index.css
├── scripts/
│   └── local-update.js    # News scraper script
├── update.bat             # Windows update script
├── update.sh              # Mac/Linux update script
└── package.json
```

## Manual Updates

Edit `src/data.json` directly to:
- Add custom events to timeline
- Adjust likelihood scores manually
- Add new potential buyers

## Cost

**$0** - Everything is free:
- Google News RSS: Free
- GitHub: Free
- Vercel: Free (hobby tier)
- Your computer running cron: Free

## Alternative: GitHub Actions (Optional)

If you want updates even when your computer is off, you can use GitHub Actions with the Anthropic API. See `scripts/update-tracker.js` and `.github/workflows/daily-update.yml`.

## License

MIT
