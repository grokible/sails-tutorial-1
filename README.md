# sails-tutorial-1

a [Sails](http://sailsjs.org) application

## Who Are These Tutorials For?

This tutorial is aimed at the professional programmer, who already knows a
language or two well, coming from a classical OOP background, and wants a
quick, pragmatic introduction to the things that matter in the Javascript
world.  It's essentially a cleaned up journal of my own investigations
for that purpose.

If you want a gentle intro to Javascript, this probably isn't it.  There are
lots of tutorials for that.  This is the condensed notes for going from
classical OOP to pragmatic, pretty good, Node.js/Javascript programmer.
The mechanism for doing this is learning about a particular framework,
Sails.js, which is built on Node.js, using packages like Lodash, Express,
Waterline and Bluebird.  You'll also learn some of the most important
aspects of Node.js, Sails.js and Javascript code organization, mostly
in the context of backend programming.  Javascript frontend programming
is an entirely different beast which requires much more knowledge of
browsers and their particular quirks.  While many of the things we'll cover
are relevant, there is a huge other piece to understanding how to do
frontend well.

I'll try to hit all of the things I find important about getting started
with a good foot forward in the Javascript culture.  So we'll try to make
judicious choices for the libraries we learn, as well as what we focus
on.  You should be comfortable reading lots of code.  I try to focus on
the important things - how everything connects in a system, as well as
things that might seem strange to someone coming from say, a Java
background.  My method for this is by example - we go over real world,
pragmatic and pithy examples, pointing out interesting issues.

Also, there are essentially step-by-step instructions to help you exercise
"muscle memory."

Also, this is a learning experience for me as well, so I'll definitely
make some mistakes along the way.  But you'll benefit from my inquiry
as a good programmer, who is a novice in another language/culture.
Also, this isn't my first rodeo, so the conventions I arrive at should
be pretty good.

## Sails.js Tutorial and More

I created this tutorial to help me learn Sails.js as well as advance my knowledge
of Javascript and Node.js.  My intent is to explore using Sails as a rapid prototyping
tool for standards-compliant REST services.

It's my experience that when you try to explain things to others, you arrive
at a much deeper understanding of the material.  Another benefit of documenting
this as a series of tutorials is I can point programmers I may be mentoring to
them.  This is a fairly time consuming but important aspect of running a team
of developers.

While I had started intending for this to be strictly about Sails, since Sails is
an integrated framework, it made sense to expand my inquiry as I went to include
important libraries, tools, practices, and Node itself.  So I use Sails as a
particular view into the Node.js world.  If you don't know much about Node.js
and the related tools, this is a good way to dip a toe in and learn about these
things within a useful context.  I'd argue learning sails is a good way to learn
about Node itself as it touches so many important concepts in a non-trivial way.

Note, I am a Node.js novice but an experienced programmer, and so that's the
intended audience for this tutorial.  The goal is to learn Sails.js for
backend prototyping, as well as all of the normal stuff that a professional
programmer wants to know.  For example, I go over promises, which arguably seem
"advanced," (they're quite simple actually) because they make the usual
rat's nest of continuation passing style programming, a lot saner.  I also
go through the trouble of selecting and hooking up an automated code documentation
system - not the sexiest of topics, but one every good programmer will want
to have in place.

Thus it's my hope that by the end of this tutorial I'll have arrived at a good
coding setup in terms of style, organization, tool selection and use, etc.  At
least that's the intent.

I will (git) tag the project in its finished state after each tutorial, so one
can see the changes that were made.

Each successive tutorial is located in TUTORIALS/TUTORIALXX.md.


## Note on Prerequisites

I take an incremental approach while paying attention to the flow of the tutorials.
But my intent is to reach a level of fluency with the tools.  Thus, I'll keep things
simple, but won't dumb things down, as I attempt to reach a pragmatic balance for
maintainable and scalable production coding practices and processes.

## Finished Tutorial State

At the end of each tutorial, the project will have incrmental changes reflecting
the tutorial.  The easiest way to get those changes is to look at the tags:

```ScriptSession
$ git pull
$ git tag --list
tutorial.01
tutorial.01.1
tutorial.01.2
...
```

The tag you should get is the latest one with the same number as the tutorial.
For example, in the tag list above, if you want the project in its state at the
end of TUTORIAL01.md, you should get the tag "tutorial.01.2".  The minor number
reflects a minor update which is usually a documentation or tiny code fix.  In the
listing of tags above it shows I updated the tutorial twice (with minor fixes).

To make a new branch from the tag "tutorial.01.2" you can do:

```ScriptSession
$ git checkout -b new_branch_name tutorial.01.2
```

You can then compare the results of this branch to your existing branch if you
are having problems, or to a previous tag to see all the differences.

## Tutorial Content

### Tutorial 01

Take a look at [TUTORIAL01.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL01.md).
You'll learn:

* Installing Sails.js and optional libraries using npm.
* Starting and stopping Sails.js and the bootstrap process.
* Modifying Sails configuration, and an intro to the global config object
  which represents the bootstrapped Sails system.  Important configuration
  such as connectors (mysql) and migration type.
* Using Sails model and controller generator scripts to create modules with stub functions.
* Using blueprint convenience routes.
* Using the sails-disk and sails-mysql persistent stores.
* Defining Sails model schema and the mapping to MySQL database column attributes.  Interacting
  with the MySQL database, and debugging.  Dealing with schema changes.

To Start: just follow [TUTORIAL01.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL01.md).
To Get Finished Tutorial State: `git checkout -b new_branch_name tutorial.01.2`

**References:**

* [Sails to Meteor Comparison](http://stackoverflow.com/questions/22202286/sails-js-vs-meteor-what-are-the-advantages-of-both).
* [Sails docs on Models](http://sailsjs.org/#!documentation/models)
* [Sails docs on Controllers](http://links.sailsjs.org/docs/controllers)
* [Sails docs on ORM Attributes of Models](http://sailsjs.org/#/documentation/concepts/ORM/Attributes.html).
* [Note on migration settings](http://sailsjs.org/#/documentation/concepts/ORM/model-settings.html?q=migrate)
* [Sails blueprint api reference](http://sailsjs.org/#/documentation/reference/blueprint-api)
* [Convention over Configuration, Wikipedia](http://en.wikipedia.org/wiki/Convention_over_configuration)
* [Validator library](https://github.com/chriso/validator.js)
* [Sails validations, not recommended](http://sailsjs.org/#/documentation/concepts/ORM/Validations.html)

### Tutorial 02

Take a look at [TUTORIAL02.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL02.md).
You'll learn:

* Use declarative parameter validation for controllers via the Joi library.  This gives us full control over
  error handling and preparing parameters before updating our models, which is crucial.
* Use bluebird promises for the asynchronous portion which improves maintainability and
  readability of tricky code.
* Take direct control of interaction with the Waterline ORM (User.create), which gives us a lot of
  expressive power.
* Do proper error handling for returning JSON error information.
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

To Start: `git checkout -b new_branch_name tutorial.01.2` and then follow [TUTORIAL02.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL02.md).
To Get Finished Tutorial State: `git checkout -b new_branch_name tutorial.02.5`

**References:**

* [Sails blueprint api reference](http://sailsjs.org/#/documentation/reference/blueprint-api)
* [Sails Custom Routing docs](http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html)
* [Express API](http://expressjs.com/api.html)
* [Blog post on better abstractions, e.g. Promises](http://jeditoolkit.com/2012/04/26/code-logic-not-mechanics.html#post)
* [Futures and Promises, Wikipedia](http://en.wikipedia.org/wiki/Futures_and_promises).
* [Bluebird Promises, GitHub](https://github.com/petkaantonov/bluebird/blob/master/API.md)
* [Blog Post comparing Async Library to Bluebird](http://spion.github.io/posts/why-i-am-switching-to-promises.html)
* [Sails Response Object docs](http://sailsjs.org/#/documentation/reference/res)
* [Express Response Object docs](http://expressjs.com/3x/api.html)
* [JSDoc documentation](http://usejsdoc.org/)
* [Detailed sails.config reference](http://sailsjs.org/#/documentation/reference/sails.config)
* [Introduction to Waterline](http://sailsjs.org/#/documentation/concepts/ORM)
* [Github Waterline project docs](https://github.com/balderdashy/waterline-docs).
* [Waterline Queries](https://github.com/balderdashy/waterline-docs/blob/master/query.md)
* [Waterline Query Methods (CRUD)](https://github.com/balderdashy/waterline-docs/blob/master/query-methods.md)
* [Waterline query language docs](https://github.com/balderdashy/waterline-docs/blob/master/query-language.md)
* [Mocha Testing Framework docs](http://mochajs.org/)
* [Joi Validation Library API](https://www.npmjs.com/package/joi)
* [NPM script field documentation](https://docs.npmjs.com/misc/scripts)

### Tutorial 03

Take a look at [TUTORIAL03.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL03.md).
You'll learn:

* Standardizing on ECMAScript 5.1 and some of the details of what that means.
* Understand the basic mechanisms for prototypal inheritance.
* Apply prototypal inheritance mechanisms to construct some reliable classical
  OOP patterns:  inheritance, private implementation details, singletons.
* Demonstrating OOP properties using simple assert tests.
* Several methods of insulating our classes private implementation details
  including class level static variables, and ES6 Symbol for instance variables.
* Apply our new OOP patterns to solve some basic object problems for our own
  Error class, and some other classes which make working with Sails controllers
  simple.
* Investigation, critique and adjustments/enhancements to some of these OOP
  patterns.
* Intermediate Javascript patterns that rely on functions as first class objects,
  such as the "interception pattern".
* Use of the interception pattern to provide a "missing hook" in the Sails
  controller design.  This allowed us to create our own wrapper for any
  controller.
* Howto use the IntelliJ IDEs (Ultimate or WebStorm) to do basic interactive
  debugging both for browser interception and unit tests.
* Clean and well thought-out conventions for controller code, and for our own OOP
  libraries and Sails enhancements.

To Start: `git checkout -b new_branch_name tutorial.02.5` and then follow [TUTORIAL03.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL03.md).
To Get Finished Tutorial State: `git checkout -b new_branch_name tutorial.03.2`

**References:**

* [Wikipedia ECMAScript Version History](http://en.wikipedia.org/wiki/JavaScript#Version_history)
* [Mozilla JavaScript Implementation History](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript)
* [Kangax ECMAScript 5 Implementation Support/Availability](http://kangax.github.io/compat-table/es5/)
* [Mozilla Developer JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [ECMASCript 5.1 specification, ECMA-262/5.1](http://www.ecma-international.org/ecma-262/5.1/)

## Bon Voyage

Hope you enjoy the tutorials and happy sailing!

You can start with the first [TUTORIAL01.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL01.md)
