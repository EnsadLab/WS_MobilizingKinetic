//==============================================================
//sketch1.js : example sketch
//==============================================================
function sketch1()
{
    this.sketch = new Sketch(this);
    this.sketch.name = "sketch1";
    this.sketch.category = "mobile";

    this.setup = function()
    {
        var cube = EasyContext.CreateCube(); //handle parent
        cube.material.setWireframe(true); 
        //pubsub connections
        //this.sketch.pubsub.publish("/sketch1/setup");
        //this.sketch.pubsub.subscribe("/tag/position",this.onTagPosition.bind(this));

        //publish categories

    };
    
    this.update = function()
    {

    };

    this.onTagPosition = function(params)
    {
       
        //do something based on the tag position received
        //params.id
        //params.x
        //params.y
        //params.z
    };
};

SketchManager.RegisterSketch(new sketch1());

