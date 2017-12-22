//UI mobile console
var log, journal;
var xlogpos, ylogpos, zlogpos;

//scene
var map;
var blobs = document.getElementsByClassName("blobs");
var verticalGuide, horizontalGuide;

//device vars
var isvibrating = false;
var zposition = 0;

var init = function(e){
    declarationVars();
    //checkisvibrating();
    followBlob(blobs[0]);
    setRelativeZ(blobs[0],zposition);
    blobs[0].addEventListener("touchstart", doubletap);
}

window.onload = init;


function declarationVars(){
    //debug
    journal = document.getElementById("journal");
    xlogpos = document.getElementById("xlogpos");
    ylogpos = document.getElementById("ylogpos");
    zlogpos = document.getElementById("zlogpos");

    //DOM objects
    map = document.getElementById("map");
    verticalGuide = document.getElementById("verticalGuide");
    horizontalGuide = document.getElementById("horizontalGuide");
}

/******************/
/* initialisation */
/******************/

function checkisvibrating(){
    //console.log(navigator.userAgent);
    "use strict";
    journal.innerHTML += navigator.userAgent;
    if (navigator.vibrate || navigator.mozVibrate || navigator.webkitVibrate) {
        isvibrating = true;
        journal.innerHTML += " : <span style='color:red;'>true</span><br><br><br>"; 
    }else{
        isvibrating = false;
        journal.innerHTML += " : <span style='color:red;'>false</span><br><br><br>"; 
    }
}
function logprint(msg){
    journal.innerHTML += "<br>"+ msg;
}

function logpos(){
    xlogpos.innerHTML = iselement.offsetLeft;
    ylogpos.innerHTML = iselement.offsetTop;
    zlogpos.innerHTML = iselement.style.zIndex;
}












var iselement = null;
var iselementX = 0;
var iselementY = 0;
var originalX = 0;
var originalY = 0;

//remove all default action when a window.event is triggered
window.addEventListener("touchstart",checkIfElement);
window.addEventListener("touchmove",moveIfElement);
window.addEventListener("touchend",leaveIfElement);
window.addEventListener("keydown", checkKey);
window.oncontextmenu = function(e){e.preventDefault();}

function checkIfElement(e){
    console.log(e);
    //logprint(e.target.id);
    if(e.target.classList.contains("blobs")){
        iselement = e.target;
        iselementX = iselement.offsetLeft;
        iselementY = iselement.offsetTop;
        originalX = e.changedTouches[0].clientX;
        originalY = e.changedTouches[0].clientY;
    }else{
        //console.log("nothing that can be moved");
    }
}
function moveIfElement(e){
    if(iselement != null){
        var differenceX = e.changedTouches[0].clientX - originalX;
        var differenceY = e.changedTouches[0].clientY - originalY;
        moveBlob(differenceX,differenceY);
        followBlob(iselement);
    }
}
function leaveIfElement(e){
    iselement = null;
    //console.log(iselement);
}

function moveBlob(differenceX,differenceY){
    iselement.style.left = iselementX + differenceX + "px";
    iselement.style.top = iselementY + differenceY + "px";
    logpos();
}

function checkKey(e){
    //console.log(e.key, e.keyCode);
    if(iselement != null){
        if(e.keyCode == 107){
            console.log("plus");
            zposition++;
            setRelativeZ(iselement,zposition);
            innerZ();
            logpos();
        }else if(e.keyCode == 109){
            console.log("moins");
            zposition--;
            setRelativeZ(iselement,zposition);
            innerZ();
            logpos();
        }
    }
}

function setRelativeZ(element,zposition){
    element.style.zIndex = zposition;   
}
function innerZ(){
    iselement.innerHTML = iselement.style.zIndex;
}




function followBlob(el){
    verticalGuide.style.left = el.offsetLeft + "px";
    horizontalGuide.style.top = el.offsetTop + "px";
}





var mylatesttap;
function doubletap() {
    var now = new Date().getTime();
    var timesince = now - mylatesttap;
    if((timesince < 600) && (timesince > 0)){
        // double tap
        //vibrer(5);
        console.log("double tap");
    }else{
        // too much time to be a doubletap
    }
    mylatesttap = new Date().getTime();
}


