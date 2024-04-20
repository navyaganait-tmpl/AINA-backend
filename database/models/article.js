const { DataTypes, BelongsTo } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const article = sequelize.define("article", {
        articleId: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
        },
        orginalDesc: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        generatedSummary: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        originalUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        publishedDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        source: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        originalArticle: {
            type: DataTypes.JSON,
            allowNull: true
        }


    })
    article.associate = function (models) {
        models.article.hasMany(models.article, { foreignKey: "articleId" });
        models.article.belongsTo(models.article, { foreignKey: "articleId" });
        models.article.belongsTo(models.category, { foreignKey: "categoryId" });
    };
    return article;

}
