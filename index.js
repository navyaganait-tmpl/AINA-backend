async function saveFirstArticle() {
  try {
      const data = fs.readFileSync('articles.txt', 'utf8');
      const articleData = JSON.parse(data);

      const article = {
          originalUrl: articleData[0].link,
          orginalDesc: articleData[0].content,
          image: articleData[0].imageUrl
      };

      await db.article.create(article);
      console.log('First article saved successfully');
  } catch (error) {
      console.error('Error saving article:', error);
  }
}
