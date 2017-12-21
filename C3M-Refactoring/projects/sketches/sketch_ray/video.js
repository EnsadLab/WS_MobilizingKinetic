function SketchRayVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    this.target = [];

    var clients = {};

    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
        this.sketch.subscribe('/disconnect', this.onClientDisconnect.bind(this));

        var R = EasyContext._renderer;

        var step = 360 / 100;

        for(var i=0; i<360*2; i += step){

            var box = new Mobilizing.Mesh({primitive: "cube",
                                           size : 100});
            var x =  10000 * Math.cos((Mobilizing.math.degToRad(step)*i));
            var z =  10000 * Math.sin((Mobilizing.math.degToRad(step)*i));
            box.transform.setLocalPosition(x, i*10 - 100, z);
            box.transform.lookAt(new Mobilizing.Vector3());
            //box.material.setTransparent(true);
            this.target.push(box);
            this.sketch.root.transform.addChild(box.transform);
        }

        var testCube = new Mobilizing.Mesh({primitive: "cube",
                                            size : 100});

        var x =  1000;
        var z =  1000;
        testCube.transform.setLocalPosition(x, 0, z);
        this.sketch.root.transform.addChild(testCube.transform);
    };

    this.update = function()
    {
        //put your process in there
    };

    this.onConnect = function(id)
    {
        if (!clients.hasOwnProperty(id)) {    
            // create a shape for the new connected client
            clients[id] = new UserLine(100, 100);
            //clients[id].transform.setLocalPositionY(170);
            this.sketch.root.transform.addChild(clients[id].transform);
        }

        clients[id].setPlaneVisible(false);
        clients[id].setLineAlwaysVisible(true);

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

        for(var i in this.target){

            if(clients[id].ray.intersectsMeshBox(this.target[i])){
                //console.log(i, this.target[i]);
                this.target[i].setVisible(true);
            }else{
                //this.target[i].setVisible(false);
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

        clients[id].setPlaneVisible(false);
        clients[id].setLineAlwaysVisible(false);
    }
};

SketchManager.RegisterSketch(new SketchRayVideo()); //register so the system is able to use this sketch