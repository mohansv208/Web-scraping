// runScraper.ts
import { scrapeReviews } from './src/index'; // Adjust the path based on where you compiled your files

async function main() {
  const companyName = 'Yellow.ai'; // Replace with the actual company name
  const startDate = '2014-01-01'; // Set your start date (YYYY-MM-DD)
  const endDate = '2024-12-31'; // Set your end date (YYYY-MM-DD)
  const source = 'capterra'; // Choose 'g2' or 'capterra'

  try {
    const reviews = await scrapeReviews({ companyName, startDate, endDate, source });
    console.log(reviews);
    // You can also save the reviews to a file if desired
  } catch (error) {
    console.error('Error scraping reviews:', error);
  }
}

main();
