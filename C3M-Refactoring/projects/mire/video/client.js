
function client(){

    this.genericClient = new GenericClient("video");
    this.videoMapping = new VideoMapping();

    var M, R;
  
    var timerView = 0;

    var textures = [];

    var finalObject;

    this.preLoad = function(loader)
    {
        this.videoMapping.preLoad(loader);
        textures.push(loader.loadImage({ url: "SAM_100_0023.jpg" }));
        textures.push(loader.loadImage({ url: "mirecrosscolor.png" }));
        textures.push(loader.loadImage({ url: "mire32.png" }));
        textures.push(loader.loadImage({ url: "Arches_E_PineTree_8k.jpg" }));
        textures.push(loader.loadImage({ url: "mireh.png" }));
        textures.push(loader.loadImage({ url: "mireverticale.png" }));
        textures.push(loader.loadImage({ url: "mireline2.png" }));
        textures.push(loader.loadImage({ url: "mirecolorsquare.png" }));
        textures.push(loader.loadImage({ url: "mirenoise.png" }));
        textures.push(loader.loadImage({ url: "mirecrosswhitesmall.png" }));
        textures.push(loader.loadImage({ url: "Tropical_Beach_8k.jpg" }));
        textures.push(loader.loadImage({ url: "Road_to_MonumentValley_8k.jpg" }));
        textures.push(loader.loadImage({ url: "white.png" }));

        //loader.loadOBJ({url:"../../common/3D/espace1_50k_t1.obj", onLoad:this.onObjLoaded.bind(this)});
        loader.loadOBJ({ url: "../../common/3D/espace2_50k_t1.obj", onLoad: this.onObjLoaded.bind(this) });
        
        console.log("load called");

        
    };

    this.onObjLoaded = function(model)
    {
        finalObject = model;
    };

    this.setup = function()
    {
        //generic stuff
        M = this.getContext();
        R = M.addComponent(new Mobilizing.Renderer3D());
        
        //add the genericClient (network management)
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //tells the video mapping to use this pubsub
        this.videoMapping.setPubsub(this.genericClient.pubsub);
        //connection
        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));

        //aggregates the video mapping main project and the project scene
        //M.addBehaviour(null, this.videoMapping);
        M.addComponent(this.videoMapping);
        this.videoMapping.setRenderer(R);
        this.videoMapping.setup();
        this.videoMapping.setFinalObject(finalObject);
        
        //your stuff here
        //this.videoMapping.disc.transform.setVisible(false);
        R.setCurrentScene("virtual");
        //var light = M.createLight();
        var light = new Mobilizing.Light();
        light.setDistance(2000);
        light.setIntensity(2);
        R.addToCurrentScene(light);
        console.log(textures[1]);


        var img = textures[1].getValue();
        var texture = new Mobilizing.Texture({ image: img });
        console.log("texture=", texture);
        this.sphere1 = this.createSkysphere(texture);



        for (var i=0;i<36;++i)
        {
            var box = new Mobilizing.Mesh({primitive:"sphere", radius:50, hsegments:10, color:Mobilizing.Color.random()});
            var angle = i * Math.PI/18;
            box.transform.setLocalPosition(Math.cos(angle) * 600, 0, Math.sin(angle) * 600);
            box.material.setColor(Mobilizing.Color.random());
            R.addToCurrentScene(box);
        }

        for (var alt=500;alt<20000;alt+=200)
        {
            for (var i=0;i<36;++i)
            {
                var box = new Mobilizing.Mesh({primitive:"box", width:50, height:50, depth:50, color:Mobilizing.Color.random()});
                var angle = i*Math.PI/18;
                box.transform.setLocalPosition(Math.cos(angle) * 600, alt, Math.sin(angle) * 600);
                box.material.setColor(Mobilizing.Color.random());
                R.addToCurrentScene(box);
            }

        }

        for (var i=0; i<36; ++i)
        {
            var box = new Mobilizing.Mesh({primitive:"box", width:50, height:50, depth:50, color:Mobilizing.Color.random()});
            var angle = i*Math.PI/18;
            box.transform.setLocalPosition(Math.cos(angle) * 600, 170, Math.sin(angle) * 600);
            box.material.setColor(Mobilizing.Color.random());
            R.addToCurrentScene(box);
        }
        

        var box = new Mobilizing.Mesh({primitive:"box", width:50, height:50, depth:50, color:Mobilizing.Color.random()});
        var angle = i*Math.PI/36;
        box.transform.setLocalPosition(0, 800, 0);
        R.addToCurrentScene(box);

        //color cubes scene
        for (var x = -10; x <= 10; x += 1) {
            for (var y = -10; y <= 10; y += 1) {
                //the default cube has a size of 100 units (for now), and then the scale is applied
                var c = new Mobilizing.Mesh({ primitive: "cube" });
                c.material.setColor(Mobilizing.Color.random());
                c.transform.setLocalPosition((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -10 + (Math.random() * 10)); //set the position in space
                c.transform.setLocalScale(0.2); //set scale
                c.transform.setLocalEulerAngles(Math.random() * 360, Math.random() * 360, Math.random() * 360);
                R.addToCurrentScene(c);
            }
        }
    };

    this.createSkysphere = function(t)
    {
        //var s = Mobilizing.Mesh.CreateSphere(900,100,100);
        var s = new Mobilizing.Mesh({ primitive: "sphere", radius: 700, segments : 100 });
        R.addToCurrentScene(s);
        s.transform.setLocalPosition(0,170,0);
        s.transform.setLocalScale(-1,1,1); //inverted sphere
        s.material = new Mobilizing.Material({type:"basic"});
        if (t !== undefined)
        {
            s.material.setTexture(t);
            s.updateMaterial();
        }
        return s;
    };

    this.createSkyCylinder = function(t)
    {
        var cylinder = new Mobilizing.Mesh({primitive:"cylinder", height:1800, radiusTop:900, radiusBottom:900, openEnded:true, color:Mobilizing.Color.white});
        //var s = Mobilizing.Mesh.CreateSphere(900,100,100);
        R.addToCurrentScene(cylinder);
        cylinder.transform.setLocalPosition(0,170,0);
        cylinder.transform.setLocalScale(-1,1,1); //inverted sphere
        cylinder.material = new Mobilizing.Material({type:"basic"});
        if (t !== undefined)
        {
            cylinder.material.setTexture(t);

            cylinder.updateMaterial();
        }
        return cylinder;
    };

    this.onConnect = function()
    {
        //listen to the server
        this.genericClient.pubsub.subscribe("/mire/index", this.onMireIndex.bind(this));
        this.genericClient.pubsub.subscribe("/mire/mode", this.onMode.bind(this));
        this.genericClient.pubsub.subscribe("/mire/meshwarpingmode", this.onMeshWarpingMode.bind(this));
        this.genericClient.pubsub.subscribe("/mire/blendingmode", this.onBlendingMode.bind(this));

    };

    this.onMireIndex = function(data)
    {
        console.log(data, textures[data % textures.length].getValue());
        var texture = new Mobilizing.Texture({ image: textures[data % textures.length].getValue() });
        this.sphere1.material.setTexture(texture);
    };

    this.onMode = function (data)
    {
        var mode = data % 5;
        this.videoMapping.setMode(mode);
    };

    this.onMeshWarpingMode = function (data)
    {
        var mode = data % 3;
        this.videoMapping.setMeshWarpingMode(mode);
    };

    this.onBlendingMode = function (data) {
        var mode = data % 3;
        this.videoMapping.setBlendingMode(mode);
    };




    this.update = function()
    {
        /*timerView += M.Time.deltaTime;
        if (timerView > 10)
        {

            timerView -= 10;
            this.sphere1.material.setTexture(textures[(tour++)%textures.length]);
        }
        */

        //labelsGroup.transform.setLocalRotationY(r += .03);
    };

    var index = 0;
    this.onKeyDown = function(e){

        console.log(e);
        if (e.keyIdentifier === "Enter" || e.key === "Enter") {
            console.log ( "key down");
            index++;
            this.sphere1.material.setTexture(textures[index % textures.length].getValue());
        }
    }
}
