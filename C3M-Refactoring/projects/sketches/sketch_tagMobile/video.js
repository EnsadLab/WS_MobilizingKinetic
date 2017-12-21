function SketchTabMobVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var clients = {};

    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log(this.sketch.name + " setup");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
        this.sketch.subscribe('/mobile/pos', this.onClientPosition.bind(this));

        var R = EasyContext._renderer;

    }; 

    this.update = function()
    {
        //put your process in there
    };

    this.onConnect = function(id)
    {
        // create a shape for the new connected client
        clients[id] = new UserLine(100, 100);
        clients[id].setPlaneVisible(true);
        clients[id].setLineAlwaysVisible(true);
        //clients[id].transform.setLocalPositionY(170);
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
        var rot = new Mobilizing.Quaternion().fromArray(data.rot);

        if(!(id in clients)){
            if(id){
                this.onConnect(id);
            }else{
                return;
            }
        }

        // update the client's cube position
        clients[id].rotationRoot.transform.setLocalQuaternion(rot);
        clients[id].tagID = data.tagID;
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
};

SketchManager.RegisterSketch(new SketchTabMobVideo()); //register so the system is able to use this sketch