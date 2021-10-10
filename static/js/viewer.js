var columnSize = 8;

var tools = [false, false, false, false, false, false]

function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}
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

var overlayBoard = new OverlayCanvas(32, 32);
var board = new Canvas(32, 32, overlayBoard);

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

var playTask = null;

$("#play").click(function(){
    if(playTask == null){
        playTask = setInterval(function(){
            board.nextFrame();
        }, 100);
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