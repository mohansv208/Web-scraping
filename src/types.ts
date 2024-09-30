import { Page } from 'puppeteer';



export interface Review {
  title: string; // Title of the review
  reviewerName?: string; // Name of the reviewer, optional
  reviewBody?: string; // Body of the review, optional
  rating: string | number; // Rating given by the reviewer
  date: string; // Date of the review
  reviewerPosition?: string; // Position of the reviewer, optional
  companySize?: string; // Size of the company the reviewer is affiliated with, optional
  reviewComments?: string; // Additional comments about the review, optional
  pros?: string; // Positive aspects mentioned in the review, optional
  cons?: string; // Negative aspects mentioned in the review, optional
}

export interface Scraper {
  navigateToCompanyPage(page: Page): Promise<Review[]>; // Navigate to the company's page and scrape reviews
  scrapeReviews(page: Page): Promise<Review[]>; // Scrape reviews from the page
  scrape(page: Page): Promise<Review[]>; // General scrape method that could include additional logic
}
