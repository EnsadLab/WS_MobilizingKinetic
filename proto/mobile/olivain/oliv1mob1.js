function script() {
    var M;
    var R;

    var cam;
    var light;

    var orientation;

    var touch;
    var mouse;
    var pointer;

    var pubsub;
    var sendTimer;

         this.preLoad = function(loader) {

        loader.loadOBJ({url:"../../models/salleBox.obj", onLoad:this.loadedRoom.bind(this)});

        //loader.loadOBJ({url:"../models/GL3D.obj", onLoad:this.loadedGL.bind(this)});
    }

    this.loadedGL = function(model){
        gaiteModel = model;
    }

    this.loadedRoom = function(m){
        room = m;
        room.transform.setLocalPositionY(-1.7); // ???
        var mat = new Mobilizing.Material({type: "basic"});
        mat.setColor(Mobilizing.Color.red);
       // mat.setWireframe(true);
        room.setMaterial(mat);
    }


    this.setup = function() {
       //console.log("setup");
        M = this.getContext();

        R = new Mobilizing.Renderer3D();
        M.addComponent(R);

        world = new Mobilizing.Mesh({primitive:"node"});
        R.addToCurrentScene(world);

        cam = new Mobilizing.Camera();
        cam.setFOV(90);
        cam.transform.setLocalRotation(-90,0,0);
        cam.transform.setLocalPosition(0,20,0);
        R.addCamera(cam);

        world.transform.addChild(room.transform);


        light = new Mobilizing.Light();
        light.transform.setLocalPosition(-2, 5, 2);
        R.addToCurrentScene(light);
        
        var light2 = new Mobilizing.Light();
        light2.transform.setLocalPosition(0, 5, 0);
        light2.transform.setLocalRotation(-45,0,0);
        R.addToCurrentScene(light);



//// INPUTS

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

        orientation = new Mobilizing.input.Orientation();
        M.addComponent(orientation);
        orientation.setup();
        orientation.on();


// NETWORK

        // initialize a pubsub instance
        pubsub = new Mobilizing.net.PubSub();
        pubsub.events.on('connect', this.onConnect.bind(this));


        sendTimer = new Mobilizing.Timer({interval: 100,callback: this.updateNetwork.bind(this)});
        M.addComponent(sendTimer);
        sendTimer.setup();
        sendTimer.on();
        sendTimer.start();
       

 // Canvas for text rendering
        txt_canvas = document.createElement('canvas');
        txt_canvas.width = 512;
        txt_canvas.height = 512;
        context = txt_canvas.getContext('2d');
        context.fillStyle ="rgba(100,100,102,0.5)";
        context.fillRect(0,0,512,512);

        context.font = "Bold 80px Arial";
        context.strokeStyle = "#FF0000";
        context.fillStyle = "rgba(0,0,0,1)";
        //context.strokeRect(1,1,511,511);

        //create a Mobilizing texture out of it
        texture = new Mobilizing.Texture({canvas:txt_canvas});
        context.fillText("SHOOT 'EM ALL !!", 0, 150);

        room.material.setTexture(texture);
        
  };

    this.update = function() {
        sendTimer.update();
        //picking
        if(pointer.getState()){
            var factor = 1000;
            this.deltaVector.x = pointer.getDeltaX()/factor;
            this.deltaVector.z = pointer.getDeltaY()/factor;
            
            this.sendPosition(this.deltaVector);
        }


    };

    //Network funcs (sendig datas)

    //what to send to the others
    this.updateNetwork = function(){
        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            this.sendRotation( deviceQuat );  

        }
       
    }

    this.onConnect = function() {
        this.connected = true;
        console.log("connected client");
    };

    this.sendRotation = function(val) {
        if(!this.connected)
        {
            return;
        }

        pubsub.publish('/client/rot', {
            id: pubsub.getID(),
            rot: val.toArray()
        });
        var div = document.getElementById("text");
        div.innerHTLML = "ROTATION : "+val.toArray();

    };

    this.sendPosition = function(val) {
        if(!this.connected)
        {
            return;
        }

        pubsub.publish('/client/pos', {
            id: pubsub.getID(),
            pos: val.toArray()
        });
    };



};
