/**
 * ESPACE^ESPACE main scene script
 */
function Espace(){

    //Mobilizing context
    var M;

    //videomapping camera
    this.cubeCamera = null;

    this.buildingGroup = null;

    this.setup = function(context){

        console.log("espace setup");
        M = this.getContext();


        M.setCurrentScene("virtual");

        //we make a local camera only if we are in a tester page!
        //the html file must then contains "tester" in its name
        if(location.href.indexOf("tester") >= 0){
            var cam = new Mobilizing.Camera({type:"perspective"});
            cam.transform.setLocalPosition(0,0,10);
            cam.layer = "virtual";
            M.addCamera(cam);
        }

        this.pointLight1 = new Mobilizing.Light();
        this.pointLight1.transform.setLocalPosition(0,170,200);
        this.pointLight1.setIntensity(.8);
        this.pointLight1.setDistance(3000);

        M.addToCurrentScene(this.pointLight1);

        this.pointLight2 = new Mobilizing.Light();
        this.pointLight2.transform.setLocalPosition(600,600,200);
        this.pointLight2.setIntensity(.8);
        this.pointLight2.setDistance(1000);
        //M.addToCurrentScene(this.pointLight2);

        //SHADOWS =============
        this.sun = new Mobilizing.Light({type:"directional"});
        this.sun.transform.setLocalPosition(0,.7,0.6);
        this.sun.setIntensity(.5);

        M.addToCurrentScene(this.sun);
        //M.setShadowMapOn(true);

        /*this.sun.setShadowSize(1024,1024);
        this.sun.setShadowDistance(1,2000);
        this.sun.setCastShadow(true);*/

        //=====================

        this.buildingGroup = new Mobilizing.Node();
        M.addToCurrentScene(this.buildingGroup);

       /* var cube = new Mobilizing.Cube({width:100,height:100,depth:100});
        //cube.transform.setLocalPositionZ();
        cube.transform.setLocalPositionY(200);
        cube.setCastShadow(true);
        cube.setReceiveShadow(true);
        this.buildingGroup.transform.addChild(cube.transform);*/

        this.archi = new Mobilizing.Mesh();
        this.archi.loadFromFile("../../espace_common/3D/esba.obj", this.onBuildingLoaded.bind(this));

        this.city = new Mobilizing.Mesh();
        this.city.loadFromFile("../../espace_common/3D/city.obj", this.onBuildingCityLoaded.bind(this));

        //M.engine.renderer.sortObjects = false;

        /*this.floor = new Mobilizing.Cube({width:10000, height:5, depth:10000,widthSegments:10,heightSegments:10});
        this.floor.transform.setLocalPositionY(-60);
        this.buildingGroup.transform.addChild(this.floor.transform);
        */

        //this.floor.setReceiveShadow(true);
        //M.addToCurrentScene(this.floor);
    };

    this.onBuildingLoaded = function(model)
    {
        var name = "building";
        console.log("espace video client loaded : ",name);

        console.log("added",model);
        if(typeof this.loadedCallback === "function"){
            this.loadedCallback(model,name);
        }

        //shadows
        /* model.setReceiveShadow(false);
        model.setCastShadow(false);*/
    };

    this.onBuildingCityLoaded = function(model)
    {
        var name = "city";
        console.log("espace video client loaded : ",name);

        console.log("added",model);
        if(typeof this.loadedCallback === "function"){
            this.loadedCallback(model,name);
        }
        //shadows
        /*model.setReceiveShadow(false);
        model.setCastShadow(false);*/
    };

    this.update = function(){

    };

}