function vibrer(facteurVibration){
    if(navigator.vibrate){
        navigator.vibrate(facteurVibration*100);//vibration during time in ms
    }else if(navigator.mozVibrate){
        navigator.mozVibrate(facteurVibration*100);//vibration during time in ms
    }else if(navigator.webkitVibrate){
        navigator.webkitVibrate(facteurVibration*100);//vibration during time in ms
    }
}



//2D radius
function checkRadius(tableau){
    //build area sphere
    var taille = 0;
    var timer;
    //buildArea(tableau,taille);
    //data set
    console.log(tableau[0]," is vibrating");
    var me = document.getElementsByClassName("moi")[0];
    console.log(me.id, " is receiving");
    var meX = me.offsetLeft;
    var isXinf = false;
    var difX = 0;
    var meY = me.offsetTop;
    var isYinf = false;
    var difY = 0;
    var facteurVibration = 0;
    //checking dimensions
    checkX(tableau,meX,meY,difX,difY);
    //getting result in facteurVibration
    facteurVibration = 1 + ((difX + difY) / 10);
    if(facteurVibration > 20 ){
        //console.log("MAXIMUM FORCE !!!");
    }else{
        //vibration
    }

}
function checkX(tableau,meX,meY,difX,difY){
    if(meX < tableau[1][1] && meX > tableau[1][0]){//supérieur à xmin et inférieur à x
        //console.log(meX, " / ", tableau[1][1]);
        difX = tableau[1][1] - meX;
        //console.log("différence X : ", difX);
        //console.log("Xmoi est inférieur à Xother");
        checkY(tableau,meY,difY);
    }else if(meX > tableau[1][1] && meX < tableau[1][2]){//supérieur à x et inférieur à xmax
        //console.log(meX, " / ", tableau[1][1]);
        difX = meX - tableau[1][1];
        //console.log("différence X : ", difX);
        //console.log("Xmoi est supérieur à Xother");
        checkY(tableau,meY,difY);
    }else if( meX == tableau[1][1]){//égal à x 
        //console.log(meX, " | ", tableau[1][1]);
        difX = 1000;//MAXIMUM FORCE
        //console.log("différence X : ", difX);
        //console.log("Xmoi est égal à Xother");
        checkY(tableau,meY,difY);
    }else{
        //console.log("X out of range");
        difX = 0;
    }
}
function checkY(tableau,meY,difY){
    if(meY < tableau[1][4] && meY > tableau[1][3]){//supérieur à ymin et inférieur à y
        console.log(meY, " / ", tableau[1][4]);
        difY = tableau[1][4] - meY;
        //console.log("différence Y : ", difY);
        //console.log("Ymoi est inférieur à Yother");
    }else if(meY > tableau[1][4] && meY < tableau[1][5]){//supérieur à y et inférieur à ymax
        //console.log(meY, " / ", tableau[1][4]);
        difY = meY - tableau[1][4];
        //console.log("différence Y : ", difY);
        //console.log("Ymoi est supérieur à Yother");
    }else if(meY == tableau[1][4]){//égal à y 
        //console.log(meY, " = ", tableau[1][4]);
        difY = 1000;//MAXIMUM FORCE
        //console.log("différence Y : ", difY);
        //console.log("Ymoi est égal à Yother");
    }else{
        //console.log("Y out of range");
        difY = 0;
    }
}



function buildArea(tableau,taille){
    var sphere = document.createElement("div");
    sphere.style.position = "absolute";
    sphere.style.backgroundColor = "rgba(255,0,0,0.5)";
    sphere.style.border = "1px solid black";
    map.appendChild(sphere);

    timer = setInterval(function(){
        taille++;
        sphere.style.width = taille-2 + "px";
        sphere.style.height = taille-2 + "px";
        sphere.style.left = tableau[1][1]-((taille-2)/2) + "px";
        sphere.style.top = tableau[1][4]-((taille-2)/2) + "px";
        sphere.style.borderRadius = (taille-2) + "px";
        //limit size = 200
        if(taille > 199){
            clearInterval(timer);
            $(sphere).animate({opacity:0},500);
            setTimeout(function(){$(sphere).remove();},700);
            taille = 0;
            console.log("end");
        }
    },0);
}