//Node Modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// const User = require("./app/models/user")

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "little secret",
  resave: false,
  saveUninitialized: false
}));

//initialize
app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
mongoose.connect("mongodb://localhost:27017/blogDB");


//define schema for User
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

//define User
const User = new mongoose.model("User", userSchema);

//serialize & deserialize

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//define schema for Post
const postSchema = new mongoose.Schema({
  username:{
    type: String,
    require: true
  },
  title: String,
  content: String
})

//define Post
const Post = new mongoose.model("Post", postSchema);


//root page and front page
app.get(["/",'/front'], function(req, res){
  res.render("front");
})


//register
app.get("/register", function(req, res){
  res.render("register");
})


//login
app.get("/login", function(req, res){
  res.render('login');
})


//home page
app.get("/home", function(req, res){
  if (req.isAuthenticated()){

    Post.find({}, function(err, posts){
      if (err) {
        console.log(err);
      } else {
        res.render("home", {
          posts: posts
        });
      }}
    )
  } else {
    res.redirect("/login")
  }
});


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
  req.logout(function(err){
    if (err) {
      console.log(err);
    } else {
      req.session.username = "";
      res.redirect("/");
    }
  });
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
      res.redirect("/front");
    } else {
      passport.authenticate("local")(req, res, function(){
        req.session.username = req.user.username;
        res.redirect("/home")
      })
    }
  })
})


//compose
app.post("/compose", function(req, res){

  const post = new Post({
    username: req.user.username,
    title: req.body.postTitle,
    content: req.body.postContent
  })

  post.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/home");
    }
  });
});


//postid
app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId.trim()}, function(err, post){
    if (err) {
      console.log(err);
    } if (!post) {
      console.log("No post found");
    } else{
      res.render("post", {
        username: post.username,
        title: post.title,
        content: post.content
      });
    }
  });
});



//port
app.listen(3000, function(){
  console.log("Server on port 3000!");
});
