//==============================================================
//sketch_persistence.js
//==============================================================
function SketchPersistence()
{
    this.sketch = new Sketch(this);

    this.sketch.name = "SketchPersistence";

    this.setup = function()
    { 
        //FIXME : use the pubsub encapsulation in this.sketch
        this.sketch.pubsub.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.pubsub.subscribe("/user/profile",this.onUserProfile.bind(this));
    };
    
    this.update = function()
    {

    };

    this.onTagPosition = function(params)
    {
        this.replaceKey("/tag/position", params);
    };

    this.onUserProfile = function(params)
    {
        this.appendKey("/user/profile", params);
    };


    //persistence features -----------
    this.replaceKey = function(key, val)
    {

    };

    this.appendKey = function(key, val)
    {

    };

};

SketchManager.RegisterSketch(new SketchPersistence());