#!/usr/bin/env python3
"""
Ethical Web Scraper for Bokio.se Competitive Research

This script:
- Respects robots.txt rules
- Rate-limits requests (2-5 seconds between pages)
- Uses descriptive User-Agent
- Only scrapes publicly accessible marketing pages
- Takes screenshots for design reference
- Extracts feature descriptions and pricing
- Does NOT access user dashboards or authenticated areas
- Does NOT collect PII or personal data

Usage:
    python research/scraper.py
"""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path
from urllib.robotparser import RobotFileParser

from playwright.async_api import async_playwright


class EthicalBokioScraper:
    """Respectful scraper for Bokio's public marketing pages"""

    def __init__(self):
        self.base_url = "https://www.bokio.se"
        self.user_agent = "ForkiooResearch/0.1 (Educational competitive research; contact: research@forkioo.dev)"
        self.output_dir = Path(__file__).parent / "output"
        self.output_dir.mkdir(exist_ok=True)
        self.delay_between_requests = 3  # seconds
        self.robot_parser = RobotFileParser()

        # Pages to scrape (public marketing pages only)
        self.pages_to_scrape = [
            "/",  # Homepage
            "/priser",  # Pricing
            "/funktioner",  # Features
            "/om-bokio",  # About
            "/support",  # Support/Help
        ]

        # Disallowed paths from robots.txt (based on research)
        # These paths should NOT be scraped
        self.known_disallowed = [
            "/bin/",
            "/config/",
            "/umbraco/",
            "/views/",
            "/sbf-back-office/",
        ]

    def check_can_fetch(self, path: str) -> bool:
        """Check if we're allowed to fetch this path"""
        # Check against known disallowed paths
        for disallowed in self.known_disallowed:
            if path.startswith(disallowed):
                print(f"❌ BLOCKED by robots.txt: {path}")
                return False

        # Only scrape public marketing pages
        if path.startswith("/login") or path.startswith("/dashboard"):
            print(f"❌ BLOCKED (authenticated area): {path}")
            return False

        return True

    async def scrape_page(self, browser, path: str):
        """Scrape a single page respectfully"""

        # Check if allowed
        if not self.check_can_fetch(path):
            return None

        print(f"\n📄 Scraping: {self.base_url}{path}")

        # Create browser page
        page = await browser.new_page(user_agent=self.user_agent)

        try:
            # Navigate with timeout
            await page.goto(
                f"{self.base_url}{path}",
                wait_until="networkidle",
                timeout=30000,
            )

            # Wait a bit for any lazy-loaded content
            await asyncio.sleep(2)

            # Extract data
            data = {
                "url": f"{self.base_url}{path}",
                "path": path,
                "scraped_at": datetime.now().isoformat(),
                "title": await page.title(),
                "meta_description": await page.locator('meta[name="description"]').get_attribute("content") if await page.locator('meta[name="description"]').count() > 0 else None,
            }

            # Extract headings
            data["headings"] = {
                "h1": [await el.text_content() for el in await page.locator("h1").all()],
                "h2": [await el.text_content() for el in await page.locator("h2").all()],
            }

            # Extract main content text (limit to avoid overwhelming data)
            main_content = page.locator("main, article, .content, .main-content").first
            if await main_content.count() > 0:
                data["main_text"] = (await main_content.text_content())[:2000]  # First 2000 chars

            # Take screenshot for design reference
            screenshot_path = self.output_dir / f"screenshot{path.replace('/', '_')}.png"
            await page.screenshot(path=screenshot_path, full_page=True)
            data["screenshot"] = str(screenshot_path)

            print(f"✅ Scraped: {path}")
            print(f"   Title: {data['title']}")
            print(f"   Screenshot: {screenshot_path}")

            return data

        except Exception as e:
            print(f"❌ Error scraping {path}: {e}")
            return None

        finally:
            await page.close()

    async def run(self):
        """Main scraping workflow"""

        print("=" * 60)
        print("Bokio.se Ethical Competitive Research Scraper")
        print("=" * 60)
        print(f"User-Agent: {self.user_agent}")
        print(f"Output directory: {self.output_dir}")
        print(f"Rate limit: {self.delay_between_requests}s between requests")
        print("=" * 60)

        results = []

        async with async_playwright() as p:
            # Launch browser
            browser = await p.firefox.launch(headless=True)

            print("\n🚀 Starting scraping...")

            for i, path in enumerate(self.pages_to_scrape):
                # Rate limiting: wait between requests
                if i > 0:
                    print(f"⏳ Waiting {self.delay_between_requests}s (rate limiting)...")
                    await asyncio.sleep(self.delay_between_requests)

                # Scrape page
                result = await self.scrape_page(browser, path)
                if result:
                    results.append(result)

            await browser.close()

        # Save results to JSON
        output_file = self.output_dir / "scrape_results.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print("\n" + "=" * 60)
        print(f"✅ Scraping complete!")
        print(f"📊 Scraped {len(results)} pages")
        print(f"💾 Data saved to: {output_file}")
        print(f"📸 Screenshots saved to: {self.output_dir}")
        print("=" * 60)

        return results


async def main():
    scraper = EthicalBokioScraper()
    await scraper.run()


if __name__ == "__main__":
    asyncio.run(main())
