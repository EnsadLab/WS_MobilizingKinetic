//==============================================================
//client.js
//==============================================================
function client()
{

    this.genericClient = new GenericClient("mobile");

    var M,R;

    var touch;
    var pointer;
    var mouse;

    var pressed = false;

    var commands = [];
    var labels = [];

    /*this.preLoad = function()
    {
        M = this.getContext();
    };*/

    var trackpads = [];
    

    this.createButton = function(text, position, callback)
    {
        //exemple button --------------------
        //create a button :
        var button = new Mobilizing.Button({
            camera: this.camera,
            pointer: pointer,
            width: 150,
            height: 50,
            strokeWidth: .01,
            text: text,
            textSize: 18,
            onPress: callback
        });
        M.addComponent(button);
        button.setup();
        R.addToCurrentScene(button.root);
        button.root.transform.setLocalPosition(position);
        return button;
        //--------------------------------
    };


    this.createButton2 = function (text, position, message, index, value) {
        //exemple button --------------------
        //create a button :
        var button = new Mobilizing.Button({
            camera: this.camera,
            pointer: pointer,
            width: 150,
            height: 50,
            strokeWidth: .01,
            text: text,
            textSize: 18,
        });

        button.onPress = function ()
        {
            var data = {};
            data.value = value;
            data.index = index;

            this.genericClient.pubsub.publish(message, data);
        }.bind(this);
        M.addComponent(button);
        button.setup();
        R.addToCurrentScene(button.root);
        button.root.transform.setLocalPosition(position);


        return button;
        //--------------------------------
    };


    



    this.createTrackpad = function (position, size, message, multiplier) {

        var trackpad = {};
        trackpad.cube = new Mobilizing.Mesh({ primitive: "box", width: size.x, height: size.y, depth: size.z, material:"basic" });
        trackpad.cube.transform.setLocalPosition(position);
        trackpad.pressed = false;
        trackpad.message = message;
        trackpad.ignore = false;
        trackpad.multiplier = multiplier;
        trackpad.clickable = new Mobilizing.Clickable(
            {
                pointer: pointer,
                camera: this.camera,
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
            var x = mouse.getX();
            var y = mouse.getY();
            let pick = trackpad.clickable.target.transform.pick(trackpad.clickable.camera, x, y);
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

        M.addComponent(trackpad.clickable);
        trackpad.clickable.setup();
        R.addToCurrentScene(trackpad.cube);
        return trackpad;
    };

    this.setup = function()
    {

        M = this.getContext();
        //M.addBehaviour(null, this.genericClient);
        M.addComponent(this.genericClient); //new
        this.genericClient.setup(); //new

        R = M.addComponent(new Mobilizing.Renderer3D());

        touch = M.addComponent(new Mobilizing.input.Touch({ "target": R.canvas }));
        touch.setup();//set it up
        touch.on();//active it

        mouse = M.addComponent(new Mobilizing.input.Mouse());
        mouse.setup();//set it up
        mouse.on();//active it

        pointer = new Mobilizing.Pointer();
        M.addComponent(pointer);
        pointer.add(touch);
        pointer.add(mouse);

        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));

        var canvas_size = R.getCanvasSize();
        this.width = canvas_size.width;
        this.height = canvas_size.height;

        this.camera = new Mobilizing.Camera();
        this.camera.transform.setLocalPosition(0, 0,1500);
        R.addCamera(this.camera);

        var button_height = 70;
        var button_interval = 160;

        var mireIndex = 0;
        var modeIndex = 0;
        var meshWarpingmodeIndex = 0;
        var blendingmodeIndex = 0;


        //trackpads
        var trackpad_width = 190;
        var trackpad_height = 190;

        trackpads.push(this.createTrackpad(new Mobilizing.Vector3(-300, -300, 0), new Mobilizing.Vector3(trackpad_width, trackpad_height, 1), "/trackpad/move", 0.5));
        trackpads.push(this.createTrackpad(new Mobilizing.Vector3(-100, -300, 0), new Mobilizing.Vector3(trackpad_width, trackpad_height, 1), "/trackpad/paint", 0.01)); 
        trackpads.push(this.createTrackpad(new Mobilizing.Vector3(100, -300, 0), new Mobilizing.Vector3(trackpad_width, trackpad_height, 1), "/trackpad/erase", 0.1));
        trackpads.push(this.createTrackpad(new Mobilizing.Vector3(300, -300, 0), new Mobilizing.Vector3(trackpad_width, trackpad_height, 1), "/trackpad/smooth", 100));


        for (var i = 0; i < 4; ++i)
        {
            var by = 300 - i * 75;
            this.createButton2("Mode", new Mobilizing.Vector3(-300, by, 0), "/projector/mode", i, 1);
            this.createButton2("Display", new Mobilizing.Vector3(-100, by, 0), "/projector/display", i, 1);

        }
        
        this.createButton(
            "None",
            new Mobilizing.Vector3(-400, 400, 0),
            function () {
                this.genericClient.pubsub.publish('/mire/index', mireIndex++);
            }.bind(this));

        this.createButton(
            "Mire++",
            new Mobilizing.Vector3(-200,400,0),
            function()
            {
                this.genericClient.pubsub.publish('/mire/index', mireIndex++);
            }.bind(this));

        this.createButton(
            "Mode++",
            new Mobilizing.Vector3(0,400,0),
            function () {
                this.genericClient.pubsub.publish('/mire/mode', modeIndex++);
            }.bind(this));

        this.createButton(
            "Warping Mode",
            new Mobilizing.Vector3(200, 400, 0),
            function () {
                this.genericClient.pubsub.publish('/mire/meshwarpingmode', meshWarpingmodeIndex++);
            }.bind(this));

        this.createButton(
            "Blending Mode",
            new Mobilizing.Vector3(400, 400, 0),
            function () {
                this.genericClient.pubsub.publish('/mire/blendingmode', blendingmodeIndex++);
            }.bind(this));


        this.createButton(
            "Distorsion-",
            new Mobilizing.Vector3(200, 200, 0),
            function () {
                this.genericClient.pubsub.publish('/projector/distorsion', -0.002);
            }.bind(this));

        this.createButton(
            "Distorsion+",
            new Mobilizing.Vector3(400, 200, 0),
            function () {
                this.genericClient.pubsub.publish('/projector/distorsion', 0.002);
            }.bind(this));


        
        /*
            var y = 400;
            var increment = 0.02;
            this.createButton(
                "Fov-",
                new Mobilizing.Vector3(-400, y, 0),
                function () {
                    this.sendCommand("0", "fov", -increment);
                }.bind(this));
            this.createButton(
                "Fov+",
                new Mobilizing.Vector3(-200, y, 0),
                function () {
                    this.sendCommand("0", "fov", increment);
                }.bind(this));
            y = 300;
            this.createButton(
                "Fov-",
                new Mobilizing.Vector3(-400, y, 0),
                function () {
                    this.sendCommand("1", "fov", -increment);
                }.bind(this));
            this.createButton(
                "Fov+",
                new Mobilizing.Vector3(-200, y, 0),
                function () {
                    this.sendCommand("1", "fov", increment);
                }.bind(this));
            y = 200;
            this.createButton(
                "Fov-",
                new Mobilizing.Vector3(-400, y, 0),
                function () {
                    this.sendCommand("2", "fov", -increment);
                }.bind(this));
            this.createButton(
                "Fov+",
                new Mobilizing.Vector3(-200, y, 0),
                function () {
                    this.sendCommand("2", "fov", increment);
                }.bind(this));
            y = 100;
            this.createButton(
                "Fov-",
                new Mobilizing.Vector3(-400, y, 0),
                function () {
                    this.sendCommand("3", "fov", -increment);
                }.bind(this));
            this.createButton(
                "Fov+",
                new Mobilizing.Vector3(-200, y, 0),
                function () {
                    this.sendCommand("3", "fov", increment);
                }.bind(this));

        */
        for (var i=0;i<4;++i)
        {
            /*var y = button_height * 4 + i * -button_interval + 400;
            var labelcaption = "" + i;
            //var l = M.createLabel({text:labelcaption, font:this.font,fontSize:32, width:100, height:button_height, color:Mobilizing.Color.black, backgroundColor:Mobilizing.Color.white});
            //l.transform.setLocalPosition(-1000, y,-1000);
            this.createButton(
                labelcaption,
                new Mobilizing.Vector3(-1000, y,-1000),
                function()
                {
                    this.genericClient.pubsub.publish('/mire/index', mireIndex++);
                });
*/
            //labels.push(l);

            /* var ldata = M.createLabel({text:"data", font:this.font,fontSize:24, width:1600, height:button_height, color:Mobilizing.Color.black, backgroundColor:Mobilizing.Color.white});
            ldata.transform.setLocalPosition(0, y-button_interval/2,-1000);
            M.addToCurrentScene(ldata);
            labels.push(ldata);*/

            /*for (var j=0;j<18;++j)
            {
                var c = {};
                c.index = i;
                var caption = "";
                if (j === 0)
                {
                    c.key = 'x';
                    c.val = -1;
                    caption = "x-";
                }
                else if (j === 1)
                {
                    c.key = 'x';
                    c.val = +1;
                    caption = "x+";
                }
                else if (j === 2)
                {
                    c.key = 'y';
                    c.val = -1;
                    caption = "y-";
                }
                else if (j === 3)
                {
                    c.key = 'y';
                    c.val = +1;
                    caption = "y+";
                }
                else if (j === 4)
                {
                    c.key = 'z';
                    c.val = -1;
                    caption = "z-";
                }
                else if (j === 5)
                {
                    c.key = 'z';
                    c.val = +1;
                    caption = "z+";
                }
                else if (j === 8)
                {
                    c.key = 'ry';
                    c.val = -0.1;
                    caption = "ry-";
                }
                else if (j === 9)
                {
                    c.key = 'ry';
                    c.val = 0.1;
                    caption = "ry+";
                }
                else if (j === 6)
                {
                    c.key = 'rx';
                    c.val = -0.1;
                    caption = "rx-";
                }
                else if (j === 7)
                {
                    c.key = 'rx';
                    c.val = 0.1;
                    caption = "rx+";
                }
                else if (j === 10)
                {
                    c.key = 'rz';
                    c.val = -0.1;
                    caption = "rz-";
                }
                else if (j === 11)
                {
                    c.key = 'rz';
                    c.val = 0.1;
                    caption = "rz+";
                }
                else if (j === 12)
                {
                    c.key = 'hs';
                    c.val = -0.01;
                    caption = "hs-";
                }
                else if (j === 13)
                {
                    c.key = 'hs';
                    c.val = 0.01;
                    caption = "hs+";
                }
                else if (j === 14)
                {
                    c.key = 'vs';
                    c.val = -0.01;
                    caption = "vs-";
                }
                else if (j === 15)
                {
                    c.key = 'vs';
                    c.val = 0.01;
                    caption = "vs+";
                }
                else if (j === 16)
                {
                    c.key = 'fov';
                    c.val = -0.1;
                    caption = "fov-";
                }
                else if (j === 17)
                {
                    c.key = 'fov';
                    c.val = 0.1;
                    caption = "fov+";
                }

                var _text = caption;
                var b = new Mobilizing.Button({context:M, text:_text, font:this.font, width:120, height:button_height, backgroundColor:Mobilizing.Color.red});
                b.render();
                b.transform.setLocalPosition(-900+120*j, y,-1000);
                M.addToCurrentScene(b);

                var command = {};
                command.command = c;
                command.button = b;
                command.message = '/projector/rotate';
                commands.push(command);*/

        }
        this.sendCommand = function (ind, key, val)
        {
            var data = {};
            data.index = ind;
            data.key = key;
            data.val = val;
            this.genericClient.pubsub.publish("/projector/rotate", data);
            console.log("/projector/rotate ", data);
        };
        
        /*for (var i=0;i<11;++i)
        {
            var c = i;


            var _text = "m"+c;
            var b = new Mobilizing.Button({context:M, text:_text, font:this.font, width:100, height:button_height});
            b.render();
            b.transform.setLocalPosition(-600+i*100, -600,-1000);
            M.addToCurrentScene(b);

            var command = {};
            command.command = c;
            command.button = b;
            command.message = '/mire/index';
            commands.push(command);

        }

        for (var i=0;i<6;++i)
        {
            var _text = "cc"+c;
            var b = new Mobilizing.Button({context:M, text:_text, font:this.font, width:200, height:button_height});
            b.render();
            b.transform.setLocalPosition(-600+i*200, -700,-1000);
            M.addToCurrentScene(b);

            var command = {};
            command.command = {channel:0,cc:30,value:i*10};
            command.button = b;
            command.message = '/midi/cc';
            commands.push(command);
        }
        for (var i=0;i<6;++i)
        {
            var _text = "no"+c;
            var b = new Mobilizing.Button({context:M, text:_text, font:this.font, width:200, height:button_height});
            b.render();
            b.transform.setLocalPosition(-600+i*200, -800,-1000);
            M.addToCurrentScene(b);

            var command = {};
            command.command = {channel:0,note:30,velocity:i*10};
            command.button = b;
            command.message = '/midi/noteon';
            commands.push(command);
        }*/


    };

    this.onConnect = function()
    {
        this.genericClient.pubsub.subscribe("/projector/state",this.onProjectorState.bind(this));
    };

    this.onProjectorState = function(data)
    {
        console.log("onProjectorState " + data);
        var l = labels[data.index];
        l.setText("" + data.x+ " " + data.y + " " + data.z + "\n" + data.rx+ " " + data.ry + " " + data.rz + "\n" + data.hs + " " + data.vs + " " + data.fov);
    };

    this.update = function()
    {

        //gestion des pads

        for (var i in trackpads)
        {
            var t = trackpads[i];
            t.update();
            if (t.pressed)
            {
                var data = {};
                data.x = t.movex * t.multiplier;
                data.y = t.movey * t.multiplier;
                t.movex = 0;
                t.movey = 0;
                
                this.genericClient.pubsub.publish(t.message, data);
                //console.log("publish " , t.message, data)

            }
        }
        /*if (M.input.touchPressed && !pressed)
        {
            pressed = true;
            this.genericClient.pubsub.publish('/mire/change', 0);
        }
        if (!M.input.touchPressed && pressed)
        {
            pressed = false;
        }
         */

        /*for (var i in commands)
    {
        var c = commands[i];
        if (c.button.pressed(this.camera))
        {
            this.genericClient.pubsub.publish(c.message, c.command);
        }
    }*/

    };
};
