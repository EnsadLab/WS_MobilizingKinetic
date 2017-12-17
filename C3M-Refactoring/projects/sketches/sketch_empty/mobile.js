//==============================================================
//sketch2.js
//==============================================================
function SketchEmptyMobile()
{
    this.sketch = new Sketch(this);
    this.sketch.name = "SketchEmptyMobile";
    this.sketch.category = "mobile";
    this.setup = function()
    {
        //create your mobile scene here
        //var sphere = EasyContext.CreateSphere();
        //sphere.material.setWireframe(true);  
    };
    
    this.update = function()
    {
    };
};

SketchManager.RegisterSketch(new SketchEmptyMobile());