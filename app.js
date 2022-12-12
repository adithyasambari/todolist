//jshint esversion:6

const mongoose = require("mongoose")
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');
mongoose.set('strictQuery', false);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const uri = 'mongodb+srv://adithyasambari:%40dithya2010@cluster0.00p0fhe.mongodb.net/todolist-2DB?retryWrites=true&w=majority';

// const uri = 'mongodb://localhost:27017/todolist-2DB';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
}


    mongoose.connect(uri, options, (err, db) => {
      if (err) console.error(err);
      else console.log("Connected")
    })

    const itemsSchema = {
      name: String
    }
    // const items = ["Buy Food", "Cook Food", "Eat Food"];
    // const workItems = [];
    const Item = mongoose.model("Item", itemsSchema)

    const item1 = new Item({
      name: "Wake Up"
    })
    const item2 = new Item({
      name: "Have Fun"
    })

    const item3 = new Item({
      name: "Enjoy your day"
    })

    const defaultItems = [item1, item2, item3];

    const listSchema = {
      name: String,
      items: [itemsSchema]
    }

    const List = mongoose.model("List", listSchema)
    // Item.deleteOne({_id:"6390b6b2cffb67e9167e6293"}, function (err) {
    //   if (err) {
    //     console.log(err);
    //   }else {
    //     console.log("Deleted Document");
    //   }
    // })

    const day = date.getDate();



app.get("/", function(req, res) {


  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }else {
          console.log("Loaded Document");
        }
      })

      res.redirect("/")

    }else {
      res.render("list", {listTitle: day, newListItems: foundItems});

    }

  })

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + customListName)

      }else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

      }
    }
  })

})




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
 const item = new Item({
   name: itemName
 })

 if (listName === day) {
   item.save()
   res.redirect("/")
 } else {
   List.findOne({name: listName}, function (err, foundList) {
     foundList.items.push(item)
     foundList.save()
     res.redirect("/" + listName)
   })
 }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
    const checkId = req.body.deleteBox;
    const listName = req.body.listName;

    if (listName === day) {
      Item.findByIdAndRemove(checkId, function (err) {
        if (!err) {
          console.log("checked");
          res.redirect("/")
    }
  })

}else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkId}}}, function(err, foundList){
    if (!err) {
      res.redirect("/" + listName);
    }
  })
}
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
