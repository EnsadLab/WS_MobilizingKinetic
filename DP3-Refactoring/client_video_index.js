/**
 * Generic index for mobile devices clients
 */
function script(){

    this.genericClient  = new GenericClient("video");
    this.videoMapping   = new VideoMapping();
    
    var M = null;
    var R = null;
    var finalObject;

    this.preLoad = function(loader)
    { 
        this.videoMapping.preLoad(loader);

        loader.loadOBJ({url:"sketches/3d/petite_salle_d1_50k_t1/petite_salle_d1_50k_t1.obj", onLoad: this.onObjLoaded.bind(this)});
        //we preload all the registered sketches
        var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "video")
            {
                if (sketch.preLoad)
                    sketch.preLoad(loader);
            }
        }
    };

    this.onObjLoaded = function(model)
    {
        finalObject = model;
        console.log("onObjLoaded");
    };

    this.setup = function()
    {
        console.log("client_video_index setup");
        M = this.getContext();

        EasyContext.SetContext(M);
        EasyContext.CreateVideoMappingScene();
        R = EasyContext._renderer;

        M.addComponent(this.genericClient);
        this.genericClient.setup(); //new

        //tells the video mapping to use this pubsub
        this.videoMapping.setPubsub(this.genericClient.pubsub);
        
        

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

        //EasyContext._renderer.setClearColor(Mobilizing.Color.red.clone());

        var light = new Mobilizing.Light();
        light.setDistance(20000);
        light.setIntensity(2);
        EasyContext._renderer.addToCurrentScene(light);
        EasyContext._light2 = light;
        //add all video sketches that are of category "video"
        var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            console.log("sketch=" + s);
            var sketch = sketches[s];
            if (sketch.sketch.category === "video")
            {
                sketch.sketch.enabled = true;
                sketch.sketch.pubsub = this.genericClient.pubsub; //connect pubsub
                //sketch.sketch.init();
                //create root : this will be used to show/hide the sketch
                sketch.sketch.root = new Mobilizing.Mesh({ primitive: "node" }); 
                R.addToCurrentScene(sketch.sketch.root);
                M.addComponent(sketch);
                sketch.setup();
                sketch.sketch.off(); //off by default
            } 
        }

        //connection
        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));
    };

    //this.onConnect = function(){
    //     console.log("on connect",this.genericClient.pubsub.id);
    //    this.genericClient.pubsub.subscribe(this.genericClient.pubsub.id, this.genericClient.onSwitchToProject.bind(this.genericClient));
    //};

    this.onConnect = function(){
        //listen to the server
        console.log("video client onConnect");
        this.genericClient.pubsub.subscribe("/next", this.onNext.bind(this));
        this.genericClient.pubsub.subscribe("/sketch/state", this.onSketchState.bind(this));

        //we activate all sketches
        var sketches = SketchManager.GetSketches();

        for (var s in sketches)
        {
            var sketch = sketches[s];

            if(sketch.onConnect){
                console.log("forward onConnect to", sketch);
                sketch.onConnect(this.genericClient.pubsub.getID());
            }

        }
    };

    this.update = function()
    {
        //nothing her
    };

    this.onNext = function()
    {

    };

    this.onSketchState = function(params)
    {
        console.log("onSketchState received", params);
        //change this sketch state (visibility)
        SketchManager.SetSketchState(params.name, params.state);
    };

}
