function Sketch(params)
{
    console.log("Sketch creation...");
    this.name = "unnamed";
    this.category = params.category;
    this._subscriptions = []; //subscription list
    console.log("Sketch constructor : ", params.name);
    this.name = params.constructor.name; //get name from passed instance constructor name
    
    this.init = function()
    {

    };

    this.publish = function(channel, message)
    {
        //console.log("publish");
        this.pubsub.publish(channel, message);
    };

    this.subscribe = function(channel, callback)
    {
        this._subscriptions[channel] = callback;
    };

    this.on = function()
    {
        //we show the root and we activate all substrictions
        this.root.transform.setVisible(true);
        for (var channel in this._subscriptions)
        {
            var callback = this._subscriptions[channel];
            console.log("susbscribe " + channel + " " + callback);
            this.pubsub.subscribe(channel, callback);
        }
    };

    this.off = function()
    {
        //we hide the root and we deactivate all substrictions
        this.root.transform.setVisible(false);
        for (var channel in this._subscriptions)
        {
            this.pubsub.unsubscribe(channel);
        }
    };
    
}


