/**
 * Created by mattdeveney on 11/28/16.
 */

var data;
var img_data;
var dataForPlatform;
var page = $("#content");
var nShows = 0;
var ratings = [];
// var ratedTitles = [];
// var ratedScores = [];


loadData();

function loadData() {

    $.ajax({
        url: "static/datasets/valid_games.txt",
        async: false,
        success: function (csvd) {
            data = $.csv.toObjects(csvd);
        },
        dataType: "text",
        complete: function () {
            // call a function on complete
            renderSelect();
        }
    });

    $.ajax({
        url:"static/datasets/img_links(full).txt",
        async:false,
        success: function(csvd) {
            img_data = $.csv.toObjects(csvd);
        },
        dataType: "text"

    });

}

function renderSelect() {

    var html = "";

    var instruction = "<h4 class='page-text'>First, select a platform:</h4>";

    html += instruction;

    var selectBox = "<select class='form-control' id='platform-select'><option value='xbox'>Xbox One</option><option value='ps4'>PlayStation 4</option><option value='pc'>PC</option></select>";

    html += selectBox;

    var continueButton = "<button id='continue-button1' class='btn btn-primary' onclick='filterData()'>Continue</button>";

    html += continueButton

    page.html(html);

}

function filterData () {

    var platform = $("#platform-select").val();

    dataForPlatform = data.filter(function(a){
        if (platform == 'xbox') {
            return a.platform == 'Xbox One';
        } else if (platform == 'ps4') {
            return a.platform == 'PlayStation 4';
        } else {
            return a.platform == 'PC';
        }
    });

    // if (platform == 'xbox') {
    //     imgDataForPlatform = img_data.slice(0,1037);
    // } else if (platform == 'ps4') {
    //     imgDataForPlatform = img_data.slice(1038,2354);
    // } else {
    //     imgDataForPlatform = img_data.slice(2355,4906);
    // }


    showGames();

}

function showGames () {

    if (nShows != 0) {

        pushRatings();

    }

    nShows += 1;

    var sortedScores = dataForPlatform.sort(function(a,b){
        return b.weighted_score - a.weighted_score;
    });

    var games = sortedScores.slice((nShows-1)*10,nShows*10+1);

    emptyPage();
    renderGameGrid();

    games.forEach(function(d,i){
        renderCell(d,i);
    });


}

function renderCell(game, i) {

    var cell = $("#cell" + i);

    var html = "";

    titleID = "title" + i

    var title = "<h5 id=" + titleID + " class='title'>" + game.title + "</h5>";

    html += title;

    var image_datum = img_data.filter(function(a){
        return (a.title == game.title);
    });

    var image;

    if (image_datum.length > 0) {

        var link = image_datum[0].link;

        image = "<img class='game-image' src=" + link + "></img>";

    } else {

        image = "<img class='game-image default' src='images/default_image.png'></img>";

    }


    html += image;

    var dropdown = "<select class='form-control rating' id=" + game.title.replace(/\s/g, '') + "><option value='0' selected='selected'>Not Played</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option><option value='6'>6</option><option value='7'>7</option><option value='8'>8</option><option value='9'>9</option><option value='10'>10</option></select>"

    html += dropdown;

    cell.html(html);


}

function renderGameGrid () {

    var html = "";

    var instruction = "<h4 class='page-text'>Now, if you've played any of these games, give them a rating:</h4>";

    html += instruction;

    var showMoreButton = "<button id='showMoreButton' class='btn btn-primary' onclick='showGames()'>Show More Games</button>";

    html +=  showMoreButton;

    var continueButton = "<button id='continue-button2' class='btn btn-primary' onclick='generateSuggestions()'>Continue</button>";

    html += continueButton;

    var gridRow1 = "<div class='row gamesShowed'><div class='col-md-1'></div><div class='col-md-2 cell' id='cell1'></div><div class='col-md-2 cell' id='cell2'></div><div class='col-md-2 cell' id='cell3'></div><div class='col-md-2 cell' id='cell4'></div><div class='col-md-2 cell' id='cell5'></div><div class='col-md-1'></div></div>";
    var gridRow2 = "<div class='row gamesShowed'><div class='col-md-1'></div><div class='col-md-2 cell' id='cell6'></div><div class='col-md-2 cell' id='cell7'></div><div class='col-md-2 cell' id='cell8'></div><div class='col-md-2 cell' id='cell9'></div><div class='col-md-2 cell' id='cell10'></div><div class='col-md-1'></div></div>";

    html += gridRow1;
    html += gridRow2;

    page.html(html);

}

function emptyPage () {
    page.empty();
}

function pushRatings() {

    for (var i = 0; i < 10; i++) {

        var cell = $("#cell" + (i+1));

        var select = cell.find($("select"))[0];

        var gameTitle = $("#title" + (i+1)).text();

        if (select.selectedIndex != 0) {

            ratings.push({"title" : gameTitle, "rating" : select.selectedIndex.toString()});

            /*ratedTitles.push(title);
            ratedScores.push(select.selectedIndex);
*/
        }

    }
}


function toggleDisplay() {

    $("#how-it-works").slideToggle("slow");

}


function runPyScript(ratings){

    console.log(ratings);

    $.ajax({
        type: 'POST',
        url: $SCRIPT_ROOT + '/suggestions',
        contentType: 'application/json',
        data: JSON.stringify(ratings),
        success: function (data) {
            console.log(data);
        }
    });

}




function generateSuggestions (){

    pushRatings();

    runPyScript(ratings);

    renderSuggestions();

}

function renderSuggestions() {

    emptyPage();

    html = "";

    var instruction = "<h4 class='page-text'>Here are the games you should try next!</h4>";

    var showMoreButton = "<button class='btn btn-primary' onclick='showGames()'>Show More Games</button>";

    var suggestionFeed = "<div class='row suggestion'><div class='col-md-2'></div><div class='col-md-2'></div><div class='col-md-2'></div></div>";

    html += instruction;
    html +=  showMoreButton;
    html += suggestionFeed;

    page.html(html);

}
