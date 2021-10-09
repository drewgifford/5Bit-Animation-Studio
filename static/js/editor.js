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

var tools = [true, false, false, false, false, false]

class Canvas {

    constructor(width, height){

        this.canvas = document.querySelector("#board");
        this.canvas.width = 10 * width;
        this.canvas.height = 10 * height;

        this.width = width;
        this.height = height;

        this.w = +this.canvas.width;
        this.h = +this.canvas.height

        this.canvas.style.height = Math.floor((height / width) * this.canvas.clientWidth) + "px";

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.fillStyle = "black";

        this.ctx.globalAlpha = 1;

        this.ctx.fillRect(0,0, this.w, this.h);

        this.color = [0,0,0,255];

        this.setColor([255,255,0,255]);

        // Initialize data arrays
        this.resetData();

        this.steps = [];
        this.redo_arr = [];
        this.frames = [];

        this.newStep();


        // EVENT LISTENERS
        this.canvas.addEventListener("click", e => {
            // On clicking the canvas...
            var rect = this.canvas.getBoundingClientRect();

            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            x = Math.floor(this.height * x / this.canvas.clientWidth);
            y = Math.floor(this.height * y / this.canvas.clientHeight);


            if (tools[Tool.fill]){
                console.log("INITIAL COLOR", this.data[x][y]);
                filler(x, y, this.data[x][y], 0);

                this.newStep();

            }
            else if(tools[Tool.pencil]){
                this.draw(x,y);
            }
            else if(tools[Tool.eraser]){
                this.erase(x,y);
            }



        });

        // Check if mouse cursor is down
        this.active = false;

        this.canvas.addEventListener("mousedown", e => {
            this.active = true;
        });
        document.addEventListener("mouseup", e => {

            if(this.active){
                if(tools[Tool.pencil] || tools[Tool.eraser]){
                    this.newStep();
                }
            }

            this.active = false;
        });

        // Check for mouse dragging

        this.canvas.addEventListener("mousemove", e => {
            this.dragDraw(e);
        });
        this.canvas.addEventListener("touchmove", e => {
            this.dragDraw(e);
        });



    }

    newStep(){
        var newStep = [];

        for(var x = 0; x < this.width; x++){
            newStep[x] = [];
            for(var y = 0; y < this.height; y++){
                newStep[x][y] = this.data[x][y];
            }
        }
        this.steps.push(newStep);
    }

    resetData(){
        this.data = [];

        for(var x = 0; x < this.width; x++){
            this.data[x] = [];

            for(var y = 0; y < this.height; y++){
                this.data[x][y] = [0,0,0,255];
            }
        }
    }

    undo(){
        if(this.steps.length <= 1){ return; }

        var color = this.color;
        var gph = this.globalAlpha;

        // Clear the board
        this.clear();

        // 

        var undoneStep = this.steps.pop();

        this.redo_arr.push(undoneStep);

        var step = this.steps[this.steps.length-1];

        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                    
                this.setColor(step[x][y]);
                this.globalAlpha = step[x][y][3];
                this.draw(x,y);

            }
        }

        this.setColor(color);
        this.globalAlpha = gph;
    }

    redo(){

        if(this.redo_arr.length < 1){ return; }

        var color = this.color;
        var gph = this.globalAlpha;

        // Clear the board
        var redoneStep = this.redo_arr.pop();

        this.steps.push(redoneStep);

        var step = redoneStep;

        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                    
                this.setColor(step[x][y]);
                this.globalAlpha = step[x][y][3];
                this.draw(x,y);

            }
        }

        this.setColor(color);
        this.globalAlpha = gph;
    }

    dragDraw(e){
        if(this.active){

            var rect = this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            x = Math.floor(this.width * x / this.canvas.clientWidth);
            y = Math.floor(this.height * y / this.canvas.clientHeight);

            if(tools[Tool.pencil]){
                this.draw(x, y);
            }
            else if (tools[Tool.eraser]){
                this.erase(x,y);
            }

        }
    }

    draw(x, y, count){

        if (x >= 0 && x < this.width && y >= 0 && y < this.height){

            this.data[x][y] = this.color;

            this.ctx.fillRect(
                Math.floor(x * (this.w / this.width)),
                Math.floor(y * (this.h / this.height)),
                Math.floor(this.w / this.width),
                Math.floor(this.h / this.height)
            );

        }

    }

    erase(x, y){
        var temp = this.color;
        var tga = this.ctx.globalAlpha;
        this.setColor([0,0,0,255]);
        this.draw(x, y);
        this.setColor(temp);
        this.ctx.globalAlpha = tga;
    }

    setColor(color){
        this.ctx.globalAlpha = 1;
        this.color = color;
        this.ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
    }

    setTool(i){
        tools = [false, false, false, false, false, false];
        tools[i] = true;
        //TODO: update UI
    }

    clear(){
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.resetData();

        this.setColor(this.color);
    }


}



var board = new Canvas(32, 32);

function filler(x, y, currentColor, debug){

    if (x >= 0 && x < board.width && y >= 0 && y < board.height){

        if(arraysEqual(board.data[x][y], currentColor)){
            board.draw(x, y);


            filler(x + 1, y, currentColor, debug+1);
            filler(x, y + 1, currentColor, debug+1);
            filler(x - 1, y, currentColor, debug+1);
            filler(x, y - 1, currentColor, debug+1);
        }

    }
}

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
        }
        return;
    }

    

    board.setTool(parseInt(toolId));

    $(".tools .item").removeClass("active");
    $(this).addClass("active");

});