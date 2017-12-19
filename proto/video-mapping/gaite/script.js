function script()
{
    var M;
    var R;

    var cam;
    var light;


    var touch;
    var mouse;
    var pointer;

    var keyboard;

    var clients = {};

    var pubsub;

    var world;
    var worldSize = {width: 15, height: 6, depth: 8};//in meters

    var canvas;
    var canvasContext;

    var pointsOfIntersection = [];

    var gaiteModel;
    var gaiteModelGhost;
    var room; 
    var roomTexture;

    var soloMode = false;
    var debugDisc;

    var printLog = false;

    this.preLoad = function(loader)
    {
        //get external scripts
        loader.loadScript({url:"../commons/CanvasPlane.js",
                           onLoad : function(script){console.log("loaded", script)}});

        //loader.loadOBJ({url:"../models/salleBox.obj", onLoad: this.loadedRoom.bind(this)});

        loader.loadOBJ({url:"../models/gaite.obj", onLoad: this.loadedGL.bind(this)});

    }

    this.loadedGL = function(model){

        gaiteModelGhost = model;
        var mat = new Mobilizing.Material({type:"phong"});
        gaiteModelGhost.setMaterial(mat);
        gaiteModelGhost.material.setTransparent(true);
        gaiteModelGhost.material.setOpacity(.5);
        gaiteModelGhost.material.setShading("flat");
        gaiteModelGhost.material.setShininess(0);
        gaiteModelGhost.material.setDepthWrite(false);
        gaiteModelGhost.transform.setLocalPositionY(-1.7);

        gaiteModel = new Mobilizing.EdgesMesh({mesh: gaiteModelGhost});
        //gaiteModel.material.setLineWidth(2);
        gaiteModel.transform.setLocalPositionY(-1.7);
        //console.log("loaded gaiteModel", gaiteModel);
    }

    this.loadedRoom = function(m){
        room = m;
        room.transform.setLocalPositionY(-1.7);

        canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        roomTexture = new Mobilizing.Texture({canvas: canvas});
        var mat = new Mobilizing.Material({type: "basic"});
        mat.setWireframe(true);
        room.setMaterial(mat);
        /*room.material.setTexture(roomTexture);
        canvasContext = canvas.getContext("2d");*/

        console.log("loaded room", room);
    }

    this.setup = function()
    {
        console.log("setup");

        M = this.getContext();
        R = new Mobilizing.Renderer3D();

        M.addComponent(R);

        //inputs
        touch = new Mobilizing.input.Touch({"target": R.canvas});
        M.addComponent(touch);
        touch.setup();//set it up
        touch.on();//active it

        mouse = new Mobilizing.input.Mouse({"target": R.canvas});
        M.addComponent(mouse);
        mouse.setup();//set it up
        mouse.on();//active it

        pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.add(mouse);
        pointer.setup();
        pointer.on();

        keyboard = new Mobilizing.input.Keyboard();
        M.addComponent(keyboard);
        keyboard.setup();
        keyboard.on();
        keyboard.events.on("keyup", this.onKeyup.bind(this));

        //scene
        world = new Mobilizing.Mesh({primitive:"node"});
        R.addToCurrentScene(world);

        cam = new Mobilizing.Camera();
        cam.setFOV(60);
        R.addCamera(cam);

        /*world.transform.addChild(room.transform);*/
        world.transform.addChild(gaiteModel.transform);
        world.transform.addChild(gaiteModelGhost.transform);

        if(soloMode){
            debugDisc = this.createUserDisc();
            world.transform.addChild(debugDisc.transform);
        }

        R.setFog("exp");
        R.setFogDensity(.05);

        //initialize a pubsub instance
        if(!soloMode){
            pubsub = new Mobilizing.net.PubSub();
            pubsub.events.on('connect', this.onConnect.bind(this));
        }
    };

    //user disc
    this.createUserDisc = function(){

        var discRoot = new Mobilizing.Mesh({primitive: "node"});

        var diag = Math.sqrt( Math.pow(worldSize.height,2) +  Math.pow(worldSize.width,2));
        diag *= 2;

        var disc = new Mobilizing.Mesh({primitive: "plane",
                                        width: diag,
                                        height: diag,
                                        material: "basic"});
        disc.material.setTransparent(true);
        //disc.setRotationY(90);
        disc.material.setOpacity(.2);

        var discEdges = new Mobilizing.EdgesMesh({mesh: disc});
        discEdges.material.setLineWidth(2);

        //discRoot.transform.addChild(disc.transform);
        discRoot.transform.addChild(discEdges.transform);

        var light = new Mobilizing.Light({type:"spot"});
        light.transform.setLocalPosition(0,0,0);
        light.setTargetPosition(light.transform.getLocalPosition().x, light.transform.getLocalPosition().y, -100);
        light.setIntensity(.5);
        light.setPenumbra(.5);
        light.setAngle(Math.PI/10);
        discRoot.transform.addChild(light.transform);

        return discRoot;
    };

    this.update = function()
    {
        var target;

        if(soloMode){
            target = debugDisc;
        }else{
            //target = room.planes;
            target = cam;
        }

        if(pointer.getState())
        {
            var factor = 5;
            var x = -pointer.getDeltaX()/factor;
            var y = -pointer.getDeltaY()/factor;

            var tempRY = target.transform.getLocalRotationY();
            target.transform.setLocalRotationY( tempRY + x );

            var tempRX = target.transform.getLocalRotationX();
            //target.transform.setLocalRotationX( tempRX + y );

            if(target === debugDisc){

                var rot = new Mobilizing.Quaternion();
                var tempRot = debugDisc.transform.getLocalRotation();
                var euler = new Mobilizing.Euler(tempRot.x,tempRot.y,tempRot.z);
                rot.setFromEuler( euler);

                var forwardVector = new Mobilizing.Vector3();
                forwardVector.x = 2 * (rot.x*rot.z + rot.w*rot.y);
                forwardVector.y = 2 * (rot.y*rot.z - rot.w*rot.x);
                forwardVector.z = 1 - 2 * (rot.x*rot.x + rot.y*rot.y);

                debugDisc.forwardVector = forwardVector;
                //console.log("debugDisc",euler, debugDisc.forwardVector);
            }
        }

        var zoom = mouse.getWheelDeltaY()/200;
        cam.transform.setLocalPositionZ( cam.transform.getLocalPositionZ()+zoom);

        //room.planes.transform.setLocalRotationY( room.planes.transform.getLocalRotationY() + .1 );
    };

    /**
     * debug world view
     */
    //reset world view
    this.resetWorlView = function(){
        cam.transform.setLocalPosition(0,0,0);
        world.transform.setLocalRotation(0,0,0);
    };

    //Enter key
    this.onKeyup = function(e){

        if(e.keyIdentifier === "Enter"){
            this.resetWorlView();
        }

        if(e.keyIdentifier === "Control"){
            if(debugDisc){
                this.extractIntersectionPoints(debugDisc, room);
                this.canvasDraw(debugDisc);
            }

        }
    };

    this.extractIntersectionPoints = function(client, targetMesh){

        var uvs = [];
        //get one of the mesh compoing the client's mesh group
        var plane = client.transform.getChild(0);
        var points = plane.getIntersectionsPoints(targetMesh);

        //extract only uv and do some computation on them before storage
        for(var i in points){

            var uv = points[i].uv;
            //reverse uv to be in canvas space
            uv.y = 1-uv.y;
            uvs.push(uv);
        }

        client.intersections = points;
        client.intersectionUvs = uvs;
    };



    /**
     * NETWORK
     */

    //hello
    this.onConnect = function()
    {
        // listen to network messages
        pubsub.subscribe('/connect', this.onClientConnect.bind(this));
        pubsub.subscribe('/client/pos', this.onClientPosition.bind(this));
        pubsub.subscribe('/client/rot', this.onClientRotation.bind(this));
        pubsub.subscribe('/disconnect', this.onClientDisconnect.bind(this));
    };

    this.onClientConnect = function(id)
    {
        // create a shape for the new connected client

        clients[id] = this.createUserDisc();
        world.transform.addChild(clients[id].transform);
        console.log("added client", id);

    };

    //clients transforms
    this.onClientPosition = function(data)
    {
        var id = data.id;
        var pos = new Mobilizing.Vector3().fromArray(data.pos);

        if(!(id in clients)){
            this.onClientConnect(id);
        }

        // update the client's cube position
        clients[id].transform.setLocalPosition(pos);
    };

    this.onClientRotation = function(data)
    {
        var id = data.id;
        var quaternion = new Mobilizing.Quaternion().fromArray(data.rot);

        if(!(id in clients)){
            this.onClientConnect(id);
        }

        // update the client's cube position
        clients[id].transform.setLocalQuaternion(quaternion);

        var upVector = new Mobilizing.Vector3();
        upVector.x = 2 * (quaternion.x * quaternion.y - quaternion.w * quaternion.z);
        upVector.y = 1 - 2 * (quaternion.x * quaternion.x + quaternion.z * quaternion.z);
        upVector.z = 2 * (quaternion.y * quaternion.z + quaternion.w * quaternion.x);

        clients[id].upVector = upVector;

        var forwardVector = new Mobilizing.Vector3();
        forwardVector.x = 2 * (quaternion.x * quaternion.z + quaternion.w * quaternion.y);
        forwardVector.y = 2 * (quaternion.y * quaternion.z - quaternion.w * quaternion.x);
        forwardVector.z = 1 - 2 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y);

        clients[id].forwardVector = forwardVector;
        
        var leftVector  = new Mobilizing.Vector3();
        leftVector.x = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z);
        leftVector.y = 2 * (quaternion.x * quaternion.y + quaternion.w * quaternion.z);
        leftVector.z = 2 * (quaternion.x * quaternion.z - quaternion.w * quaternion.y);

        clients[id].leftVector = leftVector;
        
        //console.log(clients[id].transform.getChild(1));
        clients[id].transform.getChild(1).setTargetPosition(upVector.x, upVector.y, upVector.z);

        //process intersection points
        /*
        if(room){ //if we have the room model

            this.extractIntersectionPoints(clients[id], room);
            //console.log(clients[id]);
            this.canvasDraw(clients[id]);
        }*/
    };

    //goodbye
    this.onClientDisconnect = function(id)
    {
        if(!(id in clients))
        {
            return;
        }

        // remove the client's cube from the scene
        world.transform.removeChild(clients[id].transform);
        R.removeFromCurrentScene(clients[id]);
        
        clients[id].erase();
        
        delete clients[id];
    };
};