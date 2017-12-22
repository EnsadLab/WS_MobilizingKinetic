function SketchExpoMobile()
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
    };
};

SketchManager.RegisterSketch(new SketchExpoMobile());