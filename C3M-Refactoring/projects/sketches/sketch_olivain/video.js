function SketchOlivainVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var clients = {};

    var txt_canvas;
    var texture;
    var context;
    var room;

    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
        this.sketch.subscribe('/disconnect', this.onClientDisconnect.bind(this));

        var R = EasyContext._renderer;

        var loader = new Mobilizing.Loader();
        loader.loadOBJ({url: "../3d/salleBox.obj", onLoad: this.loadedRoom.bind(this) });
        loader.consumeAll();

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
    };

    this.loadedRoom = function(model){

        room = model;
        room.transform.setLocalScale(100)
        room.transform.setLocalPositionY(-170); // ???
        var mat = new Mobilizing.Material({type: "basic"});
        mat.setColor(Mobilizing.Color.red);
        // mat.setWireframe(true);
        room.setMaterial(mat);

        room.material.setTexture(texture);
    }

    this.update = function()
    {
        this.targetToLit = [];

        for(var id in this.allTarget){

            var list = this.allTarget[id];

            for(var i in list){

                if(this.targetToLit[i] === undefined){
                    this.targetToLit[i] = list[i];
                }
            }
        }

        for(var i in this.targetToLit){

            if(this.targetToLit[i]){
                this.target[i].material.setOpacity(1);
            }else{
                this.target[i].material.setOpacity(.2);
            }
        }
        //console.log(this.targetToLit);
    };

    this.onConnect = function(id)
    {
        if (!clients.hasOwnProperty(id)) {    
            // create a shape for the new connected client
            clients[id] = new UserLine(100, 100);
            //clients[id].transform.setLocalPositionY(170);
            this.sketch.root.transform.addChild(clients[id].transform);
        }else{
            clients[id].setVisible(true);
        }
        clients[id].setPlaneVisible(false);
        clients[id].setLineAlwaysVisible(true);
        clients[id].setLineWidth(5);
        clients[id].setRayWidth(5);

        clients[id].box = new Mobilizing.Mesh({primitive:"box", width:1, height: 2, depth: 0.75 });

        clients[id].box.transform.setLocalPosition(0,0,0);
        clients[id].transform.addChild(clients[id].box.transform);

        this.sketch.root.transform.addChild(clients[id].transform);

        console.log("added client", id, this.sketch.root.getBoundingBox() ) ;

    };

    //add your callbacks below
    this.onTagPosition = function(params)
    {
        //console.log("tag position received ", params);
        //do something based on the tag position received
        //params.id
        //params.x
        //params.y
        //params.z

        for(var i in clients){

            if(clients[i].tagID === Number(params.id)){

                var pos = new Mobilizing.Vector3(params.x*100, params.z*100, params.y*-100);
                clients[i].transform.setLocalPosition(pos);
                //console.log(clients[i].transform.getLocalPosition());
            }

        }
    };

    this.onClientRotation = function(data)
    {
        var id = data.id;
        var quaternion = new Mobilizing.Quaternion().fromArray(data.rot);

        if(!(id in clients)){
            if(id){
                this.onConnect(id);
            }else{
                return;
            }
        }

        // update the client's cube position
        clients[id].rotationRoot.transform.setLocalQuaternion(quaternion);
        clients[id].tagID = data.tagID;

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

    this.onClientPosition = function(data)
    {
        var id = data.id;
        var pos = new Mobilizing.Vector3().fromArray(data.pos);

        if(!(id in clients)){
            if(id){
                this.onConnect(id);
            }else{
                return;
            }
        }
        clients[id].tagID = data.tagID;
        // update the client's cube position
        //clients[id].transform.setLocalPosition(pos);
    };

    this.onClientDisconnect = function(data)
    {
        var id = data.id;

        console.log(data);
        clients[id].setVisible(false);

        this.allTarget[id] = undefined;
    }
};

SketchManager.RegisterSketch(new SketchOlivainVideo()); //register so the system is able to use this sketch