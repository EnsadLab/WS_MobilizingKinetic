//==============================================================
//SketchEmptyVideo.js
//==============================================================
function SketchEmptyVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var cubes = {};
    
    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));

        var R = EasyContext._renderer;

    }; 

    this.update = function()
    {
        //put your process in there
    };

    this.onTagPosition = function(params)
    {
        //we update the tag cube
        var cube = cubes[params.id];
        if (cube === undefined)
        {
            cube = new Mobilizing.Mesh({ primitive: "cube" });
            cube.material.setColor(Mobilizing.Color.random());
            cube.transform.setLocalScale(20); //set scale
            this.sketch.root.transform.addChild(cube.transform);
            cubes[params.id] = cube;
        }

        //we have to invert y and z
        //we could use an animation to smooth out the positions
        cube.transform.setLocalPosition(params.x*-100, params.z*100, params.y*100); 
        //console.log("tag position received ", params);
    };
};

SketchManager.RegisterSketch(new SketchEmptyVideo()); //register so the system is able to use this sketch