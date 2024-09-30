import { BaseScraper } from './baseScraper';
import { Review } from '../types';
import { Page } from 'puppeteer';

export class G2Scraper extends BaseScraper {
    // Method to navigate to the company's page and retrieve reviews
    async navigateToCompanyPage(page: Page): Promise<Review[]> {
        try {
            // Step 1: Navigate to G2 homepage
            await page.goto('https://www.g2.com/', { waitUntil: 'networkidle2' });

            // Step 2: Search for the company
            await page.click('.ajax-search-field'); // Click to focus on the input field
            await page.type('.ajax-search-field', this.companyName); // Type the company name
            await page.keyboard.press('Enter'); // Trigger search

            // Step 3: Wait for search results to load
            await page.waitForNavigation({ waitUntil: 'networkidle0' });

            // Step 4: Extract the company slug from the first search result
            const companySlug = await this.getCompanySlug(page);
            if (!companySlug) {
                throw new Error('Company slug not found.');
            }

            console.log('Company Slug:', companySlug);

            // Step 5: Construct and navigate to the reviews URL
            const reviewsUrl = `https://www.g2.com/products/${companySlug}/reviews?order=most_recent`;
            console.log('Reviews URL:', reviewsUrl);
            await page.goto(reviewsUrl, { waitUntil: 'networkidle2' });

            // Step 6: Scrape the reviews
            const reviews = await this.scrapeReviews(page);
            console.log('Scraped Reviews:', reviews);
            return reviews;
        } catch (error) {
            this.handleError(error, 'Error during navigation and scraping');
        }
    }

    // Method to extract the company slug from the page
    private async getCompanySlug(page: Page): Promise<string | null> {
        return await page.evaluate(() => {
            const firstResult = document.querySelector('.link.js-log-click') as HTMLAnchorElement;
            return firstResult ? firstResult.href.split('/')[4] : null; // Extract the slug (e.g., "yellow-ai")
        });
    }

    // Method to scrape reviews from the reviews page
    async scrapeReviews(page: Page): Promise<Review[]> {
        try {
            // Wait for the reviews section to load; adjust selector as needed
            await page.waitForSelector('.paper--box', { timeout: 5000 }); // Wait up to 5 seconds

            return await page.evaluate(() => {
                const reviewElements = document.querySelectorAll('.paper--box'); // Adjust based on actual HTML structure
                const reviewsArray: Review[] = [];

                reviewElements.forEach(element => {
                    reviewsArray.push(this.extractReviewDetails(element)); // Use the extraction method
                });

                return reviewsArray; // Return the scraped reviews
            });
        } catch (error) {
            this.handleError(error, 'Error while scraping reviews');
        }
    }

    // Method to extract details from a single review element
    private extractReviewDetails(element: Element): Review {
        const titleElement = element.querySelector('[itemprop="name"]');
        const title = titleElement?.textContent?.trim() || 'No Title';

        const reviewerNameElement = element.querySelector('[itemprop="author"] meta[itemprop="name"]');
        const reviewerName = reviewerNameElement?.getAttribute('content') || 'Unknown Reviewer';

        const reviewBodyElement = element.querySelector('[itemprop="reviewBody"]');
        const reviewBody = reviewBodyElement ? (reviewBodyElement as HTMLElement).innerText.trim() : '';

        // Extract rating
        const ratingElement = element.querySelector('[itemprop="ratingValue"]');
        const rating = ratingElement?.getAttribute('content') || 'No Rating';

        const dateElement = element.querySelector('.review-date-class'); // Update this selector based on actual date location
        const date = dateElement?.textContent?.trim() || 'Unknown Date';

        return {
            title,
            reviewerName,
            reviewBody,
            rating,
            date,
        };
    }

    // Centralized error handling
    private handleError(error: unknown, context: string): never {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`${context}: ${errorMessage}`);
        throw new Error(`Scraping failed: ${errorMessage}`);
    }
}
