# TUTORIAL03

## Overview:  Prototypal Inheritance and OOP Design from First Principles

In the previous tutorial we dug into the specifics of the controller to enhance the
backend logic using some helpful libraries and techniques, among them bluebird (Promises)
and Joi (validation).  We also got into more detail on the Waterline ORM, for CRUD,
and single table operations.  In addition we created some of our own helper modules
using the module and prototype patterns.

## Toward Clean Conventions

In addition to learning how to use all the various libraries properly, one aim we
have is to iteratively improve our programming conventions.  In particular,
since we are using Sails.js for REST functions, we want to concentrate on the
conventions for a prototypical backend function.  One aspect of this is making
our own wrapper convenience libraries, which hide some details, and give us a
slightly higher-level of abstraction.

In the previous tutorial we cleaned up our code a bit by adding a "ControllerOut"
helper object.  We'd now like to concentrate on the inputs to the function, in
particular, validation.  We'll assume that we are going to use the Joi validation
library for this purpose.  Also, we need to revisit our error handling and exception
throwing, to make sure we have a stable foundation.

Once we've cleaned these things up, we'll have some simpler code, and a firmer base
to build upon.  Taking care of this now will make our code much simpler, as well as
give us the chance to do a small bit of Javascript review.

Also, we'd like to make sure that we are standing firmly on good concepts that
won't change under our feet.  So we'll need to step back a few steps and talk about
some important assumptions underpinning everything.

With that in mind, let's briefly look at versions of the Javascript language.

## Which Javascript should we use?

Since we are doing backend programming, we sidestep some of the ugly, real-world
aspects of programming in Javascript, namely, which version of Javascript should we
target based on browser prevalence.

ECMAScript 3, also referred to as "ES3" was finalized in 1999, 15 years prior to writing this,
and is the most widely adopted version of Javascript.

We want to be somewhat conservative, since we'd like most of our coding
techniques and style to commute to front-end programming (to the extent is relevant
and possible).  Yet, since we're on the backend, we can afford to use a more recent
version of the ECMAScript standard.  As of the date I'm typing this sentence, 1/14/2015,
ECMAScript 5.1 seems to be fairly widespread in modern browsers, which means that if we were
front-end programmers, we'd most definitely have compatability libraries giving us
more modern capabilities.  So it's a reasonable strategy to learn the newer, ES5
ways of doing things, while touching on older Javascript compatability issues.

