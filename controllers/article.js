const Sequelize = require('sequelize');
const axios = require('axios');
const { parseString } = require('xml2js');
const striptags = require('striptags');
const { JSDOM } = require('jsdom');

module.exports = {
  getAllBlogs: async (req, res) => {
    try {
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
