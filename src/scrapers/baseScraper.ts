import { Review, Scraper } from '../types';
import { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export abstract class BaseScraper implements Scraper {
    protected companyName: string;
    protected startDate: Date;
    protected endDate: Date;

    constructor(companyName: string, startDate: string, endDate: string) {
        this.companyName = companyName;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }

    // Make sure the return type matches the interface
    abstract navigateToCompanyPage(page: Page): Promise<Review[]>; 
    abstract scrapeReviews(page: Page): Promise<Review[]>;

    // scrape now only calls navigateToCompanyPage
    async scrape(page: Page): Promise<Review[]> {
        const reviews = await this.navigateToCompanyPage(page); // navigateToCompanyPage returns the reviews
        await this.storeData(reviews); // Store the scraped data after navigation
        return reviews;
    }

    protected async storeData(reviews: Review[]): Promise<void> {
        // Define the directory where the file will be stored
        const directory = path.join(__dirname, 'scraped_reviews');
    
        // Create the directory if it doesn't exist
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true }); // Ensure all directories in the path are created
        }
    
        // Define the filename and path where the data will be saved
        const filename = path.join(directory, `${this.companyName.replace(/\s+/g, '_').toLowerCase()}_reviews.json`);
    
        try {
            // Write the JSON data to the file
            fs.writeFileSync(filename, JSON.stringify(reviews, null, 2), 'utf-8');
            console.log(`Data has been saved to ${filename}`);
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error saving data to ${filename}: ${error.message}`);
            } else {
                console.error(`Error saving data to ${filename}: An unknown error occurred`);
            }
        }
    }
}
