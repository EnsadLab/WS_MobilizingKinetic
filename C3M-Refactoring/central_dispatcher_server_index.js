
//execution of this dispatcher sever in Mobilizing
function centralDispatcherServerIndex()
{

    var M;
    var R;
    var miso;
    var touch;
    var pointer;
    var mouse;

    var espaceBt;
    var centonBt;

    var espace_clientBt = {};

    var cam,
        light;

    var time;

    this.preLoad = function(loader)
    {

        M = this.getContext();
    }

    this.setup = function()
    {

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

        time = new Mobilizing.Time();
        M.addComponent(time);
        time.setTimeScale(.1);
        time.setup();
        time.on();

        //NETWORK
        if(typeof CentralServer !== 'undefined')
        {
            var projects = [];

            this.centralServer = new CentralServer();

            this.pubsub = this.centralServer.pubsub;
            //console.log(this.pubsub);

            //local references to project and scenarios
            this.centralServer.currentProject = ProjectsRepository.getProjectByName("Mire");
            console.log("ProjectsRepository", this.centralServer.currentProject);

            for(var i in ProjectsRepository.projects)
            {
                projects.push(ProjectsRepository.projects[i].genericServer.name);
            }

        }
        else
        {
            //initialize a pubsub instance
            this.pubsub = new Mobilizing.net.PubSub();
            //transmit to the client script
            this.pubsub.events.on('connect', this.onConnect.bind(this));
        }

        //UI
        cam = new Mobilizing.Camera({type:"ortho"});
        cam.transform.setLocalPosition(0,0,1000);
        R.addCamera(cam);

        //liste des commandes (toutes commandes pubsub):
        //contenus C3M
        this.addCommandButton("Switch to Sketches", "/index/remote/client/switchproject", "Sketches");
        this.addCommandButton("Switch to Mire", "/index/remote/client/switchproject", "Mire");
        //sketches
        this.addCommandButton("Empty video ON", "/sketch/state", {name:"SketchEmptyVideo",state:true});
        this.addCommandButton("Empty video OFF", "/sketch/state", {name:"SketchEmptyVideo",state:false});
        this.addCommandButton("Empty mobile ON", "/sketch/state", {name:"SketchEmptyMobile",state:true});
        this.addCommandButton("Empty mobile OFF", "/sketch/state", {name:"SketchEmptyMobile",state:false});

        this.addCommandButton("Lines video ON", "/sketch/state", {name:"SketchLinesVideo",state:true});
        this.addCommandButton("Lines video OFF", "/sketch/state", {name:"SketchLinesVideo",state:false});
        this.addCommandButton("Lines mobile ON", "/sketch/state", {name:"SketchLinesMobile",state:true});
        this.addCommandButton("Lines mobile OFF", "/sketch/state", {name:"SketchLinesMobile",state:false});
        
        this.addCommandButton("Gaité video ON", "/sketch/state", {name:"SketchGaiteVideo",state:true});
        this.addCommandButton("Gaité video OFF", "/sketch/state", {name:"SketchGaiteVideo",state:false});
        this.addCommandButton("Gaité mobile ON", "/sketch/state", {name:"SketchGaiteMobile",state:true});
        this.addCommandButton("Gaité mobile OFF", "/sketch/state", {name:"SketchGaiteMobile",state:false});
        
        this.addCommandButton("Ray video ON", "/sketch/state", {name:"SketchRayVideo",state:true});
        this.addCommandButton("Ray video OFF", "/sketch/state", {name:"SketchRayVideo",state:false});
        this.addCommandButton("Ray mobile ON", "/sketch/state", {name:"SketchRayMobile",state:true});
        this.addCommandButton("Ray mobile OFF", "/sketch/state", {name:"SketchRayMobile",state:false});

    };

    this.addCommandButton = function(caption, message, params)
    {
        if (this.buttony === undefined)
        {
            this.buttony =   R.getCanvasSize().height / 2-45; 
            this.buttonx =   -R.getCanvasSize().width / 2+150;
        }
        var bt = this.createButton(caption,
                                   new Mobilizing.Vector3(this.buttonx, this.buttony, 0),
                                   function(){
            this.pubsub.publish(message, params);
        }.bind(this));

        this.buttony -= 90;

        if (this.buttony < -R.getCanvasSize().height/2+45)
        {
            this.buttony =   R.getCanvasSize().height / 2-45; 
            this.buttonx += 310;
        }

    };

    this.update = function()
    {
        if(!this.ready)
        {
            return;
        }

        if(this.centralServer)
        {
            //update what need's to be updated server side

            this.centralServer.deltaTime = time.getDelta();
            this.centralServer.update();
        }
    };

    this.createButton = function(text, position, callback)
    {
        //exemple button --------------------
        //create a button :
        var button = new Mobilizing.Button({
            camera: cam,
            pointer: pointer,
            width: 300,
            height: 80,
            canvasWidth: 300,
            canvasHeight: 80,
            strokeWidth: 3,
            text: text,
            textSize: 20,
            onPress: callback
        });
        M.addComponent(button);
        button.setup();
        R.addToCurrentScene(button.root);
        button.root.transform.setLocalPosition(position);
        return button;
        //--------------------------------
    };

    this.build_ui = function(projects)
    {
        var indexEspaceEspace = 1;
        var indexCenton = 1;

        projects.forEach( function(project){


            var bt = this.createButton(project,
                                       new Mobilizing.Vector3(-110, R.getCanvasSize().height / 2 - espaceBt.height, 0),
                                       function(){
                if(this.centralServer)
                {
                    this.centralServer.switchToProject(project);
                }
                else
                {
                    this.pubsub.publish('/index/remote/client/switchproject', project);
                }
            }.bind(this));

            bt.root.transform.setLocalPosition(
                espaceBt.root.transform.getLocalPosition().x,
                espaceBt.root.transform.getLocalPosition().y - (indexEspaceEspace*100),
                0);
            indexEspaceEspace++;

            espace_clientBt[project] = bt;

        }.bind(this));

        this.ready = true;
    };

    this.build_ui_sketches = function(sketches)
    {

        sketches.forEach( function(sketch){

            var y = 0;
            var bt = this.createButton(sketch.sketch.name,
                                       new Mobilizing.Vector3(200, y, 0),
                                       function(){
                this.pubsub.publish('/sketch/state', {name:sketch.sketch.name, state:true});
            }.bind(this));

            y+=100;

        }.bind(this));

    };

    this.onConnect = function()
    {
        this.pubsub.subscribe("/index/remote/projects", this.onProjects.bind(this));
        this.pubsub.publish('/index/remote/client/ready');
    };

    this.onProjects = function(data)
    {
        this.build_ui(data);
    };
}