function SketchGaiteVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var clients = {};
    var worldSize = {width: 15, height: 60, depth: 8};//in meters

    var R;

    var gaite;
    var gaiteModel;
    var gaiteModelGhost;
    
    var startQuaternion;
    var startPosition;

    this.state = "released"; //model is pressed or released

    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
        this.sketch.subscribe('/mobile/pressed', this.onClientPressed.bind(this));
        this.sketch.subscribe('/mobile/released', this.onClientReleased.bind(this));

        R = EasyContext._renderer;

        var loader = new Mobilizing.Loader();
        loader.loadOBJ({url: "../3d/gaite.obj", onLoad: this.gaiteLoaded.bind(this) });
        loader.consumeAll();

        R.setFog("exp");
        R.setFogDensity(.001);
        
        startQuaternion = new Mobilizing.Quaternion();
        startPosition = new Mobilizing.Vector3();
    };

    this.gaiteLoaded = function(model){

        gaite = new Mobilizing.Mesh({primitive: "ndoe"});

        gaiteModelGhost = model;
        var mat = new Mobilizing.Material({type:"phong"});
        gaiteModelGhost.setMaterial(mat);
        gaiteModelGhost.material.setTransparent(true);
        gaiteModelGhost.material.setOpacity(.2);
        gaiteModelGhost.material.setShading("flat");
        gaiteModelGhost.material.setShininess(0);
        gaiteModelGhost.material.setDepthWrite(false);

        gaiteModelGhost.setScale(100);
        gaiteModelGhost.setRotationY(-90);
        gaiteModelGhost.setTranslation(0,0,-100);

        gaiteModel = new Mobilizing.EdgesMesh({mesh: gaiteModelGhost});

        gaite.transform.addChild(gaiteModelGhost.transform);
        gaite.transform.addChild(gaiteModel.transform);
        
        /*gaite.transform.setLocalScale(100);
        gaite.transform.setLocalRotationY(-90);
        gaite.transform.setLocalPositionZ(-100);*/

        this.sketch.root.transform.addChild(gaite.transform);

        console.log("model loaded", model);
    }

    this.update = function()
    {
        //put your process in there
        if(this.state === "released" && gaite){
            //back to 0 
            var q = gaite.transform.getLocalQuaternion().slerp(startQuaternion, .01);
            gaite.transform.setLocalQuaternion(q);
            
            var p = gaite.transform.getLocalPosition().lerp(startPosition, .01);
            gaite.transform.setLocalPosition(p);
        }
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

        for(var i in clients){

            if(clients[i].tagID === Number(params.id)){

                var pos = new Mobilizing.Vector3(params.x*100, params.z*100, params.y*-100);
                //clients[i].transform.setLocalPosition(pos);
                //console.log(clients[i].transform.getLocalPosition());
                gaite.transform.setLocalPosition(pos);
            }

        }
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
        light.setIntensity(10);
        light.setPenumbra(.5);
        light.setAngle(Math.PI/10);

        clients[id].spot = light;
        clients[id].transform.addChild(light.transform);

        this.sketch.root.transform.addChild(clients[id].transform);
        console.log("added client", id, this.sketch.root.getBoundingBox() ) ;

    };

    this.onClientPressed = function(data){

        if(this.state === "released"){
            this.id = data.id;
            this.state = "pressed";
        }

    }

    this.onClientReleased = function(data){

        var id = data.id;

        if(id === this.id){
            this.state = "released";
            this.id = undefined;
        }

    }

    this.onClientRotation = function(data)
    {
        var id = data.id;

        if(this.id === id && this.state === "pressed"){

            var rot = new Mobilizing.Quaternion().fromArray(data.rot);

            if(!(id in clients)){
                if(id){
                    this.onConnect(id);
                }else{
                    return;
                }
            }
            var q = gaite.transform.getLocalQuaternion().slerp(rot, .5);
            gaite.transform.setLocalQuaternion(q);
        }
    };

};

SketchManager.RegisterSketch(new SketchGaiteVideo()); //register so the system is able to use this sketch