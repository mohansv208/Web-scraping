import { BaseScraper } from './baseScraper';
import { Review } from '../types';
// import { parseCapterraDate } from '../utils/capterraDateParser';
import { Page } from 'puppeteer';

export class CapterraScraper extends BaseScraper {

    // Method to navigate to the company's review page and start the scraping process
    async navigateToCompanyPage(page: Page): Promise<Review[]> {
        try {
            // Step 1: Navigate to Capterra homepage
            await page.goto('https://www.capterra.in/', { waitUntil: 'networkidle2' });

            // Step 2: Search for the company name in the search field
            await page.type('#homeSearch', this.companyName);
            await page.keyboard.press('Enter');

            // Step 3: Wait for the results to load
            await page.waitForSelector('.entry', { visible: true });

            // Step 4: Extract the first result slug from the search results
            const slug = await page.evaluate(() => {
                const firstResultElement = document.querySelector('.entry') as HTMLAnchorElement;
                if (firstResultElement) {
                    const href = firstResultElement.getAttribute('href');
                    return href ? href.replace('/software', '') : null;
                }
                return null;
            });

            if (!slug) {
                throw new Error('No results found for the company name.');
            }

            console.log(`First result found with slug: ${slug}`);

            // Step 5: Navigate to the company's reviews page
            const reviewsUrl = `https://www.capterra.in/reviews` + slug;
            console.log(`Navigating to reviews page: ${reviewsUrl}`);
            await page.goto(reviewsUrl, { waitUntil: 'networkidle2' });

            // Step 6: Scrape reviews from the company's review page
            console.log('Calling scrapeReviews function...');
            const reviews = await this.scrapeReviews(page);
            return reviews;
            // console.log('Reviews scraped successfully:', reviews);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error during navigation and scraping:', error.message);
                throw new Error(`Scraping failed: ${error.message}`);
            } else {
                console.error('An unknown error occurred during scraping:', error);
                throw new Error('Scraping failed due to an unknown error.');
            }
        }
    }

    // Method to scrape reviews from the review page
    async scrapeReviews(page: Page): Promise<Review[]> {
        const allReviews: Review[] = [];
        let pageCount = 1;

        while (true) {
            try {
                console.log(`Scraping page ${pageCount}`);
                // Step 1: Scrape review data using page.evaluate
                const reviews = await page.evaluate((start, end) => {
                    const parseCapterraDate = (dateString: string) => {
                        const regex = /(\d+)\s+(year|years|month|months|week|weeks|day|days)\s+ago/i;
                        const match = regex.exec(dateString);
                        if (match) {
                            const value = parseInt(match[1], 10);
                            const unit = match[2].toLowerCase();
                            const date = new Date();
        
                            switch (unit) {
                                case 'year':
                                case 'years':
                                    date.setFullYear(date.getFullYear() - value);
                                    break;
                                case 'month':
                                case 'months':
                                    date.setMonth(date.getMonth() - value);
                                    break;
                                case 'week':
                                case 'weeks':
                                    date.setDate(date.getDate() - (value * 7));
                                    break;
                                case 'day':
                                case 'days':
                                    date.setDate(date.getDate() - value);
                                    break;
                                default:
                                    return null; 
                            }
        
                            return date;
                        }
                        return null; 
                    };
                    const reviewElements = document.querySelectorAll('.review-card'); // Adjust based on actual HTML structure
                    const reviewsArray: Review[] = [];
                    const startDate = new Date(start);
                    const endDate = new Date(end);

                    reviewElements.forEach(review => {
                        const reviewerName = review.querySelector('.h5.fw-bold.mb-2')?.textContent?.trim() || 'Unknown Reviewer';
                        const reviewerPosition = review.querySelector('.text-ash.mb-2')?.textContent?.trim() || 'Unknown Position';
                        const companySize = review.querySelector('.col-12.col-md-6.col-lg-12 .mb-2')?.textContent?.trim() || 'Unknown Company Size';
                        const reviewTitle = review.querySelector('h3.h5.fw-bold')?.textContent?.trim() || 'No Title';
                        const reviewDateText = review.querySelector('.mos-star-rating + span')?.textContent?.trim() || 'Unknown Date';
                        const reviewDate = parseCapterraDate(reviewDateText);

                        // Validate the review date against start and end bounds
                        if (reviewDate && reviewDate >= startDate && reviewDate <= endDate) {
                            const reviewComments = review.querySelector('p span:last-child')?.textContent?.trim() || 'No Comments';
                            const pros = review.querySelector('p.fw-bold + p')?.textContent?.trim() || 'No Pros';
                            const cons = review.querySelector('p.fw-bold.mb-2 + p')?.textContent?.trim() || 'No Cons';
                            const ratingElement = review.querySelector('.mos-star-rating .ms-1');
                            const rating = parseFloat(ratingElement?.textContent?.trim() || '0');

                            reviewsArray.push({
                                reviewerName,
                                reviewerPosition,
                                companySize,
                                title: reviewTitle,
                                date: reviewDateText,
                                reviewComments,
                                pros,
                                cons,
                                rating,
                            });
                        } else {
                            console.warn(`Review dated "${reviewDateText}" is out of the specified range.`);
                        }
                    });

                    return reviewsArray;
                }, this.startDate.toISOString(), this.endDate.toISOString());

                allReviews.push(...reviews);

                // Step 2: Check for the "Next" button
                const nextButton = await page.$('a.page-link[rel="next"]'); // Select the next button
                if (nextButton) {
                    await Promise.all([
                        nextButton.click(),
                        page.waitForNavigation({ waitUntil: 'networkidle2' }), // Wait for the next page to load
                    ]);
                } else {
                    break; // No more pages
                }
                pageCount++;
            } catch (error) {
                console.error('Error while scraping reviews:', error);
                break; // Exit the loop on error
            }
        }

        if (allReviews.length === 0) {
            console.warn('No reviews found on the pages.');
        }

        return allReviews; // Return the array of all scraped reviews
    }
}
