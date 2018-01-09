var EasyContext = {};

EasyContext.SetContext = function(context)
{
    EasyContext._context = context;
};

EasyContext.GetRenderer = function()
{
    return EasyContext._renderer;
};

EasyContext.CreateScene = function()
{
    //3D renderer
    EasyContext._renderer       = EasyContext._context.addComponent(new Mobilizing.Renderer3D());
    //default perspective camera
    EasyContext._camera = new Mobilizing.Camera();
    EasyContext._camera.transform.setLocalPosition(0,0,0);
    EasyContext._renderer.addCamera(EasyContext._camera);
    //light
    EasyContext._light = new Mobilizing.Light();
    EasyContext._light.transform.setLocalPosition(0,0,40);
    EasyContext._renderer.addToCurrentScene(EasyContext._light);
    EasyContext._light.setDistance(200);
    //time component
    EasyContext._time = new Mobilizing.Time();
    EasyContext._context.addComponent(EasyContext._time);
    EasyContext._time.setup();
    EasyContext._time.on();
    //setup what we need to have touch/mouse
    EasyContext._mouse = new Mobilizing.input.Mouse();
    EasyContext._context.addComponent(EasyContext._mouse);
    EasyContext._mouse.setup();
    EasyContext._mouse.on();//active it
    EasyContext._touch = EasyContext._context.addComponent(new Mobilizing.input.Touch({"target": EasyContext._renderer.canvas}));
    EasyContext._context.addComponent(EasyContext._touch);
    EasyContext._touch.setup();
    EasyContext._touch.on();//active it
    EasyContext._pointer = new Mobilizing.Pointer();
    EasyContext._context.addComponent(EasyContext._pointer);
    EasyContext._pointer.add(EasyContext._mouse);
    EasyContext._pointer.add(EasyContext._touch);
    EasyContext._pointer.setup();
};

EasyContext.CreateVideoMappingScene = function()
{
    //3D renderer
    EasyContext._renderer       = EasyContext._context.addComponent(new Mobilizing.Renderer3D());
};


EasyContext.CreateMidi = function(midiInInterface, midiOutInterface, onMidiIn)
{
    var midi = new Mobilizing.Midi({in:midiInInterface, out:midiOutInterface, onMidiIn:onMidiIn});
    EasyContext._context.addComponent(midi);
    return midi;
};


EasyContext.CreateCube = function()
{
    var cube = new Mobilizing.Mesh({primitive:"cube", size:1});
    EasyContext._renderer.addToCurrentScene(cube);
    return cube;
};

EasyContext.CreateSphere = function()
{
    var sphere = new Mobilizing.Mesh({primitive:"sphere", radius:1});
    EasyContext._renderer.addToCurrentScene(sphere);
    return sphere;
};

EasyContext.GetDeltaTime = function()
{
    return EasyContext._time.getDelta();
};

//turn any object into a button
EasyContext.MakeClickable = function(object, callback)
{
    var clickable = new Mobilizing.Clickable(
    {
        pointer: EasyContext._pointer,
        camera:EasyContext._camera,
        target: object,
        onPress:function()
        {
            if (object.transform.getVisible())
            {
                //object.material.setColor(Mobilizing.Color.red);
                callback();
            }
        },
        onRelease:function()
        {
            if (object.transform.getVisible())
            {
                //object.material.setColor(color);
            }
        },
        onEnter:function()
        {
            //object.material.setColor(Mobilizing.Color.green);
        },
        onLeave:function()
        {
            //object.material.setColor(Mobilizing.Color.white);
        }
    });
    
    EasyContext._context.addComponent(clickable);
    clickable.setup();
};


EasyContext.CreateButton = function(position,texture, color, callback, data)
{
    var button = new Mobilizing.Mesh({primitive:"cube", material:"lambert"});
    button.transform.setLocalPosition(position);
    if (texture !== undefined)
    {
        button.material.setTexture(texture);
    }
    button.material.setColor(color);
    var clickable = new Mobilizing.Clickable(
        {
            pointer: EasyContext._pointer,
            camera:EasyContext._camera,
            target: button,
            onPress:function()
            {
                if (button.transform.getVisible())
                {
                    button.material.setColor(Mobilizing.Color.red);
                    callback(data);
                }
            },
            onRelease:function()
            {
                if (button.transform.getVisible())
                {
                    button.material.setColor(color);
                }
            },
            onEnter:function()
            {
                button.material.setColor(Mobilizing.Color.green);
            },
            onLeave:function()
            {
                button.material.setColor(Mobilizing.Color.white);
            }
        });
    
    EasyContext._context.addComponent(clickable);
    clickable.setup();
    EasyContext._renderer.addToCurrentScene(button);
    return button;
};


EasyContext.CreateTrackpad = function (position, size, message, multiplier) {
    
            var trackpad = {};
            trackpad.cube = new Mobilizing.Mesh({ primitive: "box", width: size.x, height: size.y, depth: size.z, material:"basic" });
            trackpad.cube.transform.setLocalPosition(position);
            trackpad.pressed = false;
            trackpad.message = message;
            trackpad.ignore = false;
            trackpad.multiplier = multiplier;
            trackpad.lastposx = 0;
            trackpad.lastposy = 0;
            
            trackpad.clickable = new Mobilizing.Clickable(
                {
                    pointer: EasyContext._pointer,
                    camera: EasyContext._camera,
                    target: trackpad.cube,
                    onPress: function () {
                        trackpad.cube.material.setColor(Mobilizing.Color.red);
                        trackpad.pressed = true;
                        trackpad.ignore = true;
                    },
    
                    onRelease: function () {
                        trackpad.cube.material.setColor(Mobilizing.Color.blue);
                        trackpad.pressed = false;
                    },
    
                    onEnter: function () {
                        trackpad.cube.material.setColor(Mobilizing.Color.green);
                        trackpad.ignore = false;
                    },
                    onLeave: function () {
                        trackpad.cube.material.setColor(Mobilizing.Color.white);
                        trackpad.ignore = false;
                    }
                });
    
            trackpad.update = function ()
            {
                var x = EasyContext._pointer.getX();
                var y = EasyContext._pointer.getY();
                var pick = trackpad.clickable.target.transform.pick(trackpad.clickable.camera, x, y);
                if (pick !== null)
                {
                    if (!trackpad.ignore)
                    {
                        trackpad.movex = pick.uv.x - trackpad.lastposx;
                        trackpad.movey = pick.uv.y - trackpad.lastposy;
    
                    }
    
                    trackpad.lastposx = pick.uv.x;
                    trackpad.lastposy = pick.uv.y;
                    trackpad.ignore = false;
                    //trackpad.movex = pick.uv.x - 0.5;
                    //trackpad.movey = pick.uv.y - 0.5;
                }
    
            };
    
            EasyContext._context.addComponent(trackpad.clickable);
            trackpad.clickable.setup();
            EasyContext._renderer.addToCurrentScene(trackpad.cube);
            return trackpad;
        };
