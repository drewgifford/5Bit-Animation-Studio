class OverlayCanvas {

    constructor(width, height){
        this.canvas = document.querySelector("#overlayBoard");
        this.canvas.width = 10 * width;
        this.canvas.height = 10 * height;

        this.width = width;
        this.height = height;

        this.w = +this.canvas.width;
        this.h = +this.canvas.height;

        this.canvas.style.height = Math.floor((height / width) * this.canvas.clientWidth) + "px";

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.clearRect(0, 0, this.w, this.h);

        this.data = this.createNewData();
    }

    createNewData(){
        var data = [];

        for(var x = 0; x < this.width; x++){
            data[x] = [];

            for(var y = 0; y < this.height; y++){
                data[x][y] = [0,0,0,0];
            }
        }

        return data;
    }

    draw(x, y){

        if (x >= 0 && x < this.width && y >= 0 && y < this.height){

            this.color[3] = 255;

            this.data[x][y] = this.color;

            this.ctx.fillRect(
                Math.floor(x * (this.w / this.width)),
                Math.floor(y * (this.h / this.height)),
                Math.floor(this.w / this.width),
                Math.floor(this.h / this.height)
            );

        }

    }

    setData(data){
        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){

                this.data[x][y] = data[x][y];

                this.setColor(data[x][y]);
                
                this.draw(x,y);

            }
        }
    }

    clear(){
        for(var x = 0; x < this.width; x++){
            for(var y = 0; y < this.height; y++){

                this.data[x][y] = [0,0,0,0];

                this.setColor([0,0,0,255]);
                
                this.draw(x,y);

            }
        }
    }

    setColor(color){
        this.ctx.globalAlpha = 1;
        this.color = color;
        this.ctx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
    }

}