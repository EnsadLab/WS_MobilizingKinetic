//==============================================================
//sketch2.js
//==============================================================
function SketchEmptyServer()
{
    this.sketch = new Sketch({name:this.constructor.name,category:"server"}); 
    
    this.setup = function()
    {
        //put your server init here
    };
    
    this.update = function()
    {
        //put your server logic here
    };
};

SketchManager.RegisterSketch(new SketchEmptyServer());