function SketchExpoMobile()
{
    this.sketch = new Sketch(this);
    this.sketch.name = this.constructor.name; 
    this.sketch.category = "mobile";

    var M, R;

    var sendTimer;
    var orientation;

    var buttons = [];

    var posX, poxY;

    var images = [];
    var cubes = [];
    this.preLoad = function(loader)
    {
        console.log("SketchExpoMobile preLoad");
        for (var i=1;i<=10;++i)
        {
            var imgurl = "../sketch_expo/images/" + i + "carre.jpg";
            var img = loader.loadImage({ url: imgurl });
            images.push(img);
        }
    };

    this.setup = function()
    {
        console.log(this);
        M = this.getContext();
        R = EasyContext.GetRenderer();// new Mobilizing.Renderer3D();
        M.addComponent(R);

    
        sendTimer = new Mobilizing.Timer({interval: 100,
                                          callback: this.updateNetwork.bind(this)});


        M.addComponent(sendTimer);
        sendTimer.setup();
        sendTimer.on();
        sendTimer.start();

        orientation = new Mobilizing.input.Orientation();
        M.addComponent(orientation);
        orientation.setup();
        orientation.on();


        var nx = 0;
        var ny = 0;
        var z = -0;

        for (var i in images)
        {
            console.log("add image cube");
            var img = images[i].getValue();
            console.log("img = ", img);
            var cube = new Mobilizing.Mesh({ primitive: "cube", material: "basic"});//, material : "basic"});
            //cube.material.setColor(Mobilizing.Color.random());
            cube.material.setColor(Mobilizing.Color.white);
            cube.transform.setLocalScale(160,160,160); //set scale
            this.sketch.root.transform.addChild(cube.transform);
            cubes[i] = cube;
            //x = Math.random()*1000-500;
            //y = Math.random()*200;
            //z = Math.random()*1000-500;
            //cube.transform.lookAt(0,0,0);
            //cube.transform.setLocalRotation(Math.random()*360, Math.random()*360,Math.random()*360);
            cube.transform.setLocalRotation(0, 90,0);
            
            
            //cube.transform.lookAt(new Mobilizing.Vector3(0,170,0));
            //we have to invert y and z
            //we could use an animation to smooth out the positions
            
            var x = window.innerWidth/2+((nx-0.5)*160);
            var y = -window.innerHeight/2-((ny-2)*160);
            cube.transform.setLocalPosition(x, y, z); 

            cube.material.setTexture(new Mobilizing.Texture({ image: img }));
            cube.updateMaterial();

            
            
            
            /*var clickable = new Mobilizing.Clickable({target: cube,
                pointer: EasyContext._pointer,
                camera: EasyContext._camera,
                onPress: function(){
                    cube.material.setColor(Mobilizing.Color.red.clone());
                    pressed = true;
                    this.sketch.pubsub.publish("/picture/control",{id: this.sketch.pubsub.getID(), picture:i})
                }.bind(this),
                onRelease:  function(){
                    cube.material.setColor(Mobilizing.Color.white.clone());
                    pressed = false;
                    this.sketch.pubsub.publish("/picture/control",{id: this.sketch.pubsub.getID(), picture:i})
                }.bind(this)
               });
                M.addComponent(clickable);
                clickable.setup();
            */
            this.MakePictureClickable(cube, i); 

                nx += 1;
                if (nx>=2)
                {
                    ny += 1;
                    nx = 0;
                }
        }

        


        

    };

    this.MakePictureClickable = function(object, index)
    {
        //en dur
        /*
        EasyContext.MakeClickable(object, function()
        {
            
             console.log(index);
             this.sketch.pubsub.publish("/picture/control",{id: this.sketch.pubsub.getID(), picture:index})
         }.bind(this));
        */

         var clickable = new Mobilizing.Clickable({target: object,
            pointer: EasyContext._pointer,
            camera: EasyContext._camera,
            onPress: function(){
                object.material.setColor(Mobilizing.Color.red.clone());
                object.pressed = true;
                this.currentindex = index;
                this.sketch.pubsub.publish("/picture/control",{id: this.sketch.pubsub.getID(), picture:index, movex:0, movey:0, movez:0})
            }.bind(this),
            onRelease:  function(){
                object.material.setColor(Mobilizing.Color.white.clone());
                object.pressed = false;
                this.currentindex = -1;
                this.sketch.pubsub.publish("/picture/control",{id: this.sketch.pubsub.getID(), picture:index, movex:0, movey:0, movez:0})
            }.bind(this)
           });
            M.addComponent(clickable);
            clickable.setup();

    };


    //what to send to the others
    this.updateNetwork = function(){

        var deviceQuat = orientation.getGyroQuaternion();
        if(deviceQuat)
        {
            this.sendRotation( deviceQuat ); 
        }

    }

    this.sendRotation = function(val)
    {
        this.sketch.pubsub.publish('/mobile/rot', {
            id: this.sketch.pubsub.getID(),
            rot: val.toArray(),
            tagID: this.tagID
        });
    };

    this.sendPosition = function(val)
    {
        this.sketch.pubsub.publish('/mobile/pos', {
            id: this.sketch.pubsub.getID(),
            pos: val.toArray(),
            tagID: this.tagID
        });
    };
    
    this.update = function()
    {
        sendTimer.update();
        var pointer = EasyContext._pointer;
        if(pointer.getState())
        {
            var x = pointer.getX();
            var y = pointer.getY();
            var nx = x / R.getCanvasSize().width;   
            var ny = y / R.getCanvasSize().width;  
            if (this.pressed)
            {
                
                  

                var mx = nx-this.mousex;
                var my = ny-this.mousey;
                var mz = 0;
                if (this.currentindex >= 0)
                {
                    console.log("mx="+mx+ " my="+my);
                    this.sketch.pubsub.publish("/picture/control",{id: this.sketch.pubsub.getID(), picture:this.currentindex, movex:mx, movey:my, movez:mz})
                }
            }
            else{
                this.pressed = true;
                this.mousex = nx;
                this.mousey = ny;
            }
        
                  
        }
        else
        {
            this.pressed = false;
        }
    };
};

SketchManager.RegisterSketch(new SketchExpoMobile());