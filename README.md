# Web Scraping Module

## What are we trying to achieve?
This project aims to provide a modular web scraping solution for extracting product reviews from various SaaS review platforms, including G2 and Capterra. The goal is to enable users to collect and analyze reviews to gain insights into customer experiences and product performance.

## Different Tools for Web Scraping
There are several tools available for web scraping, some of the node js tools are mentioned below:
### Puppeteer vs. Other Web Scraping Tools

| Feature/Tool          | **Puppeteer**                                           | **Cheerio**                             | **jQuery**                             | **Playwright**                         |
|-----------------------|--------------------------------------------------------|-----------------------------------------|----------------------------------------|----------------------------------------|
| **Browser Control**    | Full control over headless Chrome and Chromium        | No browser control; operates on static HTML | No browser control; primarily for DOM manipulation | Full control over multiple browsers (Chromium, Firefox, WebKit) |
| **Dynamic Content**    | Excellent handling of JavaScript-rendered content     | Limited; requires static HTML           | Limited; primarily for DOM manipulation | Excellent handling of JavaScript-rendered content |
| **Ease of Use**        | Easy to set up with a clear API                       | Simple to use for parsing HTML, but limited for scraping | Familiar to front-end developers, but not designed for scraping | Similar to Puppeteer, but with more features and cross-browser support |
| **Performance**        | Fast, but can be resource-intensive due to running a full browser | Fast for static content; lightweight     | Fast for DOM manipulation                | Fast with multi-browser support; optimized for performance |
| **Feature Set**        | Includes built-in features for screenshots, PDFs, and more | Focused on parsing HTML; lacks built-in browser features | Focused on DOM manipulation; not suitable for scraping | Comprehensive features including auto-waiting and tracing |
| **Use Cases**          | Ideal for scraping dynamic sites, testing, and automation | Best for scraping static content         | Best for client-side DOM manipulation   | Suitable for scraping and testing across multiple browsers |

### Conclusion

Puppeteer stands out for its ability to handle dynamic content effectively and provide full control over the browser environment. While tools like Cheerio and jQuery are excellent for static content and DOM manipulation, they lack the browser automation capabilities needed for modern web scraping tasks. Playwright offers similar features to Puppeteer with added cross-browser support, making it a great alternative. However, for those primarily focused on scraping JavaScript-heavy websites, Puppeteer remains a top choice.


## Why We Went with Puppeteer?
We chose Puppeteer for this project due to its ability to simulate user interactions and navigate dynamic web pages. Puppeteer provides a high-level API to control headless Chrome, making it suitable for scraping modern websites that rely heavily on JavaScript for content rendering. Additionally, it allows for various functionalities such as taking screenshots and generating PDFs.

## Installation Steps
To set up this project, ensure you have the following:
- **Node.js**: Version 22.9.0 or later
- **npm**: Version 10.8.3 or later

### Steps to Install:
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd web-scraping
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```

## Folder Architecture
```
web-scraping/
├── src/
│   ├── index.ts        # Entry point
│   ├── scrapers/       # Folder containing individual scrapers
│   │    │   ├── scraped-reviews/
│   │    │    │  ├── <company_name>_reviews.json
│   │   ├── baseScraper.ts
│   │   ├── g2Scraper.ts
│   │   ├── capterraScraper.ts
│   │   └── factory.ts
│  ├── screenshots/     
│   │   └── error_screenshot_timestamp.png # screenshots of errors if any
│  ├── types.ts
├── package.json
└── README.md
```

## Driver Function
The driver function for running the scraper is located in `runScraper.ts`. It initializes the scraping process by specifying the company name, date range, and source.

```typescript
import { scrapeReviews } from './src/index';

async function main() {
  const companyName = 'Yellow.ai';
  const startDate = '2014-01-01';
  const endDate = '2024-12-31';
  const source = 'capterra';

  try {
    const reviews = await scrapeReviews({ companyName, startDate, endDate, source });
    console.log(reviews);
  } catch (error) {
    console.error('Error scraping reviews:', error);
  }
}

main();
```

## Capterra Web Scraper: How to Run?
To run the Capterra scraper, execute the following command in the terminal:

```bash
ts-node runScraper.ts
```

Make sure to update the values of `companyName`, `startDate`, `endDate`, and `source` in the driver function as needed.

## Capterra Web Scraper: Sample Output
The output from the Capterra scraper will be in JSON format, similar to the following:

```json
[
  {
    "reviewerName": "Dharaneesh",
    "reviewerPosition": "Assistant Manager Customer Experience in India",
    "companySize": "Food & Beverages, 51–200 Employees",
    "title": "Yellow Messenger Chat got",
    "date": "2 years ago",
    "reviewComments": "Overall a Good partner...",
    "pros": "The Chatbot that responds timely...",
    "cons": "The Chatbot that responds timely...",
    "rating": 5
  }
]
```

## Capterra Web Scraper: Error Handling
In the event of an error during scraping, screenshots of the error can be captured and saved in the `screenshots/` folder. Make sure to handle exceptions properly in the scraping logic to avoid crashing the application.

## G2 Web Scraping: How to Run?
To run the G2 web scraper, follow the same command as for the Capterra scraper, but specify the source as 'g2' in the driver function.

## G2 Web Scraping Blockers: Why We Were Unable to Scrape G2?
While implementing the G2 Scraper, we encountered significant challenges with web scraping due to blocking mechanisms employed by G2. Despite trying various approaches, we were unable to successfully scrape data. Here are some attempts made:
1. **User Agents**: We used around 10 different user agents, but G2 continued to block access.
2. **Puppeteer Extra and Stealth**: Tools like `puppeteer-extra` and `puppeteer-extra-plugin-stealth` were utilized, yet they did not yield successful results.
3. **Puppeteer Arguments**: Various Puppeteer arguments were experimented with, but none proved effective in overcoming the blocking.
4. **Randomized Behavior**: Attempts to implement more human-like behavior by introducing randomized delays and mouse movements also did not resolve the issue.

Due to these challenges, we were unable to proceed with pagination and further scraping efforts.

## Contributing
Contributions are welcome! If you have any suggestions or solutions for overcoming the challenges with the G2 Scraper, please feel free to submit a pull request or open an issue.

