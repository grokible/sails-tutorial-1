# TUTORIAL02

## Overview:  Overriding Default Controller Behavior

In the previous tutorial we explored the default controller and model behavior one
gets out of the box from Sails, with a little configuration.  Now we are going to
override and enhance this behavior with a little Javascript and some more configuration
to make more complete and robust REST actions.

We'll focus first on making our User create routine work well, and then see how this
affects login and authentication.

In this tutorial we will investigate how to:

* Override controller actions and create our own custom actions using well-chosen
  Javascript libraries.
* Create our own functions locally and globally to promote reuse.
* Use a variety of nice Javascript tools for executing and inspecting HTTP calls
  which can help our debugging efforts.
* Use bluebird promises to greatly simplify our asynchronous code.
* Learn basics of the Waterline ORM in conjunction with promises.
* Use the `sails>` interactive console to experiment (REPL => faster experimentation!).
* Setup a test/ directory structure for all of our unit tests and learn how to
  integrate a Mocha as an npm script (i.e. npm test).


## From now on...

I'm not going to tell you to stop and start Sails.  Any change that is made requires it.

## Sails Routing

Recall our generated controller was empty, but due to our blueprint settings in `config/blueprint.js`,
we automatically inherited both RESTful calls and corresponding shortcut calls.  Since Sails
provides so much automatic behavior, out-of-the-box, it's important to understand the underlying
system, so that we can surgically make a change.  This is explained in the [blueprint-api section of Sails doc](http://sailsjs.org/#/documentation/reference/blueprint-api).

First off, there are "routes" and "actions".  A route is the URL pattern that binds to a particular
action.  An action is the inherited behavior (code) that does something.  For example, by default
we get a blueprint RESTful route `/:modelIdentity/create` (e.g. `/user/create`), which corresponds to the blueprint action create.

The blueprint api gives us 3 types of automatically generated routing:  RESTful, shortcut and action.  We've already
seen RESTful (e.g. `GET /user/1`), and shortcut (e.g. `GET /user/create?firstName=Roger...`).  Next we'll see
action routes.  Action routes are automatically generated routes that map to a controller action.  All we have
to do is add a controller action and we'll automatically get a route to it.

Let's create a new controller for handling authorization:
```ShellSession
$ sails generate controller auth login
```
This creates this file in `controllers/AuthController.js`:

```Javascript
/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  /**
   * `AuthController.login()`
   */
  login: function (req, res) {
    return res.json({
      todo: 'login() is not implemented yet!'
    })
  }
}
```

Now hit the URL `http://localhost:1337/auth/login` and you will see the returned json.  Also, try
`http://localhost:1337/auth/create` and you will should get a 404 error.  The blueprint routes are
only active if we have both a controller and a model.  Since we didn't create an auth model, the
blueprint routing for RESTful and shortcut routes is not active (the Blueprint Action routes are,
however).

Take a moment to look at the format for the controller action:

* It has a name (e.g. login), which is used for the blueprint action route that is generated.
* The action handler is a function which takes a req(uest) and res(ponse).  These Request and
  Response objects are Sails objects, but they are compatible with Express Request/Response
  objects (Sails adds some additional convenience methods).
* The way we signal we are finished is to call res.json (), which is equivalent to calling
  res.send () with a jsonified argument.  The response object acts as the way we communicate
  with the system to return a non-streamed result.  Note that the functions res.json () and
  res.send () return 'this' (the response) for chaining, however, we do not need to
  return anything from the action method.  The call to res.json () or res.send () are the
  way the results are communicated outward.

Note that we probably want to change the route from `/auth/login` to simply `/login`.  Also, we
don't want to accidentally have blueprint actions turned on at some later time, if and when we
add a model for this controller.  So let's first deactivate blueprint routes for this controller
and then add a custom (explicit) route to `/login`.

Make the following changes to `/controllers/AuthController.js`:

```Javascript
module.exports = {
    // Disable Sail's default routing for controller
    _config: { actions: false, shortcuts: false, rest: false },
```

You should find that `http://localhost:1337/auth/login` now gives a 404 error, since we've turned
off *Blueprint Action Routing* for the controller.

Note that we ran into a small nit here, when we applied the _config settings to model/controller pairs
(such as User).  It was not possible to selectively turn off actions, but leave shortcuts and/or
rest as true (this generates a stacktrace, showing some SQL is generated incorrectly, so likely a *bug*).

Regardless, *action routing* seems like something we would want always turned on, with the thought that we
should only be putting actions in the controller we want routed.

## Custom (Explicit) Routes

Now that we've disabled the blueprint driven routing for this controller, we can play around with
*Custom Routing*.  The [Custom Routing docs](http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html)
describe all of the possibilities.

The single file `config/routes.js` describes all the custom routes for the application.
Routes have an address (consisting of a verb and path/pattern), and a target.  The simplest
target format is `:controllerIdentity.:nameOfAction`, e.g. `UserController.login`.

Let's add the route to the end of `config/routes.js`.

```Javascript
    'post /login' : 'AuthController.login'
```

## Testing POST

Up to this point we've assumed we can use the browser address bar for testing, as all of our methods
have been available with shortcut routes.

While having proper REST verbs can be slightly more trouble, it's important to be able to test them
easily, and use them as there are things that will work better if we do things "properly" (e.g.
CSRF middleware depends on proper mutator definition).

I give 3 different useful ways of firing off HTTP requests from a test machine.  You might want
to try each, as each has its benefits.  Postman, from the Chrome browser is a nice GUI approach.
The curl CLI, while being old, is generally available without an install, and is scriptable,
but it can be fairly cryptic.  HTTPie, is a very nice, compact tool, but requires Python and
a small install.

I suggest using Google's Chrome browser and installing the Postman addon.  This combination is
pretty good for this purpose.  Once you've done that, you should be able to do a post to
`/login` and not get a 404.

Alternatively, if you need a command-line tool there are lots of them.  Here's how to do this
with an old-school curl call (N.B. I had to use 127.0.0.1 as localhost was rejected using this format):

```ShellSession
$ curl -i -X POST -H 'Content-Type: application/json; charset=utf-8' -d '{}' http://127.0.0.1:1337/login
HTTP/1.1 200 OK
X-Powered-By: Sails <sailsjs.org>
Access-Control-Allow-Origin: 
Access-Control-Allow-Credentials: 
Access-Control-Allow-Methods: 
Access-Control-Allow-Headers: 
Content-Type: application/json; charset=utf-8
Content-Length: 47
Set-Cookie: sails.sid=s%3ASWKgoInhB-IWnUyEZujV_ajw.aL0r1ktv7X6xL1PZmEkhi2eO8JW3FNhiNpHhJeZUzjE; Path=/; HttpOnly
Date: Fri, 12 Dec 2014 20:33:28 GMT
Connection: keep-alive

{
  "todo": "login() is not implemented yet!"
}
```

It worked, but kind of a pyhrric victory as curl is so complicated.  Rather than write a wrapper shell
for curl, let's just install HTTPie, which gives us a nicer CLI.  Note that HTTPie is Python.
On my mac, I installed like this:

```ShellSession
$ brew install httpie
$ http POST localhost:1337/login
HTTP/1.1 200 OK
Access-Control-Allow-Credentials:
Access-Control-Allow-Headers:
Access-Control-Allow-Methods:
Access-Control-Allow-Origin:
Connection: keep-alive
Content-Length: 47
Content-Type: application/json; charset=utf-8
Date: Fri, 12 Dec 2014 20:38:55 GMT
Set-Cookie: sails.sid=s%3Ap21kFkbSdmvUqH7l3PtjhidB.DNjbhGFxXmaVuWJAxGidaaF3j8n0e5m95XOLsUQfJk8; Path=/; HttpOnly
X-Powered-By: Sails <sailsjs.org>

{
    "todo": "login() is not implemented yet!"
}
```

OK, that is much simpler and provides some nice ASCII coloring.  We'll start using HTTPie for
any CLI testing we do from here on out.

## Authentication

Sails doesn't really provide authentication out-of-the-box in a simple format.  Authentication
is a somewhat complicated subject, and will require some moderate knowledge of Sails, Express,
and standards like TLS.  We want to take this in a few steps to make things incremental.

Also, since this is a tutorial, we'll be making lots of stops along the way.  The Authentication
task is really just a mechanism to drive our exploration.  In other words, we are going to
take the "long way" in figuring this out, because we are trying to understand a new system.
Authentication is just a means to an end in that respect.

Our first incremental step will be to concentrate on creating a User record with an encrypted
password.  Regardless of which authorization scheme we choose to use, there will always be
some account with some associated secret.  That is a given, and all systems require some
sort of bootstrapping using this.  So we will focus our efforts on this first.

## Simple Authentication Considerations and Approach

The first candidate we could use is "Basic Authentication".  Basic authentication has the
benefit that it is simple, and relies on built in behavior in both the web server and
most web browsers.  But basic authentication doesn't allow us to really customize
things as we'll need to.  So in our case it is a little too simple.

The approach we will use will be the following:

    1. All our calls will be protected by HTTPS.
    2. User.create will take a plaintext password, encrypt it using bcrypt, and
       save it in our datastore.  Thus, we do not save plaintext user passwords.
    3. Auth.login will take a plaintext password, encrypt it and compare it
       to the saved password.  We again use bcrypt for this comparison.
    4. On successful login, Auth.login will return a special token which is
       specific to the user.
    5. The special token must be returned with each protected call in the
       HTTP "Authorization" header.  The format for this header-value line
       will be:

       Authorization: Grokible-Simple-Auth token=<TOKEN>

Note that for our purposes, we will use the self-same token generated by
bcrypt as the token.  This does have the downside that the token expiration
is tied to the user's password (which is undesireable).  If someone cracks
the HTTPS packet with the token, it can then be used until the user changes
his password.  However, note that this system is compatible with most
more advanced authentication systems, in that all we need is a way of
generating per-user tokens that expire, and a protocol for having the client get
a new token when one expires.

So our simple approach will allow us to incrementally upgrade our server
implementation to use oAuth 2.0, for example.

## Implementing password encryption

For our purposes we will first skip step 1, which is to require HTTPS for
most calls.  HTTPS will encrypt the token, which is important so that no
one can sniff the token and use it.  This is essentially an Express
configuration step that we'll save until the end (Sails relies on Express
for lower level server functionality).

