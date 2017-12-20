function SketchEmptyMobile()
{
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name; 
    this.sketch.category = "mobile";
    
    this.setup = function()
    {
         
    };
    
    this.update = function()
    {
        //console.log("send a test message");
        //this.sketch.publish("/tag/position",{x:0,y:0,z:0});
    };
};

SketchManager.RegisterSketch(new SketchEmptyMobile());