'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.httpGet = httpGet;
exports.httpPost = httpPost;
exports.httpPut = httpPut;
exports.httpDelete = httpDelete;
function httpGet(path) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'GET', path);
  };
}

function httpPost(path) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'POST', path);
  };
}

function httpPut(path) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'PUT', path);
  };
}

function httpDelete(path) {
  return function (target, key, descriptor) {
    route(target, key, descriptor, 'DELETE', path);
  };
}

function route(target, key, descriptor, httpMethod, path) {
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

  target.routes[target.routes.length] = { path: path, httpMethod: httpMethod, fn: fn };
};