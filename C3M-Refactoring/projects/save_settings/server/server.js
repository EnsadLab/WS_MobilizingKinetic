function SaveSettingsServer()
{

    this.genericServer = new GenericServer();

    this.genericServer.name = "SaveSettings";
    //WARNING! this MUST have the same name than the actual folder
    this.genericServer.folderName = "save_settings";

    this.setup = function(){

    }

    this.update = function()
    {

    };

    this.onConnect = function(){
        console.log("SaveSettingsServer.prototype.onConnect");
    };

    this.onClientConnect = function(){
        console.log("SaveSettingsServer.prototype.onClientConnect");
    };

    this.start = function()
    {
        console.log("SaveSettingsServer.prototype.start");
    };
    /**
    * quit allows to finish every process that has been registered (listners etc.) to clean up memory when we switch to another subserver
    */
    this.quit = function()
    {
        console.log("SaveSettingsServer.prototype.quit");
    };

};

//we need to have to complete interface of this class to make a fully functionnal instance of it
ProjectsRepository.Register(new SaveSettingsServer());
