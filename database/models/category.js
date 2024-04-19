const {DataTypes, BelongsTo}= require("sequelize");
module.exports=(sequelize,DataTypes)=>{
    const category =sequelize.define("category",{
        categoryId:{
            primaryKey:true,
            type:DataTypes.INTEGER,
            auto_increment:true
        },
        title:{
            type:DataTypes.TEXT,
            allowNull: false,
        },
        image:{
            type:DataTypes.TEXT,
            allowNull: true,
        }, 
        
    })
    category.associate = function (models) {
        models.category.hasMany(models.article, { foreignKey: "categoryId" });
      };
    return category;

}