## Using bcrypt to Hash Passwords

bcrypt is a standard for password hashing.  We'll need to add a password
field to User.create, as well as some custom code.  First step is to install
bcrypt (do it locally):

```ShellSession
$ npm install bcrypt
|
> bcrypt@0.8.0 install /Users/rogerbush8/Documents/workspace/node/learning/sails/sails-tutorial-1/node_modules/bcrypt
> node-gyp rebuild

  CXX(target) Release/obj.target/bcrypt_lib/src/blowfish.o
  CXX(target) Release/obj.target/bcrypt_lib/src/bcrypt.o
  CXX(target) Release/obj.target/bcrypt_lib/src/bcrypt_node.o
  SOLINK_MODULE(target) Release/bcrypt_lib.node
  SOLINK_MODULE(target) Release/bcrypt_lib.node: Finished
bcrypt@0.8.0 node_modules/bcrypt
├── bindings@1.0.0
└── nan@1.3.0
```

Next, let's add a property to `models/User.js` for password:

```Javascript
...
    email : { type: 'string', required: true, unique: true, email: true },

    password : { type: 'string', required: true }
```

Next we need to override the create action in `controllers/UserController.js`.  First,
let's stub in some code to test bcrypt.


```Javascript
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var BCrypt = require ('bcrypt')

module.exports = {
  create: function (req, res) {
      var params = req.params.all ()

      var salt = BCrypt.genSaltSync (10)
      var hash = BCrypt.hashSync (params.password, salt)

      return res.json ({
          hash: hash
      })
  }
}
```
Hitting `http://localhost:1337/user/create?password=fugu` in the browser, returns:

```ShellSession
{
    "hash": "$2a$10$CZDtxdiEWv7hkv7p.oNu3uue1t6lkC0yHtMVHflFxBg/rV7etEQ62"
}
```
Again, note we are using the `res` object to set our json result, and then
returning the response object (res.json returns 'this').

Also note that our other (blueprint) routes still work.  User.create has simply
been overridden.  A few notes:

* The `var BCrypt = require ('bcrypt')` loads the library and makes it's methods
  available through the bcrypt variable, which is private to this module.
