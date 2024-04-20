const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const sources = require('../sources.json');
const Sequelize = require('sequelize');
const db = require('../database/models');
const parser = new Parser();

async function scrapeArticleContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Remove unwanted tags
    $('a, img, picture, source').remove(); // Remove all <a>, <img>, <picture>, and <source> tags

    // Get the cleaned article content
    const articleContent = $('article').text().trim(); // You may need to adjust the selector based on the structure of the article

    return articleContent;
  } catch (error) {
    console.error(`Error scraping article content from ${url}: ${error.message}`);
    return null;
  }
}

async function getAllBlogs(req, res) {
  try {
    let modifiedFeed = [];
    for (const sourceUrl of sources) {
      const feedUrl = sourceUrl.url;
      const feed = await parser.parseURL(feedUrl);

      // Modify each feed item
      const modifiedItems = await Promise.all(feed.items.map(async (item) => {
        if (item.contentSnippet.split(' ').length < 50) {
          const articleContent = await scrapeArticleContent(item.link);
          if (articleContent) {
            item.content = articleContent;
            item['content:encoded'] = articleContent;
            item.contentSnippet = articleContent.substring(0, 100) + '...'; // Update contentSnippet if needed
          }
        }
        item.source = sourceUrl.source;
        // console.log(db.);
        await savingDataInDatabase(item['content:encoded'] , item.pubDate , item.source , item)
        return item;
      }));

      modifiedFeed = modifiedFeed.concat(modifiedItems);
    }
    res.send(modifiedFeed);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


async function savingDataInDatabase(orginalDesc, pubDate, source, item) {
  try {
    console.log('-------------Saving Data in Database ------------------');

    await db.article.create({ orginalDesc: orginalDesc, publishedDate: pubDate, source: source, item: item });
    console.log('-------------Saving Data in Database Completed------------------');
  } catch (error) {
    console.log(error);
  }
}
module.exports = { getAllBlogs };
