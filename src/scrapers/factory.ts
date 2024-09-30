import { G2Scraper } from './g2Scraper';
import { CapterraScraper } from './capterraScrapper';
import { Scraper } from '../types';

enum ReviewSource {
    G2 = 'g2',
    CAPTERRA = 'capterra',
}

export class ScraperFactory {
    /**
     * Returns an instance of the appropriate scraper based on the source.
     * 
     * @param source - The source of the reviews (e.g., 'g2', 'capterra')
     * @param companyName - The name of the company to scrape reviews for
     * @param startDate - The start date of the review period
     * @param endDate - The end date of the review period
     * @returns Scraper - A scraper instance for the specified source
     * @throws Error - If the source is unknown or inputs are invalid
     */
    static getScraper(source: string, companyName: string, startDate: string, endDate: string): Scraper {
        // Basic validation for the inputs
        this.validateInputs(companyName, startDate, endDate);

        switch (source.toLowerCase()) {
            case ReviewSource.G2:
                return new G2Scraper(companyName, startDate, endDate);
            case ReviewSource.CAPTERRA:
                return new CapterraScraper(companyName, startDate, endDate);
            default:
                throw new Error(`Unknown review source: ${source}. Supported sources are 'g2' and 'capterra'.`);
        }
    }

    /**
     * Validates the inputs for the scraper.
     * 
     * @param companyName - The name of the company
     * @param startDate - The start date of the review period
     * @param endDate - The end date of the review period
     * @throws Error - If any input is invalid
     */
    private static validateInputs(companyName: string, startDate: string, endDate: string): void {
        if (!companyName) {
            throw new Error('Company name must be provided.');
        }

        if (!this.isValidDate(startDate)) {
            throw new Error(`Invalid start date format: ${startDate}. Please use "YYYY-MM-DD".`);
        }

        if (!this.isValidDate(endDate)) {
            throw new Error(`Invalid end date format: ${endDate}. Please use "YYYY-MM-DD".`);
        }
    }

    /**
     * Validates if a given string is a valid date in 'YYYY-MM-DD' format.
     * 
     * @param dateString - The date string to validate
     * @returns boolean - True if the date is valid, false otherwise
     */
    private static isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/; // Simple regex for YYYY-MM-DD format
        if (!regex.test(dateString)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0]; // Ensure date matches format
    }
}
