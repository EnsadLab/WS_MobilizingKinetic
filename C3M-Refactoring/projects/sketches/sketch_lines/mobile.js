function SketchLinesMobile()
{
    var M;

    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name; 
    this.sketch.category = "mobile";

    var sendTimer;
    var orientation;

    this.setup = function()
    {
        console.log("SketchLinesVideo");

        M = this.getContext();

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

        console.log("updateNetwork");
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
            rot: val.toArray()
        });
    };

    this.update = function()
    {
        sendTimer.update();
        //console.log("send a test message");
        //this.sketch.publish("/tag/position",{x:0,y:0,z:0});
    };
};

SketchManager.RegisterSketch(new SketchLinesMobile());