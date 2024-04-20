const Sequelize = require('sequelize');
const axios = require('axios');
const { parseString } = require('xml2js');
const striptags = require('striptags');
const { JSDOM } = require('jsdom');

module.exports = {
  getAllBlogs: async (req, res) => {
    try {const axios = require('axios');
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
    
      const urls = [
        "https://feeds.feedburner.com/ndtvnews-top-stories",
        "https://www.deccanchronicle.com/google_feeds.xml",
        "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml"
      ];

      const articles = [];

      for (const url of urls) {
        try {
          const response = await axios.get(url);
          const xmlData = response.data;
          const jsonData = await parseXml(xmlData);
          const items = jsonData.rss.channel[0].item;
          const parsedArticles = await Promise.all(items.map(async (item) => {
            let imageUrl = null;
            if (item.enclosure && item.enclosure[0].$.type === 'image/jpeg') {
              imageUrl = item.enclosure[0].$.url;
            } else if (item['media:content']) {
              imageUrl = item['media:content'][0].$.url;
            } else if (item['media:thumbnail']) {
              imageUrl = item['media:thumbnail'][0].$.url;
            }
            let content = null;
            if (url === "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml") {
              try {
                const linkResponse = await axios.get(item.link[0]);
                // console.log(linkResponse.data);
                const dom = new JSDOM(linkResponse.data);
                // console.log(dom);
                const section = dom.window.document.querySelector('section[data-component="text-block"]');

                console.log(section);
                content = section ? section.innerHTML : '';
              } catch (error) {
                console.error(`Error fetching content from ${item.link[0]}:`, error);
              }
            } else {
              content = item["content:encoded"] ? striptags(item["content:encoded"][0]) : striptags(item.link[0]);
            }
            return {
              link: item.link[0],
              content,
              imageUrl,
            };
          }));
          articles.push(...parsedArticles);
        } catch (error) {
          console.error(`Error fetching articles from ${url}:`, error);
        }
      }

      // console.log("Fetched articles:", articles);
      return res.status(200).json({ articles });
    } catch (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

async function parseXml(xmlData) {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
