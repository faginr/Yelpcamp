var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name: "Kestral Glade", 
        image: "https://farm7.staticflickr.com/6123/5916494333_2110997285.jpg",
        description: "A solitary glade with ample river access. Plentiful bird watching available."   
    },
    {
        name: "Wayward Prarie", 
        image: "https://farm9.staticflickr.com/8622/16537080447_6a3a3950e3.jpg",
        description: "Wide open spaces with beautiful vistas to behold. Bring your own water."   
    },
    {
        name: "Ancient Elms", 
        image: "https://farm2.staticflickr.com/1408/5128829651_506b72b316.jpg",
        description: "Welcome to the oldest living Elms in the state. RV hookups and camper friendly."   
    }
]

function seedDB(){
    //Remove all campgrounds
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds");
        //add in campgrounds
        data.forEach(function(seed){
            Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                } else {
                    console.log("added a campground");
                    //create a comment
                    Comment.create(
                        {
                            text: "This is a great spot. Five Stars!",
                            author: "Nala"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                            campground.comments.push(comment);
                            campground.save();
                            console.log("Created New Comment");
                        }
                    });
                }
            });
        });
    });
        
    //add in comments
}

module.exports = seedDB;
