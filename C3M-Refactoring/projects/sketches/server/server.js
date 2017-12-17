function SketchesServer()
{
    this.genericServer = new GenericServer();

    this.genericServer.name = "Sketches";
    //WARNING! this MUST have the same name than the actual folder
    this.genericServer.folderName = "sketches";

    this.setup = function(){

    };

    this.update = function()
    {
 
    };

    this.onConnect = function(){
        console.log("SketchesServer.prototype.onConnect");
    };

    this.onClientConnect = function(){
        console.log("SketchesServer.prototype.onClientConnect");
    };

    this.start = function()
    {
        console.log("SketchesServer.prototype.start");
    };
    /**
    * quit allows to finish every process that has been registered (listners etc.) to clean up memory when we switch to another subserver
    */
    this.quit = function()
    {
        console.log("SketchesServer.prototype.quit");
    };

};

//we need to have to complete interface of this class to make a fully functionnal instance of it
ProjectsRepository.Register(new SketchesServer());
