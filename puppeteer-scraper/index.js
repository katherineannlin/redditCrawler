import startBrowser from './browser.js';
import Scraper from './scraper.js';

// const scraperController = require('./pageController');

//Start the browser and create a browser instance
const browserInstance = await startBrowser();
const scraperInsance = new Scraper(browserInstance);

// Pass the browser instance to the scraper controller
// scraperController(browserInstance)
await scraperInsance.open('http://www.reddit.com/r/titanfolk/');
const keywords = ['Levi', 'Erwin'];
const page_limit = 5;
const results = await scraperInsance.scrap(keywords, page_limit);
console.log(results, `Total posts found: ${results.length}.`);
