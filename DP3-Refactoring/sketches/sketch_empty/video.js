//==============================================================
//SketchEmptyVideo.js
//==============================================================
function SketchEmptyVideo()
{
    //declare sketch
    this.sketch = new Sketch({name:this.constructor.name,category:"video"}); 

    var cubes = {};
    
    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");
        var R = EasyContext._renderer;
    }; 

    this.update = function()
    {
        //put your process in there
    };
};

SketchManager.RegisterSketch(new SketchEmptyVideo()); //register so the system is able to use this sketch