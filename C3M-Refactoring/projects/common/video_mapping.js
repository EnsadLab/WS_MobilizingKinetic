/**
 * video generic client for C3M in Mobilizing
 */
function VideoMapping(params){

    if(params){
        this.cameraCubeSize = params.cameraCubeSize;
    }else{
        this.cameraCubeSize = 2048;
    }

    this.debugMode = false;

    //Mobilizing context
    var M = null;
    var R = null;

    var pointer;
    this.camerasGroup;
    this.cameras = [];

    this.cameraCube  = null;
    var cubeMapTexture = null;
    var light = null;
    var finalobject = null;
    var finalMaterial = null;
    var finalTexture = null;
    var finalImg;

    var imgSoft;

    var projectorResolution = {x:1400, y:1050};
    var videoOutputResolution = {x:3840, y:2160};

    var warping_select_x = 0.5;
    var warping_select_y = 0.5;
    var warping_select_radius = 100;

    var warping_width = 16*2;
    var warping_height = 9*2;


    var projectordata =
        [
            //workshop gaîté Lyrique petite salle
            {x:-0.3865741,y:290.5,z:-52.54564,rx:0,ry:0.3793071,rz:359.4626,cx:4.9,cy:290.5,cz:746,ux:0.009380065,uy:0.999956,uz:0,hs:0,vs:0,fov:38.6246},
            {x:-419.6722,y:280.2,z:366.9787,rx:0,ry:89.7097,rz:359.3583,cx:374,cy:280.2,cz:371,ux:0,uy:0.9999373,uz:-0.01119903,hs:0,vs:0,fov:39.02763},
            {x:-420.4124,y:273.3,z:-375.1005,rx:0,ry:90.16589,rz:359.0784,cx:373.78,cy:273.3,cz:-377.4,ux:0,uy:0.9998707,uz:-0.01608356,hs:0,vs:0,fov:38.81395},
            {x:1.778113,y:271.3,z:38.02724,rx:0,ry:180.2458,rz:0.1382615,cx:-1.6,cy:271.3,cz:-749.4,ux:0.002413095,uy:0.9999971,uz:0,hs:0,vs:0,fov:39.11279},
            {x:422.0862,y:278.6,z:-380.361,rx:0,ry:270.4144,rz:0.4450853,cx:-374.42,cy:278.6,cz:-374.6,ux:0,uy:0.9999698,uz:-0.007767923,hs:0,vs:0,fov:38.73487},
            {x:425.6877,y:287.2,z:368.8908,rx:0,ry:270.3024,rz:0.3085319,cx:-371.92,cy:287.2,cz:373.1,ux:0,uy:0.9999855,uz:-0.005384796,hs:0,vs:0,fov:38.50241}       
        ];
    
    this.setPubsub = function(pubsub){
        this.pubsub = pubsub;
    };

    this.setRenderer = function (_R)
    {
        R = _R;
    };

    this.getProjectorData = function () {
        return projectordata;
    };
    this.preLoad = function(loader)
    {
        /*
        for (var i = 0; i < 6; i++) {
            var maskurl = "../../common/3D/mask" + i + ".png";
            projectordata[i].imgMask = loader.loadImage({ url: maskurl });
        }
        */
        imgSoft = loader.loadImage({ url: "../../common/3D/soft.png" });
        finalImg = loader.loadImage({ url: "../3d/petite_salle_d1_50k_t1/petite_salle_d1_50k_t1_u1_v1.jpg" });

    };

    //note : we don't use the setup as in usual project, see createScene
    this.setup = function()
    {
        console.log("VideoMapping::setup");
        M = this.getContext();

        var touch = M.addComponent(new Mobilizing.input.Touch({"target": R.canvas}));
        touch.setup();//set it up
        touch.on();//active it

        var mouse = M.addComponent(new Mobilizing.input.Mouse());
        mouse.setup();//set it up
        mouse.on();//active it

        pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.add(mouse);

        //manage the video order given in the url params
        var URLParam = this.getUrlParameter("video_order");
        console.log("URLParam",URLParam);
        this.videoOrder = URLParam !== undefined ? Number(URLParam) : undefined;
        console.log("this.videoOrder from parmaters",this.videoOrder);
        //this.videoOrder = 0; //test

        this.pubsub.events.on('connect', this.onConnect.bind(this));

        this.createScene();
        this.createCameras(this.debugMode); //should be triggered by the pub sub
    };

    //connection manager
    this.onConnect = function(){

        //listen to the response form the server to manage the video client order (according to the modulo machine)
        this.pubsub.subscribe( this.pubsub.id, this.onSetVideoOrder.bind(this));

        //project swicther to reload the corresponding page
        this.pubsub.subscribe("/switchToProject",this.onSwitchToProject.bind(this));
        this.pubsub.subscribe("/projector/rotate", this.onProjectorRotation.bind(this));
        this.pubsub.subscribe("/projector/distorsion", this.onProjectorDistorsion.bind(this));
        this.pubsub.subscribe("/projector/mode", this.onProjectorMode.bind(this));
        this.pubsub.subscribe("/projector/display", this.onProjectorDisplay.bind(this));
        //this.pubsub.subscribe("/remote/touch", this.onRemoteTouch.bind(this));
        this.pubsub.subscribe("/trackpad/move", this.onTrackpadMove.bind(this));
        this.pubsub.subscribe("/trackpad/paint", this.onTrackpadPaint.bind(this));
        this.pubsub.subscribe("/trackpad/erase", this.onTrackpadErase.bind(this));
        this.pubsub.subscribe("/trackpad/smooth", this.onTrackpadSmooth.bind(this));

    };


    this.onTrackpadMove = function (data) {

        warping_select_x += data.x;
        warping_select_y += data.y;

        if (warping_select_x < 0)
            warping_select_x = 0;
        if (warping_select_y < 0)
            warping_select_y = 0;
        if (warping_select_x > 1)
            warping_select_x = 1;
        if (warping_select_y > 1)
            warping_select_y = 1;

        for (var i = 0; i < 4; ++i) {
            projectordata[i].select.transform.setLocalPosition((warping_select_x - 0.5) * projectorResolution.x, (warping_select_y-0.5) * projectorResolution.y, 0);
        }
    };

    this.onTrackpadPaint = function (data) {



        
        
        
        for (var i = 0; i < 4; ++i) {

            var projector = projectordata[i];
            if (projector.mode == 1) {
                //console.log("onTrackpadPaint", data);
                var cx = warping_select_x * (warping_width - 1) + 0.5;
                var cy = warping_select_y * (warping_height - 1) + 0.5;
                var ix = Math.floor(cx);
                var iy = Math.floor(cy);
                var radius = warping_select_radius / 1920 * warping_width;

                var lx = Math.floor(cx - radius);
                var rx = Math.floor(cx + radius);
                var ty = Math.floor(cy + radius);
                var by = Math.floor(cy - radius);
                var x = data.x;
                var y = data.y;

                for (var nx = lx; nx <= rx; ++nx) {
                    for (var ny = by; ny <= ty; ++ny) {

                        var dx = nx - cx;
                        var dy = ny - cy;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        var k = (radius - dist) / radius;
                        if (k < 0)
                            k = 0;
                        if (nx >= 0 && ny >= 0 && nx < warping_width && ny < warping_height) {
                            this.moveWarpingVertex(i, nx, ny, x * k, y * k);
                        }

                    }
                }

            }

            else if (projector.mode == 2) {
                //blend



                console.log("projector=", projector);

                var ctx = projector.canvas.getContext("2d");

                ctx.putImageData(projector.canvasBuffer, 0, 0);
                //drawing to the pixels
                var px = warping_select_x * 1920;
                var py = 1079 - warping_select_y * 1080;
                this.draw(projector.canvas, px, py, projector.textureMask, Mobilizing.Color.black);

                //save new state
                projector.canvasBuffer = ctx.getImageData(0, 0, projector.canvas.width, projector.canvas.height);


                /*
                    //crosshair drawing
                    if (!pointer.getState()) {
                        this.drawCossHair(this.canvas, x, y);
                    }
                */

            }
            else if (projector.mode == 3) {
                projector.x += data.x;
                projector.z += data.y;
                updateCameras();

            }
            
            
        }
    };
    this.draw = function (canvas, x, y, texture, color) {
        var ctx = canvas.getContext("2d");
        var brushSize = 100;
        var brushAlpha = 0.5;

        var grd = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
        grd.addColorStop(0, color.makeRGBAStringWithAlpha(brushAlpha));
        grd.addColorStop(1, color.makeRGBAStringWithAlpha(0));

        ctx.fillStyle = grd;
        ctx.beginPath();

        ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();

        texture.setNeedsUpdate();
    };

    this.drawCossHair = function (canvas, x, y, texture) {
        var ctx = canvas.getContext("2d");
        ctx.putImageData(this.canvasBuffer, 0, 0);

        var crossHairSize = 100;

        ctx.strokeStyle = "darkgray";
        ctx.lineWidth = 5;

        ctx.beginPath();
        ctx.moveTo(x, y - crossHairSize / 2);
        ctx.lineTo(x, y + crossHairSize / 2);
        ctx.moveTo(x - crossHairSize / 2, y);
        ctx.lineTo(x + crossHairSize / 2, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, this.brushSize, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();//reset the path to avoid accumulation

        texture.setNeedsUpdate();
    };
    this.onTrackpadErase = function (data) {
    };

    this.onTrackpadSmooth = function (data) {
        warping_select_radius += data.x;
        for (var i = 0; i < 4; ++i) {
            projectordata[i].select.transform.setLocalScale(new Mobilizing.Vector3(warping_select_radius, warping_select_radius, 1));
          
        }

    };

    //defines the organisation of cameras for videomapping computers
    this.onSetVideoOrder = function(data){

        console.log("onSetVideoOrder");
        //we may pass the video order from the server if not defined in URL parameters
        if(this.videoOrder === undefined || this.videoOrder === null){
            //get the video order for choosing camera relatively to modulo
            this.videoOrder = data.order;
            console.log("this.videoOrder given by server",this.videoOrder);
        }

        //create the scene anyway!
        console.info("onSetVideoOrder",data);
        this.createCameras(this.debugMode);
    };

    //switch from one projet to an other, order coming form the server
    //incoming data format : {projectName:projectName}
    this.onSwitchToProject = function(data){

        var newURL = data.videoClientURL + "?video_order=" + this.videoOrder;
        location = newURL ;
        console.info("onSwitchToProject",newURL);
    }

    this.onProjectorMode = function (data) {

        console.log("onProjectorMode", data);
        projectordata[data.index].mode++;
        projectordata[data.index].mode = projectordata[data.index].mode % 4;

        if (projectordata[data.index].mode == 0)
        {
            projectordata[data.index].select.transform.setVisible(false);
        }
        else if (projectordata[data.index].mode == 1)
        {

            projectordata[data.index].select.transform.setVisible(true);
            projectordata[data.index].select.material.setColor(Mobilizing.Color.red);
        }

        else if (projectordata[data.index].mode == 2)
        {
            projectordata[data.index].select.transform.setVisible(true);
            projectordata[data.index].select.material.setColor(Mobilizing.Color.white);
        }
        
    };

    this.onProjectorDisplay = function (data) {

        console.log("onProjectorDisplay", data);
        projectordata[data.index].display++;
        projectordata[data.index].display = projectordata[data.index].display % 3;


        var wireframe = false;
        var colorful = false;
        if (projectordata[data.index].display == 1) {
            wireframe = true;
            colorful = true;

        }
        else if (projectordata[data.index].display == 2) {
            wireframe = false;
            colorful = true;
        }
        else {

        }

        if (colorful) {
            projectordata[data.index].mesh_warping.material.setColor(projectordata[data.index].color);
            
        }
        else {
            projectordata[data.index].mesh_warping.material.setColor(Mobilizing.Color.white);
            
        }
       
            projectordata[data.index].mesh_warping.material.setWireframe(wireframe);

        






    };


    this.onProjectorDistorsion = function (data) {
        
        
        for (var i = 0; i < 4; ++i)
        {
           
            /*var p = projectordata[i];
            p.distorsion += data;
            R.setCurrentScene(p.layer);
            R.removeFromCurrentScene(p.mesh_warping);
            this.createMeshWarping(p, i);
            */
            /*this.moveWarpingVertex(i, 7, 7, data, 0);

            this.moveWarpingVertex(i, 8, 7, data/2, 0);
            this.moveWarpingVertex(i, 6, 7, data/2, 0);
            this.moveWarpingVertex(i, 7, 8, data/2, 0);
            this.moveWarpingVertex(i, 7, 6, data/2, 0);
            */
        }

        

    };




   
    this.onProjectorRotation = function(data)
    {
        console.log("onProjectorRotation ", data);
        //var newURL = data.videoClientURL + "?video_order=" + this.videoOrder;
        //location = newURL ;
        if (data.key === 'rx')
            projectordata[data.index].rx += data.val;
        if (data.key === 'ry')
            projectordata[data.index].ry += data.val;
        if (data.key === 'rz')
            projectordata[data.index].rz += data.val;
        if (data.key === 'hs')
            projectordata[data.index].hs += data.val;
        if (data.key === 'vs')
            projectordata[data.index].vs += data.val;
        if (data.key === 'x')
            projectordata[data.index].x += data.val;
        if (data.key === 'y')
            projectordata[data.index].y += data.val;
        if (data.key === 'z')
            projectordata[data.index].z += data.val;

        if (data.key === 'fov')
            projectordata[data.index].fov += data.val;
        //console.info("onProjectorRotation",data);
        this.updateCameras();
        /*var degree = new Mobilizing.Vector3();
        degree.x = projectordata[data.index].rx;
        degree.y = projectordata[data.index].ry;
        degree.z = projectordata[data.index].rz;

        if (this.ready)
        {
            var pd = projectordata[data.index];
            this.cameras[data.index].transform.entity.rotation.set( M.math.degToRad(degree.x), M.math.degToRad(degree.y), M.math.degToRad(degree.z), 'YXZ');

            this.cameras[data.index].setHorizontalShift(projectordata[data.index].hs);
            this.cameras[data.index].setVerticalShift(projectordata[data.index].vs);
            this.cameras[data.index].setFOV(pd.fov);

            this.cameras[data.index].transform.setLocalPosition(pd.x,  pd.y,  pd.z);

            console.log("PROJ update index=" + data.index + " rx=" + pd.rx + " ry=" + pd.ry + " rz=" + pd.rz + " hs=" + pd.hs + " vs=" + pd.vs);

            var message = {};
            message.index = data.index;
            message.rx = pd.rx.toFixed(3);
            message.ry = pd.ry.toFixed(3);
            message.rz = pd.rz.toFixed(3);
            message.hs = pd.hs.toFixed(3);
            message.vs = pd.vs.toFixed(3);
            message.x = pd.x.toFixed(3);
            message.y = pd.y.toFixed(3);
            message.z = pd.z.toFixed(3);
            message.fov = pd.fov.toFixed(3);
            this.pubsub.publish("/projector/state", message);
        }
        */
    }

    /*//we must disconnect immediatly on window close
    this.disconnectOnUnload = function(){
        this.pubsub.publish("/disconnect");
    };*/


    this.setViewPosition = function(viewPosition)
    {
        finalobject.material.setUniform("viewPosition", viewPosition); //change the view position
        finalobject.updateMaterial();
    };

    this.setViewPositionCentimeters = function(viewPosition)
    {
        var viewpos = new Mobilizing.Vector3(viewPosition.x/100, viewPosition.y/100, viewPosition.z/100);
        var discpos = new Mobilizing.Vector3(viewPosition.x, 0, viewPosition.z);
        this.cameraCube.transform.setLocalPosition(interpolated);
        this.setViewPosition(viewpos);
        this.disc.transform.setLocalPosition(discpos);
    }

    this.createScene = function(){

        console.info("generic client createScene");
        console.log("Renderer=", R);
        //generic setup includes 3D model for mapping and cameras
        //R.setClearColor(Mobilizing.Color.blue.clone());

        //==========================================================
        //virtual scene : the actual content we want the user to see
        //==========================================================
        R.setCurrentScene("virtual"); //we switch to the virtual scene

        //cube camera : this camera renders to a cube map (6 x 1024x1024)
        //this.cameraCube = M.createCamera({type:"cube", cubeResolution:this.cameraCubeSize});
        this.cameraCube = new Mobilizing.Camera({ type: "cube", cubeResolution: this.cameraCubeSize });
        R.addCamera(this.cameraCube);
        this.cameraCube.transform.setLocalPosition(0,1.7,0); //at the origin (but could be anywhere else, can even move)
        this.cameraCube.index = 0;
        this.cameraCube.autoclear = true;
        this.cameraCube.layer = "virtual"; //we want this camera to render only the scene "virtual"
        //give it a name to be able to find it easily from outside
        this.cameraCube.name = "video_client_cameraCube";

        this.cameraCube.setNearPlane(.5);
        this.cameraCube.setFarPlane(10000);
        this.cameraCube.transform.setLocalPositionY(150);

        //we create a texture and we set the cube map as the content
        cubeMapTexture = new Mobilizing.Texture();
        cubeMapTexture.cube = this.cameraCube._camera.renderTarget; //FIXME
        this.cameraCube._camera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;

        //ideal point of view object

        //this.disc = M.createMesh({primitive:"sphere", radius:100, widthSegments:32, heightSegments:32, color:Mobilizing.Color.white, material:"basic"});
        /*this.disc = new Mobilizing.Mesh({ primitive: "sphere", radius: 100, widthSegments: 32, heightSegments: 32, color: Mobilizing.Color.white, material: "basic" });
        this.disc.transform.setLocalPosition(0,-1000,0);
        R.addToCurrentScene(this.disc);*/


        //==========================================================
        //final scene : what we will send to the video-projectors
        //==========================================================
        //R.setCurrentScene("final");

        //create the camera system
        //this.createCameras(this.debugMode);

        //this is our physical space 3D mesh :
        /*finalobject = new Mobilizing.Mesh({ primitive: "sphere", radius: 1000, segments: 32, color: Mobilizing.Color.white, material: "basic"});
        //finalobject.material.setWireframe(true);
        R.addToCurrentScene(finalobject);*/

                
        /*finalobject.material = new Mobilizing.Material({type:"projectionmapping"});
        texture = this.createTextureFromCubeCamera(this.cameraCube);
        finalobject.material.setTexture(texture);

        var ViewPosition = new Mobilizing.Vector3(0,170,0);
        finalobject.material.setUniform("viewPosition", ViewPosition); //change the view position
        finalobject.updateMaterial();*/

        //this.setViewPositionCentimeters(new Mobilizing.Vector3(300,170,0));
        //this.setViewPosition(new Mobilizing.Vector3(300, 170, 0));
    };

    this.createTextureFromCubeCamera = function (camera) {
        var texture = new Mobilizing.Texture();
        texture.cube = camera._camera.renderTarget;
        texture.cube.minFilter = THREE.LinearMipMapLinearFilter;
        return texture;
    };

    this.createCameras = function(debugMode){

        console.log("videomapping createCameras");
        R.setCurrentScene("final");

        this.camerasGroup = new Mobilizing.Mesh({primitive:"node"}); //instead of Node
        R.addToCurrentScene(this.camerasGroup);

        if(debugMode)
        {
            //simple camera to check the system
            this.cameras[0] = new Mobilizing.Camera({type:"perspective"});
            this.cameras[0].setFOV(50);
            this.cameras[0].layer = "final";
            this.cameras[0].setFarPlane(10000);
            R.addCamera(this.cameras[0]);

            this.camerasGroup.transform.addChild(this.cameras[0].transform);
            this.camerasGroup.transform.setLocalPositionY(150);

            console.log("debugMode createCameras");
        }
        else
        {
            var ratioH = (videoOutputResolution.x/projectorResolution.x);
            var ratioV = (videoOutputResolution.y/projectorResolution.y);

            projectordata[0].index = 0;
            projectordata[0].ix = 0;
            projectordata[0].iy = 0;

            projectordata[1].index = 0;
            projectordata[1].ix = 1;
            projectordata[1].iy = 0;

            projectordata[2].index = 0;
            projectordata[2].ix = 0;
            projectordata[2].iy = 1;

            projectordata[3].index = 1;
            projectordata[3].ix = 0;
            projectordata[3].iy = 0;

            projectordata[4].index = 1;
            projectordata[4].ix = 1;
            projectordata[4].iy = 0;

            projectordata[5].index = 1;
            projectordata[5].ix = 0;
            projectordata[5].iy = 1;

            //camera colors
            projectordata[0].color = new Mobilizing.Color(1, 0, 0);
            projectordata[1].color = new Mobilizing.Color(0, 1, 1);
            projectordata[2].color = new Mobilizing.Color(1, 0, 1);
            projectordata[3].color = new Mobilizing.Color(1, 1, 0);
            projectordata[4].color = new Mobilizing.Color(0, 1, 0);
            projectordata[5].color = new Mobilizing.Color(0, 0, 1);

            
            console.log("video order = " + this.videoOrder);
            
            if (this.videoOrder === undefined)
            {
                this.videoOrder = 0;
            }
            //this.videoOrder = 1;
            //makes 6 cameras for the whole system
            for(var i=0; i<6; i++)
            {
                var p  = projectordata[i];
                if (this.videoOrder === p.index)
                {
                    this.cameras[i] = new Mobilizing.Camera({type:"perspective"});
                    this.cameras[i].setNearPlane(.5);
                    this.cameras[i].setFarPlane(10000);
                    this.cameras[i].layer = "final";
                    p.camera = this.cameras[i];
                    this.cameras[i].viewport = new Mobilizing.Rect(1/ratioH*p.ix, 1/ratioV*p.iy, 1/ratioH,1/ratioV);
                    R.addCamera(this.cameras[i]);  
                    this.cameras[i].setNearPlane(200); //20
                    p.distorsion = 0;
                    p.RTT = new Mobilizing.RenderTexture({ width: projectorResolution.x, height: projectorResolution.y });
                    this.cameras[i].setRenderTexture(p.RTT);
                    if (p.camera !== undefined)
                    {
                        this.createMeshWarping(p, i);
                    }
                    
                }
            }

            this.updateCameras();
            R.setCurrentScene("virtual");
        }

        this.ready = true;
    };

    this.updateCameras = function()
    {
        for (var i = 0; i < 6; ++i)
        {
            var p  = projectordata[i];
            if (p.camera !== undefined)
            {
                p.camera.transform.setLocalPosition(p.x * -1, p.y, p.z);
                p.camera.transform.entity.up = new Mobilizing.Vector3(p.ux * -1, p.uy, p.uz);
                p.camera.transform.lookAt(new Mobilizing.Vector3(p.cx * -1, p.cy, p.cz));
                p.camera.setHorizontalShift(p.hs);
                p.camera.setVerticalShift(p.vs);
                p.camera.setFOV(p.fov);
            }
            
        }

    };


    this.moveWarpingVertex = function (index, x, y, movex, movey)
    {
        var vertices = projectordata[index].mesh_warping.getVertices();
        var n = x + y * warping_width;
        vertices[n].x += movex*1920;
        vertices[n].y += movey*1080;
        projectordata[index].mesh_warping.updateMesh();
    };


    this.createMeshWarping = function (projector, id)
    {
        var layer = "warping" + id;
        R.setCurrentScene(layer);
        projector.mode = 0;
        projector.display = 0;
        projector.layer = layer;
        projector.cameraOrtho = new Mobilizing.Camera({ type: "ortho", viewport: projector.camera.viewport });
        projector.cameraOrtho._camera.left = -projectorResolution.x / 2;
        projector.cameraOrtho._camera.right = projectorResolution.x / 2;
        projector.cameraOrtho._camera.top = projectorResolution.y / 2;
        projector.cameraOrtho._camera.bottom = -projectorResolution.y / 2;
        projector.cameraOrtho._camera.updateProjectionMatrix();
        projector.cameraOrtho.layer = layer;
        R.addCamera(projector.cameraOrtho);

        projector.mesh_warping = new Mobilizing.Mesh({ primitive: "custom" });

        //construction du mesh de d�formation (grille d�formable)
        var width = warping_width;
        var height = warping_height;
        var lastw = width - 1;
        var lasth = height - 1;
        var grid = [];
        var a = 0;
        for (var h = 0; h < height; ++h) {
            for (var w = 0; w < width; ++w) {
                
                var x = w - lastw / 2;// + Math.cos(a) * 0.3; //perturbation
                var y = h - lasth / 2;// + Math.cos(a)*0.01;
                var px = x * projectorResolution.x / lastw;
                var py = y * projectorResolution.y / lasth;

                var dist = Math.sqrt(px * px + py * py);
                var refdist = 540;
                var k = 1 + (dist - refdist) / refdist * projector.distorsion;

                //dist = 0;
                //grid.push(new Mobilizing.Vector3(x * (15 - dist), y * (15 - dist), 0));
                ///k = 1;
                var v = new Mobilizing.Vector3(px*k, py*k, 0);
                grid.push(v);
                
                a += 0.1;
            }
        }

        for (var h = 0; h < height; ++h)
        {
            for (var w = 0; w < width; ++w) {

                var v = grid[h * width + w];
                projector.mesh_warping._geometry.vertices.push(v);
            }
        }
        for (var h = 0; h < height - 1; ++h) {
            for (var w = 0; w < width - 1; ++w) {

                var i1 = w + h * width;
                var i2 = w + 1 + h * width;
                var i3 = w + (h+1) * (width);
                var i4 = w + 1 + (h+1) * (width)
                
                projector.mesh_warping._geometry.faces.push(new THREE.Face3(i1, i2, i3));
                projector.mesh_warping._geometry.faces.push(new THREE.Face3(i3, i2, i4));

                var uv1 = new Mobilizing.Vector3(w / lastw, h / lasth, 0);
                var uv2 = new Mobilizing.Vector3((w + 1) / lastw, h / lasth, 0);
                var uv3 = new Mobilizing.Vector3(w / lastw, (h + 1) / lasth, 0);
                var uv4 = new Mobilizing.Vector3((w + 1) / lastw, (h + 1) / lasth, 0);
                projector.mesh_warping._geometry.faceVertexUvs[0].push([uv1, uv2, uv3]);
                projector.mesh_warping._geometry.faceVertexUvs[0].push([uv3, uv2, uv4]);
            }
        }
        /*
        for (var h = 0; h < height - 1; ++h)
        {
            for (var w = 0; w < width - 1; ++w)
            {
                
                var v1 = grid[h * width + w];
                var v2 = grid[h * width + w + 1];
                var v3 = grid[(h + 1) * width + w];
                var v4 = grid[(h + 1) * width + w + 1];

                var uv1 = new Mobilizing.Vector3(w / lastw, h / lasth, 0);
                var uv2 = new Mobilizing.Vector3((w + 1) / lastw, h / lasth, 0);
                var uv3 = new Mobilizing.Vector3(w / lastw, (h + 1) / lasth, 0);
                var uv4 = new Mobilizing.Vector3((w + 1) / lastw, (h + 1) / lasth, 0);

                //var c1 = Mobilizing.Color.red.clone();
                //var c2 = Mobilizing.Color.red.clone();
                //var c3 = Mobilizing.Color.red.clone();
                //var c4 = Mobilizing.Color.red.clone();

                  i = projector.mesh_warping._geometry.vertices.length;
                
                projector.mesh_warping._geometry.vertices.push(v1, v2, v3, v4);
                //projector.mesh_warping._geometry.colors.push(c1, c2, c3, c4);
               
                projector.mesh_warping._geometry.faces.push(new THREE.Face3(i + 0, i + 1, i + 2));
                projector.mesh_warping._geometry.faces[0].vertexColors[0] = Mobilizing.Color.red.clone();
                projector.mesh_warping._geometry.faces[0].vertexColors[1] = Mobilizing.Color.red.clone();
                projector.mesh_warping._geometry.faces[0].vertexColors[2] = Mobilizing.Color.red.clone();

                projector.mesh_warping._geometry.faces.push(new THREE.Face3(i + 2, i + 1, i + 3));
                projector.mesh_warping._geometry.faceVertexUvs[0].push([uv1, uv2, uv3]);
                projector.mesh_warping._geometry.faceVertexUvs[0].push([uv3, uv2, uv4]);
            }
        }
        */
        projector.mesh_warping._geometry.verticesNeedUpdate = true;
        projector.mesh_warping._geometry.elementsNeedUpdate = true;
        projector.mesh_warping._geometry.uvsNeedUpdate = true;
        //projector.mesh_warping._geometry.colorsNeedUpdate = true;
        
        projector.mesh_warping.constructMesh();
        //mesh_warping.setMaterial(mat);
        projector.mesh_warping.material.setWireframe(false);
        projector.mesh_warping.transform.setLocalPosition(0, 0, -10);
        //mesh_warping.material.setEmissiveColor(Mobilizing.Color.red.clone());
        projector.mesh_warping.material.setTexture(projector.RTT);

        //texture mask
        if (projector.imgMask)
        {
            var img = projector.imgMask.getValue();
            projector.textureMask = new Mobilizing.Texture({ image: img });
        }

        /*
        projector.canvas = document.createElement("canvas");
        projector.canvas.width = 1920;
        projector.canvas.height = 1080;

        projector.canvas.style.position = "absolute";
        projector.canvas.style.top = "0px";
        projector.canvas.style.left = "0px";
        //document.body.appendChild(this.canvas);

        //draw something
        var ctx = projector.canvas.getContext("2d");

        // Fill with gradient
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, projector.canvas.width, projector.canvas.height);

        //keep the pixels buffer we will draw to in memory
        projector.canvasBuffer = ctx.getImageData(0, 0, projector.canvas.width, projector.canvas.height);

        projector.textureMask = new Mobilizing.Texture({ canvas: projector.canvas });

        //document.body.appendChild(projector.canvas);


        */




        projector.mesh_warping.material._material.transparent = true;
        //projector.mesh_warping.material._material.alphaMap = projector.textureMask._texture;
        R.addToCurrentScene(projector.mesh_warping);


        /*var center = new Mobilizing.Mesh({ primitive: "sphere", radius: 30, hsegments: 50});
        //var angle = i * Math.PI / 18;
        center.material.setWireframe(true);
        center.transform.setLocalPosition(0,0,-20);
        R.addToCurrentScene(center);
        */

        
        projector.select = new Mobilizing.Mesh({ primitive: "sphere", radius: 1, segments: 12, material:"basic" });
        //var angle = i * Math.PI / 18;
        projector.select.transform.setLocalScale(new Mobilizing.Vector3(warping_select_radius,warping_select_radius, 1));
        projector.select.material.setWireframe(true);
        projector.select.transform.setVisible(false);
        projector.select.transform.setLocalPosition(0, 0, 0);
        R.addToCurrentScene(projector.select);
        
    };

    this.setFinalObject = function(model)
    {
        finalobject = model;
        R.setCurrentScene("final");
        console.log("videomapping loading : ", model);
        R.addToCurrentScene(model);
        
        finalobject.transform.setLocalRotation(-90,0,0);
        finalobject.transform.setLocalScale(100);

        finalMaterial = new Mobilizing.Material({type:"projectionmapping"});
        texture = this.createTextureFromCubeCamera(this.cameraCube);
        finalMaterial.setTexture(texture);
        finalMaterial.setWireframe(false);
        var ViewPosition = new Mobilizing.Vector3(0,150,0);
        finalMaterial.setUniform("viewPosition", ViewPosition); //change the view position
        
        finalobject.material = finalMaterial;
        finalobject.updateMaterial();

        //finalobject.computeNormals();
        var l = new Mobilizing.Light();
        l.transform.setLocalPosition(0, 250, 0);
        l.setIntensity(2);
        l.setDistance(700);
        R.addToCurrentScene(l);
        

        this.setMode(1);
    };


    this.setMode = function (mode) {

        //mire
        if (mode === 0)
        {
            finalobject.material = new Mobilizing.Material({ type: "basic" });
            var imgFinal = finalImg.getValue();
            finalobject.material.setTexture(new Mobilizing.Texture({ image: imgFinal }));
            finalobject.updateMaterial();

        }
        //mod�le projett�
        if (mode === 1)
        {
            //finalobject.material = new Mobilizing.Material({ type: "phong" });
            finalobject.material = new Mobilizing.Material({ type: "basic" });
            finalobject.material._material.shading = THREE.FlatShading;
            finalobject.updateMaterial();
            
        }
        //video mapping immersif
        else if (mode === 2)
        {
            finalobject.material = finalMaterial;
            finalobject.updateMaterial();
        }

        if (mode === 3) {
            finalobject.material = new Mobilizing.Material({ type: "basic" });
            finalobject.material._material.shading = THREE.FlatShading;
            finalobject.material.setWireframe(true);
            finalobject.updateMaterial();

        }

        if (mode === 4) {
            

            //this.setMeshWarpingMode(true);

        }
        


    };


    this.setMeshWarpingMode = function (mode)
    {
        var wireframe = false;
        var colorful = false;
        if (mode == 1)
        {
            wireframe = true;
            colorful = true;
            
        }
        else if (mode == 2)
        {
            wireframe = false;
            colorful = true;
        }
        else
        {
           
        }

        if (colorful) {
            projectordata[0].mesh_warping.material.setColor(new Mobilizing.Color(1, 0, 0));
            projectordata[1].mesh_warping.material.setColor(new Mobilizing.Color(1, 1, 0));
            projectordata[2].mesh_warping.material.setColor(new Mobilizing.Color(1, 0, 1));
            projectordata[3].mesh_warping.material.setColor(new Mobilizing.Color(0, 1, 1));
        }
        else
        {
            projectordata[0].mesh_warping.material.setColor(Mobilizing.Color.white);
            projectordata[1].mesh_warping.material.setColor(Mobilizing.Color.white);
            projectordata[2].mesh_warping.material.setColor(Mobilizing.Color.white);
            projectordata[3].mesh_warping.material.setColor(Mobilizing.Color.white);
        }
        for (var i = 0; i < 4; ++i)
        {
            projectordata[i].mesh_warping.material.setWireframe(wireframe);
            
        }
    };

    this.setBlendingMode = function (mode) {
        
        console.log("set blending mode" + mode);
        for (var i = 0; i < 4; ++i)
        {
            if (mode == 1)
            {
                projectordata[i].mesh_warping.material._material.alphaMap = projectordata[i].textureMask._texture;
            }
            else if (mode == 2)
            {
                var soft = imgSoft.getValue();
                projectordata[i].mesh_warping.material._material.alphaMap = new Mobilizing.Texture({ image: soft })._texture;
            }
            else
            {
                projectordata[i].mesh_warping.material._material.alphaMap = undefined;

            }
            projectordata[i].mesh_warping.material._material.needsUpdate = true;
            
        }
    };

    this.update = function(){

        if(this.ready){

            //debug navigation
            if(this.debugMode){

                if(pointer.getState())
                {
                    var delta = {x: pointer.getDeltaX(0), y: pointer.getDeltaY(0)};

                    if (delta !== undefined && delta !== null)
                    {
                        var pos = this.cameras[0].transform.getLocalPosition();
                        pos.x += delta.x /** M.Time.deltaTime*1*/;
                        pos.y -= delta.y /** M.Time.deltaTime*1*/;

                        if(!this.shift){
                            this.cameras[0].transform.setLocalRotationX(this.cameras[0].transform.getLocalRotation().x + delta.y/2);
                            this.camerasGroup.transform.setLocalRotationY(this.camerasGroup.transform.getLocalRotation().y + delta.x/2);
                        }
                        else
                        {
                            this.cameras[0].transform.setLocalPosition(pos);
                        }
                        //this.cameras[0].transform.rotate(0, delta.x/200, 0);

                    }
                }

                /*
                if(M.input.mouseWheelAvailable)
                {
                    var mouseWheel = M.input.getMousewheelDelta();
                    translation = this.cameras[0].transform.getLocalPosition().z + mouseWheel.y*0.1;
                    this.cameras[0].transform.setLocalPositionZ(translation);
                }
                */
            }
        }
    };

    this.shift = false;

    /*    this.onKeyDown = function(event){
        if(event.keyIdentifier === "Shift"){
            this.shift = true;
        }else{
            this.shift = false;
        }
        console.log("this.shift",this.shift);
    };
    this.onKeyUp = function(event){

        this.shift = false;
        console.log("this.shift",this.shift);
    };*/

    //function to get the parameters of the url, used to choose the video order
    this.getUrlParameter = function(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

}
