import { ScraperFactory } from './scrapers/factory';
import { Review } from './types';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';

// Use the stealth plugin to prevent detection of automation
puppeteer.use(StealthPlugin());

// Declare variables for the Puppeteer browser and page instances
let browser: Browser | null = null;
let page: Page | null = null;

// User agents for random selection
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.864.64 Safari/537.36 Edg/91.0.864.64',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Opera/77.0.4054.146',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Brave/91.0.4472.124',
];

// Function to get a random user agent from the list
const getRandomUserAgent = (): string => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Function to launch the Puppeteer browser with specified arguments
const launchBrowser = async (): Promise<Browser> => {
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        `--user-agent=${getRandomUserAgent()}`,
    ];
    return await puppeteer.launch({ headless: true, args });
};

// Function to ensure screenshots directory exists
const ensureScreenshotDirectory = async (): Promise<string> => {
    const screenshotPath = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath);
    }
    return screenshotPath;
};

// Function to handle errors during scraping
const handleError = async (error: any) => {
    console.error('Error during scraping:', error);
    if (page) {
        const screenshotPath = await ensureScreenshotDirectory();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({ path: path.join(screenshotPath, `error_screenshot_${timestamp}.png`) });
        console.log(`Screenshot taken: error_screenshot_${timestamp}.png`);
    }
    if (browser) {
        await browser.close();
    }
    process.exit(1);
};

// Main function to scrape reviews from a specified source
export async function scrapeReviews({
    companyName,
    startDate,
    endDate,
    source
}: {
    companyName: string;
    startDate: string;
    endDate: string;
    source: string;
}): Promise<Review[]> {
    try {
        browser = await launchBrowser();
        page = await browser.newPage();
        const scraper = ScraperFactory.getScraper(source, companyName, startDate, endDate);
        const reviews = await scraper.scrape(page);
        return reviews;
    } catch (error) {
        await handleError(error);
        throw error; // Optional re-throwing of the error
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Gracefully close the browser if the script is interrupted
process.on('SIGINT', async () => {
    console.log('SIGINT received, closing browser...');
    if (browser) {
        await browser.close();
    }
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    await handleError(err);
});
