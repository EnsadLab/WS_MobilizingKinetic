//==============================================================
//client.js
//==============================================================
function client()
{

    this.genericClient = new GenericClient("mobile");

    var M,R;

    this.camera;

    var touch;
    var pointer;
    var mouse;

    //ne doit pas être vide de chargement
    /*this.preLoad = function()
    {
        M = this.getContext();
    };*/

    this.setup = function()
    {
        M = this.getContext();
        EasyContext.SetContext(M);
        EasyContext.CreateScene(); //mobile scene
        R = EasyContext._renderer;
        this.camera = EasyContext._camera;
        this.camera.transform.setLocalPositionZ(50);
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //assure une bonne execution du pubsub pour une prise en compte de ce client
        this.genericClient.pubsub.events.on("connect", this.onConnect.bind(this) );
        
        //add all mobile sketches
        var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "mobile")
            {
                sketch.sketch.enabled = true;
                sketch.sketch.pubsub = this.genericClient.pubsub; //connect pubsub
                sketch.sketch.root = new Mobilizing.Mesh({ primitive: "node" }); 
                R.addToCurrentScene(sketch.sketch.root);
                M.addComponent(sketch);
                sketch.setup();
                sketch.sketch.off(); //off by default
            } 
        }
    };


    //connection callback
    this.onConnect = function()
    {
        console.log("mobile client onConnect");
        this.genericClient.pubsub.subscribe("/sketch/state", this.onSketchState.bind(this));
        
        //register the pubsub messages
        //sketch on/off
        //move sketches
    };

    this.switch = function()
    {

        //this.genericClient.pubsub.publish("/next");
    }

    this.update = function()
    {
        //timeline management
        //turn on and off sketches based on their position in the timeline

        
    };


    this.onSketchState = function(params)
    {
        SketchManager.SetSketchState(params.name, params.state);
    };
};
