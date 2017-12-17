/* This is a Rotate component.
 */
function Rotate(params)
{
    if (params !== undefined)
    {
        //parameters parsing
        if (params.speed !== undefined)
        {
            this.speed = params.speed;
        }
        if (params.axis !== undefined)
        {
            this.axis = params.axis;
        }
    }
    this.setup = function()
    {
        //nothing
    };

    this.update = function()
    {
        var M = this.getContext();
        var T = this.getTarget();
        var dt = M.Time.deltaTime;
        var x = this.axis.x*this.speed*dt;
        var y = this.axis.y*this.speed*dt;
        var z = this.axis.z*this.speed*dt;
        T.transform.rotate(x,y,z);
    };
};