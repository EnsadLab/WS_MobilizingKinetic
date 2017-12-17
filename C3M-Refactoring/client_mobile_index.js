/**
 * Generic index for video devices clients
 */
function script(){

    var M = null;

    this.genericClient = new GenericClient("mobile");

    this.setup = function(){

        M = this.getContext();
        //M.addBehaviour(null, this.genericClient);
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
