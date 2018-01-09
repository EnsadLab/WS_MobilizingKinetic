#3CM project


##Comment ça marche

Important : Toutes les machines doivent pouvoir accéder les unes aux autres sur un réseau, qu'il soit local ou non. L'ensemble peut être testé sur une seul et même machine.

###1 - Lancer le serveur Node générique

Il faut exécuter un serveur node sur une machine connectée au réseau. Dans le cas de C3M, on utilise un réseau local créé par un routeur. Le serveur node est celui utilisé de manière générique pour les applications multiusers Mobilizing. Une copie a été faite à la racine du projet dans le dossier Node-Mob-server. Pour lancer le server il faut d'abord installer les modules node sur la machine locale, utiliser un terminal et faire :

    sudo npm install

Ensuite, s'il n'y a pas d'erreur, il faut faire :

    node app.js

Si ça fonctionne (sinon il y a un problème de version de node par ex.), le serveur est en route et les applications Mobilizing utilisant le pubsub pourront fonctionner.

Rappel de l'interface de commande du server node Mobilizing :

    --host [host]  set the server hostname. defaults to 0.0.0.0'
    --port [port]  set the server port number. defaults to 8000'
    --dir [dir]  set the directory for static files'
    --ssl  whether to serve files in HTTPS'
    --ssl-port [port]  set the server ssl port number. defaults to 8080'
    --ssl-key [file]  path to ssl key file. defaults to ssl.key'
    --ssl-crt [file]  path to ssl crt file. defaults to ssl.crt'
    --log  whether to save data to a log file or not'

Pour ceux qui sont **sur Mac**, **utiliser le fichier _launchServer.command_**, qui lance le serveur avec les "bons" settings (change le répertoire de base pour être sur C3M, donne le port 8888, etc.). Son contenu est le suivant :

    #!/bin/sh
    BASEDIR=$(dirname $0)
    cd $BASEDIR

    echo current working path is : $PWD
    echo will set the base server directory to : $BASEDIR/..

    node app.js --host dommacbookproi7.local --dir $BASEDIR/.. --port 8888

Il faut adapter la dernière ligne aux conditions de mise en œuvre, en particulier pour l'argument *host* qui doit avoir le nom de la machine (DNS) ou son adresse IP (qui doit être fixe), sinon il sera impossible d'accéder au serveur depuis une autre machine du réseau.

    node app.js --host <nom_DNS_de_la_machine_OU_IP> --dir $BASEDIR/.. --port 8888

###2 - Lancer le serveur central "dispatcher" du projet C3M

Dans un navigateur (Chrome et Safari testés! Dev fait sous Safari), aller à l'URL du serveur node, une liste des fichiers doit apparaître. Cliquer sur **central_dispatcher_server.html** pour lancer le client/serveur central du projet C3M.
Ce serveur a pour mission de coordonner l'ensemble des clients entre eux. Il traite les clients videomapping (ceux qui rendent les images qui seront envoyés aux machines Modulo Player) différement des clients mobiles. Il donne des ordres d'organisation, de switch entre les projets, gére la liste des clients connectés et leur déconnection. Se reporter au code source pour avoir des précisions.

Une interface graphique simple (des boutons avec labels) permet de choisir le projet et le scénario.

La console va cracher tout un tas d'informations qui peuvent être utiles en cas de problème.

###3 - Lancer le client (mobile)

Dans un navigateur sur un mobile (Safari Mobile ou Chrome Android), aller à l'URL du serveur node une liste des fichiers doit apparaître. Cliquer sur **client_mobile_index.html** pour lancer le client/mobile d'introduction. Ce fichier sera renommé index.html pour être automatiquement chargé par sur les machines utilisateurs.

Au chargement de cette page, un reload se fait automatiquement sur la page du projet en cours d'exécution sur le dispatcher.

###4 - Lancer le client video mapping

Dans un navigateur pouvant passer en fullscreen sur les machines dédiées au rendu temps réel pour le vidéo mapping, aller l'une des URL  du serveur node une liste des fichiers doit apparaître. Cliquer sur le fichier HTLM **client_video_index.html**, première adresse d'acceuil qui redirige vers le projet en cours.

###5 - Jouer!

La suite se passe automatiquement, le serveur dispatcher permet de switcher manuellement d'un projet/scenario à l'autre. Les mobiles permettent d'agir sur les client/videomapping selon les projets et leurs scénarios

##Principes de fonctionnement/architecture générale

Plusieurs projets doivent utiliser le même système de videomapping. Un nombre indeterminé de mobiles doivent pouvoir se connecter ensemble pour permettre une interactivité collective. Chaque projet peut proposer plusieurs scénarios. Il faut donc organiser l'ensemble afin que chaque appareil exécute le bon programme pour que la mise en réseau soit faite et que les clients mobiles "parlent" au bon projet de côté vidéomapping.

