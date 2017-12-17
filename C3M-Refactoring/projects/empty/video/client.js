function client()
{
    this.genericClient = new GenericClient("video");
    this.videoMapping = new VideoMapping();

    var M, R;
    var finalObject;

    this.preLoad = function(loader)
    {
        this.videoMapping.preLoad(loader);
        
        loader.loadOBJ({url:"../../common/3D/espace1_50k_t1.obj", onLoad: this.onObjLoaded.bind(this)});
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
        R = M.addComponent(new Mobilizing.Renderer3D());

        //add the genericClient (network management)
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //tells the video mapping to use this pubsub
        this.videoMapping.setPubsub(this.genericClient.pubsub);
        //connection
        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));

        //aggregates the video mapping main project and the project scene
        M.addComponent(this.videoMapping);
        this.videoMapping.setRenderer(R);
        this.videoMapping.setup();
        //set the finalObject model (wrong component preload in Mob)
        this.videoMapping.setFinalObject(finalObject);
        
        this.videoMapping.setMode(2);
        
        //faire une texture et la plaquer su l'objet final
        //puise dessiner depuis une surface
        //finalObjec
        
        //your stuff here
        R.setCurrentScene("virtual");

        var light = new Mobilizing.Light();
        light.setDistance(2000);
        light.setIntensity(2);
        R.addToCurrentScene(light);

        var cube = new Mobilizing.Mesh({primitive:"cube", size:100});
        R.addToCurrentScene(cube);
        cube.transform.setLocalPosition(0,170,200);
    };

    this.onConnect = function(){
        //listen to the server
        console.log("video client onConnect");
    };

    this.update = function()
    {

    };
}
