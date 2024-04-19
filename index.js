const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.bbc.com/news/world-asia-india-68816285';

axios.get(url)
    .then(response => {
        const $ = cheerio.load(response.data);

        // Find the paywall div
        const paywallDiv = $('div#paywallbox');

        // Use either sibling or general traversal based on your HTML structure
        paywallDiv.nextAll('p').remove();   // For direct siblings 
        // Or 
        paywallDiv.parent().find('p').remove();  // For nested <p> tags

        // At this point, <p> tags after the paywallbox are removed

    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
