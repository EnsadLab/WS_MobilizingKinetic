function SketchLightsVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var clients = {};
    var worldSize = {width: 150, height: 60, depth: 80};//in meters

    var R;

    var gaiteModel;
    var gaiteModelGhost;

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

        R.setFog("exp");
        R.setFogDensity(.001);

    };

    this.gaiteLoaded = function(model){

        gaiteModelGhost = model;
        var mat = new Mobilizing.Material({type:"phong"});
        gaiteModelGhost.setMaterial(mat);
        gaiteModelGhost.material.setTransparent(true);
        gaiteModelGhost.material.setOpacity(.5);
        gaiteModelGhost.material.setShading("flat");
        gaiteModelGhost.material.setShininess(0);
        gaiteModelGhost.material.setDepthWrite(false);

        gaiteModelGhost.transform.setLocalScale(100);
        gaiteModelGhost.transform.setLocalRotationY(-90);

        gaiteModel = new Mobilizing.EdgesMesh({mesh: gaiteModelGhost});
        gaiteModel.transform.setLocalScale(100);
        gaiteModel.transform.setLocalRotationY(-90);

        this.sketch.root.transform.addChild(gaiteModelGhost.transform);
        this.sketch.root.transform.addChild(gaiteModel.transform);

        console.log("model loaded", model);
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

        var light = new Mobilizing.Light({type:"spot"});
        light.transform.setLocalPosition(0,0,0);
        light.setTargetPosition(light.transform.getLocalPosition().x, light.transform.getLocalPosition().y, -100);
        light.setIntensity(.5);
        light.setPenumbra(.5);
        light.setAngle(Math.PI/10);
        
        clients[id].spot = light;
        clients[id].transform.addChild(light.transform);

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
        
        var up = getDirectionsFromQuaternion(rot);
        clients[id].spotsetTargetPosition(up.x, up.y, up.z);
    };

};

SketchManager.RegisterSketch(new SketchLightsVideo()); //register so the system is able to use this sketch