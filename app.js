const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-vikash:LetsDoIt@cluster0.nllk0.mongodb.net/todolistdb?retryWrites=true&w=majority",{useNewUrlParser:true});

const itemSchema=mongoose.Schema({
  name: {
    type:String,
    required:true
  }
});

const Item=mongoose.model("Item",itemSchema);

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

const title = "Home";
Item.find({},function(err,items){

  if(err)
  console.log(err);
  else
  res.render("list", {listTitle: title, listItems: items});
});

});

app.get("/:customListName",function(req,res){
  console.log(req.params.customListName);
 const customListName=_.capitalize(req.params.customListName);
 
  if(customListName!="favicon.ico")
  {
  List.find({name:customListName},function(err,foundList){
     if(foundList.length==0)
     {
        const listItem=new List({
        name:customListName,
        items:[]
      })
      listItem.save();
      res.redirect("/"+customListName);
     }  
     else
     {
      res.render("list", {listTitle: foundList[0].name, listItems: foundList[0].items});
     }
 });
  }
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.listName;
  const item =new Item({
    name:itemName
  });
  if(listName==="Home")
  {
   item.save();
   setTimeout(() => {res.redirect("/")}, 5000);
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==='Home')
  {
    Item.findByIdAndDelete(checkedId,function(err){
      if(!err)
         res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList){
      if(!err)
        res.redirect("/"+listName);
    });
  }
  
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
