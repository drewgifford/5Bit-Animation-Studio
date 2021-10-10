

var Tool = {
    "pencil": 0,
    "eraser": 1,
    "fill": 2,
    "undo": 3,
    "redo": 4,
    "clear": 5
}

var colors = [
    [0, 0, 0], // black
    [0, 0, 170], //blue
    [0, 170, 0], //green
    [0, 170, 170], // cyan
    [170, 0, 0], // red
    [170, 0, 170], // magenta
    [170, 85, 0], // brown
    [170, 170, 170], // light gray
    [85, 85, 85], // dark gray
    [85, 85, 255], // light blue
    [85, 255, 85], // light green
    [85, 255, 255], // light cyan
    [255, 85, 85], // light red
    [255, 85, 255], // light magenta
    [255, 255, 85], // yellow
    [255, 255, 255] // white
]

var columnSize = 8;

var tools = [true, false, false, false, false, false]

function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}

$(".tools .item").click(function(){

    var id = $(this).attr("id");
    var toolId = parseInt(id.split("-")[1]);

    if(toolId > 2){
        if (toolId == 3){
            board.undo();
        }
        if (toolId == 4){
            board.redo();
        }
        if (toolId == 5){
            board.clear();
            board.newStep();
        }
        return;
    }

    

    board.setTool(parseInt(toolId));

    $(".tools .item").removeClass("active");
    $(this).addClass("active");

});

document.onkeydown = checkForKeyboardShortcuts;

function checkForKeyboardShortcuts(e){
    var evtObj = window.event ? event : e;
    if (evtObj.keyCode == 90 && evtObj.ctrlKey) {

        if (evtObj.shiftKey) {
            board.redo();
        } else {
            board.undo();
        }

    }
}

colors.forEach(color => {
    var id = colors.indexOf(color);

    var colorString = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    $("#colors").append(`<div class='color' id='color-${id}'></div>`);

    var elem = $(`#color-${id}`);
    elem.css("background-color", colorString);

    if(id >= columnSize){
        elem.addClass('color-right');
    }
    color.push(255);

    elem.on("click", function(e){
        board.setColor(color);
        $("#colors .color").removeClass("active");
        elem.addClass("active");
    });

});

var overlayBoard = new OverlayCanvas(32, 32);
var board = new Canvas(32, 32, overlayBoard);


function filler(x, y, currentColor, debug){

    if (x >= 0 && x < board.width && y >= 0 && y < board.height){

        if(arraysEqual(board.getCurrentFrameData()[x][y], currentColor)){
            board.draw(x, y);


            filler(x + 1, y, currentColor, debug+1);
            filler(x, y + 1, currentColor, debug+1);
            filler(x - 1, y, currentColor, debug+1);
            filler(x, y - 1, currentColor, debug+1);
        }

    }
}

//Default configuration

$("#increase").click(function(){
    board.nextFrame();
});
$("#decrease").click(function(){
    board.prevFrame();
});
$("#newFrame").click(function(){
    board.createFrame();
});

$("#color-15").addClass("active");
board.setColor([255,255,255,255]);

$("#showOverlay").change(function(){
    if(this.checked){
        $("#overlayBoard").css("display","block");
    } else {
        $("#overlayBoard").css("display","none");
    }
});

var playTask = null;

$("#timing").change(function(){
    timing = $(this).val();
});

$("#play").click(function(){
    if(playTask == null){
        playTask = setInterval(function(){
            board.nextFrame();
        }, timing);
    }
});
$("#pause").click(function(){
    if(playTask != null){
        clearInterval(playTask);
        playTask = null;
    }
});
$("#stop").click(function(){
    if(playTask != null){
        clearInterval(playTask);
        playTask = null;
    }
    board.setFrame(0);
});
$("#deleteFrame").click(function(){
    board.removeFrame();
});
