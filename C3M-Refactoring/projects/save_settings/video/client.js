function client()
{
    this.genericClient = new GenericClient("video");
    this.videoMapping = new VideoMapping();

    var M, R;
    var finalObject;

    var typefaceRequest;
    var typeface;
    
    var quat;

    this.preLoad = function(loader)
    {
        this.videoMapping.preLoad(loader);

        typefaceRequest = loader.loadJSON({url:"fonts/DroidSans.json"});

        loader.loadOBJ({url:"../../common/3D/espace1_50k_t1.obj", onLoad: this.onObjLoaded.bind(this)});
    };

    this.onObjLoaded = function(model)
    {
        finalObject = model;
        console.log("onObjLoaded");
    };

    this.setup = function()
    {
        //generic stuff
        M = this.getContext();
        R = M.addComponent(new Mobilizing.Renderer3D());

        //add the genericClient (network management)
        M.addComponent(this.genericClient);
        this.genericClient.setup();

        //tells the video mapping to use this pubsub
        this.videoMapping.setPubsub(this.genericClient.pubsub);
        //connection
        this.genericClient.pubsub.events.on('connect', this.onConnect.bind(this));

        //aggregates the video mapping main project and the project scene
        M.addComponent(this.videoMapping);
        //this.videoMapping.debugMode = true;
        this.videoMapping.setRenderer(R);
        this.videoMapping.setup();
        //set the finalObject model (wrong component preload in Mob)
        this.videoMapping.setFinalObject(finalObject);

        this.videoMapping.setMode(2);

        typeface = typefaceRequest.getValue();

        //your stuff here
        R.setCurrentScene("virtual");

        var light = new Mobilizing.Light();
        light.setDistance(2000);
        light.setIntensity(2);
        R.addToCurrentScene(light);

        var baseText = "Le mapping vidéo est une technique qui permet de projeter des vidéos sur des volumes en jouant avec leur relief. Qu’elle soit sur une basket, une voiture ou une cathédrale, la projection joue sur l’illusion optique entre le relief réel et sa seconde peau virtuelle. Elle augmente et sublime l’objet ou l’architecture qu’elle éclaire7. La technique de « projection mapping », également connue sous le nom de mapping vidéo, est une technologie de projection utilisée pour transformer des objets, souvent de formes irrégulières, en surface d'affichage pour la projection vidéo. Ces objets peuvent être des paysages industriels complexes, tels que les bâtiments. En utilisant un logiciel spécialisé, un objet à deux ou trois dimensions est mappé dans l'espace virtuel qui imite l'environnement réel. De cette façon, l'ordinateur sait exactement où projeter ses informations et mettre en évidence toute sorte de forme. Presque n'importe quelle surface peut être utilisée pour « devenir une surface vidéo dynamique d’images 2D et 3D qui peuvent transformer ce qui est réél pour le public par des illusions et des images aux possibilités infinies ». Grâce à ces informations, le logiciel peut interagir avec un projecteur pour s'adapter à toute image souhaitée sur la surface d’un objet. Cette technique est utilisée par des artistes et des annonceurs pour ajouter des dimensions supplémentaires, des illusions optiques et des animations de mouvement sur des objets statiques. La vidéo est couramment associée ou déclenchée par de l’audio pour créer un récit audiovisuel. Bien que le mapping vidéo (cartographie vidéo) soit une discipline relativement nouvelle, son histoire remonte plus loin que l'on pense. Il y a environ 3 ans[Quand ?], le mapping vidéo a été associé à la Réalité Augmentée. Le premier enregistrement connu de projections sur des objets 3D date de 1969, quand Disneyland a réalisé la production « Haunted Mansion ». Ils ont utilisé de fausses têtes désincarnées comme objets pour projeter sur eux en 16 mm afin de leur donner un aspect réel par des illusions d’optiques. L’évènement de mapping vidéo suivant date de 1980, lorsque l'artiste Michael Naimark a filmé des personnes interagissant avec des objets dans une salle de séjour, puis les a projetées dans la salle vide créant l'illusion que les personnes interagissant avec les objets étaient vraiment là. La première fois que le concept de Vidéo Mapping a été étudié sur le plan scolaire c’était à l'Université de Caroline du Nord dans la Chapelle Hill, à la fin des années 1990, où des chercheurs ont travaillé sur le projet « Bureau de l'avenir ». Dans ce projet, les scientifiques ont voulu relier les bureaux de différents endroits comme s’ils étaient ensemble dans un espace de bureau partagé en projetant des gens dans l'espace de bureau comme si on y était. À partir de 2001, de plus en plus d'artistes ont commencé à utiliser le Vidéo Mapping pour la création d’œuvre et des compagnies telles que Microsoft, ont commencé à expérimenter avec cette technique comme un nouveau médium de progrès technologique. Après que l'objet appelé à être projeté sur une surface choisie a été créé, une réplique virtuelle de l'aménagement physique de l’ensemble scénographique doit être réalisé. Tout d'abord, il faut choisir les images ou les vidéos qu'on souhaite projeter. Ensuite, le modèle virtuel de la surface de projection est créé sur l'ordinateur à l'aide de programmes spéciaux. L’étape suivante est définie comme le «masquage», qui consiste à utiliser des «masque» d'opacité pour correspondre aux formes et aux positions des différents éléments du bâtiment ou de l’espace de projection exact. Les coordonnées doivent être définies pour chaque objet placé par rapport au projecteur. Enfin, l'orientation xyz, la position et le type d’objectif définissent la scène virtuelle. Des ajustements sont souvent nécessaires en manipulant manuellement soit la scène physique ou virtuelle pour de meilleurs résultats. De grands projecteurs allant jusqu'à 20.000 lumens sont nécessaires pour les projections à grande échelle sur des immeubles dans les villes. Sinon, pour les petites productions, un projecteur avec une base de 5000 lumens peut fonctionner. Tous les projecteurs doivent être utilisés avec un objectif grand angle pour produire de meilleurs résultats. Des logiciels de cartographie vidéo tels que MadMapper [archive] sont téléchargeables pour une utilisation dans de tels projets. Le mapping vidéo a gagné en notoriété grâce à des campagnes guérilla de publicité et aux prestations de vidéo-jockeys pour les musiciens électroniques. De grandes entreprises comme Nokia, Samsung et BMW ont utilisé des mappings de projections vidéo pour créer des campagnes incroyables pour leurs produits dans les grandes villes à travers le monde. Ces campagnes publicitaires utilisent souvent des techniques de cartographie Vidéo pour projeter des animations sur les façades de bâtiments. Le mapping vidéo peut également être interactif, comme le projet de Nokia « Ovi Maps » dans lequel les projections répliquent en les déformant les mouvements du public. Le festival de la Fête des Lumières à Lyon a commencé à intégrer des projets de cartographie 3D dans ses productions, dont un créant l'illusion d'un flipper géant projeté sur la façade du théâtre des Célestins.";
        
        var textList = baseText.split(" ");
        var maxDist = 300;


        this.node = new Mobilizing.Mesh({primitive:"node"});

        for(var i=0; i<textList.length; i++)
        {
            text = new Mobilizing.Mesh({primitive: "text",
                                        text: textList[i],
                                        font: typeface,
                                       });

            var x = Mobilizing.math.randomFromTo(-maxDist, maxDist);
            var y = Mobilizing.math.randomFromTo(0, maxDist*2);
            var z = Mobilizing.math.randomFromTo(-maxDist, maxDist);

            if(x > -100 && x < 0) x = -100;
            if(x < 100 && x > 0) x = 100;

            if(y > -100 && y < 0) y = -100;
            if(y < 100 && y > 0) y = 100;

            if(z > -100 && y < 0) z = -100;
            if(z < 100 && z > 0) z = 100;

            text.transform.setLocalPosition(x,y,z);
            text.transform.setLocalScale(Mobilizing.math.randomFromTo(10, 20));

            text.transform.lookAt(new Mobilizing.Vector3(0,170,0));

            this.node.transform.addChild(text.transform);
        }
        R.addToCurrentScene(this.node);
        
        this.node.transform.setLocalPositionY(170 - maxDist/2 );
        
        quat = new Mobilizing.Quaternion();
    };

    this.onConnect = function()
    {
        //listen to the server
        console.log("video client onConnect");
        //we must subscribe to channels here
        this.genericClient.pubsub.subscribe("/savesettingorder", this.onSaveSetting.bind(this));
        this.genericClient.pubsub.subscribe("/getsettingorder", this.onGetSettingOrder.bind(this));
        this.genericClient.pubsub.subscribe("/returnsetting", this.onGetSetting.bind(this));
        this.genericClient.pubsub.subscribe("/deviceQuat", this.onDeviceQuat.bind(this));
    };

    this.onSaveSetting = function()
    {
        console.log("save settings call");

        /*for(var projNb in settings)
        {
            var keys = Object.keys(settings[projNb]);

            for(var prop in keys)
            {
                var key = keys[prop];
                var val = settings[projNb][key];

                var toSend = {projector:projNb, key: key, val: val};

                if(key !== "imgMask")
                {
                    console.log("will send", toSend);
                    this.genericClient.pubsub.publish("/savesettings", toSend);
                }
            }
        }*/

        var toSend = {key:"un truc", value: {text:"un text", index:Math.random()}};
        this.genericClient.pubsub.publish("/setsetting", toSend);

    }

    this.onGetSettingOrder = function(data)
    {
        this.genericClient.pubsub.publish("/getsetting", data);
    }

    this.onGetSetting = function(data)
    {
        console.log("getting setting",data);
    }

    this.update = function()
    {
        /*this.node.transform.setLocalRotationY( this.node.transform.getLocalRotationY()+.05);
        this.node.transform.setLocalRotationZ( this.node.transform.getLocalRotationZ()+.1);*/
    };

    this.onDeviceQuat = function(data)
    {
        //console.log(data);
        if(this.node)
        {
            quat.x = data._x;
            quat.y = data._y;
            quat.z = data._z;
            quat.w = data._w;
            
            this.node.transform.setLocalQuaternion( quat );
        }
    }
}
