var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;  //Am I using this here? from Ed's video
var request = require("request");
var cheerio = require("cheerio");

var port = process.env.PORT || 3000;

var db = require("./models");

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }, function(err){
  if (err) {
    console.log(err);
  }
  else {
    console.log("connected to mongoose");
  }

});


/////////// Routes

app.get("/", function(req, res) {
  db.Article.find({}).then(function(dbArticles){
    res.render("index", { dbArticles: dbArticles });
    console.log("dbArticles" + dbArticles);
  }).catch(function(err) {
    console.log(err);
  })
})

// $(document).on("click", "#scrape", function() {
app.get("/scrape", function(req, res) {

  request("https://www.nytimes.com/section/sports/football", function(error, response, html) {
    var $ = cheerio.load(html);
    console.log("html" + html);

    $("article.story").each(function(i, element) {
      var result = {};

      result.title = $(this)
          .find("h2.headline").text().trim();

      result.link = $(this)
          .find("a.story-link").attr("href");

      result.summary = $(this)
          .find("p.summary").text().trim();

      console.log(result);

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    })
  })
    res.send("Scrape Complete");
});
// });

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: ObjectId(req.params.id) }, 
                                        {$set: {note: dbNote._id }}, 
                                        { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(port, function(){
  console.log('Listening on PORT ' + port);
});
