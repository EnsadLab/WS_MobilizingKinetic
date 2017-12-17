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



