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

var tools = [false, false, true, false, false, false]

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

        this.ctx.fillStyle = "black";

        this.ctx.globalAlpha = 1;

        this.ctx.fillRect(0,0, this.w, this.h);

        // Initialize data arrays
        this.data = [...Array(this.width)].map(e => Array(this.height).fill([0,0,0]));

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

                filler(x, y, this.data[x][y]);

            }



        })


    }


}



var board = new Canvas(16, 16);

function filler(x, y, cc){
    if (x >= 0 && board.width && y >= 0 && y <= board.height){

        if(JSON.stringify(board.data[x][y]) == JSON.stringify(cc) && JSON.stringify(board.data[x][y]) != JSON.stringify(board.color)){
            board.draw(x, y);

            filler(x + 1, y, cc);
            filler(x, y + 1, cc);
            filler(x - 1, y, cc);
            filler(x, y - 1, cc);
        }

    }
}