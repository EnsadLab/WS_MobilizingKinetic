//==============================================================
//client.js
//==============================================================
function client()
{

    this.genericClient = new GenericClient("mobile");

    var M,R;

    //ne doit pas être vide de chargement
    /*this.preLoad = function()
    {
        M = this.getContext();
    };*/

    this.setup = function()
    {
        M = this.getContext();
        R = M.addComponent(new Mobilizing.Renderer3D());
        
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //assure une bonne execusion du pubsub pour une prise en compte de ce client
        this.genericClient.pubsub.events.on("connect", this.onConnect.bind(this) );

    };
    //connection callback
    this.onConnect = function()
    {
        console.log("mobile client onConnect");
    };

    this.update = function()
    {

    };
};
