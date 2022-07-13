const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// const User = require("./app/models/user")

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "",
  resave: false,
  saveUninitialized: false
}));

//initialize
app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
mongoose.connect("mongodb://localhost:27017/blogDB");


//define schema for collection, which named User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true
  },
  email:{
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

//serialize & deserialize

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Another data collections for store post

const postSchema = new mongoose.Schema({
  username:{
    type: String,
    require: true
  },
  postTitle: Array,
  postContent: Array
})

const Post = new mongoose.model("Post", postSchema);





app.get("/", function(req, res){
  res.render("front");
})

app.get("/register", function(req, res){
  res.render("register");
})

app.get("/login", function(req, res){
  res.render('login');
})


//home page
app.get("/home", function(req, res){
  if (req.isAuthenticated()){
    res.render("home");
  } else {
    res.redirect("/login")
  }
})

//compose
app.get("/compose", function(req, res){
  if (req.isAuthenticated()){
    res.render("compose");
  } else {
    res.redirect("/login");
  }
})




//logout
app.get("/logout", function(req ,res){
  req.logout();
  res.redirect("/");
})


//register
app.post("/register", function(req, res){

  User.register({username: req.body.username, email:req.body.email}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      })
    }
  })
})

//login
app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      })
    }
  })
})

//compose
app.post("/compose", function(req, res){

  console.log(req.session.user);

  // User.findOne({_id: req.body._id}, function(err, foundUser){
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(foundUser);
  //   }
  // })

  // const post = new Post({
  //   title: req.body.postTitle,
  //   content: req.body.postContent
  // })


})





app.listen(3000, function(){
  console.log("Server on port 3000!");
})
