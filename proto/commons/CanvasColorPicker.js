function CanvasColorPicker(width, height)
{
    this.width = width || 512;
    this.height = height || 512;
    this.canvas;
    this.canvasContext;

    this.setup = function()
    {

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.canvas.style.position = "absolute";
        document.body.appendChild(this.canvas);
        
        this.canvasContext = this.canvas.getContext("2d");

        var gradient = this.canvasContext.createLinearGradient(0, 0, this.width, 0);
        // Create color gradient
        gradient.addColorStop(0,    "rgb(255,   0,   0)");
        gradient.addColorStop(0.15, "rgb(255,   0, 255)");
        gradient.addColorStop(0.33, "rgb(0,     0, 255)");
        gradient.addColorStop(0.49, "rgb(0,   255, 255)");
        gradient.addColorStop(0.67, "rgb(0,   255,   0)");
        gradient.addColorStop(0.84, "rgb(255, 255,   0)");
        gradient.addColorStop(1,    "rgb(255,   0,   0)");
        // Apply gradient to canvas
        this.canvasContext.fillStyle = gradient;
        this.canvasContext.fillRect(0, 0, this.width, this.height);

        // Create semi transparent gradient (white -> trans. -> black)
        gradient = this.canvasContext.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
        gradient.addColorStop(1,   "rgba(0,     0,   0, 1)");
        // Apply gradient to canvas
        this.canvasContext.fillStyle = gradient;
        this.canvasContext.fillRect(0, 0, this.width, this.height);

    };

    this.getColor = function(x, y) {
        var newColor;
        var imageData = this.canvasContext.getImageData(x, y, 1, 1);
        var selectedColor = 'rgb(' + imageData.data[4] + ', ' + imageData.data[5] + ', ' + imageData.data[6] + ')'; 
        return selectedColor;
    };
};
