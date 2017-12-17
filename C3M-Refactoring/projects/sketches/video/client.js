function client()
{
    this.genericClient = new GenericClient("video");
    this.videoMapping = new VideoMapping();

    var M, R;
    var finalObject;


    this.preLoad = function(loader)
    {
        this.videoMapping.preLoad(loader);
        loader.loadOBJ({url:"../3d/petite_salle_d1_50k_t1/petite_salle_d1_50k_t1.obj", onLoad: this.onObjLoaded.bind(this)});
    };

    this.onObjLoaded = function(model)
    {
        finalObject = model;
        console.log("onObjLoaded");
    };

    this.setup = function()
    {
        //generic stuff
        M = this.getContext();
        EasyContext.SetContext(M);
        EasyContext.CreateVideoMappingScene();
        R = EasyContext._renderer;

        //add the genericClient (network management)
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //tells the video mapping to use this pubsub
        this.videoMapping.setPubsub(this.genericClient.pubsub);
        //connection
        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));

        //aggregates the video mapping main project and the project scene
        M.addComponent(this.videoMapping);
        //this.videoMapping.debugMode = true;
        this.videoMapping.setRenderer(EasyContext._renderer);
        this.videoMapping.setup();
        //set the finalObject model (wrong component preload in Mob)
        this.videoMapping.setFinalObject(finalObject);

        //0 mode mire (modèle)
        //2 immersive mode
        //1 model mode
        //3 wireframe
        this.videoMapping.setMode(2); //2

        //your stuff here
        EasyContext._renderer.setCurrentScene("virtual");

        EasyContext._renderer.setClearColor(Mobilizing.Color.red.clone());

        var light = new Mobilizing.Light();
        light.setDistance(20000);
        light.setIntensity(2);
        EasyContext._renderer.addToCurrentScene(light);



        //add all video sketches that are of category "video"
        var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "video")
            {
                sketch.sketch.pubsub = this.genericClient.pubsub; //connect pubsub
                //sketch.sketch.init();
                //create root : this will be used to show/hide the sketch
                sketch.sketch.root = new Mobilizing.Mesh({ primitive: "node" }); 
                R.addToCurrentScene(sketch.sketch.root);
                M.addComponent(sketch);
                sketch.setup();
            } 
        }


    };

    this.onConnect = function(){
        //listen to the server
        console.log("video client onConnect");
        this.genericClient.pubsub.subscribe("/next", this.onNext.bind(this));

        //we activate all sketches
        var sketches = SketchManager.GetSketches();
        
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "video")
            {
                sketch.sketch.on(); //by default all sketches are on
            }

            if(sketch.onConnect){
                console.log("forward onConnect to", sketch);
                sketch.onConnect(this.genericClient.pubsub.getID());
            }

        }
    };

    this.update = function()
    {
        //test : make all the sketches turn in the space
        /*var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "video")
            {
                var angle = sketch.sketch.root.transform.getLocalRotation();
                angle.y += 1;
                sketch.sketch.root.transform.setLocalRotation(angle);
            }
        }
        */
    };

    this.onNext = function()
    {

    }



}
