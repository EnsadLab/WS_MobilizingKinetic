var SketchManager = {};
SketchManager._sketches = [];

SketchManager.SetContext = function(context)
{
    SketchManager._context = context;
};

SketchManager.RegisterSketch = function(sketch)
{
    //how do we handle instantiation ?
    SketchManager._sketches.push(sketch); //FIXME
};   

SketchManager.GetSketches = function()
{
    return SketchManager._sketches;
};

SketchManager.SetSketchState = function(name, state)
{
    for (var s in SketchManager._sketches)
    {
        var sketch = SketchManager._sketches[s];
        if (sketch.sketch.name === name && sketch.sketch.enabled)
        {
            if (state === true)
            {
                sketch.sketch.on();
            }
            else
            {
                sketch.sketch.off();
            }
        }
    }

};