[Wikipedia has a nice ECMAScript version history](http://en.wikipedia.org/wiki/JavaScript#Version_history).
Note that the Version number here is the version for JavaScript and not ECMAScript.
ECMAScript is a standard which JavaScript, an implementation maintained by Mozilla,
implements.  However, the standardization process came later, so for historical reasons,
Wikipedia shows the history of JavaScript versions.  There are more [details on the
JavaScript versions on the Mozilla Developer Website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript).

Note that ECMAScript 5 (ECMA-262, and also known as "ES5"), and in particular ECMAScript 5.1 is fully
supported by all modern browsers since 2012.  Here is a separate table enumerating
availability (a proxy for support), in
[major ECMAScript implementations](http://kangax.github.io/compat-table/es5/) in browsers and elsewhere.
This table is also important because it shows the particular features that are part
of ECMAScript 5.1 (Object, Array, JSON).

While the Mozilla Developer Website is useful, we should familiarize ourselves with
the actual [ECMASCript 5.1 specification, ECMA-262/5.1](http://www.ecma-international.org/ecma-262/5.1/)

Again, while it isn't of primary importance to us since we effectively control what
version of ECMAScript we can code to on the backend, it is nice to know that the code
we write will work in modern browsers (and at least some of the areas that would be
somewhat iffy).  This will, of course, only get better as we move
into the future, and more people upgrade their browsers.

Also note that the
[Mozilla Developer JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript) has
a lot of very good information in it for review and reference purposes.

So the assumptions I'm going to make going forward:

* Standardize on ECMAScript 5.1
* Be aware that Object, Array and JSON are the standardized elements added in ECMAScript 5,
  and may create compatability issues on older browsers (e.g. requiring compatability libraries).
* More advanced functional programming and builtin async tools like Promises are coming in
  ECMAScript 6.  But for our purposes on the backend, we will choose libraries for these,
  as we did with Bluebird promises.
* Optimize our choices toward backend since that is our design target, but be cognizant
  of code portability to browsers.  For example, I'd select lodash over JQuery for backend
  because lodash seems more primitive and is not targeted toward UI, but would still be
  frontend compatible.

Now that we've settled on ES5, let's turn to OOP inheritance in Javascript, as we
are going to start using it in some of our designs.


## Prototypal OOP with a Classical Nod

You've no doubt heard many of the arguments on both sides of the fence as
to whether classical OOP is desirable, or harmful from the standpoint of
Javascript.  I look at it as a stepping stone.  People would like something
that is at least somewhat familiar to the previous patterns they've seen.
Also, the new patterns shouldn't have any side effects, such as consuming
too much memory or befuddling garbage collection.

At the same time we don't want to actually do anything that hinders our
progression.  This can be tricky to get the balance right, especially since
we are learning.

We are going to finesse the Classical OOP versus Prototypal OOP issue with the
following observation:

* We'd like a simple convention for some of the OOP features to ease our
  transition.  This should be simple, maintainable, and reliable ways to
  gain important OOP benefits, even if the pattern is slightly different.

* Some simple helper functions could be seen as part of a solution for this,
  for beginners, and a bridge by javascript gurus.

This then begs the question of what capabilities we should preserve in looking
for a library (or idioms) that provide us with OOP-like qualities.  We don't
want everything, as it is both unnecessary, and also probably inefficient.

Here are some capabilities that are important:

* Encapsulation - should be possible within a single file (module-level
  encapsulation).
* Privacy - as a class author, we will need to be able to create private instance
  variables that will not accidentally collide with those that subclass our
  class.  We need the ability to have a private implementation, separate from
  a public interface.
* Inheritance - extend objects, override/reuse/call base methods.  Would be
  nice if we could extend objects that don't inherit from our "base oop class".
  There must be a way to go up the inheritance chain.  We must be able to do
  an "instanceof" like operation.
* So-called "static methods and variables" (i.e. methods and variables that
  belong to the class, not the instance).
* Readability - simple ideas should have simple representations.  This is to
  be judged on a continuum.

A big capability we are going for is:

* Ability for library creators to make a library whose code can be reused
reliably, without modifying the source code.  This is the so-called "open/closed"
principal that OOP programming solved, to a large extent.  We will see
Javascript does a pretty good job, but also has some serious flaws that are
not fixable in this respect.  That is, it is pretty easy for someone to write
code that cripples a 3rd party library by modifying the prototypes either
improperly, or in fact, properly done but having ignorant collisions.

We'll get close, but there will be some remaining problems we'll always have
to be cognizant of.

Some notes:

* It would be better to preserve the prototypal nature of Javascript
  than try to simply ape classical OOP.
* We should wrap up idioms to make them more readable.  Readability,
  simplicity, and correctness are important.
* N.B. we may only need some helper functions to accomplish most of
  this.  It would be better if idiomatic Javascript can be used so
  that we don't hide the true nature of the language.
* Less is more.


## A minimalist OOP approach - concentrate on "inherits"

After looking at lots of packages, the approach that makes the most sense to me
is to add a few simple functions (one?) to help us with inheritance.  For one, Node itself
has an "inherits" function as part of its "util" package.  The problem with this is
modularity - if we wish to use this very basic function as part of our standard
kit, it should be available on the front-end as well.

Fortunately someone has already done that legwork for us with
[npm inherits](https://www.npmjs.com/package/inherits).

Let's now experiment with this module and see if we can create prototypes
that give us our "missing OOP capabilities".

But before we choose, or write, our inheritance function, let's understand
how prototypal inheritance works, and how we can use it to have something
that, when used in a certain way, gives us classical OOP inheritance.

## Prototypal Inheritance - The Short Course

[Good description of prototypal Inheritance Mechanism](http://dmitrysoshnikov.com/ecmascript/javascript-the-core/)

Note that this is actually a pretty simple system when you
think of it in these terms.

The next few sections go over, in gory detail, how Javascript's prototypal
inheritance mechanisms work.  If you're already familiar with constructor
functions, prototype and __proto__, and the inherits function, you may want to
skip ahead to the section "Prototypal Inheritance Class Pattern".

## Brief Protoypal Inheritance Primer

If you want to understand how functions like "inherits" works, and ultimately
prototypal inheritance, you must go down to the nitty-gritty of the prototype
mechanism level.  This brief section will show you everything you need to
know about this simple mechanism, in a very clear fashion.

If you think you understand this really well already, you should still
peruse this section.  The statements in it should seem familiar, or possibly
obvious.  If you do not understand prototypal inheritance, this section may
take longer to digest.  You should revisit it until you understand the
principles.  They are very simple, but there are lots of details.

The best source I've seen about prototypal inheritance is
["JavaScript. The core.," by Dmitry Soshnikov](http://dmitrysoshnikov.com/ecmascript/javascript-the-core/).  After reading this and making some simple code examples, prototypal
inheritance became very simple to understand.

It all start with functions.  You've no doubt heard of the differences and
importance of how Javascript deals with functions.  It's time to look at
some of the specifics of how this works.  Here are some aspects of functions:

* A function is an object.  So anything we can do with objects we can
  do with functions.  For example, we can add metadata properties to
  functions.  We can even add methods to functions.  It's just an object.

* A function object may also be invoked.  This is like saying there is
  a single method which is on this object which is the invocation.
  So when we do this:  `myfunc ()` the function object given by the
  name 'myfunc' invokes it's invocation method.

* Invocation of functions always returns something.  If there is no
  return statement, that something is "undefined".  undefined is a special
  value property on the global object which represents a particular type of
  nothingness.

Now let's talk about some aspects of functions related to prototypal
inheritance.  These functions are called "constructor functions".

* Prototypal inheritance relies on functions which act as constructors.
  We don't need to tell Javascript a function is a constructor, as
  any function can be used as a constructor.  When we use the
  keyword "new" the function is used as a constructor.

* A constructor function is the single function used to make objects
  of a certain class.

* If we have an object "a" made by constructor function "Foo", then
  the following Javascript statements are true.  These specifically
  show some of the details of prototypal inheritance.
    * a instanceof Foo
    * a.__proto__ === Foo.prototype
    * Object.getPrototypeOf (a) === Foo.prototype

* When a function is defined (created), in addition to the creation
  of the function object, a new prototype object is created.  This
  prototype object is the class object for the new objects which
  will be created by a constructor function.  Given a function
  named "Foo" which is a constructor function:
    * Foo.prototype points to the special class object that
      objects created with Foo will have associated with their
      __proto__ property.  This is the created object's class.

And now some facts about __proto__ and prototype properties.
N.B. in these notes and the example test code that follows,
__proto__ is somewhat non-standard (not in all Javascripts) and
should be considered an implementation detail.  We can always
get the class value from an object using Object.getPrototypeOf ().
We are using it here as it is in the document
[Javascript the core](http://dmitrysoshnikov.com/ecmascript/javascript-the-core/).
Note that ES6 standardizes __proto__, but since we are standardizing
on ES5, we should be wary of using __proto__.

* In prototypal inheritance, the __proto__ property always points
  to a class.  By chaining up the __proto__ properties we can
  traverse a portion of the class hierarchy.  Again should always
  get this value by doing Object.getPrototypeOf (o).

* A function's prototype object (the class of object it creates)
  itself has a __proto__ property, which is its parent's class.
  This must be set to point to another prototype object for
  inheritance.  This is what "inherits()" functions typically do.

* An object created using a constructor function, has its
  __proto__ property set to the constructor function's
  prototype property value.  This is considered the
  class of the object, and could be represented by this assertion:
  `Object.getPrototypeOf (a) === Foo.prototype`

* If we are to relate constructor functions in a class hierarchy,
  the final step is to create a new class object, set the prototype
  of the constructor to this, and make it so the __proto__ field of
  this new class object points to the parent class object.  This
  is what an "inherits ()" function does.  We'll see more of this later.

I realize those are a lot of facts that might sound like gobbledygook
at this point, but if you come back to them and re-read them until
you understand each one, you'll eventually master prototypal
inheritance.  It's a worthwhile effort because if you never master
this, it'll always seem like magic.

Here are few simple facts to remember that can help you:

* The __proto__ property value always points to a prototype
  object.  The prototype object is the analogy of a class.
  
* The __proto__ property values form a class inheritance
  hierarchy.  Thus the __proto__ property on a prototype
  object (a class) points to its parent class.

* The top-level prototype object is "Object.prototype" and
  its __proto__ property is null.

* We can visualize the class inheritance tree as a tree of
  classes, each with a single parent.  At the leaves of the
  tree we have individual "instance" objects (so there will
  be many leaf nodes, but few internal branches).

* When a property is referenced, e.g. `a.someProperty`,
  we start at the object `a` and look for the property,
  chaining up the inheritance hierarchy (i.e. chase the
  __proto__ properties).  Thus the first lookup attempt is
  on an "instance object," and all subsequent lookup
  attempts are on "class objects".

* There is little difference between an "instance object"
  and a "class object" (prototype).  An instance object
  should never have another object with a __proto__
  pointing to it.  The difference is completely in how
  we use the objects.  Any object could be a prototype
  (class object).

## Prototypal Inheritance - Demonstrating Aspects of Constructor Functions

Start by creating this Javascript and running it using node.  The
script below simply creates a single function "Foo" which we will
subsequently use as a constructor function.  The statement that
follow merely demonstrate, operationally, aspects of prototypal
inheritance.  If you understand all the statements, that is good.
If any of the assert statements were false, the program would
exit and show an error.

Create this file in the top-level app directory in
`prototype_test.js`.  It is a scratch file and may
be deleted after you are done with it.  You should read through
the details to make sure you understand every line.

```Javascript
var assert = require ('assert')

// A constructor function for the "class Foo".  Note Foo is an
// absolutely ordinary function.  Thus all functions may act
// as constructors.

function Foo () {
}

// Note, immediately after we define/create the Foo function, it
// has a special prototype object that got created, which is the
// class of objects Foo will instantiate when used as a constructor.
// Just below: 3 statements about Foo.prototype (the class of objects Foo will create)

assert (Foo.prototype !== null, "Foo's prototype object exists");
assert (Foo.prototype.constructor === Foo, "Foo's prototype object references Foo as the constructor")
assert (Foo.prototype.__proto__ === Object.prototype, "Foo's prototype object isA Object")

// Foo itself has a class (not the same as the class of objects Foo creates).
// It is, of course, a simple Function

assert (Foo.__proto__ === Function.prototype, "Foo isA Function");
assert (Object.getPrototypeOf (Foo) === Function.prototype, "Same as just above");

// This is related, but slightly different.  instanceof will walk up
// the __proto__ (inheritance) chain

assert (Foo instanceof Function, "Foo isA Function")


// Use __proto__ to show the class hierarchy, which is
// (Foo isA Function isA Object).  __proto__ always
// points to a "class" (a prototype)

assert (Foo.__proto__ === Function.prototype)
assert (Foo.__proto__.__proto__ === Object.prototype)
assert (Foo.__proto__.__proto__.__proto__ === null)

console.log ("ok - all assertions passed!")
```

```ShellSession
$ node prototype_test.js
ok - all assertions passed!
```
Thus all statements are true.  You should examine each statement to make sure you
understand why its true.


## Prototypal Inheritance - Demonstrating Aspects of "Instantiated Objects"

Now we will add to `prototype_test.js` to instantiate two objects, "a" and "b",
and test various aspects of them.

Append the code below to `prototype_test.js`:


// ** Now instantiate objects

```Javascript
var a = new Foo ()

assert (a instanceof Foo, "a isA Foo")

assert (a.__proto__ === Foo.prototype, "a's class is Foo")
assert (Object.getPrototypeOf (a) === Foo.prototype, "different way to say same")
assert (a.__proto__.__proto__ === Object.prototype, "a's class's class is Object")

// a is an object, not a function, and therefore can't be used as a
// constructor function, and does not have a prototype property
assert (a.prototype === undefined)

console.log ("ok - all assertions passed!")
```

And now run it again:

```ShellSession
$ node prototype_test.js
ok - all assertions passed!
```
This shows the mechanism for constructors and the basis for 
prototypal inheritance.  We have yet to show how to make classes which inherit
from each other, and how to call anscestor functions and constructors.
This will be demonstrated in our use of the inherits function.

## Inherits

Note that we've looked at details of constructor functions and objects instantiated
with new.  We've also seen an already formed prototype chain, which we added to
by creation of our functions (Function objects isA Object).  We have not created
our own parent and child classes yet.

We'll do this now using the inherits function from Node's util library.  Inherits
"derives a subclass from a parent class" by adding the new class (constructor function)
into the hierarchy in the right way.

Below is yet another addition to the code we've been using to test these
relationships.

Update the contents `prototype_test.js` to be this:

```Javascript
var assert = require ('assert')
var inherits = require ('util').inherits

// A constructor function for the "class Foo".  Note Foo is an
// absolutely ordinary function.  Thus all functions may act
// as constructors.

function Foo (x) {
    this.x = x
}

function Bar (x) {
    Foo.call (this, x);
}

function Baz (x) {
    Foo.call (this, x);
}

// Setup inheritance between "classes" (constructor function + prototype == class)
inherits (Bar, Foo)
inherits (Baz, Foo)


// Note, immediately after we define/create the Foo function, it
// has a special prototype object that got created, which is the
// class of objects Foo will instantiate when used as a constructor.
// Just below: 3 statements about Foo.prototype (the class of objects Foo will create)

assert (Foo.prototype !== null, "Foo's prototype object exists");
assert (Foo.prototype.constructor === Foo, "Foo's prototype object references Foo as the constructor")
assert (Foo.prototype.__proto__ === Object.prototype, "Foo's prototype object isA Object")

// Foo itself has a class (not the same as the class of objects Foo creates).
// It is, of course, a simple Function

assert (Foo.__proto__ === Function.prototype, "Foo isA Function");
assert (Object.getPrototypeOf (Foo) === Function.prototype, "Same as just above");

// This is related, but slightly different.  instanceof will walk up
// the __proto__ (inheritance) chain

assert (Foo instanceof Function, "Foo isA Function")


// Use __proto__ to show the class hierarchy, which is
// (Foo isA Function isA Object).  __proto__ always
// points to a "class" (a prototype)

assert (Foo.__proto__ === Function.prototype)
assert (Foo.__proto__.__proto__ === Object.prototype)
assert (Foo.__proto__.__proto__.__proto__ === null)


// ** Now instantiate objects

var a = new Foo (1)
var b = new Bar (2)
var c = new Baz (3)

assert (a instanceof Foo, "a isA Foo")
assert (b instanceof Bar, "b isA Bar")
assert (b instanceof Foo, "b isA Foo too!")
assert (c instanceof Baz, "c isA Baz")
assert (c instanceof Foo, "c isA Foo too!")
assert (a.x === 1)
assert (b.x === 2)
assert (c.x === 3)


assert (a.__proto__ === Foo.prototype, "a's class is Foo")
assert (Object.getPrototypeOf (a) === Foo.prototype, "different way to say same")
assert (a.__proto__.__proto__ === Object.prototype, "a's class's class is Object")

// class object for Bar is class Foo.
// Note that Bar class object is Foo class, and a is Foo class.  in exact same way.
assert (Bar.prototype.__proto__ === Foo.prototype)

// another way of saying this is:
assert (Bar.prototype instanceof Foo)

assert (a.__proto__ === Foo.prototype)
// another way of saying this is
assert (a instanceof Foo)


console.log ("ok - all assertions passed!")
```

```ShellSession
$ node prototype_test.js
ok - all assertions passed!
```
Again, all the tests pass.  You should make some effort to understand each of the
assert statements, as show the underlying inheritance mechanism.

## Some simple facts about Javascript prototypal inheritance

* An "instance object" is an object created using "new".
* Instance objects are created by constructor functions using the new keyword.
  This will create an object that is of the class represented by the constructor
  function.  The low-level mechanism for this is the object's __proto__ property
  and the constructor function's prototype property.  The __proto__ of an
  instance object can be thought of as it's class pointer.  The prototype of
  a constructor function can be thought of as the class definition (or class
  object).
* For an instance object, __proto__ points to the object's class (constructor prototype object).
* For a class object (prototype), __proto__ points to the parent class.  This is the
  inheritance chain.
* When a property of an object is referenced (dot notation), the __proto__ chain is used
  to lookup the property.  We start at the object, and move up the __proto__ chain until
  the property is found.
* The only objects that have a prototype property are constructor functions.  The
  prototype property of a function points to the class object.  When a constructor function
  is used to create an object, the object gets a __proto__ property set to this prototype.
  The instance object is of this class.
* The prototype is the class.  It is an object.
* The prototype object has a constructor property that points to it's associated
  constructor function.

## Prototypal Inheritance Class Pattern

Now let's take what we've learned and make some simple dummy files that 
show how our inheritance pattern will work across separate node module files.
You do not have to create these files if you don't want to, they are for
illustration.  The below 3 files show how to structure class inheritance,
as well as some other details

File `Local/Foo.js`:

```Javascript

// Exports can "forward declare" Foo because of lexical scope

module.exports = Foo

// class (static) counter for class (not a "property")

var _counter = 0


// the Foo constructor function, referenced above

function Foo (x) {
    this.x = x
    _counter++  // increment object counter
}


// normal instance method

Foo.prototype.getX = function () {
    return this.x
}


// static method - note we add it to prototype as well for availability
// from the object.  Most important point - no 'this' in function body

Foo.prototype.getCounter = Foo.getCounter = function () {
    return _counter
}

```

File `Local/Bar.js`:

```Javascript

// Import inherits function (cherry pick out of util lib)

var inherits = require ('util').inherits

// Import Foo for use in constructor chaining below

var Foo = require ('Local/Foo')


// Another "forward declaration" to constructor Bar (lexical scoping)

module.exports = Bar

// Bar constructor function

function Bar (x, y) {
    Foo.call (this, x);    // This is how we invoke Foo constructor, which we imported above
                           // in require statement.  call() passes in 'this' as first arg
                           // and invokes constructor
    this.y = y
}

inherits (Bar, Foo)        // setup inheritance via inherits function

// a normal method call on Bar (but, of course, not on Foo)

Bar.prototype.getY = function () {
    return this.y
}
```

File `oops_test.js`:

```Javascript

var assert = require ('assert')
var Foo = require ('Local/Foo')
var Bar = require ('Local/Bar')

var a = new Foo (1)
var b = new Bar (2, 3)

assert (a.getCounter () == 2)
assert (b.getCounter () == 2)
assert (Foo.getCounter () == 2)

assert (a.getX () == 1)
assert (b.getX () == 2)
assert (b.getY () == 3)

assert (a instanceof Foo)
assert (b instanceof Bar)
assert (b instanceof Foo)

console.log ("ok - all tests passed")
```

## A Note on Singletons

We can easily take the existing pattern and make a singleton by extending
the pattern.  Let's go over the details so we can see this later.  A singleton class:

* Has exactly one instance.  It should be impossible to create a second instance.
* The instance is created the first time code references it.

The following shows the singleton pattern for `Local/BazSingleton.js`.  It
inherits from Foo:

```Javascript

var inherits = require ('util').inherits
var Foo = require ('Local/Foo')

module.exports = _BazSingleton    // N.B. we pass the singleton wrapper function

function BazSingleton (x, y) {
    Foo.call (this, x);
    this.y = y
}

inherits (BazSingleton, Foo)

var Class = BazSingleton.prototype;

Class.getY = function () { return this.y }


// ** Singleton pattern

var _singleton = null

function _BazSingleton () {
    if (_singleton === null)
        _singleton = new BazSingleton ();  // create the private class

    return _singleton;                     // always return _singleton (not *this*)
}
```
Note there are a few differences between this and the Bar class, which
also inherits from Foo:

* We end the names in "Singleton" by convention.
* The exports is exporting a wrapper function, and not the normal constructor.
  This wrapper function calls the constructor, but will do so at most once.
  It returns the private class variable _singleton.  This means it may be called
  using "new" or not, and it will "do the right thing" (return the singleton
  and not construct a new one).

## Slight problems with Javascript inheritance

As much as people claim Javascript prototypal inheritance is superior to classical
inheritance, we can see it has at least one slight flaw, which has to do with
name scoping.  I've seen a lot of incorrect information in Javascript blogs and
books concerning "private" and the concept of "information hiding".

One of the most important aspects of the "private" visibility modifier in
classical OOP languages is:

* private variables and functions are scoped to the class.  What this means is
  by defining something private, inheriting classes can not have unanticipated
  negative collisions with these private variables.

In classical OOP, it is impossible to have private variables or methods collide,
which insures that they can't be affected or interact.  This provides the following
nice guarantee:

* Library designers do not have to be concerned with name collisions of private
  members (variables, methods) in inheriting classes.

If I have a class that many other authors have inherited from, and I add an
instance (this) variable in a new version, I am taking a chance that it will
collide with any of those classes that inherit.  It is impossible for me to
guarantee that internal additions don't break other people's code.  It also
forces people using my library to look at internal details (there is no
distinguising between internal and external details).

This is such a serious defect in Javascript, that it seems there are two
mechanisms in ES6 that are designed to try to address this:  WeakMaps and
Symbols.  In my opinion it would have been better just to add private and
public to the language.

Because of this, we have a few courses of action:

* Do not use inheritance.
* Use it but "be careful" and use instance variables sparingly.  It is
  difficult to quantify what "be careful" means, so we are effectively
  just rolling the dice here.
* Find a way to provide true private details.

## Private Instance Variables

We've already seen how to have a single, so-called "static" variable, where
there is one per class.  This can easily be done.  What we would like is
to have instance variables that are private, and solve the "namespace
pollution problem".  These would be created in a classical OOP language
with a private modifier.  The private modifier provides the following
benefits:

* A class author can have a private implementation separated from the
  public interface.  This allows fixes, optimizations and other changes
  that do not collide with the code of those using our class.  This
  protection against accidental interaction is the most important
  aspect of the private keyword, not some sort of notion of privacy
  as in keeping things "secret".  It allows a user of a class to
  "ignore the implementation".  As long as the public interface is
  adhered to, code that depends on the class should continue to work.

* Since it is a modifier that may be attached to any function or
  member, using it doesn't require moving code to "a private section".

Reviewing one of the methods for private members, closures, we can see doesn't
meet the second criteria.  Using closures for privacy requires moving all
things that use the private member, like functions, into the closure, and
thus onto the object itself.  This forces us to reorganize our code, for this
rather simple thing, which creates busy work and problems for source control.
It also creates bloated objects by creating a closure and forcing per-object
duplication of any method using the private member.  These are bad tradeoffs.

An alternate technique would use a property name that has "virtually no
chance of name collision" with other property names.  This could be done
a variety of ways (e.g. using a random number as part of the key).  The
key itself would be at the class level, and so it doesn't create too much
burden.  It also let's us make the key private, and use it throughout
a module.  We are thus free from the burden of reorganizing code to make
things private.  A variant of this idea called "Symbols" has been proposed
for ES6 to solve the problem with private implementation details.

Note that the ES6 committee initially thought about private and public access
modifiers, but the implementation complexity was deemed to be too great and
so this was scrapped.  Instead, the concept of a Symbol was created, which
could be used as a handle to some private data stored on the object.  This
is like our "generated key name" technique just described, but has added
benefits.

The important thing to note is the most important problem we are trying to solve
is name collisions, which will give OOP library authors the ability to declare
internal details and guarantee they don't accidentally interfere with code that
users of the library write.  This is an incredibly important guarantee to allow
libraries of reusable code to interact and be used without fear of sideeffects.

## Using ES5 Symbol Compatability Library

We can use a compatability library which implements the ES6 Symbol concept we've
been discussing.  Since having true private members is an important part of
OOP design, we'll use this as another essential requirement for our classes.

```ShellSession
$ sudo npm install symbol
symbol@0.2.1 node_modules/symbol
```

Note that it is symbol singular (not plural).  There is a different npm
package called "symbols" which is not what we want.

Let's modify our Foo class to change it's "x" member to be hidden:

```Javascript
var Symbol = require ('symbol');

module.exports = Foo

var _x = Symbol ();

function Foo (x) {
    this[_x] = x
}
```

The symbol created is a random 8 byte number.  Also, although it is a property
on the class, it will not be iterated over in a "for..in" statement for the
object.  The symbol has created a property which is non-enumerable
(you can see the actual symbol were you to do Object.getOwnPropertyNames (obj)).

This has been labeled "not true privacy," which is somewhat correct, however, what
we have achieved using this method is avoiding accidental collision between a
class author's code and a user of that code, which was the main capability we
needed.

We now give the revised OOP inheritance templates below.  We will be using these
patterns from now on when inheritance is required.

In the file `Local/Foo.js`:
```Javascript

var Symbol = require ('symbol');

// Exports can "forward declare" Foo because of lexical scope

module.exports = Foo

// class (static) counter for class (not a "property")

var _counter = 0

// a symbol for private member "x"

var _x = Symbol ();


// the Foo constructor function, referenced above

function Foo (x) {
    this[_x] = x
    _counter++  // increment object counter
}


// normal instance method

Foo.prototype.getX = function () {
    return this[_x]
}


// static method - note we add it to prototype as well for availability
// from the object.  Most important point - no 'this' in function body

Foo.prototype.getCounter = Foo.getCounter = function () {
    return _counter
}
```

In the file `Local/Bar.js`:
```Javascript

// Import inherits function (cherry pick out of util lib)

var inherits = require ('util').inherits

// Import Foo for use in constructor chaining below

var Foo = require ('Local/Foo')


// Another "forward declaration" to constructor Bar (lexical scoping)

module.exports = Bar

// Bar constructor function

function Bar (x, y) {
    Foo.call (this, x);    // This is how we invoke Foo constructor, which we imported above
                           // in require statement.  call() passes in 'this' as first arg
                           // and invokes constructor
    this.y = y
}

inherits (Bar, Foo)        // setup inheritance via inherits function

// a normal method call on Bar (but, of course, not on Foo)

Bar.prototype.getY = function () {
    return this.y
}
```

In the test file `oop_test.js`:
```Javascript

var assert = require ('assert')
var Foo = require ('Local/Foo')
var Bar = require ('Local/Bar')

var a = new Foo (1)
var b = new Bar (2, 3)

assert (a.getCounter () == 2)
assert (b.getCounter () == 2)
assert (Foo.getCounter () == 2)

assert (a.getX () == 1)
assert (b.getX () == 2)
assert (b.getY () == 3)

assert (a.hasOwnProperty ('x') === false)

assert (a instanceof Foo)
assert (b instanceof Bar)
assert (b instanceof Foo)

// Tests on the private property _x - shows it is harder to get to, but
// still actually on a.  So we don't have "true" privacy.  This is fine
// because we do have the means to make sure we don't have accidental
// code interference.
// This shows there are no "keys" (enumerables), but that there is in fact
// a symbol we can lookup and it is a "property of a"
assert ((Object.keys (a)).length === 0)
assert (a.hasOwnProperty (Object.getOwnPropertyNames (a)[0]) === true)

console.log ("ok - all tests passed")
```
## Javascript - Toward Composition

Since Javascript started its life out as a simple glue language, inside the
browser, it didn't have immediate need for many of the mechanisms that allow 
classical OOP programs to "solve big complex problems".  There are two
aspects of this that are really important:

* Ability to independently include libraries without fear of side effects.
  This is for the creators of the libraries, who want to be able to
  improve their shared libraries without negatively affecting those that
  use the libraries.  It is also, obviously, for those using the libraries,
  who want to get improvements without having problems caused by collisions.

* Ability to manage complexity by hiding details in classes in OOP fashion.
  This is achieved by the OOP paradigm (classes represent concepts) and
  making most code a private implementation detail - users of a library
  only have to know the public API.

Note that if no one is building things that are that complicated, the
necessity of reusing code in library form (where libraries depend on
other libraries, and so on), as well as complexity management, are not
important.

However, since Node.js has opened up the field to backend programming,
these concepts are much more important because of the greater complexity.
This greater complexity and greater mission for Javascript is causing
some rethinking about code organization and structure, for which OOP
was designed.

## A Final Note On The Proposed Inheritance Patterns

The patterns above are the result of quite a bit of research and use of
derivation from first principles.  These patterns give the foundation for
proper prototypal inheritance, while achieving the most important, relevant
aspects of classical OOP inheritance.  I believe these are a good starting
point as they are based on sound principles.  As long as we understand how
these work, optimizing by so-called syntactic sugar, should be easy.

It is hard to convey, in my own research through many so-called expert
level books and blogs, how difficult this information, in this form, was
to achieve.  This is because it was often nebulous what authors were
trying to achieve with new patterns.  More often than not, authors of
patterns did not step back to ask what the repurcussions of their
changes were.

For example, most of the OOP libraries I found concentrated on syntatic
sugar, rather than the bare mechanism.  This creates problems as we
need to dig into the class to find out what is truly achieved.  In
such a case, were we to use these libraries, it is often the case that
we find them deficient based on some simple aspect, such as not being
garbage collector friendly, or over usage of memory.

Finally, OOP and module design must pay attention to physical details
as well as logical details.  The physical details can wind up mattering
more.  For example, using the closure technique for "true privacy" is
generally inappropriate due to the higher memory usage, and stringent
code organization requirements.  Part of the problem is we are trying
to compensate for things that would probably have better been part
of the Javascript language itself (as in the case of access modifiers
like "private").

Here are some aspects of the patterns I've outlined that I think make
them superior to many of the competing forms I've come across.

* They are simple and minimalist.
* They are true to both the important benefits of OOP inheritance
  as well as Javascript prototypal inheritance and ES5/ES6 directions.
  Thus they are unlikely to be outmoded.  They form a solid base.
* They do not make requirements of objects outside of their
  purview.  For example, one can inherit from any "class".
  This is not true of many Javascript OOP frameworks.
* They are not very rigid in their internal organizational
  requirements.  There is a lot of flexibility in the
  implementation for where functions and members can go.
  This is not true of many of the patterns I've seen.


## Using OOP Patterns - SymbolicError and Params

Now that we have a solid base of OOP patterns, we can begin to use them more
liberally in our libraries without fear of having to go back and change
things, or worse, having an unfirm understanding of what's going on at
the lower levels.  This is the benefit for all the analysis we've just done -
we can rely on facts and a small amount of personal preference, rather than
pure opinion.

We'd like to augment our coding libraries and conventions in these ways:

* Clean up and standardize error handling within a controller.
* Clean up and standardize input parameter validation within a controller.

While the solutions for these will probably be general enough to apply
to other code, we are going to not worry about that at the outset and
concentrate on making our controllers clean and easy to maintain.  It's
often easy enough to generalize after one has specialized code.  This
also has the benefit of solving one very important problem well,
in our case controller code organization.

## Our First Use of Inheritance - Subclassing Error Objects

Modern backend programming relies heavily on exceptions, as a robust backend must
deal with partial failures due to distributed services being imperfect, and potentially
briefly offline.

[ES5 has an error object](http://www.ecma-international.org/ecma-262/5.1/#sec-15.11) which we
will be using as a base class.

Getting back to the error object, here is some useful documentation
on [Errors from Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).  Here is basic usage:

```Javascript
    try {
        throw new Error ('Whoops!');
    } catch (e) {
        console.log (e.name + ': ' + e.message);
    }
```

The Error object is fairly rudimentary, having just a message property,
which is stringified in the Error's toString method.  We'd like to add a little more to this
class, which will help in the context of REST services:

* A "symbol" property, which will be a free-form string that acts as a unique code
  for the error.  A typical value of the symbol might be "auth.badCredentials".  This
  can be used both as a reference, as well as programmatically.  It also replaces
  the simpler idea of a numeric error code.  The symbol value will default to "unknown".

* A "chained" property, which is designed to hold the Error or Exception object that
  was originally thrown.  This comes in handy for debugging, as we might eventually
  want to use it to generate a stack trace.  We will typically be catching these
  primary errors and then using our error class as the thing that is thrown to
  the outside world.  The chained property is by default undefined.

We'll call our object a "SymbolicError".

Note that for this simple object we will not use private fields for the symbol or
the chained property.  The reason for this is this is an extremely simple class with
little of its own behavior.  Thus having "normal, instance level public attributes"
makes sense.  But don't worry, our work on private instance variables will pay off
later.

Also note for now we won't worry about handling recursive chaining, we'll just worry
about one level deep.

Here are the contents of a new file `Local/SymbolicError.js`
```Javascript
/**
 * @module Local/SymbolicError
 * @desc Error object with symbolic code (symbol) and error chaining
 * @example
 *
 *     if (someError)
 *         throw new SymbolicError ('auth.badCredentials', "Login/Password pair not valid.")
 *
 *     // example 2: chaining exceptions ...
 *
 *     } catch (e) {
 *         throw new SymbolicError ('auth.badCredentials', 'bad credentials', e)
 *     }
 *
 *     // Turn on verbose debugging in stringify output
 *
 *     SymbolicError.setDebug (true)
 */

module.exports = SymbolicError

var inherits = require ('util').inherits

var _debug = false

function SymbolicError (symbol, message, chainedException) {
    Error.call (this, message)
    this.symbol = symbol ? symbol : 'unknown'
    this.message = message ? message : ""
    this.chained = chainedException ? chainedException : null
}

inherits (SymbolicError, Error)

var Class = SymbolicError.prototype

/**
 * Turns on debugging, which prints stack trace of e on trace
 */
Class.setDebug = SymbolicError.setDebug = function (val) {
    _debug = val ? true : false
}

Class.toString = function () {
    var s = "SymbolicError(" + this.symbol + "): " + this.message

    if ( ! _debug)
        return s

    if (this.stack) 
        return s + "\n: " + this.stack

    if ( ! this.chained)
        return s

    if (this.chained.stack) 
        return s + "\n: " + this.chained.stack

    s += "\nChained: " + this.chained
    return s
}
```
Note that the SymbolicError is fairly simple, but there is room to add some
behavior later.  Currently, it allows us to have a "symbol" (string error code),
a "message" (like all Errors), and an optional chained exception.  There is also
a class level "debug" switch that will make the stringified exception more
verbose by adding a stack trace (if one is available).  This also descends
from Error.

There are a couple of other conventions we've added that we'll continue to use:

* Setting the variable "Class" to <ClassName>.prototype, so that we can
  make our method functions simpler to setup.
* Making "static" methods available from the object as well as from the
  class.  This looks like this: `Class.setDebug = SymbolicError.setDebug = function (val) {`
  We must make sure that only statics are referenced by the method (e.g. no "this").
* Short methods are on a single line.
* Leading underscore for "private" variables.  In this case _debug is a static
  which is not a property of an object, so it is truly private.  We'll also use
  this convention for private instance variables, as we've designed previously,
  which can be thought of as "mostly private" - that is, not prone to accidental
  overwrites.

Let's write a simple unit test for this class:

```Javascript
/**
 * Unit test for SymbolicError
 */

var TestSetup = require ('Local/TestSetup')
var test = new TestSetup (__filename)
var SymbolicError = test.require ()

var assert = require ('assert')

describe ('SymbolicError, constructor forms)', function () {
    describe ('#constructor all args', function () {
        it ('has its properties set after the constructor', function () {
            // To generate stack trace
            SymbolicError.setDebug (true)

            var s = 'login and password invalid';
            var e2 = new Error ("blah blah")
            var e = new SymbolicError ('auth.badCredentials', s, e2)
            assert (e.symbol === 'auth.badCredentials')
            assert (e.chained === e2)
            assert (e.message === s)
            
            // Look for stack trace in test
            if (e2.stack)
                console.log (("" + e).indexOf ('Test.Runnable') > 0)
        })
    }),

    describe ('#constructor 2 args, first null (symbol)', function () {
        it ('has default symbol unknown and message that was passed', function () {
            var s = 'login and password invalid'
            var e = new SymbolicError (null, s)
            assert (e.symbol === 'unknown')
            assert (e.message === s)
        })
    }),

    describe ('#constructor instanceof Error', function () {
        it ('is an instanceof Error class', function () {
            var e = new SymbolicError ()
            assert (e instanceof Error);
        })
    })
})
```
And now we can run it:
```ShellSession
$ mocha tests/node_modules/Local/SymbolicError.js


  SymbolicError, constructor forms)
    #constructor all args
true
      ✓ has its properties set after the constructor 
    #constructor 2 args, first null (symbol)
      ✓ has default symbol unknown and message that was passed 
    #constructor instanceof Error
      ✓ is an instanceof Error class 


  3 passing (8ms)
```
All looks good.  Pretty simple stuff.  But the benefit is we can use our
SymbolicError as the outer wrapper in our controller, and then exit the
controller by throwing this exception.  This will let us differentiate
between an exception we throw, which is expected, which will produce an
error symbol that is part of our REST API, and an unhandled exception
(i.e. 500 error).  We'll do this in such a way that we don't have to
have try/catch blocks around our controller code, which will even further
simplify things.

## Next OOP Class - Params

Next we'll create a simple wrapper class to help us deal with incoming
parameters.  As we've seen previously, the Joi library has extensive
flexibility in declaring validation rules for incoming query string
parameters.  We define a schema which has rules for each property.
Here is a reminder of what those look like:

```Javascript
var schema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})

// later ...

    schema.validate (paramArray, function (e, value) { ...
```

Our params class will hold our params, validate them, and let us apply
fixup functions on them, as well as use our new SymbolicError class.


```Javascript
/**
 * @module Local/Params.js
 * @desc Utility object for handling Sails query parameters
 */

var SymbolicError = require ('Local/SymbolicError')

module.exports = Params

var _copyMap = function (map) {
    var obj = {};
    Object.getOwnPropertyNames (map).forEach (function (key) { obj [key] = map [key] })
    return obj;
}

function Params (httpRequest, optSchema) {
    var map = httpRequest.params.all ();
    this.items = _copyMap (map)
    this.schema = optSchema ? optSchema : null

    // Not sure where this comes from, but it's not a query param so delete it
    this.delete ("id")
}

var Class = Params.prototype;

Class.delete = function (name) {
    delete this.items [name];
    return this
}

Class.has = function (name) { return this.items [name] === undefined }

Class.get = function (name) { return this.items [name] }

/**
 * criteria is a scalar or an array
 */
Class.apply = function (collection, fnEach) {
    var that = this;
    _.each (collection, function (v) {
        if (that.items.hasOwnProperty (v))
            that.items [v] = fnEach (that.items [v]);
    })
    
    return this
}

Class.toString = function () { return JSON.stringify (this.items) }

Class.validate = function () {
    if (this.schema === null)
        throw new SymbolicError ('bug.schemaIsNull', 'call to validate() with null schema in ctor');

    this.schema.validate (this.items, function (e, value) {
        if (e)
            throw new SymbolicError ('api.paramInvalid', 'one or more invalid parameter', e)
    });

    return this
}

Class.getAll = function () { return _copyMap (this.items) }
```
This will now clean up our controller code and make it extremely simple and
readable.  Here's the result:

```Javascript
    create: function (req, res) {
        var co = new ControllerOut (res)
        var pm = new Params (req, createSchema)
        pm.apply (['firstName', 'lastName'], StringUtil.cleanProperName)

        var p = pm.validate ().getAll ()
```
Note we are using our new Params object to not only validate our incoming
parameters, but also to apply a fixup function from an independent
library `StringUtil.cleanProperName`.

Note that since the Param validate routine is throwing our SymbolicError
with a particular symbol, it should be possible to detect this type of
error, and convert it into the right type of returned message, with
details on the parameters.  After all, one of our goals was to lock down
the types of things our REST API accepted to be more strict, with the
added burden on us to tell the user exactly why the parameter was not
acceptable.  We must do both to get a "self-documenting" system.

A further wrinkle is we'd like a generic post-controller routine to wrap
every controller method.  This would allow us to put the try/catch in
that function and look for our exceptions to convert into return messages
(as opposed to 500 errors for ones we didn't recognize).

Unfortunately, there is no simple hook (that we could find) in Sails.js
to do this.  Fortunately, we can create our own hook using an intermediate
Javascript technique.  Now that we've gone over all the nitty gritty
details of how Javascript functions, objects and prototypal inheritance
work, we are ready for some slightly more advanced tricks.

## Wrapping Javascript Methods - Interception 

Sails provides Middleware for calls, which are things that happen
prior to a function.  It does not provide a method of wrapping
our controller functions.  We want this ability so we can have a
try/catch that looks for our SymbolicError to change the message
that is returned to the caller, for example a 4XX error with details
on why a parameter was invalid versus 500 'server error' with no
details for "unhandled internal exceptions".

Sails does not provide an easy way to do this, so we are going to
rely on a technique called "interception" to do this.  This technique
can be used on any Javascript framework.

The idea is simple.  Since objects and/or classes (classes are objects
called prototypes, right?) have functions, we can take that function
and nest it in a wrapper of our own construction and set that back
on the object/class.  This is one of the benefits of having functions
that are "first class objects" - we can manipulate them easily,
programmatically.  From the standpoint of our tutorials, I think this
is the first time we've seen something that is both different and
better than most classical static OOP systems out there.  This obviously
relies on the ability to dynamically create functions in a simple way,
as well as manipulate them as objects.

I'm going to show you some working code that changes `UserController.js`
by adding our wrapper.  This is to show the mechanics, prior to taking
this code and putting it in an independent library.  So while the
code works, it's for teaching purposes, and we'd want to reorganize it
to make it more maintainable.

In progress changes to the file `api/controllers/UserController.js`:

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
var Params = require ('Local/Params');

var SymbolicError = require ('Local/SymbolicError');

var createSchema = Joi.object ().keys ({
    firstName: Joi.string ().alphanum ().max (30).required (),
    lastName: Joi.string ().alphanum ().max (30).required (),
    email: Joi.string ().email ().required (),
    password: Joi.string ().regex (/\w{6,128}/).required ()
})


// Our wrapper function that surrounds all controller methods

function wrapper (fn, that, arguments) {
    try {
        var req = arguments [0];
        var res = arguments [1];

        // N.B. The result is returned via callbacks associated with res or co
        // fn is the original user function we have wrapped.

        fn.call (that, req, res);
    } catch (e) {
        if (e instanceof SymbolicError) {
            var co = new ControllerOut (res)
            co.error (e)
            return;
        }
        throw e;
    }
}

// The function that does the work of changing the target object's
// method to the new method that is wrapped by our function wrapper, above.

function wrap (theWrapper, obj) {
    for (var name in obj) {

        // Only wrap local functions

        if ( ! obj.hasOwnProperty (name) || typeof obj [name] !== 'function')
            continue;

        // fn is original function on the object, to wrap

        var fn = obj [name];

        // set method on object to be our function wrapper, which gets
        // the original function (fn), this, and arguments array

        obj [name] = function () { return theWrapper (fn, this, arguments) }
    }
    return obj;
}

// Note we are calling wrap, which takes our object with the methods on it,
// wraps it, and returns it for module.exports

module.exports = wrap (wrapper, {
    /**
     * Create User.  Must have unique email.  Password is hashed prior to storage.
     * @function create
     * @arg {string} firstName will have lead/trail ws trimmed and upcase first
     * @arg {string} lastName will have lead/trail ws trimmed and upcase first
     * @arg {string} password Plaintext password for user account.
     * @arg {string} email Email must be unique (is used as login for account).
     * @returns {string} json User or Standard Error
     * @see createSchema for parameter validation
     *   // req - http.IncomingMessage, res - http.ServerResponse
     */
    create: function (req, res) {
        var co = new ControllerOut (res)
        var pm = new Params (req, createSchema)
        pm.apply (['firstName', 'lastName'], StringUtil.cleanProperName)

        var p = pm.validate ().getAll ()

        BCrypt.genSaltAsync (10)
        .then (function (salt) { return BCrypt.hashAsync (p.password, salt) })
        .then (function (hash) { p ['password'] = hash; return p /*User.create (p)*/ })
        .then (function (user) { res.json (user) })
        .catch (function (e) { co.error (e) })
    }
});
```
A few notes:

* The wrap() function takes an object and for all it's local methods,
  replaces them with a wrapped version that points to our wrapper () function.

* The wrapper() function uses the special "arguments" object which is
  an array of the function arguments.  This is initialized by Javascript for
  each function.  It in turn calls the wrapped function like this:
  `fn.call (that, req, res)` which is particular to our controllers.  We
  could make this more general by calling `fn.apply` which would take any
  number of arguments.

* Note that we can't really fully wrap the controller functions because
  some of the code paths are internal to callbacks.  For example, in our
  create() controller function, the try/catch will handle parameter
  validation, but not the asynchronous promise statement which has
  final callbacks for a result (success) and catch (error).  These
  will need access to some generic helpers that accomplish the same
  thing as our try/catch (e.g. co.error(e)).

You should be able to use Postman to give this a try and see what happens
when exceptions are thrown.  While the results aren't yet "perfect" we
can iterate on this and improve the results (part of the problem is our
previous library for error handling needs to be revised).

## Final Details

We now know enough to finish up our controller conventions so that we
can use these as a solid base.  While we have spent a lot of time on a
single controller method, we have illuminated many of the important
issues, and can see the code that will result from our efforts.  We should
be able to see the path to full control over the behavior of these routines
internally, as well as streamlined conventions for our controller code.
By moving the complexity of generic capabilities outside of the controller
methods, and providing nice APIs, we get very simple to read controller
methods with better capabilities.

We're now going to close this tutorial by going back and fixing our
previous libraries, to make sure we have a nice, simple baseline for
continuing.  Now that we know how to do a single controller method, more
or less "perfectly", as well as understanding the libraries we've made
for this purpose, we can start to stamp out multiple API methods.

## Looking Deeper Into Interception:  Hooks, Scarlet, etc.

The simplicity of our interception technique should have had some alarm bells
going off:  if this was so powerful and simple, there is probably a library
that someone else has created that does this reliably, with all the bells
and whistles.  The two that I found (I'm sure there are many more) were
"hooks" and "scarlet".

Scarlet looks interesting, but after looking through the code, it seems
there is a lot going on.  At first glance, in my opinion, that's not so
good for such a simple concept.  The API and documentation looks good,
but my thought is there's just too much code for this simple function.

Hook also looks interesting, but I don't like the fact that it modifies
the target object by adding methods.  While this is simple, it violates
some basic principals of OOP.

Based on this, we are going to roll our own interception class.  Often
when you have such a simple concept, one can arrive at better, simpler
solutions using custom-tailored code.  Our concentration will be on an
OOP solution which is not invasive.  Also, although this seems related
to "Aspect Oriented Programming (AOP)," we'll be doing something much simpler.

So our first step is just to wrap what we currently have into an object.
Let's look at the result of that transformation, as well as how we will
use the new class.

Our model will be to create a MethodInterceptor class, which is designed
to be subclassed.  For now, we'll keep things simple and have a single
"wrapper function" (which we'll call our interceptor function).  The
subclass will provide this wrapper function.  In our particular case
we are designing a single interception point that we can use for any
purpose for a sails controller.  The first purpose is simply to catch
any exceptions that exit the inner function and determine based on the
exception what to return to the client (parameter invalid or 500 error).

Note that we previously made the decision to return { data: {} } for
success and { error: {} } on error, which is the simplest part of
Google's JSON standard.  Thus we'll mostly be returning 200, even when
there is an error, rather than attempt to map different error types
to HTTP status codes.

Also, for our particular subclass, we will want to use the singleton
pattern, since we want to have a single object that all methods
are routed through.  This will also allow us to accrete different
functionality (complexity) at this level and put it into the class.
for example we could add logging, performance metrics and special
debugging code in this class.  This complexity would all be hidden
in our singleton.

Here is the base class `Local/MethodInterceptor.js`:
```Javascript
/**
 * @module Local/MethodInterceptor.js
 * @desc Utility object for intercepting/wrapping methods
 */

module.exports = MethodInterceptor

function MethodInterceptor (interceptorFn) {
    this.interceptorFn = interceptorFn
}

var Class = MethodInterceptor.prototype;

Class.intercept = function (obj) {
    for (var name in obj) {

        // Only wrap local functions

        if ( ! obj.hasOwnProperty (name) || typeof obj [name] !== 'function')
            continue;

        // fn is original function on the object, to wrap

        var originalFn = obj [name];
        var ifn = this.interceptorFn;

        // set method on object to be our function wrapper, which gets
        // the original function (fn), this, and arguments array

        var interceptorObject = this;

        obj [name] = function () {
            return ifn.call (interceptorObject, originalFn, this, arguments)
        }
    }

    return obj;
}
```
And now here is the singleton subclass.  We don't have to derive this as a
singleton (that is up to the inheriting class and has nothing to do with
the parent MethodInterceptor class):

The file `Local/SailsControllerInterceptorSingleton.js`:
```Javascript
/**
 * @module Local/SailsControllerInterceptorSingleton.js
 * @desc Singleton for all controllers.  Has a wrapper (interceptor)
 *       function that can be easily hooked around all methods for
 *       a Sails controller.
 * @example
 *
 *     // get singleton ('new' optional)
 *     var ci = SailsControllerInterceptorSingleton ();
 *
 *     // setup intercept on all methods of the object,
 *     // and return the object
 *     module.exports = ci.intercept ({
 *         create: function (req, res) {
 */

var inherits = require ('util').inherits
var MethodInterceptor = require ('Local/MethodInterceptor')
var SymbolicError = require ('Local/SymbolicError')

module.exports = _SailsControllerInterceptorSingleton;

function SailsControllerInterceptorSingleton () {
    MethodInterceptor.call (this, Class.controllerAction);
}

inherits (SailsControllerInterceptorSingleton, MethodInterceptor)

var Class = SailsControllerInterceptorSingleton.prototype;

/**
 * Call this function to finish a controller method, e.g. from an error callback
 * @example
 * 
 *     .then (function (user) { res.json (user) })
 *     .catch (function (e) { ci.error (res, e) })  // <= call here with exception
 */
Class.error = function (res, e) {
    // SymbolicErrors are designed to serialize correctly

    if (e instanceof SymbolicError)
        res.json ({ error: e });  // Google JSON standard => { error: } or { data: }
    else
        throw e; // Unhandled/unexpected exception
}

/**
 * wrapper (interceptor) function
 */
Class.controllerAction = function (originalFn, originalThis, arguments) {
    try {
        var req = arguments [0];
        var res = arguments [1];
        originalFn.apply (originalThis, arguments)
    } catch (e) {
        this.error (res, e);
    }
}

// ** Singleton pattern

var _singleton = null

function _SailsControllerInterceptorSingleton () {
    if (_singleton === null)
        _singleton = new SailsControllerInterceptorSingleton ();

    return _singleton;
}
```
Note that we eliminated the ControllerOut object.  There's no need for it
anymore.

Also note that we can easily reuse our MethodInterceptor on non-sails
controllers.  Also, our current use of inheritance for this particular
purpose seems slightly silly, even if "it works".  We're really just
inheriting for the purpose of implementation.  There are a lot of ways
we could do this that don't involve inheritance.  Also, in the case
of a singleton, we're just after a holder object to organize
new functionality for the generic controller functions we add.
Having a singleton for this purpose with it's own module file accomplishes
this.

So it does feel a little like we are using inheritance in a slightly clunky
way.  What would be better would be to make the following changes to our
MethodInterceptor class:

* In the constructor for MethodInterceptor, pass an interceptor
  function, and a "this" (pointer to object) to be passed to the
  interceptor.  This way we don't have to use inheritance, and
  we can create as many of these as we need through composition.

Let's make those changes and see how the code looks, as it shouldn't be
that different.  The following changes were made:

* Pass in a second argument to MethodInterceptor's constructor.  Use this
  in the wrapper as the 'this' argument to the interceptor function.
  This allows us to have the interceptor act like a method on the
  parent object (in this case SailsControllerInterceptorSingleton.js).

* We need to expose the intercept function since we are no longer
  getting that through inheritance.

* We'll add an example to the comments for MethodInterceptor.

* The name and function of SailsControllerInterceptorSingleton no longer
  fit.  This seemed the case as we were thinking of this object to
  be a shared context object for all controller methods.  So we'll
  change the name to `SailsControllerContext`.

Here is the new version of `Local/MethodInterceptor.js`:
```Javascript
/**
 * @module Local/MethodInterceptor.js
 * @desc Utility object for intercepting/wrapping methods
 * @example
 *
 *     // Here's an OOP way to do things:
 *
 *     function SomeConstructor () {
 *         this.interceptor = new MethodInterceptor
 *             (SomeConstructor.prototype.wrapper, this);
 *     }
 *
 *     // This function is the "interceptor" (wrapper) function.  It
 *     // doesn't automatically call the wrapped function (we must do it ourselves).
 *
 *     SomeConstructor.prototype.wrapper = function (originalFn, originalThis, arguments) {
 *         // N.B. 'this' will be set to the second arg of the MethodInterceptor
 *         // constructor.  We passed in "this" so this will behave like an OOP method.
 *         // But the second arg can be anything, including null (optional context).
 *       
 *         // You should call the original function like this:
 *
 *         originalFn.apply (originalThis, arguments)
 *     }
 */

module.exports = MethodInterceptor

/**
 * Constructor.
 * @arg {function} interceptorFn is the function that wraps the original function.
 * @arg {object} optContextObject is optional object passed into the wrapper function.
 */
function MethodInterceptor (interceptorFn, optContextObject) {
    this.interceptorFn = interceptorFn
    this.contextObject = optContextObject ? optContextObject : null
}

var Class = MethodInterceptor.prototype;

Class.intercept = function (obj) {
    for (var name in obj) {

        // Only wrap local functions

        if ( ! obj.hasOwnProperty (name) || typeof obj [name] !== 'function')
            continue;

        // fn is original function on the object, to wrap

        var originalFn = obj [name];
        var ifn = this.interceptorFn;

        // set method on object to be our function wrapper, which gets
        // the original function (fn), optContextObject as 'this', and arguments array

        obj [name] = function () {
            return ifn.call (this.optContextObject, originalFn, this, arguments)
        }
    }

    return obj;
}
```
Here is the new singleton, which we've renamed to `Local/SailsControllerContext.js`:
```Javascript
/**
 * @module Local/SailsControllerContext.js
 * @desc Singleton for all controllers.  Has a wrapper (interceptor)
 *       function that can be easily hooked around all methods for
 *       a Sails controller.
 * @example
 *
 *     // get singleton ('new' optional)
 *     var ci = SailsControllerContext ();
 *
 *     // setup intercept on all methods of the object,
 *     // and return the object
 *     module.exports = ci.intercept ({
 *         create: function (req, res) {
 */

var MethodInterceptor = require ('Local/MethodInterceptor')
var SymbolicError = require ('Local/SymbolicError')

module.exports = _SailsControllerContext;

var interceptor = null

function SailsControllerContext () {
    interceptor = new MethodInterceptor (Class.controllerAction, this);
}

var Class = SailsControllerContext.prototype;

/**
 * Call this function to finish a controller method, e.g. from an error callback
 * @example
 * 
 *     .then (function (user) { res.json (user) })
 *     .catch (function (e) { ci.error (res, e) })  // <= call here with exception
 */
Class.error = function (res, e) {
    // SymbolicErrors are designed to serialize correctly

    if (e instanceof SymbolicError)
        res.json ({ error: e });  // Google JSON standard => { error: } or { data: }
    else
        throw e; // Unhandled/unexpected exception
}

/**
 * wrapper (interceptor) function
 */
Class.controllerAction = function (originalFn, originalThis, arguments) {
    try {
        var req = arguments [0];
        var res = arguments [1];

        // Call original intercepted (wrapped) function

        originalFn.apply (originalThis, arguments)
    } catch (e) {
        this.error (res, e);
    }
}

// Expose the interceptor function

Class.intercept = function (obj) { return interceptor.intercept (obj) }

// ** Singleton pattern

var _singleton = null

function _SailsControllerContext () {
    if (_singleton === null)
        _singleton = new SailsControllerContext ();

    return _singleton;
}
```
We also must make changes to `api/controllers/UserController.js` since we
changed the name (exercise left to the reader).

## Using an IDE - IntelliJ Ultimate

We haven't discussed using an IDE, and quite frankly, I've been using a text editor
running from the command-line, just to get the feel of things.  We've been adding
to the unit tests as we go (see the checked in github code...we didn't go over it
in the tutorial), which helps guarantee code quality.

At this point our code is starting to get more complex and we could use the help
of an Integrated Development Environment (IDE).  For this I chose IntelliJ's
Ultimate IDE, which handles multiple languages.  I've been very impressed by
how well it works with Java and PHP, that it seems like a natural for Javascript.

There were 3 goals I had for using the IDE initially:

* Be able to edit files.
* Be able to interactively step through code in the debugger.  This will typically
  be in response to catching a request from the browser or Postman.
* Be able to interactively run and step through the mocha unit tests.

IntelliJ performed admirably, but lacked one thing that would have been nice
which was ability to halt the debugger based on exception type.  Version 14.0.2
does not have any of this type of feature (whereas for Java this is very extensive).
Note that the stripped down web IDE they offer, WebStorm, does have exception
halting, but only in rudimentary fashion.  It's possible this is a little
nebulous since the concept of types in Javascript is so fluid.

Here are the steps that I took to reach my goals:

* Create a new project with the top-level app directory as the project directory.
  This creates a hidden directory `.idea` which is already in .gitignore.
* Create a "Run Configuration" from the menu Run:Edit Configurations...
  A run configuration is a macro that will start a program or server.
  I selected the "Node.js" type (click + to create a new one and edit),
  and named it "Start Node: sails debug".  Below are the attributes
  of the dialog.  Note what is given is equivalent to running "sails debug" from
  the command-line, which starts sails in debug mode.
  * Node interpreter: /usr/local/bin/node (defaulted)
  * Node parameters: <blank>
  * Working directory:  /Users/rogerbush8/Documents/workspace/sails/sails-tutorial-1 (defaulted)
  * JavaScript file: /usr/local/lib/node_modules/sails/bin/sails.js
  * Application parameters: debug
* We need a separate debug configuration that lets us attach to a node
  server running in debug mode (i.e. with debug port 5858).  I created a configuration
  starting from the Node.js remote debug (we attach to an already running
  Node server, that is local, but this could work for remote as well).  I called
  this "Attach debugger to local Node.js server" Here are the parameters:
  * Host: 127.0.0.1 (defaulted)
  * Port: 5858 (defaulted)

In addition, I had to go to menu Preferences:Build,Execution,Deployment:Debugger:Stepping
and uncheck both "Do not step into library scripts" and "Do not step into scripts" which
were both checked.  This prevented "step into" from working since most things I was
debugging fell into one of these categories ("force step into" does work initially though).

Next I did the following:

* Open UserController.js and add a breakpoint in create.
* Selected Run => Start Node: sails debug (our new run config).
* Selected Debug => "Attach debugger to local Node.js server".
* Launched a call from the browser to create (e.g. http://localhost:1337/user/create?...)

This stopped at the breakpoint.

Another thing that was very useful was setting up a Run configuration for
the Mocha scripts.  There is a starter configuration for Mocha that you can
select, in menu Run:Edit Configurations... Start with Mocha.  I called mine
"Mocha all tests".  Here are the parameters:

* Node interpreter: /usr/local/bin/node (defaulted)
* Node options: <blank>
* Working directory: /Users/rogerbush8/Documents/workspace/sails/sails-tutorial-1
* Environment variables: <blank>
* Mocha package: /usr/local/lib/node_modules/mocha (defaulted)
* Test directory: /Users/rogerbush8/Documents/workspace/sails/sails-tutorial-1/tests
* check "Include sub directories"

This worked very well.  Running the "Mocha all tests" configuration runs all
the tests, and has a very nice graphical display in console.  You can put breakpoints
in tests and execution will halt.

Note that as of writing this, IntelliJ has two different IDE products that are relevant
for Node:  IntelliJ Ultimate 14 and WebStorm 9.  WebStorm 9 actually had more up-to-date
Node features than IntelliJ Ultimate, which I would guess will eventually be merged
back into that product.  Here were two interesting features in WebStorm 9 that were
not in Ultimate 14:

* Ability to halt on exceptions (I could not get this to work immediately, so I
  need to dig through some online docs).
* Live Edit for Node.js - WebStorm will automatically update your Node.js
  application and restart Node.js server on any changes.  The way this works is
  Live Edit will try to update the app using "hotswap" and if this fails it
  will restart Node.js.

Note that the instructions above for setting up the run and debug configurations
are exactly the same, and the .idea files are the same as well, so one can switch
between both IDEs.

## Conclusion

Once again, we've taken a pretty long path to get to where we are, but hopefully it
has resulted in deeper understanding.  Here are some of the things we've covered:

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

## References

* [Wikipedia ECMAScript Version History](http://en.wikipedia.org/wiki/JavaScript#Version_history)
* [Mozilla JavaScript Implementation History](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript)
* [Kangax ECMAScript 5 Implementation Support/Availability](http://kangax.github.io/compat-table/es5/)
* [Mozilla Developer JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [ECMASCript 5.1 specification, ECMA-262/5.1](http://www.ecma-international.org/ecma-262/5.1/)


