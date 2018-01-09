function SketchGaiteMobile()
{
    var M;

    this.sketch = new Sketch({name:this.constructor.name,category:"mobile"}); 

    var sendTimer;
    var orientation;

    var plate;
    var pressed;

    this.setup = function()
    {
        console.log(this.sketch.name + " setup");

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

        plate = new Mobilizing.Mesh({primitive:"plane",
                                     width: window.innerWidth/2,
                                     height: window.innerHeight/2,
                                     material: "basic"});
        plate.transform.setLocalPosition(window.innerWidth/2, -window.innerHeight/2, 0);
        plate.transform.setLocalRotationX(90);
        this.sketch.root.transform.addChild(plate.transform);

        var clickable = new Mobilizing.Clickable({target: plate,
                                                  pointer: EasyContext._pointer,
                                                  camera: EasyContext._camera,
                                                  onPress: function(){
                                                      plate.material.setColor(Mobilizing.Color.red.clone());
                                                      pressed = true;
                                                      this.sketch.pubsub.publish("/mobile/pressed",{id: this.sketch.pubsub.getID()})
                                                  }.bind(this),
                                                  onRelease:  function(){
                                                      plate.material.setColor(Mobilizing.Color.white.clone());
                                                      pressed = false;
                                                      this.sketch.pubsub.publish("/mobile/released",{id: this.sketch.pubsub.getID()})
                                                  }.bind(this)
                                                 });
        M.addComponent(clickable);
        clickable.setup();
    };

    //what to send to the others
    this.updateNetwork = function(){

        if(pressed){
            var deviceQuat = orientation.getGyroQuaternion();
            this.sendRotation(deviceQuat/* plate.transform.getLocalQuaternion() */);
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

    this.update = function()
    {
        sendTimer.update();

        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            var decal = new Mobilizing.Quaternion().setFromAxisAngle(new Mobilizing.Vector3(1,0,0), Math.PI/2);
            deviceQuat.premultiply(decal);
            plate.transform.setLocalQuaternion(deviceQuat);
        }
    };
};

SketchManager.RegisterSketch(new SketchGaiteMobile());