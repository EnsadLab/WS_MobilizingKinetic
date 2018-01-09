//==============================================================
//sketch2.js
//==============================================================
function SketchTimelineServer()
{
    this.sketch = new Sketch({name:this.constructor.name,category:"server"}); 
    
    var playing = true;
    var time = 0;
    var current = 0;
    
    var duration = 20;

    var timeline = [
        {time:0,state:false,message:"/sketch/state", params:{name:"SketchRayVideo",state:true}},
        {time:9,state:false,message:"/sketch/state", params:{name:"SketchRayVideo",state:false}},
        {time:10,state:false,message:"/sketch/state", params:{name:"SketchColorsVideo",state:true}},
        {time:19,state:false,message:"/sketch/state", params:{name:"SketchColorsVideo",state:false}},
    ];

    this.setup = function()
    {
        //put your server init here

        this.sketch.subscribe("/timeline/play",this.onPlay.bind(this));
        this.sketch.subscribe("/timeline/pause",this.onPause.bind(this));
        this.sketch.subscribe("/timeline/stop",this.onStop.bind(this));
        //todo : load json externally
        
    };
    
    this.update = function()
    {
        //put your server logic here
        var dt = 1/60; //fixme
        if (playing)
        {
            time += dt;

            //event management
            for (var t = current;t<timeline.length;++t)
            {
                var ev = timeline[t];

                if (time >= ev.time && ev.state === false)
                {
                    console.log("time="+time+" execute " , ev);
                    this.executeEvent(ev);
                    ev.state = true;
                }
                else
                {
                    current = t;
                    break; //we stop for now, we will resume at next update
                }   
            }
            
            //looping
            if (time >= duration)
            {
                this.stop();
                this.play();
            }
        }
    };

    this.onPlay = function(params)
    {
        this.play();
    };

    this.onPause = function(params)
    {
        this.pause();
    };

    this.onStop = function(params)
    {
        this.stop();
    };


    this.play = function()
    {
        playing = true;
    };

    this.pause = function()
    {
        playing = false;
    };

    this.stop = function()
    {
        playing = false;
        time = 0;
        current = 0;
        //reset all events
        for (var t in timeline)
        {
            var ev = timeline[t];
            ev.state = false;
        }
    };

    this.executeEvent = function(ev)
    {
        
        this.sketch.publish(ev.message, ev.params);
    };

};

SketchManager.RegisterSketch(new SketchTimelineServer());