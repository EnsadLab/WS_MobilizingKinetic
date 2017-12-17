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
        this.camera = EasyContext._camera;
        this.camera.transform.setLocalPositionZ(50);
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //assure une bonne execution du pubsub pour une prise en compte de ce client
        this.genericClient.pubsub.events.on("connect", this.onConnect.bind(this) );
        /*
        //to do : move the button to the easy context ?
        var nextBt = new Mobilizing.Button({
            camera: this.camera,
            pointer: pointer,
            width: 5,
            height: 2,
            strokeWidth: .1,
            text: "NEXT",
            textSize: 60, 
            onRelease: function(){ this.switch() }.bind(this)
        });
        M.addComponent(nextBt);
        nextBt.transform.setLocalPositionY(4);
        nextBt.setup();
        EasyContext._renderer.addToCurrentScene(nextBt.root);
        */

        //add all mobile sketches
        var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "mobile")
            {
                sketch.sketch.pubsub = this.genericClient.pubsub; //connect pubsub
                
                M.addComponent(sketch);
                sketch.setup();
            } 
        }
    };


    //connection callback
    this.onConnect = function()
    {
        console.log("mobile client onConnect");

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
};