**Les grands paquets sont :**

####Serveur Node générique

**Node-Mob-server/app.js**

####Liste des projets et de leurs scenarios

**projectList.js** -> contient une liste avec des infos utilisées dans la gestion automatisé des reload des clients et une méthode utilitaire de binding des script serveurs aux noms des projets

####Client-Serveur Central Dispatcher

**central_dispatcher_server.html**
**central_dispatcher_server.js** -> script Mobilizing client-serveur pubsub principal, contient toute la logique
**central_dispatcher_server_index.js** -> utilisé pour gérer l'UI du dispatcher, la var centralServer est une référence au script de central_dispatcher_server.js

####Clients videomapping

**client_video_index.html** -> page de redirection vers le bon projet et scénario, d'après les ordres du dispatcher

**client_video_index.js** -> script de redirection, équivalent à client_mobile_index.js, seul le clientType change ("videomapping" ici, et non "mobile")

**client_video_generic.js** -> Gestion des élements communs à tous les projets, chargé dans le html de chaque projet et scènario, à savoir le système de projection mapping : modèle 3D fidèle de l'espace physique, cameraCube et sa cubeMap texture, organisation entre scène virtuelle (ce qu'on veut projeté sur le réel) et scène physique. La configuration des caméras de la scène physique (1 caméra = 1 vidéo proj placé et orienté exactement pareil). A priori, ce fichier ne doit pas être modifié (sauf bug découvert)


#####PROJETS :

######Principe de base, illustration avec Centon_Digital :

**client_video_centon.html** -> projet Centon_Digital. Charge les js nécessaires dont client_video_generic.js. WARNING : la mise en cascade des script comment ici dans un script entre balise :

        <script src="client_video_generic.js"></script>
        <script src="centon.js"></script>

        <script>
            var script = new script();
            var project = new centon();

            //specify the project
            script.projectName = "centon";
            script.projectScript = project;

            //add a close event
            window.addEventListener("unload", script.disconnectOnUnload);
            //run it
            var runner = new Mobilizing.Runner(script);
        </script>

**centon.js** -> script principal du projet Centon_Digital. Contient des référence au script client_video_generic.js (pubsub, context...). preLoad(), setup() et update() sont appellés automatiquement lors de l'execution de client_video_generic.js

######Projet avec scénarios :

**espace.js** -> Espace^Espace script central. this.scenarioScript contientu une référence au script du scénario. Fourni par le dispatcher lors du switch. Contient des référence au script client_video_generic.js (pubsub, context...). preLoad(), setup() et update() sont appellés automatiquement lors de l'execution de client_video_generic.js

**client_video_espace_map_queue.html** -> fichier de chargement. Structure de la relation entre projet et scénario :

        <script src="projectList.js"></script>
        <script src="client_video_generic.js"></script>
        <script src="espace.js"></script>

        <!--this should be adapt by project-->
        <script src="video_scenarios/map_queue_video_client.js"></script>

        <script>
            var script = new script();
            var project = new espace();
            var scenario = new mapQueueVideoClient();//!! this should be adapt by project

            //specify the project
            script.projectName = "espace";
            if(project){
                script.projectScript = project;
            }
            //specify the scenario for the project
            if(scenario){
                project.scenarioScript = scenario;
            }

            //add a close event
            window.addEventListener("unload", script.disconnectOnUnload);

            //run it
            var runner = new Mobilizing.Runner(script);
        </script>

