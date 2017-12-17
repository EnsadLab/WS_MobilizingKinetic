function mobile_splashscreen()
{

    var M, R;

    this.setup = function()
    {
        M = this.getContext();
        R = new Mobilizing.Renderer3D();
        M.addComponent(R);
         
        var canvas_size = {width:window.innerWidth, height:window.innerHeight};

        this.width = canvas_size.width;
        this.height = canvas_size.height;

        this.cam = new Mobilizing.Camera();
        this.cam.transform.setLocalPosition(0,0,15);
        R.addCamera(this.cam);

        var caption = "Bienvenu sur le projet C3M\n\nPour participer à l'experience du moment, merci de toucher votre écran\n\n";

        var touch = M.addComponent(new Mobilizing.input.Touch({"target": R.canvas}));
        touch.setup();//set it up
        touch.on();//active it

        var mouse = M.addComponent(new Mobilizing.input.Mouse());
        mouse.setup();//set it up
        mouse.on();//active it

        var pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.add(mouse);
        
        //create a button :
        button = new Mobilizing.Button({camera: this.cam,
                                        pointer: pointer,
                                        width:2,
                                        height:2,
                                        strokeWidth: .01,
                                        text:caption,

                                        onPress: function(){
                                            window.location.href = "mobile.html" 
                                        }
                                       });
        M.addComponent(button);
        button.setup();
        R.addToCurrentScene(button.root);

    };

    this.update = function()
    {
       
    };
};
