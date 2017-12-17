/**
* Object that contains all the necessary infos for projects and their respectives scenarios
* @property ProjectsRepository
*/
var ProjectsRepository = {};

/**
* Project list to be handled by ProjectsRepository object
*
* @property projects
*/
ProjectsRepository.projects = [];

/**
* Adds the project instance to the projects list
*
* @method Register
* @param {Object} project instance of the project server to use
*/
ProjectsRepository.Register = function(project){

    ProjectsRepository.projects.push(project);
    console.log("pushed",project,"in",ProjectsRepository.projects);

    //launch the setup of this server
    //project.setup();
};

/**
* Remove the project from the list
*
* @method Unregister
* @param {Object} project
*/
ProjectsRepository.Unregister = function(project){

    var index = ProjectsRepository.projects.indexOf(project);
    if(index >= 0){
        ProjectsRepository.projects.splice(index);
    }

};

/**
* Returns the project instance by its string's name
*
* @method getProjectByName
* @param {Object} name
* @return {Object} the project having this name
*/
ProjectsRepository.getProjectByName = function(name){

    var projectToReturn = null;

    for(var i in ProjectsRepository.projects){

        if(ProjectsRepository.projects[i].genericServer.name == name){
            projectToReturn = ProjectsRepository.projects[i];
            break;
        }
    }

    return projectToReturn;
};
