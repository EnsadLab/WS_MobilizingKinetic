function MireServer(clients, pubsub)
{
    this.genericServer = new GenericServer();

    this.genericServer.name = "Mire";
    //WARNING! this MUST have the same name than the actual folder
    this.genericServer.folderName = "mire";
    this.timerView = 0;
    this.mire = 0;
    this.mirecount = 6;
    //console.log("Midi Setup");

    //this.midi = new Mobilizing.Midi("USB Uno MIDI Interface");
};

MireServer.prototype.setup = function()
{
    
}
;
MireServer.prototype.update = function()
{
    /*this.timerView += 0.01;
    if (this.timerView > 10)
    {
        
        this.timerView -= 10;
        this.mire = this.mire + 1;
        this.mire = this.mire % this.mirecount;
        this.genericServer.pubsub.publish("/mire/index", this.mire);
        console.log("this.mire=" + this.mire);
    }
     */
};

MireServer.prototype.onConnect = function()
{
    if(!this.ready)
    {
        console.log("MireServer.prototype.onConnect");
        this.genericServer.pubsub.subscribe("/mire/change", this.setMire.bind(this));
        this.ready = true;
        
        this.genericServer.pubsub.subscribe("/midi/cc", this.onMidiCC.bind(this));
        this.genericServer.pubsub.subscribe("/midi/noteon", this.onMidiNoteOn.bind(this));
    }
    
};

MireServer.prototype.onMidiCC = function(data)
{
    //console.log("onMidiCC", data);
    //console.log("channel=", data.channel);
    //console.log("data=", data.cc);
    //console.log("value=", data.value);
    
    //this.midi.ControlChange(data.channel, data.cc, data.value);
    
};

MireServer.prototype.onMidiNoteOn = function(data)
{
    //console.log("onMidiNoteOn", data);
    //this.midi.NoteOn(data.channel, data.note, data.velocity);
};

MireServer.prototype.setMire = function(data)
{
    //this.genericClient.pubsub.publish('/mire/change', 0);
    //this.genericServer.pubsub.publish("/niveau/video/clientConnect",this.clients);
    
    this.mire = this.mire + 1;
    this.mire = this.mire % this.mirecount;
    this.genericServer.pubsub.publish("/mire/index", this.mire);
    
    
    
};

this.update = function()
{
    
};


MireServer.prototype.start = function()
{
    /*if (this.midi.midioutput !== undefined)
        this.midi.ControlChange(0, 30, 0); //switch to nothing sound preset*/
};


/**
 * quit allows to finish every process that has been registered (listners etc.) to clean up memory when we switch to another subserver
 */
MireServer.prototype.quit = function()
{
    console.log("MireServer.prototype.quit");
};



//we need to have to complete interface of this class to make a fully functionnal instance of it
ProjectsRepository.Register(new MireServer());
