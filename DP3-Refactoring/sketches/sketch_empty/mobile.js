function SketchEmptyMobile()
{
    this.sketch = new Sketch({name:this.constructor.name,category:"mobile"}); 
    
    this.setup = function()
    {
         //put your mobile init here
    };
    
    this.update = function()
    {
        //put your mobile logic here
    };
};

SketchManager.RegisterSketch(new SketchEmptyMobile());