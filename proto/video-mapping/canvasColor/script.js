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
    var texture;

    var pointsOfIntersection = [];

    var gaiteModel;
    var room; 
    var texture;
    var imgFile;//the file to be loaded

    var soloMode = false;
    var debugDisc;

    var printLog = false;

    this.preLoad = function(loader)
    {
        //get external scripts
        loader.loadScript({url:"../commons/CanvasPlane.js",
                           onLoad : function(script){console.log("loaded", script)}});

        loader.loadOBJ({url:"../models/salleBox.obj", onLoad:this.loadedRoom.bind(this)});

        //loader.loadOBJ({url:"../models/GL3D.obj", onLoad:this.loadedGL.bind(this)});

        imgFile = loader.loadImage({url:"mire.jpg"});
    }

    this.loadedGL = function(model){

        gaiteModel = model;
    }

    this.loadedRoom = function(m){
        room = m;
        room.transform.setLocalPositionY(-1.7);

        canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 512;
        texture = new Mobilizing.Texture({canvas: canvas});
        var mat = new Mobilizing.Material({type: "basic"});
        room.setMaterial(mat);
        room.material.setTexture(texture);
        canvasContext = canvas.getContext("2d");
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
        cam.setFOV(90);
        R.addCamera(cam);

        //room of screens
        /*room = new CanvasPanoScreen(worldSize.width, worldSize.height, worldSize.depth);
        room.setup();
        room.setToRenderer(R);
        room.fillPlanes("red");*/
        //world.transform.addChild(room.planes.transform);

        world.transform.addChild(room.transform);

        if(soloMode){
            debugDisc = this.createUserDisc();
            world.transform.addChild(debugDisc.transform);
        }

        light = new Mobilizing.Light();
        light.transform.setLocalPosition(-2, 5, 2);
        R.addToCurrentScene(light);

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

        discRoot.transform.addChild(disc.transform);
        discRoot.transform.addChild(discEdges.transform);

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

            printLog = true;
            var plane = room.left;
            var id = Object.keys[0];

            this.extractIntersectionPoints(clients[id], plane.mesh);

            console.log(clients[id].intersections);

            /*for(var i=0; i<clients[id].intersections.length; i++){

                var intersect = clients[id].intersections[i];

                var temp = new Mobilizing.Mesh({primitive:"cube", size: .1});
                temp.transform.setLocalPosition(intersect.vertex);
                world.transform.addChild(temp.transform);

            }*/

            this.canvasDraw(clients[id], plane);
            plane.update();

        }
    };


    var upperZoneColor = "rgba(255,255,0, .5)";
    var bottomZoneColor = "rgba(0,0,255,.5)";


    this.canvasDraw = function(client, plane){

        var uvs = client.intersectionUvs;
        /*var canvas = plane.canvas;
        var canvasContext = plane.canvasContext;*/

        if(uvs.length > 0){

            //gets the orientation of the plan : vertical or horizontal
            var orientation;

            canvasContext.fillStyle = "white";//"rgba(0,0,0,0)";
            //canvasContext.clearRect(0,0, canvas.width, canvas.height);
            //canvasContext.fillRect(0,0, canvas.width, canvas.height);
            //canvasContext.globalAlpha = 0.1;

            //try to identify the opening and closing of the points array
            for(var i=0; i<uvs.length; i++){

                var p = uvs[i];

                //is perfectly panoramic ?
                if(p.y === 0 || p.y === 1){
                    orientation = "vertical";
                    break;
                }else{
                    orientation = "horizontal";
                }
            }

            var facing;

            //get the facing of the clients screen, extacted from quaternion
            if(client.forwardVector.y > 0 && orientation === "horizontal"){
                facing = "up";
            }else{
                facing = "down";
            }

            //get the left-right facing, extacted from quaternion
            if(client.forwardVector.x < 0 && orientation === "vertical"){
                facing = "left";
            }else{
                facing = "right";
            }

            if(orientation === "horizontal"){

                //drawing sequence, 2 points by 2
                for(var i=0; i<uvs.length; i+= 2){

                    //base points for computing strat and end point of this sequence
                    var baseStart = {x: uvs[i].x * canvas.width, y: uvs[i].y * canvas.height};
                    var baseEnd = {x: uvs[i+1].x * canvas.width, y: uvs[i+1].y * canvas.height};

                    //draw the regions
                    //horizontal panoramic line   


                    var upY, downY;
                    if(facing === "up"){
                        upY = 0;
                        downY = canvas.height;
                    }else{
                        upY = canvas.height;
                        downY = 0;
                    }

                    //upper zone
                    canvasContext.beginPath();

                    var start, end;

                    if(baseEnd.x < baseStart.x){
                        start = baseStart;
                        end = baseEnd;
                    }else{
                        start = baseEnd;
                        end = baseStart;
                    }

                    canvasContext.moveTo(start.x, upY);
                    canvasContext.lineTo(start.x, start.y);
                    canvasContext.lineTo(end.x, end.y);
                    canvasContext.lineTo(end.x, upY);

                    canvasContext.closePath();
                    canvasContext.fillStyle = upperZoneColor;
                    canvasContext.fill();

                    //bottom zone
                    canvasContext.beginPath();

                    canvasContext.moveTo(start.x, downY);
                    canvasContext.lineTo(start.x, start.y);
                    canvasContext.lineTo(end.x, end.y);
                    canvasContext.lineTo(end.x, downY);

                    canvasContext.closePath();
                    canvasContext.fillStyle = bottomZoneColor;
                    canvasContext.fill();

                    //draw the line
                    canvasContext.beginPath();
                    canvasContext.moveTo(baseStart.x, baseStart.y);
                    canvasContext.lineTo(baseEnd.x, baseEnd.y);
                    canvasContext.strokeStyle = "red";
                    canvasContext.stroke();
                }

            }else{
                //vertical lines

                var startPoints = [];
                var endPoints = [];

                for(var i=0; i<uvs.length; i++){
                    
                    if(uvs[i].y <= 0.0001){
                        startPoints.push(uvs[i]);
                    }
                    if(uvs[i].y === 1){
                        endPoints.push(uvs[i]);
                    }
                }
                
                //console.log(startPoints, endPoints);

                var left, right;
                if(facing === "left"){
                    left = 0;
                    right = canvas.width;
                }else{
                    left = canvas.width;
                    right = 0;
                }

                console.log(facing);

                //left zone
                /*canvasContext.beginPath();

                if(baseEnd.x < baseStart.x){
                    start = baseStart;
                    end = baseEnd;
                }else{
                    start = baseEnd;
                    end = baseStart;
                }

                canvasContext.moveTo(left, 0);
                canvasContext.lineTo(start.x, start.y);
                canvasContext.lineTo(end.x, end.y);
                canvasContext.lineTo(left, canvas.height);

                canvasContext.closePath();
                canvasContext.fillStyle = upperZoneColor;
                canvasContext.fill();*/

                //draw the line
                for(var i=0; i<uvs.length; i+= 2){

                    //base points for computing strat and end point of this sequence
                    var baseStart = {x: uvs[i].x * canvas.width, y: uvs[i].y * canvas.height};
                    var baseEnd = {x: uvs[i+1].x * canvas.width, y: uvs[i+1].y * canvas.height};

                    var start, end;

                    if(baseEnd.x < baseStart.x){
                        start = baseStart;
                        end = baseEnd;
                    }else{
                        start = baseEnd;
                        end = baseStart;
                    }

                    canvasContext.beginPath();
                    canvasContext.moveTo(baseStart.x, baseStart.y);
                    canvasContext.lineTo(baseEnd.x, baseEnd.y);
                    canvasContext.strokeStyle = "red";
                    canvasContext.stroke();
                }
            }
            texture.setNeedsUpdate();
        }
    }

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
        var rot = new Mobilizing.Quaternion().fromArray(data.rot);

        if(!(id in clients)){
            this.onClientConnect(id);
        }

        // update the client's cube position
        clients[id].transform.setLocalQuaternion(rot);
        
        var dirVec = getDirectionsFromQuaternion(quaternion);
        clients[id].forwardVector = dirVec.forwardVector;

        //process intersection points
        if(room){ //if we have the room model

            /*for(var i=0; i<room.planesArray.length; i++){

                var plane = room.planesArray[i];
                this.extractIntersectionPoints(clients[id], plane.mesh);
                this.canvasDraw(clients[id], plane);
                plane.update();
            }*/

            this.extractIntersectionPoints(clients[id], room);
            //console.log(clients[id]);
            this.canvasDraw(clients[id]);

        }
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

        delete clients[id];
    };
};