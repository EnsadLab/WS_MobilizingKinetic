function SketchLightsVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var clients = {};
    var worldSize = {width: 150, height: 60, depth: 80};//in meters
    
    var R;
    var gaite;
    
    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
       
        R = EasyContext._renderer;
       
        var loader = new Mobilizing.Loader();
        loader.loadOBJ({url: "../3d/gaite.obj", onLoad: this.gaiteLoaded.bind(this) });
        loader.consumeAll();
        console.log("loading",loader);
    };
    
    this.gaiteLoaded = function(model){
        gaite = model;
        this.sketch.root.transform.addChild(gaite.transform);
        console.log("model loaded", gaite);
    }

    this.update = function()
    {
        //put your process in there
    };

    //add your callbacks below
    this.onTagPosition = function(params)
    {
        //console.log("tag position received ", params);
        //do something based on the tag position received
        //params.id
        //params.x
        //params.y
        //params.z

        //create and move a cube
    };

    this.onConnect = function(id)
    {
        // create a shape for the new connected client
        clients[id] = new UserLine(worldSize.width, worldSize.depth);
        clients[id].setPlaneVisible(true);
        clients[id].setLineAlwaysVisible(true);
        clients[id].transform.setLocalPositionY(170);
        
        this.sketch.root.transform.addChild(clients[id].transform);
        console.log("added client", id, this.sketch.root.getBoundingBox() ) ;

    };

    this.onClientRotation = function(data)
    {
        var id = data.id;
        var rot = new Mobilizing.Quaternion().fromArray(data.rot);

        if(!(id in clients)){
            if(id){
                this.onConnect(id);
            }else{
                return;
            }
        }

        // update the client's cube position
        clients[id].transform.setLocalQuaternion(rot);
    };

};

SketchManager.RegisterSketch(new SketchLightsVideo()); //register so the system is able to use this sketch