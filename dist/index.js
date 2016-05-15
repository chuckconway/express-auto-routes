'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = autoRoutes;
exports.httpGet = httpGet;
exports.httpPost = httpPost;
exports.httpPut = httpPut;
exports.httpDelete = httpDelete;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addedRoutes = [];

function autoRoutes(router, searchPattern) {

  (0, _glob2.default)(searchPattern, function (er, files) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var f = _step.value;

        var controllerClass = require(f);
        var controller = getUnderliningController(controllerClass);

        if (controller !== undefined) {
          addRoutesFromController(controller, router);
        } else {
          console.log('Javascript file, ' + f + ' was found, but does not appear to be a valid controller. Skipping this file.');
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

    console.log('Routes added:');

    for (var i = 0; i < addedRoutes.length; i++) {
      console.log(addedRoutes[i].method + ': ' + addedRoutes[i].path + ' - ' + addedRoutes[i].name);
    }
  });

  return router;
}

function addRoutesFromController(controller, router) {
  var suffix = 'controller';
  var name = controller.name;
  //Ensure we only process routes that end with 'Controller'
  if (name.toLowerCase().indexOf(suffix, name.length - suffix.length) !== -1) {
    addRoutes(router, controller);
  } else {
    console.log('Javascript file, ' + name + ' found, but it does not appear to be a controller. Expecting filename to end with \'Controller\'(case insensitive)');
  }
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

      //add middleware if it's defined.
      //express throws and error when undefined middleware is added.
      if (r.middleware) {
        router[r.httpMethod.toLowerCase()](r.path, r.middleware, r.fn);
      } else {
        router[r.httpMethod.toLowerCase()](r.path, r.fn);
      }

      addedRoutes[addedRoutes.length] = { name: controller.name, method: r.httpMethod, path: r.path };

      //console.log('Controller ' + controller.name + ' added method ' + r.httpMethod + ' for path ' + r.path);
    }
  } else {
      console.log('Controller ' + controller.name + ' does not contain routes');
    }
}

function httpGet(path, middleware) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'GET', path, middleware);
  };
}

function httpPost(path, middleware) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'POST', path, middleware);
  };
}

function httpPut(path, middleware) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'PUT', path, middleware);
  };
}

function httpDelete(path, middleware) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'DELETE', path, middleware);
  };
}

function route(target, key, descriptor, httpMethod, path, middleware) {
  var fn = descriptor.value;

  delete descriptor.value;
  delete descriptor.writable;

  if (!path) {
    path = key;
  }

  descriptor.get = function () {
    var bound = fn.bind(this, path);

    Object.defineProperty(this, key, {
      configurable: true,
      writable: true,
      value: bound
    });

    return bound;
  };

  if (!target.routes) {
    target.routes = [];
  }

  target.routes[target.routes.length] = { path: path, httpMethod: httpMethod, fn: fn, middleware: middleware };
};