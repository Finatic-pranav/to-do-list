const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine','ejs');

let items = [];
let workItems = [];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    title:String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    title:"Welcome to your to do List"
});

const item2 = new Item({
    title:"Hit the + button to add the new item"
});

const item3 = new Item({
    title:"<-- Hit this to delete the item"
});

const defaultItems = [item1, item2, item3];


const listsSchema = {
    name:String,
    items:[itemsSchema]
};


const List = mongoose.model("List", listsSchema);



Item.find(function(err){
    if(err){
        console.log(err);
    } else {
        items.forEach(function(element){
            items.push = element.title; 
        });
    }
});



app.get("/", function(req,res){
    
    // let days = date();

    Item.find({}, function(err, foundItems){

        if (foundItems.length ===0){
            Item.insertMany([item1, item2, item3], function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Successfully Inserted!");
                }
            });
            res.render("/");
        } else{
            res.render("list",{listTitle:"Today", newListItems:foundItems});
        }

    });
});

app.post("/", function(req,res){
    // console.log(req.body.list);

    const item = req.body.newItem;
    const listName = req.body.list;

    const itemF = new Item({
        title:item
    });

    if (listName === "Today"){
        itemF.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(itemF);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
});


app.post("/delete", function(req,res){
    const checkBoxId = req.body.checkbox;
    const listName = req.body.list;


    if (listName === "Today"){
        Item.findByIdAndRemove(checkBoxId, function(err){
            if(!err){
                console.log("Item removed Successfully!");
                res.redirect("/");
            }
        });
    } else{
        List.findOneAndUpdate({name:listName}, {$pull : {items :{_id:checkBoxId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+ listName);
            }
        });
    }

    
});


app.get("/:userName", function(req,res){
    const customListName = req.params.userName;

    List.findOne({name:customListName}, function(err, foundList){
        if (!err) {
            if (!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });

                list.save();
                res.redirect("/"+customListName);
            } else {
                res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
            }
        }
    });

});


app.get("/about", function(req,res){
    res.render("about");
})


app.listen(3000, function(){
    console.log("Server is running on port 3000");
})