/**
 * Generic index for mobile devices clients
 */
function script(){

    var M = null;

    this.genericClient = new GenericClient("video");

    this.setup = function(){

        console.log("client_video_index setup");
        M = this.getContext();
        //M.addBehaviour(null, this.genericClient); //previous
        M.addComponent(this.genericClient); //new
        this.genericClient.setup(); //new

        //connection
        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));
    };

    this.onConnect = function(){
         console.log("on connect",this.genericClient.pubsub.id);
        this.genericClient.pubsub.subscribe(this.genericClient.pubsub.id, this.genericClient.onSwitchToProject.bind(this.genericClient));

    };

    this.update = function(){

    };

}
