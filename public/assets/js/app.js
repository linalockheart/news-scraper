    $.getJSON("/articles", function(data) {

    for (var i = 0; i < data.length; i++) {
        
        var dataId="<p data-id='" + data[i]._id + "'>";
        var articleTitle = "<h4>" + data[i].title + "</h4>";
        var articleSummary = "<p>" + data[i].summary + "</p>";
        var commentBtn = "<button class='btn btn-outline-success' data-id='" + data[i]._id + "' data-toggle='modal' data-target='#noteModal' id='addComment' type='submit'>Add Comment</button>";
        var articleLink = "<a href='" + data[i].link + "'>" + "<p>" + data[i].link; + "</a></p>";
        var note = "";
        if ('note' in data[i]) {
          note = data[i].note.title + "<br>" + data[i].note.body;
        }
        var noteDiv = "<div id='notes'><p>Comments:<br>" + note + "</p></div>";

        var articleInfo = dataId + articleTitle + articleSummary + commentBtn + noteDiv + articleLink + "<hr>";
        $("#articles").append(articleInfo);
    }
  });

  $('#noteModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
  })

  $(document).on("click", "#addComment", function() {
     
    $("#savenote").attr("data-id", $(this).attr("data-id"))
    var thisId = $(this).attr("data-id");
    console.log(thisId)
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
      
        window.location.reload(true);
        // console.log(data);
        // $("#notes").append(data.note.title + data.note.body);
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    // $("#titleinput").val("");
    // $("#bodyinput").val("");
  });
  