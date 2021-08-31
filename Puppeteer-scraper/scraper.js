class Scraper {
  constructor(browser) {
    this.browser = browser;
    this.page = null;
  }

  async open(url) {
    try {
      const page = await this.browser.newPage();
      await page.goto(url);
      this.page = page;
    } catch (err) {
      console.log(`Could not goto ${url}:`, err);
    }

    console.log(`Open ${url} successfully.`);
  }

  async scrap(keywords, page_limit) {
    if (this.page == null) {
      throw new Error("No page loaded.");
    }

    // Wait for the required DOM to be rendered
    await this.page.waitForSelector('div.rpBJOHq2PR60pnwJlUyP0');
    // Wait until all posts are loaded
    await this.waitForPostsLoading();
    console.log('page 1 load done.');
    await this.scrollDown(page_limit);

    return this.scrapContents(keywords);
  }

  async waitForPostsLoading() {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  async scrollDown(page_limit) {
    for (let i = 1; i < page_limit; ++i) {
      await this.page.evaluate(() => {
        const last_post = document.querySelector('div.rpBJOHq2PR60pnwJlUyP0').lastChild;

        last_post.scrollIntoView();
      });
      // Wait until all posts are loaded
      await this.waitForPostsLoading();
      console.log(`page ${i+1} load done.`);
    }
  }

  async scrapContents(keywords) {
    return await this.page.evaluate((keywords) => {
      const keywordRegex = new RegExp(keywords.join('|'), 'i');
      const isTopicInterested = topic => {
        return topic && topic.search(keywordRegex) != -1;
      }
      const items = document.querySelectorAll('div._1poyrkZ7g36PawDueRza-J._11R7M_VOgKO1RJyRSRErT3');
      const results = [];

      for (const item of items) {
        const topic = item.querySelector('h3._eYtD2XCVieq6emjKBH3m')?.innerText;
        const link = item.querySelector('a.SQnoC3ObvgnGjWt90zD9Z._2INHSNB8V5eaWp4P0rY_mE')?.href
        const upvote = item.querySelector('div._1rZYMD_4xY3gRcSS3p8ODO')?.innerText;
        const comments = item.querySelector('span.FHCV02u6Cp2zYL0fhQPsO')?.innerText?.split(' ')[0]

        if (isTopicInterested(topic)) {
          results.push({
            topic,
            link,
            upvote,
            comments
          })
        }
      }

      return results;
    }, keywords);
  }
}

export default Scraper;
