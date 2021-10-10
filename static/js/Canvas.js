class Canvas {

    constructor(width, height, overlayBoard){

        this.canvas = document.querySelector("#board");
        this.canvas.width = 10 * width;
        this.canvas.height = 10 * height;

        this.overlayBoard = overlayBoard;
        this.overlayVisible = false;

        this.width = width;
        this.height = height;

        this.name = "Untitled Project";
        this.author = "Unknown Author";
        this.created = Date.now();

        this.w = +this.canvas.width;
        this.h = +this.canvas.height

        console.log("W", this.w);
        console.log("width", this.width);

        this.canvas.style.height = Math.floor((height / width) * this.canvas.clientWidth) + "px";

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.fillStyle = "black";

        this.ctx.globalAlpha = 1;

        this.ctx.fillRect(0,0, this.w, this.h);

        this.color = [0,0,0,0];

        // Initialize data arrays

        this.steps = [[]];
        this.redo_arrs = [[]];
        this.frames = [];

        

        // Frame configuration
        this.frames = [];

        this.frames[0] = this.createNewData();

        this.currentFrame = 0;
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
                console.log("INITIAL COLOR", this.frames[this.currentFrame][x][y]);
                filler(x, y, this.frames[this.currentFrame][x][y], 0);

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

    getCurrentFrameData(){
        return this.frames[this.currentFrame];
    }

    nextFrame(){
        if(this.currentFrame >= this.frames.length-1){
            this.setFrame(0);
            return;
        }
        this.setFrame(this.currentFrame+1);
    }
    prevFrame(){
        if(this.currentFrame <= 0){ 
            this.setFrame(this.frames.length-1);
            return;
        }
        this.setFrame(this.currentFrame-1);
    }

    getJson(){
        var obj = {
            name: this.name,
            author: this.author,
            frames: this.frames
        }
        return obj;
    }

    createFrame(){
        this.addFrame(this.frames.length-1);
        this.setFrame(this.frames.length-1);
        this.newStep();
    }

    addFrame(prevIndex){

        var newData = this.createNewData();

        console.log("ADDED NEWDATA", newData);

        this.frames.push(newData);
        this.redo_arrs.push([]);
        this.steps.push([]);


        console.log("Pushed to frames");

    }

    removeFrame(){
        if(this.frames.length == 1) return;
        
        this.frames.splice(this.currentFrame, 1);
        this.redo_arrs.splice(this.currentFrame, 1);
        this.steps.splice(this.currentFrame, 1);

        if(this.currentFrame > this.frames.length-1){
            this.currentFrame = 0;
        }
        this.setFrame(this.currentFrame);
    }

    setFrame(index){
        var temp = this.color;
        this.currentFrame = index;
        this.setData(this.frames[index]);

        $("#frame").val(this.currentFrame+1);

        this.setColor(temp);
        if(index > 0){
            var prev = this.frames[index-1];
            this.overlayBoard.setData(prev);
        }
    }

    newStep(){
        var newStep = [];

        for(var x = 0; x < this.width; x++){
            newStep[x] = [];
            for(var y = 0; y < this.height; y++){
                var data = this.getCurrentFrameData();

                newStep[x][y] = data[x][y];
            }
        }
        var steps_arr = this.steps[this.currentFrame];

        steps_arr[steps_arr.length] = newStep;
    }

    createNewData(){
        var data = [];

        for(var x = 0; x < this.width; x++){
            data[x] = [];

            for(var y = 0; y < this.height; y++){
                data[x][y] = [0,0,0,255];
            }
        }

        return data;
    }

    undo(){
        var steps_arr = this.steps[this.currentFrame];

        if(steps_arr.length <= 1){ return; }

        var color = this.color;
        var gph = this.globalAlpha;

        this.clear();

        var undoneStep = steps_arr.pop();

        this.redo_arrs[this.currentFrame].push(undoneStep);

        var step = steps_arr[steps_arr.length-1];

        console.log("STEP DATA", step[0][0]);

        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                    
                this.setColor(step[x][y]);
                this.globalAlpha = step[x][y][3];
                this.draw(x, y, true);

            }
        }

        this.setColor(color);
        this.globalAlpha = gph;
    }

    setData(data){
        console.log("Looping through X");
        for(var x = 0; x < this.width; x++){
            console.log("X:",x);
            for(var y = 0; y < this.height; y++){
                this.frames[this.currentFrame][x][y] = data[x][y];

                this.setColor(data[x][y]);
                
                this.draw(x,y);
                
            }
        }
    }

    redo(){

        if(this.redo_arrs[this.currentFrame].length < 1){ return; }

        var color = this.color;
        var gph = this.globalAlpha;

        // Clear the board
        this.clear();

        var redoneStep = this.redo_arrs[this.currentFrame].pop();

        this.steps[this.currentFrame].push(redoneStep);

        var step = redoneStep;

        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){
                    
                this.setColor(step[x][y]);
                this.globalAlpha = step[x][y][3];
                this.draw(x, y, true);

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

    draw(x, y, noWrite){

        // 1
        

        if (x >= 0 && x < this.width && y >= 0 && y < this.height){

            this.getCurrentFrameData()[x][y] = this.color;

            var x1 = (x / this.width) * this.w;
            var y1 = (y / this.height) * this.h;

            var w = (this.w/this.width);
            var h = (this.h/this.height);

            this.ctx.fillRect(
                x1, y1, w, h
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
        this.frames[this.currentFrame] = this.createNewData();

        this.setColor(this.color);

        if(this.frames.length == 1){
            this.overlayBoard.clear()
        }
    }

    cloneData(data){

        var newData = [];

        for(var x = 0; x < this.width; x++){
            
            newData[x] = [];

            for(var y = 0; y < this.height; y++){
                newData[x][y] = data[x][y];
            }

        }

        return newData;
    }

    convertToGif(){
        
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/boardToImage',
            data: JSON.stringify(this.frames)
        });

    }


}