function script()
{
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

    this.preLoad = function(loader)
    {

    }

    this.setup = function()
    {
        console.log("setup");
        M = this.getContext();

        R = new Mobilizing.Renderer3D();
        M.addComponent(R);

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

        cam = new Mobilizing.Camera();
        cam.setToPixel();
        R.addCamera(cam);

        light = new Mobilizing.Light();
        R.addToCurrentScene(light);


        sendTimer = new Mobilizing.Timer({interval: 100,callback: this.updateNetwork.bind(this)});
        M.addComponent(sendTimer);
        sendTimer.setup();
        sendTimer.on();
        sendTimer.start();
        
        // initialize a pubsub instance
        pubsub = new Mobilizing.net.PubSub();
        pubsub.events.on('connect', this.onConnect.bind(this));


        //specific client
        this.deltaVector = new Mobilizing.Vector3();
    };

    this.update = function()
    {
        sendTimer.update();

        //picking
        if(pointer.getState()){

            var factor = 1000;
            this.deltaVector.x = pointer.getDeltaX()/factor;
            this.deltaVector.z = pointer.getDeltaY()/factor;
            
            this.sendPosition(this.deltaVector);
        }

    };

    //what to send to the others
    this.updateNetwork = function(){

        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            this.sendRotation( deviceQuat ); 
            
        }
    }

    this.onConnect = function()
    {
        this.connected = true;
    };

    this.sendRotation = function(val)
    {
        if(!this.connected)
        {
            return;
        }

        pubsub.publish('/client/rot', {
            id: pubsub.getID(),
            rot: val.toArray()
        });
    };

    this.sendPosition = function(val)
    {
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
