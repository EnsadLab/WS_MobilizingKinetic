function SketchTabMobMobile()
{
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name; 
    this.sketch.category = "mobile";

    var M, R;

    var sendTimer;
    var orientation;

    var buttons = [];

    var posX, poxY;

    this.setup = function()
    {
        console.log(this);
        M = this.getContext();
        R = EasyContext.GetRenderer();// new Mobilizing.Renderer3D();
        M.addComponent(R);

        /*R.removeCamera(EasyContext._camera);

        this.camera = new Mobilizing.Camera();
        //this.camera.transform.setLocalPositionZ(50);
        this.camera.setToPixel();
        R.addCamera(this.camera);
        R.addToCurrentScene(this.sketch.root);

        this.touch = M.addComponent(new Mobilizing.input.Touch({"target": R.canvas}));
        this.touch.setup();//set it up
        this.touch.on();//active it

        this.mouse = M.addComponent(new Mobilizing.input.Mouse());
        this.mouse.setup();//set it up
        this.mouse.on();//active it

        this.pointer = new Mobilizing.Pointer();
        M.addComponent(this.pointer);
        this.pointer.add(this.touch);
        this.pointer.add(this.mouse);*/

        sendTimer = new Mobilizing.Timer({interval: 100,
                                          callback: this.updateNetwork.bind(this)});


        M.addComponent(sendTimer);
        sendTimer.setup();
        sendTimer.on();
        sendTimer.start();

        orientation = new Mobilizing.input.Orientation();
        M.addComponent(orientation);
        orientation.setup();
        orientation.on();
    };

    //what to send to the others
    this.updateNetwork = function(){

        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            this.sendRotation( deviceQuat ); 
        }

        this.sendPosition( new Mobilizing.Vector3(posX, poxY, 0));
    }

    this.sendRotation = function(val)
    {
        this.sketch.pubsub.publish('/mobile/rot', {
            id: this.sketch.pubsub.getID(),
            rot: val.toArray(),
            tagID: this.tagID
        });
    };

    this.sendPosition = function(val)
    {
        this.sketch.pubsub.publish('/mobile/pos', {
            id: this.sketch.pubsub.getID(),
            pos: val.toArray(),
            tagID: this.tagID
        });
    };

    this.update = function()
    {
        sendTimer.update();

//        if(this.pointer.getState()){
//            posX = this.pointer.getX();
//            posY = this.pointer.getY();
//            //console.log(posX, posY);
//        }

        //this.sketch.publish("/tag/position",{x:0,y:0,z:0});
    };
};

SketchManager.RegisterSketch(new SketchTabMobMobile());