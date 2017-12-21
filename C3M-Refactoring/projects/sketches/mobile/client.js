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
 
    var tagNb = [3,4,70,21,56];

    var buttons = [];

    var tagID;

    this.setup = function()
    {
        M = this.getContext();
        EasyContext.SetContext(M);
        EasyContext.CreateScene(); //mobile scene
        R = EasyContext._renderer;
        this.camera = EasyContext._camera;
        this.camera.transform.setLocalPositionZ(50);
        this.camera.setToPixel();

        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //construct the tag number list

        for(var i=0; i< tagNb.length; i++){

            var tag = tagNb[i];

            var bt = new Mobilizing.Button({camera: this.camera,
                                            pointer: EasyContext._pointer,
                                            strokeWidth: .1,
                                            textSize: 40,
                                            radius:1,
                                            canvasWidth: 100,
                                            canvasHeight: 100,
                                            text:"<b>"+tag+"</b>",
                                            onPress: this.onPress
                                           });
            bt.tagID = tag;
            M.addComponent(bt);
            bt.setup();

            buttons.push(bt);
        }

        this.selectGrid = new Mobilizing.ButtonGroup({buttons: buttons, columns: 8, mode:"honeycomb"});

        this.selectGrid.root.transform.setLocalScale(60);
        this.selectGrid.root.transform.setLocalPosition(100, -500, 0);
        R.addToCurrentScene(this.selectGrid.root);        

        var bt = new Mobilizing.Button({camera: this.camera,
                                        pointer: EasyContext._pointer,
                                        strokeWidth: .1,
                                        textSize: 14,
                                        width:100*2,
                                        height: 50*2,
                                        canvasWidth: 100,
                                        canvasHeight: 50,
                                        text:"<b>Show tags</b>",
                                        onPress: function(){
                                            if(this.selectGrid.root.getVisible()){
                                                this.selectGrid.root.setVisible(false);
                                            }else{
                                                this.selectGrid.root.setVisible(true);
                                            }
                                        }.bind(this)
                                       });
        bt.transform.setLocalPosition(150, -100, 0);
        M.addComponent(bt);
        bt.setup();
        R.addToCurrentScene(bt);


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
                sketch.sketch.tagID = tagID;
            } 
        }
    };

    this.onPress = function(){
        
        tagID = this.tagID;
        console.log(tagID);
        
        var sketches = SketchManager.GetSketches();
        for (var s in sketches)
        {
            var sketch = sketches[s];
            if (sketch.sketch.category === "mobile")
            {
                sketch.tagID = tagID;
            } 
        }
    }

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
