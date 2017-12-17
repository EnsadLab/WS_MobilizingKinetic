//==============================================================
//sketch2.js
//==============================================================
function sketch2()
{
    this.sketch = new Sketch(this);
    this.sketch.name = "sketch2";
    this.sketch.category = "mobile";
    this.setup = function()
    {
        var sphere = EasyContext.CreateSphere();
        sphere.material.setWireframe(true);  
    };
    
    this.update = function()
    {
    };
};

SketchManager.RegisterSketch(new sketch2());