//==============================================================
//sketch2.js
//==============================================================
function SketchExpoServer()
{
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "server";
    this.setup = function()
    {
        
    };
    
    this.update = function()
    {
        
    };
};

SketchManager.RegisterSketch(new SketchExpoServer());