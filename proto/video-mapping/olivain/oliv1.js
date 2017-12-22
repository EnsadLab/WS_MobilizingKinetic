function script() {
    var M;
    var R;

    var cam;
    var light;

    var touch;
    var mouse;
    var pointer;

    var keyboard;

    var clients = {};
    var clients_cubes = {};

    var pubsub;
    var worldSize = {width: 15, height: 6, depth: 8};//in meters
    var world;
    var room;

    var txt_canvas;
    var texture;
    var context;


var b =0;
    //network funcs (listen to messages and modify 3d on event)
    this.onConnect = function()
    {
        // listen to network messages
        pubsub.subscribe('/connect', this.onClientConnect.bind(this));
        pubsub.subscribe('/client/pos', this.onClientPosition.bind(this));
        pubsub.subscribe('/client/rot', this.onClientRotation.bind(this));
        pubsub.subscribe('/disconnect', this.onClientDisconnect.bind(this));
        pubsub.subscribe("/tag/position",this.onTagPosition.bind(this));

        };

    this.onClientConnect = function(id)
    {

        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;

        b = (Math.random()*5) * plusOrMinus;
        //create a shape for the new connected client
        clients[id] = new UserLine(worldSize.width, worldSize.depth);
        clients[id].setPlaneVisible(false);
        clients[id].setLineAlwaysVisible(true);
        clients[id].transform.setLocalPosition(b,0,0);
        

        clients[id].box = new Mobilizing.Mesh({primitive:"box", width:1, height: 2, depth: 0.75 });
        
        clients[id].box.transform.setLocalPosition(0,0,0);
        clients[id].transform.addChild(clients[id].box.transform);
       
        world.transform.addChild(clients[id].transform);

      //  console.log("added client", id);
    };


    //clients transforms
    this.onClientPosition = function(data)
    {
        var id = data.id;
        var pos = new Mobilizing.Vector3().fromArray(data.pos);

        if(!(id in clients)){
            this.onClientConnect(id);
        }

       // console.log("new position");
           console.log(data);
        //update the client's cube position
       clients[id].transform.setLocalPosition(pos);
    };

    this.onClientRotation = function(data)
    {
       var id = data.id;
       var quaternion = new Mobilizing.Quaternion().fromArray(data.rot);

        if(!(id in clients)){
            this.onClientConnect(id);
        }

          /* console.log("rotation");
           console.log(data);*/
        // update the client's cube position
        clients[id].transform.setLocalQuaternion(quaternion);

        var dirVec = getDirectionsFromQuaternion(quaternion);

        clients[id].upVector = dirVec.upVector;


        var origin = clients[id].transform.getLocalPosition();
        var direction = clients[id].upVector.normalize();

        clients[id].ray.set(origin, direction);

        clients[id].box.transform.setLocalRotation(data.rot);

            for(var v in clients) {
                if(v != id) { // check everyone beeing touched except ourself
                var intersection = clients[id].ray.intersectsMeshBox(clients[v].box);
                if(intersection) {
                    console.log(id+" touch "+v);

                    context.fillStyle ="rgba(100,100,102,0.75)";

                    context.fillRect(0,0,512,512);

                    context.font = "Bold 80px Arial";
                    context.strokeStyle = "#FF0000";
                    context.fillStyle = "rgba(0,0,0,1)";
                    var ntext = v+"\n"+clients[v].uwb_pos[0]+":"+clients[v].uwb_pos[1]+":"+clients[v].uwb_pos[2]+"\nUWB_ID"
                    console.log(ntext);
                    context.fillText(ntext, 0, 250);

                    texture.setNeedsUpdate();

                }
            }
        }
        
    };

    this.onTagPosition = function(params)
    {
        console.log("tag position received ", params);
        //params.id
        //params.x
        //params.y
        //params.z

        for(var i in clients){
            clients[i].uwb_pos = [params.x,params.y,params.z];

            if(clients[i].tagID === Number(params.id)){
                clients[i].transform.setLocalPosition(params.x,params.y,params.z);
                //console.log(clients[i].transform.getLocalPosition());
            }

        }
    };

    //goodbye
    this.onClientDisconnect = function(id)
    {
        if(!(id in clients))
        {
            return;
        }

        console.log("disconnected");
        console.log(id);

        //remove the client's cube from the scene
        world.transform.removeChild(clients[id].transform);
        R.removeFromCurrentScene(clients[id]);
        clients[id].erase();
        delete clients[id];
    };


/////////////////////////////////////////////////////////////////////
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
       // console.log("setup");
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
        
        light2 = new Mobilizing.Light();
        light2.transform.setLocalPosition(0, 5, 0);
        light2.transform.setLocalRotation(-45,0,0);
        R.addToCurrentScene(light);

        /*test = new Mobilizing.Mesh({primitive:"box", width:0.5, height: 1.7, depth: 0.5 });
        test.transform.setLocalPosition(2,2,0);
        R.addToCurrentScene(test);*/

        touch = M.addComponent(new Mobilizing.input.Touch({"target": R.canvas}));
        M.addComponent(touch);
        touch.setup();//set it up
        touch.on();//active it
        mouse = M.addComponent(new Mobilizing.input.Mouse({"target": R.canvas}));

        M.addComponent(mouse);
        mouse.setup();//set it up
        mouse.on();//active it
        pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.add(mouse);


        document.addEventListener('keydown', function(event) {
         if (event.keyCode == 38) {
             console.log("going deeper ?");
             z = cam.transform.getLocalPositionY() - 0.5;
             cam.transform.setLocalPositionY(z);

            }else if (event.keyCode == 40) {
             console.log("going farer ?");
             z = cam.transform.getLocalPositionY() + 0.5;
             cam.transform.setLocalPositionY(z);

            }else if (event.keyCode == 39) {
             console.log("going farer ?");
             z = cam.transform.getLocalPositionX() + 0.5;
             cam.transform.setLocalPositionX(z);
            }else if (event.keyCode == 37) {
             console.log("going farer ?");
             z = cam.transform.getLocalPositionX() - 0.5;
             cam.transform.setLocalPositionX(z);
            }
        });

        //initialize a pubsub instance
        pubsub = new Mobilizing.net.PubSub();
        pubsub.events.on('connect', this.onConnect.bind(this));


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
        if(pointer.getState())  {
            cam.transform.setLocalRotationX(cam.transform.getLocalRotationX() + pointer.getDeltaX()/5);
            cam.transform.setLocalRotationY(cam.transform.getLocalRotationY() + pointer.getDeltaY()/5);
           }

    };
};