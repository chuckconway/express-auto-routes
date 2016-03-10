'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = autoRoutes;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function autoRoutes(router, searchPattern) {

  //let router = express.Router();
  // let rootControllerFolder = this.dirname + '/../api/controllers/';
  // let path = rootControllerFolder + '**/*.js';
  var suffix = 'Controller';
  var add = this.addRoutes;

  (0, _glob2.default)(searchPattern, function (er, files) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var f = _step.value;


        var controllerClass = require(f);
        var controller = getUnderliningController(controllerClass);
        var name = controller.name;

        //Ensure we only process routes that end with 'Controller'
        if (name.indexOf(suffix, name.length - suffix.length) !== -1) {
          addRoutes(router, controller);
        } else {
          console.log('Javascript file, ' + name + ' found, but it does not appear to be a controller. Expecting filename to end with \'Controller\'');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
}

function getUnderliningController(controller) {
  var controllers = [];
  var suffix = 'Controller';

  _lodash2.default.forEach(controller, function (item) {

    //We want to make sure that the item's name ends with "Controller"
    if (_lodash2.default.endsWith(item.name, suffix)) {
      controllers[controllers.length] = item;
    }
  });

  return _lodash2.default.first(controllers);
}

function addRoutes(router, controller, action) {
  //check if the controller has action defined.
  //This should never happen because the attributes generate the routes.
  if (controller.prototype.routes !== undefined) {
    var routes = controller.prototype.routes;

    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      router[r.httpMethod.toLowerCase()](r.path, r.fn);
    }
  } else {
    console.log();
  }
}