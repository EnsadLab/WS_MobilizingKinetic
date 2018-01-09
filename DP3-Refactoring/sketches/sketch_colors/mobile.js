function SketchColorsMobile()
{
    var M, R;

    this.sketch = new Sketch({name:this.constructor.name,category:"mobile"}); 

    var sendTimer;
    var orientation;

    var ColorPicker;

    this.id;

    this.setup = function()
    {
        console.log("SketchLinesVideo");

        M = this.getContext();
        R = EasyContext.GetRenderer();

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

        this.id = 

            this.upPicker = new CanvasColorPicker(window.innerWidth - 20,window.innerHeight/2);
        this.upPicker.setup();

        var pickedColorWidth = 200;

        this.upPickerPlane = new Mobilizing.Mesh({primitive:"plane",
                                                  width: window.innerWidth - pickedColorWidth*2,
                                                  height: window.innerHeight/2,
                                                  material: "basic"});
        this.upPickerPlane.transform.setLocalPosition(window.innerWidth/2 - pickedColorWidth, -window.innerHeight/4, 0);
        this.sketch.root.transform.addChild(this.upPickerPlane.transform);

        var upTexture = new Mobilizing.Texture({canvas: this.upPicker.canvas});
        this.upPickerPlane.material.setTexture(upTexture);

        this.upColorPlane = new Mobilizing.Mesh({primitive:"plane",
                                                 width: pickedColorWidth,
                                                 height: window.innerHeight/2,
                                                 material: "basic"});

        var pickerPos = this.upPickerPlane.transform.getLocalPosition();
        var pickerBBox = this.upPickerPlane.getBoundingBox().getSize();

        this.upColorPlane.transform.setLocalPosition(pickerPos.x + pickerBBox.x/2 + pickedColorWidth/2,
                                                     pickerPos.y,
                                                     pickerPos.z);
        this.sketch.root.transform.addChild(this.upColorPlane.transform);

        //DOWN

        this.downPicker = new CanvasColorPicker(window.innerWidth - 20,window.innerHeight/2);
        this.downPicker.setup();

        var pickedColorWidth = 200;

        this.downPickerPlane = new Mobilizing.Mesh({primitive:"plane",
                                                    width: window.innerWidth - pickedColorWidth*2,
                                                    height: window.innerHeight/2,
                                                    material: "basic"});
        this.downPickerPlane.transform.setLocalPosition(window.innerWidth/2 - pickedColorWidth,
                                                        -(window.innerHeight/4)*3, 0);
        this.sketch.root.transform.addChild(this.downPickerPlane.transform);

        var downTexture = new Mobilizing.Texture({canvas: this.downPicker.canvas});
        this.downPickerPlane.material.setTexture(downTexture);

        this.downColorPlane = new Mobilizing.Mesh({primitive:"plane",
                                                   width: pickedColorWidth,
                                                   height: window.innerHeight/2,
                                                   material: "basic"});

        pickerPos = this.downPickerPlane.transform.getLocalPosition();
        pickerBBox = this.downPickerPlane.getBoundingBox().getSize();

        this.downColorPlane.transform.setLocalPosition(pickerPos.x + pickerBBox.x/2 + pickedColorWidth/2,
                                                       pickerPos.y,
                                                       pickerPos.z);
        this.sketch.root.transform.addChild(this.downColorPlane.transform);

        this.id = this.sketch.pubsub.getID();

    };

    this.update = function()
    {
        sendTimer.update();

        //picking
        if(EasyContext._pointer.getState()){

            var x = EasyContext._pointer.getX();
            var y = EasyContext._pointer.getY();

            var picked = this.upPickerPlane.transform.pick(EasyContext._camera, x, y);

            if(picked){

                var uv = picked.uv;

                var canvasPoint = {x: uv.x * this.upPicker.width, y: (1-uv.y) * this.upPicker.height};

                this.upColor = this.upPicker.getColor(canvasPoint.x, canvasPoint.y);
                this.upColorPlane.material.setColor( new Mobilizing.Color().setStyle(this.upColor));
            }

            var picked = this.downPickerPlane.transform.pick(EasyContext._camera, x, y);

            if(picked){

                var uv = picked.uv;

                var canvasPoint = {x: uv.x * this.upPicker.width, y: (1-uv.y) * this.downPicker.height};

                this.downColor = this.downPicker.getColor(canvasPoint.x, canvasPoint.y);
                this.downColorPlane.material.setColor( new Mobilizing.Color().setStyle(this.downColor));
            }

        }

    };

    //what to send to the others
    this.updateNetwork = function(){

        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            this.sendRotation( deviceQuat ); 
        }
        this.sendUpColor( this.upColor );
        this.sendDownColor( this.downColor );
    }

    this.sendRotation = function(val)
    {
        this.sketch.pubsub.publish('/mobile/rot', {
            id: this.sketch.pubsub.getID(),
            rot: val.toArray()
        });
    };

    this.sendUpColor = function(val)
    {
        if(this.upColor){

            this.sketch.pubsub.publish('/mobile/upColor', {
                id: this.sketch.pubsub.getID(),
                color: this.upColor
            });
        }
    };

    this.sendDownColor = function(val)
    {
        if(this.downColor){

            this.sketch.pubsub.publish('/mobile/downColor', {
                id: this.sketch.pubsub.getID(),
                color: this.downColor
            });
        }
    };
};

SketchManager.RegisterSketch(new SketchColorsMobile());