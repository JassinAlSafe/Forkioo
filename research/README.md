# Competitive Research

This directory contains ethical competitive research tools for analyzing Bokio.se.

## Ethical Guidelines

This scraper follows strict ethical guidelines:

✅ **What we DO:**
- Respect robots.txt rules
- Rate-limit all requests (3 seconds between pages)
- Use descriptive User-Agent with contact info
- Only scrape public marketing pages
- Take screenshots for design inspiration (not copying)
- Extract feature descriptions for competitive analysis

❌ **What we DON'T do:**
- Access authenticated areas (login, dashboard)
- Scrape user data or PII
- Bypass security measures
- Copy copyrighted assets (logos, images, CSS)
- Hammer their servers
- Violate GDPR or their Terms of Service

## Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install firefox
```

## Usage

```bash
# Run the scraper
python research/scraper.py
```

## Output

Results are saved to `research/output/`:
- `scrape_results.json` - Extracted data (titles, headings, descriptions)
- `screenshot_*.png` - Full-page screenshots for design reference

## Legal Notes

This research is for educational and competitive analysis purposes only:
- We use scraped data to understand competitor features, not to copy them
- Screenshots are for inspiration to create our own unique designs
- We do not collect, store, or process any personal data
- If Bokio requests we stop, we will immediately comply

## Contact

If you represent Bokio and have concerns about this research, please contact: research@forkioo.dev
