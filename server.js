var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var port = process.env.PORT || 3000;

var db = require("./models");
var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// NEED TO CHANGE THIS PART WHEN DEPLOYING TO HEROKU
mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });

// Routes

app.get("/", function(req, res) {
  db.Article.find({}).then(function(dbArticles){
    res.render("index", { dbArticles: dbArticles });
    console.log("dbArticles" + dbArticles);
  }).catch(function(err) {
    console.log(err);
  })
})

app.get("/scrape", function(req, res) {
  // CHANGE WEBSITE
  request("https://news.ycombinator.com/", function(error, response, html) {
    var $ = cheerio.load(html);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".title").each(function(i, element) {
      // Save an empty result object
      var result = {};
      console.log("result" + result);

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text("");
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    })
  })
    res.send("Scrape Complete");
  });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
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
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
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
