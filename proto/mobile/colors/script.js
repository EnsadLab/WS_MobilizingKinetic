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

    var ColorPicker;

    this.preLoad = function(loader)
    {

        loader.loadScript({url: "../commons/CanvasColorPicker.js",
                           onLoad : function(script){console.log("loaded", script)}});

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

        // initialize a pubsub instance
        pubsub = new Mobilizing.net.PubSub();
        pubsub.events.on('connect', this.onConnect.bind(this));


        sendTimer = new Mobilizing.Timer({interval: 100,
                                          callback: this.updateNetwork.bind(this)});
        M.addComponent(sendTimer);
        sendTimer.setup();
        sendTimer.on();
        sendTimer.start();

        //specific client
        this.upPicker = new CanvasColorPicker(window.innerWidth - 20,window.innerHeight/2);
        this.upPicker.setup();

        var pickedColorWidth = 200;

        this.upPickerPlane = new Mobilizing.Mesh({primitive:"plane",
                                                  width: window.innerWidth - pickedColorWidth*2,
                                                  height: window.innerHeight/2,
                                                  material: "basic"});
        this.upPickerPlane.transform.setLocalPosition(window.innerWidth/2 - pickedColorWidth, -window.innerHeight/4, 0);
        R.addToCurrentScene(this.upPickerPlane);

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
        R.addToCurrentScene(this.upColorPlane);
        
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
        R.addToCurrentScene(this.downPickerPlane);

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
        R.addToCurrentScene(this.downColorPlane);


    };

    this.update = function()
    {
        sendTimer.update();

        //picking
        if(pointer.getState()){

            var x = pointer.getX();
            var y = pointer.getY();

            var picked = this.upPickerPlane.transform.pick(cam, x, y);

            if(picked){

                var uv = picked.uv;

                var canvasPoint = {x: uv.x * this.upPicker.width, y: (1-uv.y) * this.upPicker.height};

                this.upColor = this.upPicker.getColor(canvasPoint.x, canvasPoint.y);
                this.upColorPlane.material.setColor( new Mobilizing.Color().setStyle(this.upColor));
            }
            
            var picked = this.downPickerPlane.transform.pick(cam, x, y);

            if(picked){

                var uv = picked.uv;

                var canvasPoint = {x: uv.x * this.upPicker.width, y: (1-uv.y) * this.downPicker.height};

                this.downColor = this.downPicker.getColor(canvasPoint.x, canvasPoint.y);
                this.downColorPlane.material.setColor( new Mobilizing.Color().setStyle(this.downColor));
            }

        }

    };

    this.updateNetwork = function(){

        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            this.sendRotation( deviceQuat ); 
            this.sendUpColor( this.upColor );
            this.sendDownColor( this.downColor );
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

    this.sendUpColor = function(val)
    {
        if(!this.connected)
        {
            return;
        }

        if(this.upColor){

            pubsub.publish('/client/upColor', {
                id: pubsub.getID(),
                color: this.upColor
            });
        }
    };
    
    this.sendDownColor = function(val)
    {
        if(!this.connected)
        {
            return;
        }

        if(this.downColor){

            pubsub.publish('/client/downColor', {
                id: pubsub.getID(),
                color: this.downColor
            });
        }
    };
};
