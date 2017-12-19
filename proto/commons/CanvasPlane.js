function CanvasPlane(width, height, canvasWidth, canvasHeight)
{
    this.width = width || 1;
    this.height = height || 1;
    this.mesh;
    this.canvas;
    this.canvasWidth = canvasWidth || 512;
    this.canvasHeight = canvasHeight || 512;
    this.canvasContext;
    this.texture;

    this.setup = function()
    {
        this.mesh = new Mobilizing.Mesh({primitive: "plane",
                                         width: this.width,
                                         height: this.height,
                                         material:"basic"});

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        this.canvasContext = this.canvas.getContext("2d");

        this.texture = new Mobilizing.Texture({canvas: this.canvas});

        this.mesh.material.setTexture(this.texture);
        this.mesh.material.setShading("flat");
        this.mesh.material.setShininess(0);
        this.mesh.material.setTransparent(true);
    };

    this.setToRenderer = function(R){
        R.addToCurrentScene(this.mesh);
    }

    this.update = function()
    {
        this.texture.setNeedsUpdate();
    };
};

function CanvasPanoScreen(width, height, depth, canvasWidth, canvasHeight){

    this.planes;
    this.width = width || 1;
    this.height = height || 1;
    this.depth = depth || 1;
    this.canvasWidth = canvasWidth || 512;
    this.canvasHeight = canvasHeight || 512;
    this.planesArray = []; //for easy ref
    this.planeTotal;

    this.setup = function(){

        this.planes = new Mobilizing.Mesh({primitive:"node"});

        this.front = new CanvasPlane(this.width, this.height, this.canvasWidth, this.canvasHeight);
        this.front.setup();
        this.front.mesh.transform.setLocalRotationY(180);//reverse uv
        this.front.mesh.transform.setLocalPositionZ(this.depth/2);
        //this.planes.transform.addChild(this.front.mesh.transform);
        this.planesArray.push(this.front);

        this.back = new CanvasPlane(this.width, this.height, this.canvasWidth, this.canvasHeight);
        this.back.setup();
        this.front.mesh.transform.setLocalScale(-1,1,1);//reverse uv
        this.back.mesh.transform.setLocalPositionZ(-this.depth/2);
        //this.planes.transform.addChild(this.back.mesh.transform);
        this.planesArray.push(this.back);

        this.left = new CanvasPlane(this.depth, this.height, this.canvasWidth, this.canvasHeight);
        this.left.setup();
        this.left.mesh.transform.setLocalRotationY(-90);//reverse uv
        this.left.mesh.transform.setLocalPositionX(-this.width/2);
        //this.planes.transform.addChild(this.left.mesh.transform);
        this.planesArray.push(this.left);

        this.right = new CanvasPlane(this.depth, this.height, this.canvasWidth, this.canvasHeight);
        this.right.setup();
        this.right.mesh.transform.setLocalRotationY(90);//reverse uv
        this.right.mesh.transform.setLocalPositionX(this.width/2);
        //this.planes.transform.addChild(this.right.mesh.transform);
        this.planesArray.push(this.right);

        this.planeTotal = this.planesArray.length;
    };

    this.update = function(){

        for(var i in this.planesArray){
            var plane = this.planesArray[i];
            plane.update();
        }
    }

    this.setToRenderer = function(R){
        for(var i in this.planesArray){
            var plane = this.planesArray[i];
            plane.setToRenderer(R);
        }
    }


    this.clearPlanes = function(){

        for(var i in this.planesArray){
            var plane = this.planesArray[i];
            plane.canvasContext.fillStyle = "rgba(0,0,0,0)";
            plane.canvasContext.clearRect(0,0, plane.canvas.width, plane.canvas.height);
            plane.update();
        }
    }

    this.fillPlanes = function(color){
        for(var i in this.planesArray){
            var plane = this.planesArray[i];
            plane.canvasContext.fillStyle = color;
            plane.canvasContext.fillRect(0,0, plane.canvas.width, plane.canvas.height);
            plane.update();
        }
    }

}
