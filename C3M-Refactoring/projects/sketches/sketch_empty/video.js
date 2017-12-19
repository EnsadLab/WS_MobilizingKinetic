//==============================================================
//SketchEmptyVideo.js
//==============================================================
function SketchEmptyVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = "SketchEmptyVideo";
    this.sketch.category = "video";
    
    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log("SketchEmptyVideo setup ");
        
        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        
        var R = EasyContext._renderer;
        
        //color cubes scene
        for (var x = -10; x <= 10; x += 1) {
            for (var y = -10; y <= 10; y += 1) {
                //the default cube has a size of 100 units (for now), and then the scale is applied
                var c = new Mobilizing.Mesh({ primitive: "cube" });
                c.material.setColor(Mobilizing.Color.random());
                c.transform.setLocalPosition((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random()- 0.5) * 1000); //set the position in space
                c.transform.setLocalScale(20); //set scale
                c.transform.setLocalEulerAngles(Math.random() * 360, Math.random() * 360, Math.random() * 360);
                this.sketch.root.transform.addChild(c.transform);
            }
        }

    };
    
    this.update = function()
    {
        //put your process in there
    };

    //add your callbacks below
    this.onTagPosition = function(params)
    {
       console.log("tag position received ", params);
        //do something based on the tag position received
        //params.id
        //params.x
        //params.y
        //params.z

        //create and move a cube
    };
};

SketchManager.RegisterSketch(new SketchEmptyVideo()); //register so the system is able to use this sketch