* The "create" property is how we define a controller action.  It takes a request and
  response object, which are defined in the [Express API](http://expressjs.com/api.html).
* We are calling the synchronous versions of the npm bcrypt library calls genSalt() and hash(),
  genSaltSync() and hashSync().  We will want to change these to asynchronous calls to follow
  good non-blocking hygiene.
* Loading the bcrypt library locally is one choice, but if we want a library to be
  available globally, how do we do this?

## First pass:  change synchronous code to async

Note the convoluted path that this simple example, which is essentially two steps,
requires when written in an asynchronous fashion.

```Javascript
    create: function (req, res) {
        var params = req.params.all ()

        BCrypt.genSalt (10, function (err, salt) {
            if (err)
                return res.json ({ error: err })
            BCrypt.hash (params.password, salt, function (err, hash) {
                if (err)
                    return res.json ({ error: err })
                return res.json ({
                    hash: hash
                })
            })
        }) 
    }        
```

## Continuation passing

The Continuation passing style of programming has some advantages, but one of
them is not readability.  The nesting of functions and repeated error handling
in the example above make this fairly simple example a lot less readable.

While the idea of continuation passing is simple, the effect of using it to
write real code, which handles all of the requirements of the real world,
results in very hard to read and maintain code.  Irakli Gozalishvili
makes a good short argument for
[better abstractions in this blogpost](http://jeditoolkit.com/2012/04/26/code-logic-not-mechanics.html#post).

Fortunately, others who have gone before us felt the same way and invented some [clever
solutions to clean things up](http://en.wikipedia.org/wiki/Futures_and_promises).
Promises are a programming abstraction that helps simplify programs that use functions
that return their results, or errors, asynchronously.  Promises in Javascript
are essentially little wrapper objects that bundle up the object to be returned (or
an error), and thereby simplify our code by reducing nesting, eliminating repeated
error handling code, and improving programmatic control over asychronous handling.

The ECMAScript 6 (ES6) promise API follows a de-facto standard called
[promises/A+](https://promisesaplus.com/), which also has been implemented separately
as Javascript 5 libraries.  Thus we can use the feature and future proof our code
by adhering to the promises/A+ standard.

Note that Sails.js previously used a library called "async" to do similar types of things that
promises do.  In the version of Sails I'm running (0.10.5), bluebird has replaced async
in the Waterline ORM.  So we should be able to use it for most of our calls.

A popular promise library that seems to be known for the quality of its implementation is
[bluebird](https://github.com/petkaantonov/bluebird/blob/master/API.md), which we will
be using for all of our synchronization purposes.  I couldn't find extensive performance
data on bluebird, but here is an interesting
[blog post that compares async to bluebird](http://spion.github.io/posts/why-i-am-switching-to-promises.html)
and finds bluebird to be about twice as fast and half as needy in terms of memory.

Note that we should be careful of mixing and matching async and bluebird.  They probably
could be used together, with adequate caution, but remember, the whole point of using
promises is to make the code easier to maintain.  Mixing both will require understanding when we are
using bluebird and when we are using async, potentially within the same code.
So even if we can figure out a way to use them together, it might be a pyhrric victory resulting in
more complexity.  So we'll just be careful in this respect (obviously we are using the two in the same
call chain *somewhere*, as long as we don't bleed one into the other).

## Second pass:  using bluebird promises to simplify asynchronous code

Promises, in our case bluebird, can help in clean up our simple async code, by
eliminating the nested error handling, and making our code look much like
synchronous code.  It does this by wrapping our tail call functions in a
returned promise object (rather than return a value).  Thus the promise
represents a future return value that acts as a placeholder.

To use Promises, we need to npm install the bluebird library and require the
library.  Then, in order to interoperate with existing library calls, we
make a call to promisifyAll(), which creates "Async" methods for each of the
methods and functions in the library (promisify makes sync methods async by
wrapping them and returning a promise object instead of the normal value).
These new wrapped functions have the original name + "Async" appended.

```ShellSession
# From within top-level project directory
$ npm install bluebird
```
To use the promise library and promisify the bcrypt library, we add this
to the top of our `controllers/UserController.js` file:

```Javascript
var Promise = require ('bluebird')
var BCrypt = Promise.promisifyAll (require ('bcrypt'))
```

Now let's take a look at what async code with promises looks like:

```Javascript
        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (params.password, salt) })
        .then (function (hash) { return res.json ({ hash: hash }) })
        .catch (function (e) { return res.json ({ error: e }) })
```
Let's look at the previous, non-promisified version for comparision:
```Javascript
        BCrypt.genSalt (10, function (err, salt) {
            if (err)
                return res.json ({ error: err })
            BCrypt.hash (params.password, salt, function (err, hash) {
                if (err)
                    return res.json ({ error: err })
                return res.json ({
                    hash: hash
                })
            })
        }) 
```
That's a dramatic difference.  Imagine if we had more than 2 or 3 steps
in an async chain (which is very common).  The difference would be even
more pronounced.

Also note, we can add internal comments to make our code look/feel even
more familiar:

```Javascript
        BCrypt.genSaltAsync (10)

        // use generated salt to hash password with variability

        .then (function (salt) { return BCrypt.hashAsync (params.password, salt) })
        .then (function (hash) { return res.json ({ hash: hash }) })

        // handle errors

        .catch (function (e) { return res.json ({ error: e }) })
```

Note that what is happening is the following:

* A promise-chain is built by calling each of the promisifyAll() synthesized "*Async" methods,
  as well as the promise methods (e.g. then, catch).
* Each of the statements in this chain returns a promise which wraps the
  function.
* Error passing is implicit, and allows us to forward all errors to the
  final catch statement.  Multiple catch statements and a finally
  are possible.
* Internal comments are allowed because Javascript allows us to separate the dot operator with
  white space.
* Most importantly, our code looks similar to the easier to understand synchronous code.

Note that I wanted to make bluebird promises available in the global sails scope but this
was more difficult than expected.  While there are different mechanisms in sails for loading
and exposing libraries (`config/bootstrap.js`, `api/services/`), these all occured too late in
the loading process to be fully useful.  So including bluebird at the top of any module that
needs it seems the best current course of action.

## Choosing a JSON return standard

We are going to define a simple utility function for formatting errors we return from
the system.  For now, we'll make a very simple wrapper function that can be evolved.
In our `catch` block, we currently do the following:
```Javascript
    .catch (function (e) { return res.json ({ error: e }) })
```
The problem with this is we don't have control over the format of our errors.  Also, most
of the information in the error object is debugging information, which in a test environment
we want to see, but in a production environment, we do not want to see (at least by default).
At the very least we want to control the output format so that we can use errors
programmatically.  So we need our format to do a few things:

* A programmatic string code that tells what error happened.  This will be part of the
  interface for our API.
* A way of telling whether we had an error, or whether our call was successful.  In this
  area it would be good to have something be simple, since there is a bit of confusion
  over how to do this correctly with HTTP status codes.
* A place for optional detail, such as a stack trace, which could be suppressed in
  production.
* A way of adding new fields and data of various types without fear of collision in
  the error object's namespace.

After investigating lots of different schemes I've chosen Google's simple format
as my representation.  The [Google Json Style Guide](https://google-styleguide.googlecode.com/svn/trunk/jsoncstyleguide.xml)
gives plenty of details, but it's fairly simple.  Here's what a successful call looks like:
```Javascript
{
    data: { }
}
```
And here is the failure case:
```Javascript
{
    error: { code: someSymbolicCode, message: "some message" }
}
```
The first thing to notice is that the presence of the data property at the top level, indicates success,
and the presence of the error property indicates failure.  These can't be in the same message.
The error further must have a code (a string symbol) and a message, which is a short error summary
which can change (e.g. it can have some specific error data in it that changes).  Message should
be 1 or 2 lines long and it is not meant to be propagated to the UI (it's meant for a programmer,
or client log).

To the error property, we'll add an optional "_internal" property inside of error, which will only
show up when we are running sails in a development environment.  These details are helpful for debugging,
but we don't want them showing up in production.

## Defining our own utility modules

Let's call the new module `ControllerOut.js`.  It will be a simple OOP wrapper which wraps the
[Sails Response Object](http://sailsjs.org/#/documentation/reference/res).  The Sails Response
Object is itself an extension of the [Express Response Object](http://expressjs.com/3x/api.html).

Most of the node.js and Sails.js code that I've seen follows a variation of the "module pattern,"
which is related to a singleton pattern:  A single module object is instantiated by node.js when
it loads the module on server initialization, and then methods are called on this object.  This
style requires request state to be passed in.

At the risk of being called a "classicist" I'm going to slightly deviate from that here to get
OOP-style encapsulation of the response object:

my code usage look like this:
```Javascript
var ControllerOut = require ('Local/ControllerOut');

module.exports = {
    create: function (req, res) {
        var co = new ControllerOut (res)
        // snip ...
        .catch (function (e) { return co.error (e) })
```
A few notes about the above code:
* In the call to `co.error (e)` we do not need to pass the response object in since the
  ControllerOut object encapsulates that state (we pass it to the constructor).  This is
  the main reason we have chosen an OOP pattern rather than a Module pattern.
* The require `require ('Local/ControllerOut')` is explained below.  We essentially create
  a special local directory for holding our own project specific modules, which are
  not Sails modules (i.e. Models, Controllers, Services).  Note that this has the nice
  benefit of the require statement indicating which are our Local libraries via the
  "Local/" prefix in the require.
* We've Camel-cased the ControllerOut since it's a class name.


## Code organization:  Where should I put utility modules files?

Note that there are many ways to organize, and to let Node know where our modules
are.  There are also many opinions on how to do this correctly.  We'll pick something
that tries to balance the many competing factors.

Here are some details for considering where to put our new function(s):

* It's a node module.
* For now, this will be part of our existing project.  Since it relates to the Sails
  Response object, it clearly depends on Sails.
* In whatever we do, we want to make it very simple, and have it work well with
  the other systems (e.g. Git, Node, Sails).

Node has very specific rules about how it goes about looking for module files specified
in a `require()` statement, in the following order

* If the module begins with `/`, `../`, or `./` it is considered a relative path to a file
  relative to the working directory (cwd) where node was launched from.  In an application
  like sails, this will be the top-level application directory.
* If the module is a native module (core), it will come from wherever these come from
  (we can't override this).
* The `node_modules` folder at the node working directory level will be searched first,
  and failing that, will search the `node_modules` of the parent directory, and so on
  up to the root directory.

Note that there are additional rules when directories are used, as in the case of an npm
installed package which provides a module.  But for our purposes, the rules above are
sufficient.

So we'd like to put it somewhere node will find it (i.e. doing require()), that is project-specific
(for now), and that doesn't interfere with any of the existing packages.  We're not going to
make an npm module and install this as this would be overkill at this point in time.

A reasonable solution is to put it in the Sails application, top-level directory `node_modules/`.
Since node_modules is designed to hold external libraries, we will make a special "Local" directory,
which will hold project specific modules.

One wrinkle is we must make it so .gitignore will continue to ignore `node_modules` but not our
new `Local` directory.

## Changing .gitignore for node_modules/Local files

There is one problem with this approach:  the provided .gitignore file excludes the `node_modules/`
directory.  We can easily change .gitignore to exclude everything in node_modules, except for
the new Local subdirectory.
```ShellSession
# in .gitignore file
# node_modules <= commented out

node_modules/*
!node_modules/Local
```
The first pattern `node_modules/*` matches all the files and directories inside of node_modules.
The second pattern `!node_modules/Local` "adds back in" the Local directory which was excluded by the
first pattern.  These combine to exclude everything except our node_modules/Local files.  Note
we must do `git add node_modules` and this will find the correct files to checkin to git.

Again, there are lots of ways to do this, each with it's own pros/cons.  I didn't like most of the
solutions that were proposed as many required post-install scripts, or environment variable altering.
Despite the fact that node_modules is typically thought of as only for external libraries, I've made
a tiny exception which will work well with source control, and doesn't require post or pre-install hacks.

## A note about programming style and documentation (JSDoc)

Since we are starting to have a bit more code, it's important to start off on the right foot
with some good code style and documentation standards.  For documenting code, we'd like to
have the ability to automatically generate an API guide.  At present, the only tool that I found
which seems up to this task is JSDoc.  Note that there were many choices that support
simple Markdown, which I don't find suitable for generating API guides.  While I really appreciate
Markdown (this doc is written in it), method and API documentation requires a metadata system optimized
for this purpose, and Markdown alone is not sufficient.  Of course, it's great if the tool also
supports Markdown for times when you need a long description of a module or class library.

There is online [JSDoc documentation](http://usejsdoc.org/) which we can peruse later.
For now, knowing the most used tags will suffice.  We'll also see later how to run JSDoc to generate the
documentation.

The code below uses the most important JSDoc tags without any explanation (the meaning is
pretty standard and easy to infer in any case).  In a later section we'll run JSDoc and see the results.

## Code for ControllerOut.js

Put the following content into a file in the top-level app directory `node_modules/Local/ControllerOut.js`:
```Javascript
/**
 * @module ControllerOut
 * @desc Utility object for controller responses (wraps Sails response object)
 * @see {@link http://sailsjs.org/#/documentation/reference/res|Sails Response('res') Reference}
 * @example
 * // In Sails controller:
 * var ControllerOut = require ('Local/ControllerOut')
 * ...
 * someAction: function (req, res) {
 *     var co = new ControllerOut (res)
 *     ...
 *     if (err)
 *         return co.error (err)  // jsonify err and send via Sails response obj
 *     else if (err2)
 *         return co.error (err2, { code: 'math.wayTooBig', message: "too big" });
 *                             // ^ override error properties
 * }
 */

module.exports = ControllerOut

function ControllerOut (response) {
    this.response = response;
}

ControllerOut.prototype.error = function (error, options) {

    // Options properties {code, message} override error's
    // After options, underbar takes precedence (_code or _message) override error's

    var options = options || {}
    var code = options.code || error._code || error.code || 'general.unknown'

    // Attempt to pull out any conceivable error message that we can use

    var message = options.message || error._message || error.message || error.description ||
        error.title || error.summary || error.reason || 'No message, unknown error.'

    var rc = {
        code: code,
        message: message
    }
        
    // If we are in a sails dev environment, supply all the error details

    if (sails.config.environment == 'development') {
        rc._internal = error
        return this.response.json ({ error: rc })
    }
}
```
Note we are using a Javascript "prototype class" pattern, as well as exporting its symbol via Node's
`module.exports` mechanism.  This will allow us to use it like this:
```Javascript
var ControllerOut = require ('Local/ControllerOut')    // found in our dir node_modules/Local
var co = new ControllerOut (res)    // invoke OOP constructor with res(ponse) object
return co.error (error)    // invoke error method on object
```

The ControllerOut helper object will give us a place to add functionality for streamlining
and standardizing our controller output.

The error method tries to pull an error message and code out of error objects by using common
properties that various error objects might define.  We also add the ability to override
the message or code by specifying this in passed in options, or by changing the error object
and adding "_message" or "_code".  Note that this is a bit suboptimal because it's not a good
idea to modify the objects of other libraries, however, for now this is fine as we don't want
to get too far off our path.  Error objects tend to be fairly simple.  We will come back
to this eventually and use error chaining to do things better (at the cost of more complexity).

The code also uses the `sails.config.environment` setting to elide internal error information
when not in a development environment.

Note that the `sails.config` object is quite detailed, and any setup information we need
for our modules can be determined (read-only) from this.  There is a
[detailed sails.config reference](http://sailsjs.org/#/documentation/reference/sails.config)
we can peruse later.  Note that the config object is constructed during app initialization
and that `sails.config` is available to Sails methods (controller, model, service), but
not outside this scope.

And now here is the final `controller/UserController.js` file with changes incorporated:
```Javascript

/**
 * User controller logic for REST service.
 * @module controllers/UserController
 * @see module:models/User
 */

var Promise = require ('bluebird');
var BCrypt = Promise.promisifyAll (require ('bcrypt'));
var ControllerOut = require ('Local/ControllerOut');

module.exports = {
    create: function (req, res) {
        var co = new ControllerOut (res);
        var pm = req.params.all ()

        // TODO - Currently only returns hash, does not create yet

        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (pm.password, salt) })
        .then (function (hash) { return res.json ({ hash: hash }) })
        .catch (function (e) { return co.error (e) })
    }
};
```
A few things to try:

* Execute this code for the normal case, as well as an error case.
* You should run git on your node_modules to make sure `ControllerOut.js` will
  not be git ignored.  Running `git status` will show the node_modules directory.
  Try `git add node_modules` and you should see it only adds things in the Local
  subdirectory based on our changes to .gitignore.
* We will generate automatic docs later.

The easiest way to test the error case, in an interactive, ad hoc manner, is to omit the password
parameter on the call.  Again, we have convenience blueprint routes defined, so we can
use the browser address bar, even though this will ultimately not be a GET (i.e. create is a POST):
```ShellSession
# In your browser
http://localhost:1337/user/create?firstName=Roger&lastName=Bush&email=rogerbush8@yahoo.com
```
We can also test whether our gitignore changes did the right thing in node_modules:
```ShellSession
# from top-level application directory
$ git status node_modules
On branch master
Your branch is up-to-date with 'origin/master'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)

  node_modules/

nothing added to commit but untracked files present (use "git add" to track)
```
Note that node_modules now shows up.  Let's use git to add the directory:
```ShellSession
$ git add node_modules
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

  new file:   node_modules/ControllerOut.js
...
```
So git is now finding files in node_modules/Local but not other files in that directory
which is what we wanted.

Now that we have many of the organizational basics down, we will need to understand more
details of the Waterline ORM so that we can complete our create call.

## The Waterline ORM

Waterline is a very simple, yet powerful ORM/ODM that was originally developed as part of Sails.
The authors have wisely split it out as its own distinct project so that it can develop independently.
So far, with the help of Sails blueprint routes, Waterline has been doing all the under-the-hood heavy lifting
of fetching and saving our objects for us.

Waterline provides a high-level abstract interface to our datastore.  If you're familiar with Java Hibernate,
or other systems like it, you'll feel right at home with Waterline (albeit at a much lighter footprint, and
with far fewer bells and whistles).  Note that for object hierarchies and field validations, Waterline
relies on attribute information which we add to our model files in `api/models`.

There is a good [introduction to Waterline](http://sailsjs.org/#/documentation/concepts/ORM)
that you can investigate later with many useful examples.  We'll be doing just enough to get the
gist of working with Waterline to get us started.

There is more good documentation at the [Github Waterline project repo](https://github.com/balderdashy/waterline-docs).
Most of the documentation can be found via drill-down to the "Table of Contents" section.

We'll be mostly using information from these two sources:

* [Queries](https://github.com/balderdashy/waterline-docs/blob/master/query.md)
* [Query Methods (CRUD)](https://github.com/balderdashy/waterline-docs/blob/master/query-methods.md)

We are interested now in learning the basics:

* Querying
* CRUD operations
* Field validation (implicit and explicit)
* Howto incrementally go from Sails/Waterline doing everything, to grabbing control
  for ourselves, in a way that works well with the system.

So far, we have not explicitly interacted with the ORM system to interact with our MySQL database
(except for defining a Waterline connection to our mysql db).  The interactions we've had have
been automatically managed via blueprint routes and default
controller actions.  We're now going to dive into Waterline, as a first pass, to be able to
do simple things.

You may have wondered why we didn't have to install bluebird promises in our previous examples.
The reason for this is that Waterline uses bluebird promises:
```ShellSession
$ npm view waterline
```
...
  dependencies: 
   { anchor: '~0.10.1',
     async: '~0.9.0',
     bluebird: '^2.3.4',
...
```

## Using the Sails console to experiment (with Waterline)

Sails has different commands that we can provide from the command-line.  We can see these
commands by typing `sails` without any command or option.
```ShellSession
$ sails

  Usage: sails [command]

  Commands:

    version               
    lift [options]        
    new [options] [path_to_new_app]
    generate              
    console               
    www                   
    debug                 
    configure             
    help                  

  Options:

    -h, --help     output usage information
    -v, --version  output the version number
    --silent       
    --verbose      
    --silly        
```
The command we are interested in is `console`, which puts Sails in an interactive mode,
and allows us to type Javascript at the command-line.  This comes in handy for playing
with the ORM.  Having a REPL (Read-Eval-Print Loop) let's us learn new APIs quickly.
```ShellSession
$ sails console

info: Starting app in interactive mode...

info: Welcome to the Sails console.
info: ( to exit, type <CTRL>+<C> )

sails> 
```
Sails makes our models available by their name (first letter capitalized).  Let's
find our user record:
```ShellSession
sails> User.find ({ firstName: 'Roger' }).exec (console.log)
undefined
sails> null [ { firstName: 'Roger',
    lastName: 'Bush',
    email: 'rogerbush8@yahoo.com',
    password: null,
    id: 1,
    createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
    updatedAt: Thu Dec 11 2014 18:34:17 GMT-0800 (PST) } ]
```
Note that in order to print out the User object, we chained a call to console.log
to the end using .exec().  Note that when using `.exec (console.log)`, the
`sails>` prompt prints prior to the results.  This is because the call to exec
is not synchronized with the console prompt.  This is a race condition, with
the sails> prompt always winning the "race".

If it makes you feel better, you can hit `[ENTER]` to "get the prompt back".

Also note that on Linux, standard interactive shell command keys should work,
in my case I've got emacs style bindings so:  CTRL-P (previous), CTRL-N (next),
CTRL-A (jump to line start), CTRL-E (jump to line end), etc.  You should be able
to set yours in the usual way on most *nix type systems.

Waterline methods typically return a Collection object to allow method chaining
in a fluent interface which the author calls "Deferred Object" style.  Thus, the
reason we see a printout of the object is the Collection's stringify method shows
its contents when we pass it to `console.log`.

Note that in Waterline, Bluebird Promises are turned on by default, which means
(minimally) that promisifyAll() has been run on everything as needed, and so
promises wrap the returned values (so really we the Waterline methods return
a Promise which wraps a future Collection).

Let's try a slightly more complicated example:
```ShellSession
sails> User.find ().where ({ firstName: 'Roger' }).where ({ lastName: 'Bush' }).exec (console.log)
undefined
sails> null [ { firstName: 'Roger',
    lastName: 'Bush',
    email: 'rogerbush8@yahoo.com',
    password: null,
    id: 1,
    createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
    updatedAt: Thu Dec 11 2014 18:34:17 GMT-0800 (PST) } ]
```
Let's try a few other examples to note the results.  First, let's do one that will have
an empty Collection:
```ShellSession
sails> User.find ({ firstName: 'Glug' }).exec (console.log)
undefined
sails> null []
```
OK, we got an empty Collection, that makes sense.  Note that here we get an `undefined`
because the final call in the method chain is `exec` which does not return anything.
This completes immediately, without a return value, and so the sails interpreter 
prints undefined.  Next, the sails interpreter tees up the next prompt, waiting for
our command.  Finally, the call from the database completes and prints out to the
console.  This is why we see `sails> null []`, because the prompt precedes the 
call to console log, and then console log stringifys the Waterline (null) collection.

Again, the prompt race condition is harmless so we'll ignore it for now.  Just remember we are not
synchronizing the interactive sails prompt with our async code (which is why this happens).

Let's try something with an attribute that doesn't exist:
```ShellSession
sails> User.find ({ first: 'Roger' }).exec (console.log)
undefined
sails> Error (E_UNKNOWN) :: Encountered an unexpected error
: ER_BAD_FIELD_ERROR: Unknown column 'user.first' in 'where clause'
...
```
Nice, that gives us a good error message and a stacktrace.

Let's try editing a record on-the-fly.  In general, we probably wouldn't want to do this
as it might bypass some of our custom logic in the controller (or other construct).  This
might not be true for many of the simpler models in Waterline, since there is a fair amount
of logic we can associate at the model itself.  At any rate, this is useful for testing, but
we should be cautious of producing bad records in our datastore.

We can use `findOne` to get the first item in the collection.  Also, the `sails>` console
will let us split our Javascript over multiple lines, by ending the previous line with the
dot operator in a method chain.  This will advance to the next line and show `...` rather
than the normal `sails>` prompt.  We can also use CTRL-P and CTRL-N to bring up previous
lines in the sails interactive shell history.  This makes it easy to experiment.

Let's try getting a single record (id=1) on multiple lines.
```ShellSession
sails> User.findOne ({ id: 1 }).
... exec (function (err, user) { console.log (user.firstName) })
undefined
sails> Roger
```
Again, remember the shell prompt is not synchronized with our console.log statement,
so there is a race condition (but the `sails>` prompt always wins the race).

We can also experiment using Waterline with Bluebird promises, which are turned on by
default.  In a promise, we need to make sure to return the object from a "promisified"
method, which will then get automatically wrapped in a promise.

Let's see what a promise looks like just for fun:
```ShellSession
sails> User.findOne ({ id: 1 }).
... then (function (user) { return user })
{ _bitField: 0,
  _fulfillmentHandler0: undefined,
  _rejectionHandler0: undefined,
  _promise0: undefined,
  _receiver0: undefined,
  _settledValue: undefined,
  _boundTo: undefined }
```
Notice in this case, we printed out the promise rather than the object.  Because
the promise returns immediately and the console is not synchronized, the console
prints the current state of the promise object.  We can see by the internal properties of the
promise object that _settledValue is undefined, and thus this promise was waiting
on values to be resolved at the time it was output to the console.

If we want to synchronize, we will need to have our result print out within the
body of a function in a "promise then()" clause.

Let's alter our statement so that it prints the object(s) instead of the promise.
We can do this by calling console.log inside of a then clause (to wait on the results):

```ShellSession
User.findOne ({ id: 1 }).then (function (user) { console.log (user) })
{ _bitField: 0,
  _fulfillmentHandler0: undefined,
  _rejectionHandler0: undefined,
  _promise0: undefined,
  _receiver0: undefined,
  _settledValue: undefined,
  _boundTo: undefined }
sails> { firstName: 'Roger',
  lastName: 'Bush',
  email: 'rogerbush8@gmail.com',
  password: null,
  id: 1,
  createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
  updatedAt: Mon Jan 05 2015 12:18:10 GMT-0800 (PST) }

undefined
```
This works well, but let's add one more detail to eliminate the printout of the
promise object, which is just a bunch of noise.  Note that promises are great
for async programming, and in particular, when there is a lot of continuation
passing.  In our case here, we don't need to use promises, as things are simple.

So for the purposes of this tutorial, we can see promises work, and can be used
in the console (with a little console hackery), but we'll switch to using
exec() for the remainder for simplicity.

```ShellSession
sails> User.findOne ({ id: 1 }).exec (console.log)
undefined
sails> null { firstName: 'Roger',
  lastName: 'Bush',
  email: 'rogerbush8@gmail.com',
  password: null,
  id: 1,
  createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
  updatedAt: Mon Jan 05 2015 12:52:44 GMT-0800 (PST) }
```
Note that the documentation shows there are a variety of forms for the first argument
(the query) that this function will take.  Let's look at the documentation for find:

* [Query Methods (CRUD)](https://github.com/balderdashy/waterline-docs/blob/master/query-methods.md)

Note that in most of the calls, including find, the first argument is the "Find Criteria", and
will accept the data types `{}, [{}], string, int` (also [string] and [int] are accepted).  Note
that `{}` is a special, general criteria, and that `[{}]` is an array of these (implying logical
OR).  So each item in the Find Criteria, matches records, and then the union over all the items
in the Find Criteria is what is returned.

To understand complex Find Criteria, we must understand the most fundamental units that
make up a single predicate.
* `{ name: 'Walter'}`                // Most basic single column equality name = 'Walter'
* `{ name: 'Walter', state: 'CA' }`  // Multiple column equality
* `{ age: { '<=' : 21 }}`            // Any operator besides "=" requires double curly brackets.
* `54`                               // A number or string is interpreted as "id = <num>"

More complicated predicates involve nested levels of {} and []:

* `{ name: ['Walter Jr', 'Flynn'] }`                 // In list
* `{ name: { '!' : ['Walter Jr', 'Flynn'] } }`       // Not in list

Logical OR requires a little more typing:

* `{ or: [ { name: 'walter'}, { occupation: 'teacher'} ] }`

Each of these predicate items may be passed as a single item, or as a member of
a list in an outer enclosing array (the meaning at this level is logical OR).

By combining each of these ideas and the available operators, all complicated predicates
may be formed.  More details can be found in the
[query language docs](https://github.com/balderdashy/waterline-docs/blob/master/query-language.md).

Note we can also pass any array of strings or numbers and this will be interpreted as an
in-list for the id:

```ShellSession
sails> User.find ([1,2]).exec (console.log)
undefined
sails> null [ { firstName: 'Roger',
    lastName: 'Bush',
    email: 'rogerbush8@gmail.com',
    password: null,
    id: 1,
    createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
    updatedAt: Mon Jan 05 2015 12:52:44 GMT-0800 (PST) },
  { firstName: 'Pat',
    lastName: 'Bogus',
    email: 'patbogus@mail.com',
    password: '$2a$10$TaTPG0bNIQr1fZovmKol4eexDhefz1VUvli1wAQd6UjxnvvxsyJAm',
    id: 2,
    createdAt: Tue Dec 16 2014 16:14:12 GMT-0800 (PST),
    updatedAt: Tue Dec 16 2014 16:14:12 GMT-0800 (PST) } ]
```
It doesn't take too much insight to see that the query argument (arg 1), takes input of various
forms (scalar, array, assoc array) and renders that internally to a WHERE clause (at least
in the MySQL/Waterline adapter).  Thus, to fully make use of the power of Waterline, understanding
this transformation provides the same power that understanding how to do complex queries does in SQL.
If you've seen how this is done in other ORMs, where a multi-level assoc array is used to map to
a WHERE clause, then you'll understand how this works.  But the full understanding of this is
left to the reader (see the docs).

Let's try to update the object using an analog to the SQL UPDATE.  From the documentation,
we can see the first arg is "query" (so the WHERE clause generator as in the examples above),
and the second arg is for specifying the columns to set.  Note in this example we further
simplify the query argument to a scalar "1" which will be interpreted as the id.

```ShellSession
sails> User.update (1, { email: 'rogerbush8@gmail.com'}).exec (console.log)
undefined
sails> null [ { firstName: 'Roger',
    lastName: 'Bush',
    email: 'rogerbush8@gmail.com',
    password: null,
    id: 1,
    createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
    updatedAt: Mon Jan 05 2015 13:01:32 GMT-0800 (PST) } ]
```
Let's pull it from the db again just to make sure:
```ShellSession
sails> User.find (1).exec (console.log)
undefined
sails> null [ { firstName: 'Roger',
    lastName: 'Bush',
    email: 'rogerbush8@gmail.com',
    password: null,
    id: 1,
    createdAt: Thu Dec 11 2014 18:20:48 GMT-0800 (PST),
    updatedAt: Mon Jan 05 2015 13:01:32 GMT-0800 (PST) } ]
```
Cool, it worked!  Note a few important details:

* All Waterline container and model functions have had bluebird "promisifyAll()" run on them,
  which is why we can chain `then()` (a promise method) to `findOne()` (which returns a model).
  The call to findOne really returns a promise which wraps the (future) model.
* It's important in most promise methods, just as in continuation passing, to return a value.
* Again since we aren't synchronized with the `sails>` prompt, we will always be printing
  after the prompt in a final `console.log` statement.

## Model Create and Destroy from the sails console

Let's try creating a user from the console and removing just to round out our basic CRUD knowledge
of Waterline and using it in the console.  Let's create a user:
```ShellSession
sails> User.create ({ firstName: 'Foo', lastName: 'Bar', email: 'foobar@gmail.com', password: 'pa55word' }).exec (console.log)
undefined
sails> null { firstName: 'Foo',
  lastName: 'Bar',
  email: 'foobar@gmail.com',
  password: 'pa55word',
  createdAt: Tue Dec 16 2014 13:06:03 GMT-0800 (PST),
  updatedAt: Tue Dec 16 2014 13:06:03 GMT-0800 (PST),
  id: 2 }
```
Note that we use exec() in this case, which is just easier to type.

Now let's fetch that user:
```ShellSession
sails> User.findOne (2).exec (console.log)
undefined
sails> null { firstName: 'Foo',
  lastName: 'Bar',
  email: 'foobar@gmail.com',
  password: 'pa55word',
  id: 2,
  createdAt: Tue Dec 16 2014 13:06:03 GMT-0800 (PST),
  updatedAt: Tue Dec 16 2014 13:06:03 GMT-0800 (PST) }
```
Note that we are not encrypting the password yet.  One solution for this would be to add the
encryption behavior to a lifecycle method of Waterline (e.g. we could potentially do encryption in the
`beforeCreate()`, and `beforeUpdate()` callbacks.

Finally, let's `Destroy()` the model (which should DELETE the corresponding record in the database):
```ShellSession
sails> User.destroy (2).exec (console.log)
undefined
sails> null [ { firstName: 'Foo',
    lastName: 'Bar',
    email: 'foobar@gmail.com',
    password: 'pa55word',
    id: 2,
    createdAt: Tue Dec 16 2014 13:06:03 GMT-0800 (PST),
    updatedAt: Tue Dec 16 2014 13:06:03 GMT-0800 (PST) } ]
```
Note that destroy returned each of the destroyed records in a Waterline collection.
Let's verify that the record is gone:
```ShellSession
sails> User.findOne (2).exec (console.log)
undefined
sails> null
```

## Ready to finish User.create()

At this point, we are ready to finish User.create().  Here's what we want:

* Trim leading/trailing spaces and Upcase each word in first and last.  Make sure there is a value.
* Add a new "name" field which will be the concatenation of firstName + " " + lastName.
  This is useful because Waterline will generate special search methods based on
  any column which is named "name".  We'll also index it so searches will be fast.
* Make sure email, which we will use as our login, is unique.  This will only work for our
  SQL database as unique in Sails/Waterline is adapter dependent, and will be
  implemented using a unique constraint in MySQL (this is what we achieved when we set
  unique=true on the email attribute).
* Use bluebird promises to make our code nice and tidy.
* Integrate existing password encryption code into final solution.

## Step 1: Trim, Upcase and Validate firstName and lastName

Note in our final example of this we may want to have the exact same code in the client,
showing the cleaned version in the UI.  It's not the best practice to change these values
without showing the user what we are doing, and giving him a chance to change this.  For
now though, we'll do this behind the scenes.

Sails/Waterline uses the validator library and the full set of validations can be
seen in [the code](https://github.com/balderdashy/anchor/blob/master/lib/match/rules.js).

Note that even though we can associate validations with the model, we typically still
have to do validation checking on incoming parameters.  It would be a mistake to conflate
the input query parameters with the fields in the model.  While these are generally the
same, there are the 10% that are not which would cause issues.  Also, validating just
prior to saving the model is far too late.

In addition there are other things that we'll want to do, so we'll need to take control
of the parameter checking ourselves, early on.

Another thing we'll want to do is prohibit extra query parameters and throw a helpful
exception back to the caller.  While this has not been the most prevalent REST
behavior (so called "strict"), I believe it's the best way to go.  Allowing extra
parameters in a call leads to sloppiness - an optional parameter could be misspelled,
leading someone to believe the parameter was in effect.  The simplest solution is
to return an error for unrecognized parameter names, rather than being lax.  While
this is certainly "different from the behavior of a webserver," we need to differentiate
between a user driven UI (browser address bar) and a programmatic interface
(REST URL).  These have similarities, but by pretending they are the same, we run
into silly problems.

While it is tempting to roll our own validation (perhaps based on validator.ps), there
are a variety of param validation libraries available for Node.  The one that looks the
most useful to me is "Joi" - I had previously written a very similar library for PHP, taking the
exact same schema declarative approach, but Joi did mine one better by adding a
fluent interface.  It's great when you can find libraries that are high-quality that
are better than what you might have done yourself.

## Installing Joi

Joi is powerful, but does require a tiny bit of investment to understand how it works.
To use it properly, one must define a "schema" for each call, which describes the
details of acceptable parameters.  Once the schema is defined, we can use it in
a call to "validate" to check an input.

Joi is decoupled from HTTP request/response, and is more abstract, and therefore
more powerful.  We could conceivably use it for many different purposes.  For example,
at first glance it appears to have enough expressive power to validate simple,
hierarchical JSON formats (although larger, recursive structures are beyond it's
abilities).  That said, it looks very solid.

First, let's add a dependency to our project and have it install Joi:
```ShellSession
# Edit package.json:

 "dependencies": {
    "sails": "~0.10.5",
    ... 
    "grunt-contrib-coffee": "~0.10.1",          // <= Add the last comma
    "joi": "~5.1.0"                             // <= Add this (you may want to
                                                //    check what the latest version is!
  },
```
The dependency we just added will pull in new minor updates, but will not pull
in major updates.  Thus if we update we should get slightly better, less buggy
libraries.

## Note on Updating using NPM
While we *could* just run `sudo npm update` in the local app directory, I typically
advise against this when working on large frameworks.  The reason for this is there
are often dependency and install issues you will be forced to deal with by taking
such a sledgehammer approach.  It is better to surgically install the dependency.

Remember, when you do an update, you are installing incrementally, and potentially
getting updates to tilde (minor update) packages.  So an awful lot of changes
can happen if you haven't updated in a while.  You should save updating this way
for a time when you haven't made many changes, and have some spare time to
fix packaging issues.  This typically requires blowing away the various
node_module directories and trying from scratch (it's harder to make an install
over an existing install always work propertly, as opposed to a fresh install -
this will always be the case).

With this in mind, we are just going to install it.

```ShellSession
# update from app directory
$ sudo npm install joi
```

## Using Joi for Parameter Validation

Joi lets us create a "schema" which defines all of the legal sets of parameters
allowed for some operation, in our case, calling our create REST endpoint.
The fluent API is straightforward - each additional chained call is an additional
requirement a parameter must meet.  Also, for a call to validate (), there are
certain defaults that may be overridden by passing in options.  We'll just use
the defaults for now which will have the effect of only allowing what we
specify.  Thus, extra arguments will be flagged.

Note this does cause an immediate issue - Sails (Express?) adds an undefined
"id" field to the request parameters.  We'll need to delete it or it will get
flagged and throw an exception.

Here is our schema:
```Javascript
var createSchema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})
```
The schema is fairly self-explanatory.  Note that the regex on the password
indicates a password between 6 and 128 characters long, and characters must
be `\w` which are "word characters" (alphanumeric and "_").

Here is the new updated file for UserController.js, with the following changes:

* Add validation via Joi and call our own error formatting (we are starting
  to create our own symbolic codes, so we use "api.invalidParam").
* Surround the first part of the function body (synchronous part) with a
  try/catch and throw an exception from validate.  The validate is overriding
  the error code with our own new code "api.paramInvalidate".  The try/catch
  doesn't surround the entire function body because the last part is
  asynchronous (and it really is not subject to normal control flow).
* Set pm to the parameters passed in the request and prepare it by deleting the
  undefined "id" property, and hashing the password.
* Continue to not persist the parameters.  Eventually we will call User.create
  with the parameters directly to persist the record.  But for now, it's easier
  for testing.
* Add JSDoc comments.

```Javascript
/**
 * User controller logic for REST service.
 * @module controllers/UserController
 * @see module:models/User
 */

var Promise = require ('bluebird');
var BCrypt = Promise.promisifyAll (require ('bcrypt'));
var ControllerOut = require ('Local/ControllerOut');
var Joi = require ('joi');

var createSchema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})

module.exports = {

    /**
     * Create User.  Must have unique email.  Password is stored in encrypted format.
     * @function create
     * @arg {string} password Plaintext password for user account.
     * @arg {string} email Email must be unique (is used as login for account).
     * @returns {string} json User or Standard Error
     * @todo add email handling and property
     */
    create: function (req, res) {
        try {
            var co = new ControllerOut (res)
            var pm = req.params.all ()

            // Delete added "id" field from params
            delete pm ['id']
            createSchema.validate (pm, function (e, value) { if (e) { e._code = "api.paramInvalid"; throw e } })
        }
        catch (e) {
            return co.error (e)
        }

        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (pm.password, salt) })
        .then (function (hash) { pm ['password'] = hash; return pm /* N.B. we are not persisting */ })
        .then (function (user) { return res.json (user) })
        .catch (function (e) { return co.error (e) })
    }
};
```
You should test the validation code by entering different inputs.  It's useful at this
point to try Postman for specifying non-alphanumeric characters in the parameters and
calling POST rather than GET.

## A Note on Code Structure (Async/Sync, Promises)

Note that I chose to surround only the first part of the function in the try/catch,
which was intentional (but may look strange, at first glance).  The reason for this is
the function structure has a synchronous first part, and an asynchronous second part
(the part involving the bluebird promises).  Once we get into the portion of the
code that is asynchronous, we must look to the body of the anonymous functions for
control flow.  In fact, we have given up control flow so that the system can handle
it for us in asynchronous fashion.  Thus, if we mix our asynchronous promise code
with synchronous control flow, it will be misleading (and generally not do what we
want).  For example, throwing an exception from within a promise anonymous function,
will not bubble up to the outermost catch in our external function, but rather into
the promise handling async code.  Thus, it may "look right," but will not do what
we expect.

Because of this I'm choosing the convention of having simple preparatory code,
such as param validation, to happen first and be surrounded in a try-catch.  This is
just good old fashioned synchronous, exception handling code.  After that code is
finished, the final "heavy lifting" portion of the function will consist of a
single bluebird promise chain.

I'll continue to follow this pattern unless I find a much better one.

Also, for those new to Javascript, I'm using a Javascript feature to move the
first two lines into the try block to protect it, yet the variables are still
in scope outside the try-catch block (which is necessary for them to be used
by the async promise code).  Scope of Javascript variables is by function,
also called "lexical scope", rather than by block (curly braces), and so this works.
That is, the variables "co" and "pm" will be defined to be used outside the try-catch
expression (by the promise) but will still be protected by the try-catch.

## Adding a Utility Function and a Unit Test

As a final touch we are going to add a string utility function, and then a unit
test which will be hooked into a testing suite.

Recall that we wanted to automatically trim whitespace from the first and
last names as well as uppercase the first letter.  To do this we will add
a new library called "stringutil".  This will not be OOP, but rather a plain
module with functions (and because of this, we'll keep the name lowercase,
as we reserve CamelCase for our prototype classes).  We will put the library
in our special "Local" directory.

N.B. there is a bug in the code which we will find using unit testing.

Create the file `node_modules/Local/stringutil.js` with these contents:
```Javascript
module.exports = {
    // Clean proper name - removes whitespace and upcases first character

    cleanProperName: function (s) {
        if (s == null)
            throw { message: 'null argument passed (requires string)', code: 'call.badArgument' }

        var s2 = s.replace (/\s/g, "");  // remove all whitespace
        if (s2.length == 0)
            return s2;
        
        // N.B. The substring indexes are wrong.  BUG IS INTENTIONAL!
        return s2.substring (1, 1).toUpperCase () + s2.substring (2);
    }
}
```

Note that even though this is a relatively simple function, it would be nice if
we could write a simple unit test that worked on this module.  The average programmer
has 1 bug in every 7 lines of code (hint:  there's a bug in this code that we'll use
tests to find).  Note that sails has the Mocha testing framework as a development dependency:

```ShellSession
$ npm view sails
...
 devDependencies: 
   { 'root-require': '~0.2.0',
...
     mocha: '~1.17.1',
```

## Using Mocha to write tests

We'd like to start off on the right foot and setup automated testing and begin
writing tests for each of our modules.  Mocha is a useful test execution framework.
Although it's installed locally, we should install it globally to have the Mocha
executable available from the command-line.  This shouldn't be an issue as Mocha
is fairly mature and simple.
```ShellSession
$ npm -g install mocha
```
Next, let's create a test directory structure.  The directory structure for tests
can be any organization we want.  I find it useful to mirror the structure of
the files that we are testing since it makes it less ambiguous.  So we will mirror
the application directory structure from the top-level.

Most of what we want to test is either in the top-level `api` or `node_modules/Local`
directories.  So let's start by recreating this structure in a top-level directory called 
`tests`:
```ShellSession
# make sure you are in your top-level app directory (e.g. sails-tutorial-1)
$ ls
ls 
Gruntfile.js   TUTORIALS/     app.js         config/        package.json   tasks/         views/
README.md      api/           assets/        node_modules/
$ mkdir -p tests/api/controllers
$ mkdir -p tests/node_modules/Local
$ ls -R tests
api/

tests/api:
controllers/

tests/api/controllers:

tests/node_modules:

tests/node_modules/Local:
```
We can add more directories later, as needed.  We don't currently have any controller tests,
but we anticipate this might be one of the first areas of testing, so we've added an empty
directory.

Next, we'll add a command to execute all the tests under this structure.  Since mocha is installed
globally, we can now run the tests.  Again, make sure you are in the top-level application directory
to do this:
```ShellSession
$ mocha --recursive tests

  0 passing (1ms)
```
So we've just run Mocha and it showed we have no tests defined yet.  Let's add this command to
our project so that we can run tests from npm, which is the standard way for managing tasks
associated with our project.  This lets us abstract away the details so that someone can
always run our tests, regardless of whether we use Mocha or not.  We're going to add a
"task" to the "scripts" section of package.json:
```Javascript
  "scripts": {
    "start": "node app.js",
    "debug": "node debug app.js",
    "test": "mocha --recursive tests"   // <= Add your test
  },
```
Now we can run our tests like this:
```ShellSession
$ npm test

> sails-tutorial-1@0.0.0 test /Users/rogerbush8/Documents/workspace/node/learning/sails/sails-tutorial-1
> mocha --recursive tests

  0 passing (1ms)
```
Note that npm requires us to be in the top-level application directory for this to work.

Also note that the property names in scripts have defined meanings.  We can see what these
are in the [npm script field documentation](https://docs.npmjs.com/misc/scripts).  Thus if
we just add our own arbitrary script, it will not run (however we can run the script using the
run-script npm command).

Let's now add a test for our function stringutil.cleanProperName in a new file at
`tests/node_modules/Local/stringutil.js`:
```Javascript
var Unit = require ('../../../node_modules/Local/stringutil.js')

var assert = require ('assert')

describe ('stringutil (Local Module)', function () {
    describe ('#cleanProperName', function () {
        it ('should make first letter uppercase and trim leading/trailing whitespace', function () {
            assert.equal ('Roger', Unit.cleanProperName ('  Roger '))  // whitespace
            assert.equal ('Roger', Unit.cleanProperName ('roger'))  // caps
            assert.equal ("Mc'Donald", Unit.cleanProperName ("  Mc'Donald "))  // whitespace and case
        })
    })
})
```
This is a Mocha test which uses assert statements.  The outermost "describe" gives the description of
the unit under test, which is the "stringutil service", the next "describe" is at the function level.
The `#cleanProperName` indicates a method of the service (the `#` means method).  The `it()` function
describes a particular test.  We can put as many asserts as we need in the `it()` function, to verify
what `it()` says we are verifying.

Note that the reason this simple setup works for this function is it doesn't require Sails.
If any Sails configuration is needed, since Sails is not part of this, the code would fail
as the Sails environment is not setup.  Thus, for controller testing, we would have to
either have a testing setup that started the Sails environment, or use a technique like
mocking.  We'll put this on the back burner for now.

This simple setup is good enough to get started.  There is [detailed documentation on Mocha](http://mochajs.org/)
that you can peruse later to learn more about writing tests.

Let's try our test:
```ShellSession
$ npm test

> sails-tutorial-1@0.0.0 test /Users/rogerbush8/Documents/workspace/node/learning/sails/sails-tutorial-1
> mocha --recursive tests



  stringutil service
    #cleanProperName
      1) should make first letter uppercase and trim leading/trailing whitespace


  0 passing (5ms)
  1 failing

  1) stringutil service #cleanProperName should make first letter uppercase and trim leading/trailing whitespace:
     AssertionError: "Roger" == "ger"
      at Context.<anonymous> (/Users/rogerbush8/Documents/workspace/node/learning/sails/sails-tutorial-1/tests/node_modules/Local/stringutil.js:12:20)
      at callFn (/usr/local/lib/node_modules/mocha/lib/runnable.js:250:21)
      at Test.Runnable.run (/usr/local/lib/node_modules/mocha/lib/runnable.js:243:7)
      at Runner.runTest (/usr/local/lib/node_modules/mocha/lib/runner.js:373:10)
      at /usr/local/lib/node_modules/mocha/lib/runner.js:451:12
      at next (/usr/local/lib/node_modules/mocha/lib/runner.js:298:14)
      at /usr/local/lib/node_modules/mocha/lib/runner.js:308:7
      at next (/usr/local/lib/node_modules/mocha/lib/runner.js:246:23)
      at Object._onImmediate (/usr/local/lib/node_modules/mocha/lib/runner.js:275:5)
      at processImmediate [as _immediateCallback] (timers.js:345:15)



npm ERR! Test failed.  See above for more details.

```
Cool, we found an error!  "Roger" == "ger" => it looks like our substring concatenation didn't work
as we expected.  Let's go fix that and re-run this.  Our indexes were wrong because Javascript
substring uses zero indexing (and we started at one).  So let's fix our error:
```Javascript
        return s2.substring (0, 1).toUpperCase () + s2.substring (1)
```
Then re-run the test:
```ShellSession
 npm test

> sails-tutorial-1@0.0.0 test /Users/rogerbush8/Documents/workspace/node/learning/sails/sails-tutorial-1
> mocha --recursive tests



  stringutil (Local Module)
    #cleanProperName
      ✓ should make first letter uppercase and trim leading/trailing whitespace 


  1 passing (5ms)
```
Nice!

Our test setup does leave one thing to be desired, which is kind of ugly.  Note the line in our
test:
```Javascript
var unit = require ('../../../node_modules/Local/stringutil.js')
```
This is incredibly ugly as we have to know how many directories to chain up in the structure.
Let's write a simple test helper function that will eliminate this problem.  It would be really
nice if there was some way to automatically figure out which file to include.  After all,
the directory structure is parallel to what we are testing, and the filename of our unit test
is exactly the same.  So what we need is a function that we can load from each of our unit
tests that automatically calculates the function we are testing.

We'll write some simple helper code and put it in Local.  The code just needs to
compute the path to the actual code to unit test, using the filepath of the
script.  Since it's quite likely that this code will have additional complexity and state
added to it to control tests, we'll use an OOP approach.

Add the following contents to a new file `node_modules/Local/TestSetup.js`:

```Javascript
/**
 * TestSetup class is a setup for a unit test.  Initialization of the constructor,
 * by default, assumes a parallel test directory structure to that of the actual
 * files under test (this can be overridden in the constructor).  This makes locating
 * the files to be tested mostly automatic, and less brittle than specifying string paths.
 *
 * @module Local/TestSetup
 * @example
 *     var TestSetup = require ('Local/TestSetup')
 *     var test = new TestSetup (__filename)
 *     var Unit = test.require ()
 */

module.exports = TestSetup

function TestSetup (testFilePath, unitFilePath) {
    this.testFilePath = testFilePath
    if (unitFilePath === undefined)
        this.unitFilePath = this.getAssociatedUnitFilePath ()
}

var TOP_LEVEL_TEST_DIR = "tests"

TestSetup.prototype.getAssociatedUnitFilePath = function () {

    // Given an absolute path to a test file, in a parallel directory structure, under
    // "/tests", find the unit file that we should be testing (unit file and test file
    // must have exact same name)

    // Assume testing has been launched from top-level directory, and that
    // our tests are defined under a parallel stucture in /tests directory in top-level

    var cwd = process.cwd ()

    // Make sure current working directory + /tests at beginning testFilepath, and remove.
    // (has the effect of removing /tests from the filepath, as well as making sure we
    // are in a parallel directory structure, as a sanity check).

    var dir = cwd + "/" + TOP_LEVEL_TEST_DIR

    var i = this.testFilePath.indexOf (dir)
    if (i != 0)
        throw { code: '', message: "Unit Test filepath = " + this.testFilePath +
                ".  Filei is not in directory = " + dir };

    var unitFilePath = cwd + this.testFilePath.substr (dir.length)
    return unitFilePath
}

TestSetup.prototype.require = function () {
    return require (this.unitFilePath)
}
```
Now we'll update our test.  Here is the final version of `tests/node_modules/Local/stringutil.js`:

```Javascript
/**
 * Unit test for stringutil
 */

var TestSetup = require ('Local/TestSetup')
var test = new TestSetup (__filename)
var Unit = test.require ()

var assert = require ('assert')

describe ('stringutil (Local Module)', function () {
    describe ('#cleanProperName', function () {
        it ('should make first letter uppercase and trim leading/trailing whitespace', function () {
            assert.equal ('Roger', Unit.cleanProperName ('  Roger '))  // whitespace
            assert.equal ('Roger', Unit.cleanProperName ('roger'))  // caps
            assert.equal ("Mc'Donald", Unit.cleanProperName ("  Mc'Donald "))  // whitespace and case
        })
    })
})
```
As usual, run the test using `$ npm test`.  You should see it passes.

## Fixing the Proper Names using stringutil.cleanProperName


## Enabling Persistence on our Create Endpoint, and fixing the Proper Names

Now that we've tested our function, we must require it and use it on the parameters.

```Javascript
    var StringUtil = require ('Local/stringutil.js');
    // snip ...
    var pm = req.params.all ()
    // Add these next two lines
    pm ['firstName'] = StringUtil.cleanProperName (pm ['firstName'])
    pm ['lastName'] = StringUtil.cleanProperName (pm ['lastName'])
```

We left this disabled for easy testing (so we wouldn't pollute the database with junk records).
We will now enable this:
```Javascript
// Change this
        .then (function (hash) { pm ['password'] = hash; return pm /* N.B. we are not persisting */ })
// To this
        .then (function (hash) { pm ['password'] = hash; return User.create (pm) })
```

## The final UserController.js
```Javascript
/**
 * User controller logic for REST service.
 * @module controllers/UserController
 * @see module:models/User
 */

var Promise = require ('bluebird');
var BCrypt = Promise.promisifyAll (require ('bcrypt'));
var Joi = require ('joi');

var ControllerOut = require ('Local/ControllerOut');
var StringUtil = require ('Local/stringutil.js');

var createSchema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})


module.exports = {

    /**
     * Create User.  Must have unique email.  Password is hashed prior to storage.
     * @function create
     * @arg {string} firstName will have lead/trail ws trimmed and upcase first
     * @arg {string} lastName will have lead/trail ws trimmed and upcase first
     * @arg {string} password Plaintext password for user account.
     * @arg {string} email Email must be unique (is used as login for account).
     * @returns {string} json User or Standard Error
     * @see createSchema for parameter validation
     */
    create: function (req, res) {
        try {
            var co = new ControllerOut (res)
            var pm = req.params.all ()
            pm ['firstName'] = StringUtil.cleanProperName (pm ['firstName'])
            pm ['lastName'] = StringUtil.cleanProperName (pm ['lastName'])

            // Delete added "id" field from params
            delete pm ['id']

            createSchema.validate (pm, function (e, value) { if (e) { e._code = "api.paramInvalid"; throw e } })
        }
        catch (e) {
            return co.error (e)
        }

        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (pm.password, salt) })
        .then (function (hash) { pm ['password'] = hash; return User.create (pm) })
        .then (function (user) { return res.json (user) })
        .catch (function (e) { return co.error (e) })
    }
};
```


## Running JSDoc

We've been adding JSDoc pragmas, without actually running JSDoc and generating our documentation.
Recall that we chose JSDoc because it had a good metadata tagging system.  It also produces nice
HTML linked documentation "out-of-the-box".  Note that we do not want to check this generated
HTML documentation into source control, at least yet.  It's possible that in the future we might
generate some GitHub friendly documentation that could be checked into version control.  However,
for now, we'll assume it is not checked in.

Let's start by adding some directories to hold our generated documentation, and modifying
.gitignore appropriately:
```ShellSession
# from top-level application directory:
$ mkdir -p doc/html
```

And now append this to the end of .gitignore, so we don't checkin docs (except for the
markdown git docs).

```ShellSession
################################################
# Documentation 
# 
################################################

doc/*
```

We also need to install JSDoc, which should be done globally:
```ShellSession
$ sudo npm install -g jsdoc
```

Let's now add a task to npm that will generate the documentation.  Recall that the script
targets are predefined, and so we want to choose something that will not collide with
the pre-existing, defined, npm targets.  For this, we'll use the prefix "script-", to
indicate this is a script to be run using "npm run-script <our-script-name>":
  Add the following line
to "scripts" in the file `package.json`:
```Javascript
  "scripts": {
    "start": "node app.js",
    "debug": "node debug app.js",
    "test": "mocha --recursive tests",
    "script-gen-html-docs": "jsdoc -d doc/html $(find api/controllers api/models api/services node_modules/Local -name '*.js')"
  },
```

We can now generate the documents like this:
```ShellSession
$ npm run-script script-gen-html-docs
```
This should have created an HTML doc site in doc/html.  You can point your browser
to the file doc/html/index.html to explore this.

## Conclusion

We've taken a fairly long, meandering path to arrive at a final solution for a single REST endpoint.
Our user/create endpoint:

* Uses declarative parameter validation via the Joi library.  This gives us full control over
  error handling and preparing parameters before updating our models, which is crucial.
* Uses bluebird promises for the asynchronous portion which improves maintainability and
  readability of tricky code.
* Takes direct control of interaction with the Waterline ORM (User.create), which gives us a lot of
  expressive power.
* Does proper error handling for returning JSON error information.

We've also explored a lot of basic capabilities:

* Code organization through both modules and OOP prototype classes, as well as physical
  organization in the Sails application directory structure.  We have a way of intermingling
  our Local code, with external dependencies.  Our conventions play well with Node, Sails and
  GitHub.
* Routing in Sails, as well as how to selectively turn routes on/off to incrementally move
  from a prototyping situation to a more robust, full-featured, fully controlled app.
* Waterline ORM's basic CRUD operations and expressive power via it's query expression system, and ability to
  quickly experiment using the sails console (REPL).
* Using basics of npm for installation and update of external packages, as well as
  automating common tasks such as running unit tests.
* Very basic unit testing capabilities, appropriate for simple utility libraries.
* Documentation tagging standards (JSDoc) and automatic API documentation generation.
* Basic debugging using simple HTTP tools like Postman.
* Exposure to some high-quality, low-level Javascript libraries such as Lodash, Express, Bluebird,
  Joi, Waterline, Bcrypt.
  
Areas which are next to explore include:

* Writing full-featured, non-trivial controllers.  Finishing our UserController and
  AuthController with all the bells and whistles.
* Completely locking down our Sails routes so that they are RESTful in the final
  analyis (again, moving from prototype to finished product).
* Further refining our controller coding conventions and pushing some common code into
  our libraries.  We took some shortcuts and left some things exposed for the sake of
  learning.
* Diving deeper into areas of Sails that are important, for example Policies (i.e.
  middleware plugin functions prior to our controller).  Also understanding Express,
  since this does a lot of heavy lifting for Sails.
* Getting more practice with Waterline's features.
* Enhancing our ability to do different types of automated testing, for example,
  testing controller endpoints via automated integration techniques.
* Generating nicer looking or more useful documentation (e.g. for GitHub).
* Adding selective libraries to Sails for using it as a webserver.

We'll be doing all of these things in the next tutorials.
















