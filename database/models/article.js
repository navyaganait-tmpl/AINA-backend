const {DataTypes, BelongsTo}= require("sequelize");
module.exports=(sequelize,DataTypes)=>{
    const article =sequelize.define("article",{
        articleId:{
            primaryKey:true,
            autoIncrement:true,
            type:DataTypes.INTEGER,
            
        },
        relationId:{
            type:DataTypes.INTEGER,
            allowNull: true,
        },
        orginalDesc:{
            type:DataTypes.TEXT,
            allowNull: true,
        },
        generatedSummary:{
            type:DataTypes.TEXT,
            allowNull: true,
        },
        image:{
            type:DataTypes.TEXT,
            allowNull: true,
        },
        originalUrl:{
            type:DataTypes.TEXT,
            allowNull: true,
        },
        publishedDate:{
            type:DataTypes.DATE,
            allowNull: true,
        }
        
        
    })
    article.associate = function (models) {
         models.article.belongsTo(models.category, { foreignKey: "categoryId" });
      };
    return article;

}