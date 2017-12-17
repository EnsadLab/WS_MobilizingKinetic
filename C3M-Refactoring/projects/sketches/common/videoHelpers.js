/**
* A Mesh and EdgesMesh aggregation object for easy user line creation
* @method UserLine
* @param {Number} width
* @param {Number} depth
*/
function UserLine(width, depth){

    //root node
    this.root = new Mobilizing.Mesh({primitive: "node"});

    var diag = Math.sqrt( Math.pow(width,2) +  Math.pow(depth,2));
    diag *= 2;

    //plane
    this.plane = new Mobilizing.Mesh({primitive: "plane",
                                      width: diag,
                                      height: diag});

    this.plane.material.setTransparent(true);
    this.plane.material.setOpacity(.2);

    //line
    this.line = new Mobilizing.EdgesMesh({mesh: this.plane});
    this.line.material.setLineWidth(2);

    //ray
    this.rayLine = new Mobilizing.Mesh({primitive: "line",
                                        point1: new Mobilizing.Vector3(0,0,0),
                                        point2: new Mobilizing.Vector3(0,width,0) });
    this.rayLine.material.setLineWidth(2);
    this.ray = new Mobilizing.Ray();;

    this.root.transform.addChild(this.plane.transform);
    this.root.transform.addChild(this.line.transform);
    this.root.transform.addChild(this.rayLine.transform);

    //make a shortcut for transform
    this.transform = this.root.transform;

    /**
    * Makes the plan visible or not
    * @method setPlaneVisible 
    * @param {Boolean} val
    */
    this.setPlaneVisible = function(val){
        this.plane.setVisible(val);
    }

    /**
    * Makes the line visible or not
    * @method setLineVisible 
    * @param {Boolean} val
    */
    this.setLineVisible = function(val){
        this.line.setVisible(val);
    }

    /**
    * Makes the ray visible or not
    * @method setRayVisible 
    * @param {Boolean} val
    */
    this.setRayVisible = function(val){
        this.rayLine.setVisible(val);
    }

    /**
    * Makes the edges always visible or not, that is with depth test or not
    * @method setLineAlwaysVisible 
    * @param {Boolean} val
    */
    this.setLineAlwaysVisible = function(val){
        if(val){
            this.line.material.setDepthTest(false);
            this.line.transform.setRenderOrder(1000);
        }else{
            this.line.material.setDepthTest(true);
        }
    }

    /**
    * Makes the ray always visible or not, that is with depth test or not
    * @method setRayAlwaysVisible 
    * @param {Boolean} val
    */
    this.setRayAlwaysVisible = function(val){
        if(val){
            this.rayLine.material.setDepthTest(false);
            this.rayLine.transform.setRenderOrder(1000);
        }else{
            this.rayLine.material.setDepthTest(true);
        }
    }

    /**
    * Change the edges line width
    * @method setLineWidth 
    * @param {Number} val
    */
    this.setLineWidth = function(val){
        this.line.material.setLineWidth(val);
    }

    /**
    * Change the ray's line width
    * @method setLineWidth 
    * @param {Number} val
    */
    this.setRayWidth = function(val){
        this.rayLine.material.setLineWidth(val);
    }
};

/**
* Get the 3 direction vectors of the given quaternion
* @method getDirectionsFromQuaternion
* @param {Quaternion} quaternion
* @return {Object} object with all 3 Vector3 as {upVector: upVector, forwardVector: forwardVector,leftVector: leftVector};
*/
function getDirectionsFromQuaternion(quaternion){

    var upVector = new Mobilizing.Vector3();
    upVector.x = 2 * (quaternion.x * quaternion.y - quaternion.w * quaternion.z);
    upVector.y = 1 - 2 * (quaternion.x * quaternion.x + quaternion.z * quaternion.z);
    upVector.z = 2 * (quaternion.y * quaternion.z + quaternion.w * quaternion.x);

    var forwardVector = new Mobilizing.Vector3();
    forwardVector.x = 2 * (quaternion.x * quaternion.z + quaternion.w * quaternion.y);
    forwardVector.y = 2 * (quaternion.y * quaternion.z - quaternion.w * quaternion.x);
    forwardVector.z = 1 - 2 * (quaternion.x * quaternion.x + quaternion.y * quaternion.y);

    var leftVector  = new Mobilizing.Vector3();
    leftVector.x = 1 - 2 * (quaternion.y * quaternion.y + quaternion.z * quaternion.z);
    leftVector.y = 2 * (quaternion.x * quaternion.y + quaternion.w * quaternion.z);
    leftVector.z = 2 * (quaternion.x * quaternion.z - quaternion.w * quaternion.y);

    var result = {upVector: upVector,
                  forwardVector: forwardVector,
                  leftVector: leftVector};

    return result;
};

/**
* Extracts all the points of intersection between a given plane mesh and an other mesh (of any geometry)
* @method extractIntersectionPoints
* @param {Mesh} srcPlane the plane mesh to use as source of the intersections
* @param {Mesh} targetMesh the target mesh to use for insterections
* @param {Boolean} inverseY reverse the uv Y value to use it directly in a 2d Canvas (for realtime texture drawing)
* @return {Array} an array of object as {vertex: Vector3, uv: Vector2};
*/
function extractIntersectionPoints(srcPlane, targetMesh, inverseY){

    var points = srcPlane.getIntersectionsPoints(targetMesh);

    if(inverseY){

        //reverse for direct usage in a canvas 
        for(var i in points){

            var point = points[i];
            var uv = points.uv;
            //reverse uv to be in canvas space
            uv.y = 1-uv.y;
        }
    }

    return points;
};