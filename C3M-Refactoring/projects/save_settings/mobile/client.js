//==============================================================
//client.js mobile
//==============================================================
function client()
{
    this.genericClient = new GenericClient("mobile");

    var M,R;

    var cam;

    var touch;
    var pointer;
    var mouse;
    
    var orientation;

    //ne doit pas être vide de chargement
    /*this.preLoad = function()
    {

    };*/

    this.setup = function()
    {
        M = this.getContext();
        R = M.addComponent(new Mobilizing.Renderer3D());

        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //assure une bonne execusion du pubsub pour une prise en compte de ce client
        this.genericClient.pubsub.events.on("connect", this.onConnect.bind(this) );

        touch = M.addComponent(new Mobilizing.input.Touch({ "target": R.canvas }));
        touch.setup();//set it up
        touch.on();//active it

        mouse = M.addComponent(new Mobilizing.input.Mouse());
        mouse.setup();//set it up
        mouse.on();//active it

        pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.add(mouse);
        
        orientation = new Mobilizing.input.Orientation();
        M.addComponent(orientation);
        orientation.setup();
        orientation.on();

        cam = new Mobilizing.Camera();
        R.addCamera(cam);
        cam.transform.setLocalPositionZ(50);

        var saveBt = new Mobilizing.Button({
            camera: cam,
            pointer: pointer,
            width: 5,
            height: 2,
            strokeWidth: .1,
            text: "Save",
            textSize: 60,
            onRelease: function(){ this.sendSaveOrder() }.bind(this)
        });
        M.addComponent(saveBt);
        saveBt.setup();
        R.addToCurrentScene(saveBt.root);
        
        var toGet = "un truc";
        
        var getBt = new Mobilizing.Button({
            camera: cam,
            pointer: pointer,
            width: 5,
            height: 2,
            strokeWidth: .1,
            text: "Get",
            textSize: 60,
            onRelease: function(){ this.sendGetOrder(toGet) }.bind(this)
        });
        M.addComponent(getBt);
        getBt.transform.setLocalPositionY(-4);
        getBt.setup();
        R.addToCurrentScene(getBt.root);
    };
    //connection callback
    this.onConnect = function()
    {
        console.log("mobile client onConnect");
    };

    this.sendSaveOrder =  function()
    {
        console.log("send save order");
        this.genericClient.pubsub.publish("/savesettingorder", true);
    }
    
    this.sendGetOrder =  function(key)
    {
        console.log("send get order for", key);
        this.genericClient.pubsub.publish("/getsettingorder", key);
    }

    this.update = function()
    {
        
        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            //cube.transform.setLocalQuaternion( deviceQuat );
            this.genericClient.pubsub.publish("/deviceQuat", deviceQuat);
        }

    };
};
