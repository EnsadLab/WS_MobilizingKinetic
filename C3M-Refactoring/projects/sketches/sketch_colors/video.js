function SketchColorsVideo()
{
    //declare sketch
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name;
    this.sketch.category = "video";

    var clients = {};
    var worldSize = {width: 500, height: 600, depth: 400};//in meters

    this.setup = function()
    {
        //put here all your sketch scene and logic creation 
        console.log("SketchLinesVideo setup ");

        this.sketch.subscribe("/tag/position",this.onTagPosition.bind(this));
        this.sketch.subscribe('/mobile/rot', this.onClientRotation.bind(this));
        this.sketch.subscribe('/mobile/pos', this.onClientPosition.bind(this));
        this.sketch.subscribe('/mobile/upColor', this.onClientUpColor.bind(this));
        this.sketch.subscribe('/mobile/downColor', this.onClientDownColor.bind(this));

        var R = EasyContext._renderer;

    };

    this.update = function()
    {
        //put your process in there
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

            if(clients.tagID === params.id){

                var pos = new Mobilizing.Vector3(params.x*100, params.z*100, 0 /*params.y*-100*/);
                clients[id].transform.setLocalPosition(pos);
            }

        }
    };

    this.onConnect = function(id)
    {
        // create a shape for the new connected client
        clients[id] = new UserLine(worldSize.width, worldSize.depth);
        clients[id].setPlaneVisible(false);
        clients[id].setLineAlwaysVisible(false);

        clients[id].sphere = new UserSphere(worldSize.width*2);
        clients[id].transform.addChild(clients[id].sphere.transform);

        this.sketch.root.transform.addChild(clients[id].transform);
        console.log("added client", id, this.sketch.root.getBoundingBox() ) ;

    };

    this.onClientRotation = function(data)
    {
        var id = data.id;
        var rot = new Mobilizing.Quaternion().fromArray(data.rot);


        // update the client's cube position
        clients[id].transform.setLocalQuaternion(rot);
    };

    this.onClientPosition = function(data)
    {
        var id = data.id;
        var pos = new Mobilizing.Vector3().fromArray(data.pos);

        // update the client's cube position
        //clients[id].transform.setLocalPosition(pos);
    };

    this.onClientUpColor = function(data){

        var id = data.id;
        var color = data.color;

        var up = clients[id].sphere;
        up.setTopColor(color);
    }

    this.onClientDownColor = function(data){

        var id = data.id;
        var color = data.color;

        var down = clients[id].sphere;
        down.setBottomColor(color);
    }
    
    this.onClientDisconnect = function(data)
    {
        var id = data.id;

        console.log(data);
        clients[id].transform.setVisible(false);
    }

};

SketchManager.RegisterSketch(new SketchColorsVideo()); //register so the system is able to use this sketch