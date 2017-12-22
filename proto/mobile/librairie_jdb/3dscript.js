//3dscript.js
// mobilizing on mobile : input

function script() {

	var R; // Renderer
	var M; // Context

	var camera;
	var f = 1000;

	var light;

	var touch;
	var pointer;

	var plan;
	var first_blob;

	  this.setup = function() {

		M = this.getContext();

		R = new Mobilizing.Renderer3D();
		M.addComponent(R);

		camera = new Mobilizing.Camera();
		camera.setFarPlane(f);
		R.addCamera(camera);

        light = new Mobilizing.Light();
        light.setIntensity(1.5);
        light.transform.setLocalPosition(-50,0,100);
        light.transform.setLocalRotation(45,0,0);
        R.addToCurrentScene(light);

        // Create touch event on mobilizing canvas
        touch = new Mobilizing.input.Touch({"target": R.canvas});
        M.addComponent(touch);
        touch.setup();//set it up
        touch.on();//active it

        // Add space
        plan = new Mobilizing.Mesh({primitive:"plane",
                                     width: 2,
                                     height: 3});
        //quad2.material.setWireframe(true);
        plan.transform.setLocalPosition(0,0,-5);
        plan.transform.setLocalRotation(0,0,0);
        R.addToCurrentScene(plan);

        // Set current user as a "first blob" (blue sphere, here)
        first_blob = new Mobilizing.Mesh({primitive:"sphere", radius: 0.05, material:"phong"});
        first_blob.transform.setLocalPosition(0,0,-5);
        first_blob.transform.setLocalRotation(90,0,0);
        first_blob.material.setColor(new Mobilizing.Color(1,.1,.2));
        R.addToCurrentScene(first_blob);

        pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.setup();
        pointer.on();



	};
		
	var window_x_middle =  window.innerWidth/2;
	var window_y_middle =  window.innerHeight/2;

	this.update = function() {
		// r++;
		//console.log(pointer.getX());
		var max_x_pointer = first_blob.transform.getLocalPositionX()+0.05;
		var min_x_pointer = first_blob.transform.getLocalPositionX()-0.05;
		var pointer_to_world_size_x = (pointer.getX()-window_x_middle)/1000;
		var pointer_to_world_size_y = (pointer.getY()-window_y_middle)/1000;
		//console.log(pointer_to_world_size_y);

		if( max_x_pointer > pointer_to_world_size_x && min_x_pointer < pointer_to_world_size_x ) {
		first_blob.transform.setLocalPosition(pointer_to_world_size_x,-pointer_to_world_size_y, -5);
		}

	};


}


function checkIfElement(e){
    console.log(e);
    //logprint(e.target.id);
    if(e.target.classList.contains("blobs")){
        iselement = e.target;
        iselementX = iselement.offsetLeft;
        iselementY = iselement.offsetTop;
        originalX = e.changedTouches[0].clientX;
        originalY = e.changedTouches[0].clientY;
    }else{
        //console.log("nothing that can be moved");
    }
}