const fs = require("fs");
const { Sequelize, DataTypes } = require("sequelize");
const db = require("../database/models");

function cosineSimilarity(text1, text2) {
  const vector1 = textToVector(text1);
  const vector2 = textToVector(text2);

  const intersection = new Set([
    ...Object.keys(vector1),
    ...Object.keys(vector2),
  ]);
  let numerator = 0;

  for (const word of intersection) {
    numerator += (vector1[word] || 0) * (vector2[word] || 0);
  }

  const sum1 = Object.values(vector1).reduce((sum, val) => sum + val ** 2, 0);
  const sum2 = Object.values(vector2).reduce((sum, val) => sum + val ** 2, 0);
  const denominator = Math.sqrt(sum1) * Math.sqrt(sum2);

  return denominator ? numerator / denominator : 0.0;
}

function textToVector(text) {
  const words = text.match(/\w+/g);
  const wordCounts = {};

  if (!words) {
    return wordCounts; // Return an empty object if words is null or undefined
  }

  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  return wordCounts;
}

async function saveFirstArticle() {
  try {
    const data = fs.readFileSync("articles.txt", "utf8");
    const articleData = JSON.parse(data);

    // Retrieve the last relationId from the table
    const lastArticle = await db.article.findOne({
      order: [["relationId", "DESC"]],
    });

    let lastRelationId = lastArticle ? lastArticle.relationId : 0;

    // Outer loop (array)
    for (const article of articleData) {
      let similarFound = false;

      // Retrieve existing articles
      const existingArticles = await db.article.findAll();

      for (const existingArticle of existingArticles) {
        // console.log(article.link);
        // console.log(existingArticle.originalUrl);
        // Inner loop (database articles)
        if (article.link != existingArticle.originalUrl) {
          const similarity = cosineSimilarity(
            article.content,
            existingArticle.orginalDesc
          );

          if (similarity > 0.8) {
            console.log("Similar articles found:", similarity);

            // Set the association, assuming a correct relationship is defined
            await db.article.create({
              relationId: existingArticle.relationId,
              originalUrl: article.link,
              orginalDesc: article.content,
              image: article.imageUrl,
            });

            similarFound = true;
            break; // Exit the inner loop if a similar article is found
          }
        }
      }
      // Create the new article if not similar to others
      if (!similarFound) {
        await db.article.create({
          relationId: lastRelationId++,
          originalUrl: article.link,
          orginalDesc: article.content,
          image: article.imageUrl,
        });
        console.log("Article saved successfully");
      }
    }
  } catch (error) {
    console.error("Error saving article:", error);
  }
}

// Call the function
saveFirstArticle();

// Export the function if needed
module.exports = saveFirstArticle;
