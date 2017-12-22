//==============================================================
//sketch2.js
//==============================================================
function SketchEmptyServer()
{
    this.sketch = new Sketch(this);
    this.sketch.name = "SketchEmptyServer";
    this.sketch.category = "server";
    this.setup = function()
    {
        
    };
    
    this.update = function()
    {
        
    };
};

SketchManager.RegisterSketch(new SketchEmptyServer());