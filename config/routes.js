const articleRouter=require("../routes/article");

module.exports=function(app){
app.use('/',articleRouter);
}