function SketchExpoVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    this.target = [];
    this.allTarget = {};
    this.targetToLit = [];

    var clients = {};

    var images = [];
    var cubes = [];
    this.preLoad = function(loader)
    {
        console.log("SketchExpoVideo preLoad");
        for (var i=1;i<=10;++i)
        {
            var imgurl = "../sketch_expo/images/" + i + ".jpg";
            var img = loader.loadImage({ url: imgurl });
            images.push(img);
        }
    };


    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
        this.sketch.subscribe('/disconnect', this.onClientDisconnect.bind(this));

        var R = EasyContext._renderer;

        /*var step = 360 / 100;

        for(var i=0; i<360*4; i += step){

            var box = new Mobilizing.Mesh({primitive: "cube",
                                           size : 100});
            var x =  1500 * Math.cos((Mobilizing.math.degToRad(step)*i));
            var z =  1500 * Math.sin((Mobilizing.math.degToRad(step)*i));
            box.transform.setLocalPosition(x, i - 100, z);
            box.transform.lookAt(new Mobilizing.Vector3());
            box.material.setTransparent(true);
            this.target.push(box);
            this.sketch.root.transform.addChild(box.transform);
        }
        */
        var x = -370;
        var y = 200;
        var z = -600;

        for (var i in images)
        {
            console.log("add image cube");
            var img = images[i].getValue();
            
            var cube = new Mobilizing.Mesh({ primitive: "plane"});//, material : "basic"});
            //cube.material.setColor(Mobilizing.Color.random());
            cube.material.setColor(Mobilizing.Color.white);
            cube.transform.setLocalScale(200,100,1); //set scale
            this.sketch.root.transform.addChild(cube.transform);
            cubes[i] = cube;
            //x = Math.random()*1000-500;
            y = Math.random()*400;
            //z = Math.random()*1000-500;
            //cube.transform.lookAt(0,0,0);
            cube.transform.setLocalRotation(Math.random()*360, Math.random()*360,Math.random()*360);
            //cube.transform.lookAt(new Mobilizing.Vector3(0,170,0));
            //we have to invert y and z
            //we could use an animation to smooth out the positions
            cube.transform.setLocalPosition(x, y, z); 

            cube.material.setTexture(new Mobilizing.Texture({ image: img }));
            cube.updateMaterial();

            z += 100;

        }

        var testCube = new Mobilizing.Mesh({primitive: "cube",
                                            size : 100});

        var light = new Mobilizing.Light();
        light.setIntensity(20000);
        light.setIntensity(0.2);
        light.transform.setLocalPositionY(170);
        R.addToCurrentScene(light);
        
        var x =  1000;
        var z =  1000;
        testCube.transform.setLocalPosition(x, 0, z);
        //this.sketch.root.transform.addChild(testCube.transform);
    };

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



        var light = new Mobilizing.Light({type:"spot"});
        light.transform.setLocalPosition(0,0,0);
        light.setTargetPosition(light.transform.getLocalPosition().x, light.transform.getLocalPosition().y, -100);
        light.setIntensity(10);
        light.setDistance(1000);
        light.setPenumbra(.5);
        light.setAngle(Math.PI/5);

        clients[id].spot = light;
        clients[id].transform.addChild(light.transform);

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

            if(! (id in this.allTarget)){
                this.allTarget[id] = [];
            }

            if(clients[id].ray.intersectsMeshBox(this.target[i])){
                //console.log(i, this.target[i]);
                this.allTarget[id][i] = this.target[i];
            }else{
                this.allTarget[id][i] = undefined;
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

SketchManager.RegisterSketch(new SketchExpoVideo()); //register so the system is able to use this sketch