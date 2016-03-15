import express from 'express';
import fs from 'fs';
import _ from 'lodash';
import glob from 'glob';

export default function autoRoutes(router, searchPattern) {

  //let router = express.Router();
  // let rootControllerFolder = this.dirname + '/../api/controllers/';
  // let path = rootControllerFolder + '**/*.js';
  let suffix = 'Controller';

  glob(searchPattern, function(er, files) {
    for (let f of files) {

      let controllerClass = require(f);
      let controller = getUnderliningController(controllerClass);
      let name = controller.name;

      //Ensure we only process routes that end with 'Controller'
      if (name.indexOf(suffix, name.length - suffix.length) !== -1) {
        addRoutes(router, controller);
      } else {
        console.log(`Javascript file, ${name} found, but it does not appear to be a controller. Expecting filename to end with 'Controller'`);
      }
    }
  });

  return router;
}

function getUnderliningController(controller) {
  let controllers = [];
  let suffix = 'Controller';

  _.forEach(controller, (item) => {

    //We want to make sure that the item's name ends with "Controller"
    if (_.endsWith(item.name, suffix)) {
      controllers[controllers.length] = item;
    }

  });

  return _.first(controllers);
}

function addRoutes(router, controller, action) {
  //check if the controller has action defined.
  //This should never happen because the attributes generate the routes.
  if (controller.prototype.routes !== undefined) {
    let routes = controller.prototype.routes;

    for (var i = 0; i < routes.length; i++) {
      let r = routes[i];
      router[r.httpMethod.toLowerCase()](r.path, r.fn);
    }
  } else {
    console.log();
  }
}
