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

To Start: just follow the Tutorial:  [TUTORIAL01.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL01.md).
Finished Tutorial State: `git checkout -b new_branch_name tutorial.01.2`

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

To Start: `git checkout -b new_branch_name tutorial.01.2`
and then follow [TUTORIAL02.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL02.md).
Finished Tutorial State: `git checkout -b new_branch_name tutorial.02.1`

## Bon Voyage

Hope you enjoy the tutorials and happy sailing!

You can start with the first [TUTORIAL01.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL01.md)
