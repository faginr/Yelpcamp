var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
    mongoose      = require("mongoose"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground    = require("./models/campground"),
    User          = require("./models/user"),
    seedDB        = require("./seeds"),
    Comment       = require("./models/comment");
    

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
//look up rest convention: post and get should go to the same url for get and post
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
seedDB();

// ======================
// Passport Config
// ======================
app.use(require("express-session")({
    secret: "Weimund is the feather-rain of buns.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next){
    res.locals.currentUser = req.user;
    next();
});


app.get("/", function(req, res){
  res.render("landing"); 
});

// ===============
//Index Route
// ===============
app.get("/campgrounds", function(req,res){
    // Get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log("Error " + err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    // Render all campgrounds
        // first campgrounds is the name being assigned to the second campgrounds, which is the data being passed in.
});

// =============
// Create Route
// =============
app.post("/campgrounds", function(req, res){
   //get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCampground= {
       name: name,
       image: image,
       description: desc
   };
   //create a new campground and save to DB
   Campground.create(newCampground, function(err, newestCreated){
       if(err){
           console.log("Error " + err);
       } else {
           //redirect back to campgrounds page. defaults to get request.
           res.redirect("/campgrounds");
       }
   });
});
// ================
//New Route - because it follows the show ":id" criteria, it must be declared BEFORE the show get request
// ================
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new");
});


// ==========
//Show Route
// ==========
app.get("/campgrounds/:id", function(req, res){
    //Find campground with provided ID
    //Mongoose command --> Campground.FindById(id,callback)
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log("Error: " + err);
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});



// ==============================
//        COMMENTS ROUTES
// ==============================

app.get("/campgrounds/:id/comments/new",isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });

});

app.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
                
            });
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect campground show page
});
// ======================
// Authentication Routes
// ======================

// show register form
app.get("/register", function(req,res){
    res.render("register");
});
// signup logic
app.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campgrounds");
        });
    });
});

// show login form
app.get("/login", function(req, res){
    res.render("login");
});
// handling login logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});
// ==============
//Logout Route
// ==============
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server is started");
});
