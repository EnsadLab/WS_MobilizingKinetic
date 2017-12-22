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

    var gaiteModel;
    var room; 

    var soloMode = false;
    var debugDisc;

    this.preLoad = function(loader)
    {
        loader.loadOBJ({url:"../models/salleBox.obj", onLoad:this.loadedRoom.bind(this)});
        //loader.loadOBJ({url:"../models/GL3D.obj", onLoad:this.loadedGL.bind(this)});
    }

    this.loadedGL = function(model){

        gaiteModel = model;
    }

    this.loadedRoom = function(m){
        room = m;
        room.transform.setLocalPositionY(-1.7);
        var mat = new Mobilizing.Material({type: "basic"});
        mat.setColor(Mobilizing.Color.red);
        //mat.setWireframe(true);
        room.setMaterial(mat);
    }

    this.setup = function() {
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
        cam.setFOV(90);
        R.addCamera(cam);

        world.transform.addChild(room.transform);

        light = new Mobilizing.Light();
        light.transform.setLocalPosition(-2, 5, 2);
        R.addToCurrentScene(light);

        //initialize a pubsub instance
        pubsub = new Mobilizing.net.PubSub();
        pubsub.events.on('connect', this.onConnect.bind(this));

    };

    this.update = function()
    {
        var target;
        //target = room.planes;
        target = cam;

        if(pointer.getState())
        {
            var factor = 5;
            var x = -pointer.getDeltaX()/factor;
            var y = -pointer.getDeltaY()/factor;

            var tempRY = target.transform.getLocalRotationY();
            target.transform.setLocalRotationY( tempRY + x );

            var tempRX = target.transform.getLocalRotationX();
            //target.transform.setLocalRotationX( tempRX + y );

        }

        var zoom = mouse.getWheelDeltaY()/200;
        cam.transform.setLocalPositionZ( cam.transform.getLocalPositionZ()+zoom);

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
        clients[id] = new UserLine(worldSize.width, worldSize.depth);
        clients[id].setPlaneVisible(true);
        clients[id].setLineAlwaysVisible(true);
        
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