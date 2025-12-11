#!/bin/bash

# Pizza Hut Tracker - Daily Update Script
# 
# To set up cron job:
# 1. Open terminal and run: crontab -e
# 2. Add this line (runs at 8 AM daily):
#    0 8 * * * /path/to/pizza-hut-tracker/update.sh >> /path/to/pizza-hut-tracker/update.log 2>&1
# 3. Save and exit
#
# Make sure to: chmod +x update.sh

# Change to script directory
cd "$(dirname "$0")"

echo "========================================"
echo "Pizza Hut Tracker - Daily Update"
echo "$(date)"
echo "========================================"

# Run the update script
npm run update

# Check if data.json changed
if ! git diff --quiet src/data.json; then
    echo ""
    echo "Changes detected, pushing to GitHub..."
    git add src/data.json
    git commit -m "🍕 Daily tracker update - $(date +%Y-%m-%d)"
    git push origin main
    echo ""
    echo "✅ Update pushed to GitHub!"
else
    echo ""
    echo "No changes to push."
fi

echo ""
echo "Done!"
