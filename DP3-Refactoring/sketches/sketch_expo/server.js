//==============================================================
//sketch2.js
//==============================================================
function SketchExpoServer()
{
    this.sketch = new Sketch({name:this.constructor.name,category:"server"}); 
    
    this.setup = function()
    {
        
    };
    
    this.update = function()
    {
        
    };
};

SketchManager.RegisterSketch(new SketchExpoServer());