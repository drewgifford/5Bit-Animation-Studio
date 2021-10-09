var Tool = {
    "pencil": 0,
    "eraser": 1,
    "fill": 3,
    "undo": 4,
    "redo": 5,
    "clear": 6
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

var tools = [false, false, true, true, false, false]

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

        this.color = [255,255,255];

        // Initialize data arrays
        this.data = [];

        for(var x = 0; x < this.width; x++){
            this.data[x] = [];

            for(var y = 0; y < this.height; y++){
                this.data[x][y] = [0,0,0];
            }
        }

        this.steps = [];
        this.redo_arr = [];
        this.frames = [];


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

            }



        })


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

            if (

                !count && JSON.stringify(this.steps[this.steps.length-1]) != 
                JSON.stringify([x,y,this.color,this.ctx.globalAlpha])

            ) this.steps.push([x,y,this.color,this.ctx.globalAlpha]);

        }

    }


}



var board = new Canvas(16, 16);

function filler(x, y, currentColor, debug){

    if (x >= 0 && x <= board.width && y >= 0 && y <= board.height){

        
        //console.log(board.data[x, y]);
        //console.log("CURRENT COLOR", currentColor);

        if(board.data[x][y] == currentColor){
            board.ctx.fillStyle = "#ffffff";
            board.color = [255, 255, 255];
            board.draw(x, y);

            if(debug > 2){
                return;
            }
            console.log("test")

            filler(x + 1, y, currentColor, debug+1);
            filler(x, y + 1, currentColor, debug+1);
            filler(x - 1, y, currentColor, debug+1);
            filler(x, y - 1, currentColor, debug+1);
        }

    }
}