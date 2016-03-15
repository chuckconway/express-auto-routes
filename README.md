# express-auto-routes

Express middleware that automatically adds routes to express via decorators.

## Install

    $ npm install express-auto-routes

## Usage

Express auto routes middleware automagically adds routes via decorators on methods. It's build with es2015+ decorators in mind. At the moment they are only supported
by using a transpiler such as BabelJs.

For example,

      import {httpGet} from 'express-auto-routes';
    
      export class testsController {
          @httpGet('/tests')
          get(req, res, next){
            res.json({"Chuck":"HI"});
          }
      }

Adding as express middleware,

      import express from 'express';
      import autoRoutes from 'express-auto-routes';
    
      export class Express{
          configure(){
    
              let app = express();
              const router = express.Router();
    
              let routes = autoRoutes(router, path.join(__dirname, '../api/controllers/**/*.js'));
              app.use('/api/v1', routes);
         }
      }

### Without Decorators

The decorators add an array called 'routes' on to the class. This can be mimicked by manually adding an array to a class in ES5 or ES2015+.

ES2015

	get routes(){
	      return [
	        {path: '/widgets', httpMethod: 'GET', fn:function(req, res, next){res.json({"Chuck":"Get"});} },
	        {path: '/widgets', httpMethod: 'POST', fn:function(req, res, next){res.json({"Chuck":"Post"});} }
		     ];
    }