**video_scenarios/map_queue_video_client.js** -> scenario spécifique map_queue (mapQueueVideoClient). Deveint une forme d'enfant du script principal du projet (espace.js) à l'aide de variable affectée automatiquement lors du switch : this.pubsub, this.parentInstance (référence à l'instance de espace.js). Il s'agit ici essentiellement d'implémenter la réception des messages provenant du sous-serveur de scénario correspondant (map_queue).

####Clients mobiles

Les clients mobiles sont dans le répértoire /clients, dans un dossier portant le nom du scénario. Le nom du dossier doit être utilisé dans les script, le fichier server ajouté au dispatcher (via le html) et **la correspondance nom de projet/scénario/fichier serveur doit être ajouté dans projectList.js**

**client_mobile_index.html** -> Fichier utilisé pour rediriger les clients mobiles vers le projet courant, ordre venant du dispatcher. Il s'agit d'un client temporaire du point de vue du système pubsub, c'est pourquoi il doit émettre un événement de déconnexion dès la fermeture de la fenêtre du navigateur.

**client_mobile_index.js** -> script de gestion de la première connexion, informe de le dispatcher de la présence d'un nouveau client et reçoit en retour la page à charger (répertorié dans projectList.js)

######Organisation de scénarios :

**clients/centon/centon/index.html**
**clients/centon/centon/centon_server.js** -> serveur du scénario, gére la logique du scénario, peut être laissé vide, bien que unsubscribe doit être utilisé pour éviter de laisser des canaux de communications ouverts inutilement. Ce fichier permet de communicquer directement avec le client vidéo si nécessaire, par un usage adapté de subscribe et publish entre les 3 entités : client mobile, disptacher, client video (le passage explicite par le dispatcheur via des subscribe/publish n'est donc pas obligatoire).

**clients/centon/centon/client.js** -> script gérant l'interface graphique du client et le transfert de donnée vers le serveur correspondant.

##Arborescence de fichiers (sujet à variation) :

    ├── Node-Mob-server
    │   ├── app.js
    │   ├── launchServer.command
    │   └── package.json
    ├── ReadMe.md
    ├── centon.js
    ├── central_dispatcher_server.html
    ├── central_dispatcher_server.js
    ├── central_dispatcher_server_index.js
    ├── client_mobile_index.html
    ├── client_mobile_index.js
    ├── client_video_centon.html
    ├── client_video_espace_map_queue.html
    ├── client_video_generic.js
    ├── clients
    │   ├── centon
    │   │   └── centon
    │   │       ├── centon_server.js
    │   │       ├── client.js
    │   │       ├── fonts
    │   │       │   ├── PT-Sans
    │   │       │   │   ├── PTC55F.ttf
    │   │       │   │   ├── PTC75F.ttf
    │   │       │   │   ├── PTN57F.ttf
    │   │       │   │   ├── PTN77F.ttf
    │   │       │   │   ├── PTS55F.ttf
    │   │       │   │   ├── PTS56F.ttf
    │   │       │   │   ├── PTS75F.ttf
    │   │       │   │   ├── PTS76F.ttf
    │   │       │   │   └── Paratype\ PT\ Sans\ Free\ Font\ License.txt
    │   │       │   ├── gotham-bold.otf
    │   │       │   ├── gotham-book.otf
    │   │       │   └── miso.otf
    │   │       ├── index.html
    │   │       └── textures
    │   │           ├── agora_rdc.png
    │   │           └── agora_rdc_ref.png
    │   └── espace
    │       ├── circular_speed
    │       │   ├── circular_speed_server.js
    │       │   ├── client.js
    │       │   ├── fonts
    │       │   │   ├── PT-Sans
    │       │   │   │   ├── PTC55F.ttf
    │       │   │   │   ├── PTC75F.ttf
    │       │   │   │   ├── PTN57F.ttf
    │       │   │   │   ├── PTN77F.ttf
    │       │   │   │   ├── PTS55F.ttf
    │       │   │   │   ├── PTS56F.ttf
    │       │   │   │   ├── PTS75F.ttf
    │       │   │   │   ├── PTS76F.ttf
    │       │   │   │   └── Paratype\ PT\ Sans\ Free\ Font\ License.txt
    │       │   │   ├── gotham-bold.otf
    │       │   │   ├── gotham-book.otf
    │       │   │   └── miso.otf
    │       │   └── index.html
    │       └── map_queue
    │           ├── client.js
    │           ├── fonts
    │           │   ├── PT-Sans
    │           │   │   ├── PTC55F.ttf
    │           │   │   ├── PTC75F.ttf
    │           │   │   ├── PTN57F.ttf
    │           │   │   ├── PTN77F.ttf
    │           │   │   ├── PTS55F.ttf
    │           │   │   ├── PTS56F.ttf
    │           │   │   ├── PTS75F.ttf
    │           │   │   ├── PTS76F.ttf
    │           │   │   └── Paratype\ PT\ Sans\ Free\ Font\ License.txt
    │           │   ├── gotham-bold.otf
    │           │   ├── gotham-book.otf
    │           │   └── miso.otf
    │           ├── index.html
    │           ├── map_queue_server.js
    │           └── textures
    │               ├── agora_rdc.png
    │               └── agora_rdc_ref.png
    ├── css
    │   └── style.css
    ├── data
    │   ├── bejart.obj
    │   └── miso.otf
    ├── espace.js
    ├── projectList.js
    ├── tester_centon.html
    ├── vendor
    │   ├── Mobilizing.js
    │   ├── Mobilizing.js.map
    │   ├── opentype.min.js
    │   └── three.min.js
    └── video_scenarios
        └── map_queue_video_client.js
