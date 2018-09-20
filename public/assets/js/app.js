    $.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
        
        var dataId="<p data-id='" + data[i]._id + "'>";
        var articleTitle = "<h4>" + data[i].title + "</h4>";
        var articleSummary = "<p>" + data[i].summary + "</p>";
        var commentBtn = "<button class='btn btn-outline-success' data-toggle='modal' data-target='#noteModal' id='addComment' type='submit'>Add Comment</button>";
        var articleLink = "<a href='" + data[i].link + "'>" + "<p>" + data[i].link; + "</p></a>";
        var noteDiv = "<div id='notes'></div>";

        var articleInfo = dataId + articleTitle + articleSummary + commentBtn + articleLink + noteDiv + "<hr>";
        $("#articles").append(articleInfo);
    }
  });

  $('#noteModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
  })

  $(document).on("click", "#addComment", function() {

    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })

      .then(function(data) {
        console.log(data);

        if (data.note) {
          $("#notes").append("<p>" + data.note.title + "<br>" + data.note.body + "</p>");
        }
      });
  });
  
  $(document).on("click", "#savenote", function() {

    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
    
      .then(function(data) {
        console.log(data);
        $("#notes").append(data.note.title + data.note.body);
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    // $("#titleinput").val("");
    // $("#bodyinput").val("");
  });
  