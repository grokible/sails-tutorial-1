# TUTORIAL01

## Why Sails?

I wanted a "rails-like" fast prototyping framework for backend work, and liked the
idea of using Javascript and Node.js as a learning experience.

Sails is designed for creating ReSTful apis quickly.  While one can create websites
using Sails, the focus is clearly not on display, and by not trying to solve this,
Sails can specialize.

The author compares Sails to other frameworks such as Meteor, by making the distinction
that Sails was created to get client work done, whereas Meteor was created as a framework.
Without reading too much into this, I'm guessing this means Sails tries to be pragmatic
and sparse.  My initial thoughts are that Sails seems to have some rough edges, which
don't matter so much (e.g. lack of good error messages for newbies).  I personally love
toward frameworks that are super lean, and so between the two candidates, Sails looked
like a better fit for my personal taste.

It's been my observation that the best frameworks are those that are designed out of
necessity, as they tend to be very practical and sparse.

The author of Sails, Mike McNeil compares Sails to Meteor here:

http://stackoverflow.com/questions/22202286/sails-js-vs-meteor-what-are-the-advantages-of-both

I also appreciate the author's desire for a pure Node.js implementation of everything,
in that if one wants to learn reasonable idiomatic Javascript and Node.js through osmosis,
going through the code provides that benefit as well (not to say this isn't true for
Meteor, but we will assume it is true for Sails based on the stackoverflow article).

## Installing Sails

I installed Sails globally as it seems like it is evolving quickly, and the notion of
having different versions of Sails installed, seems like it will just cause problems at
this early stage (also having the bin files, such as generate, go to the right place is nice).
This is also what the docs recommend.

```ShellSession
$ npm install -g sails
```

Once that was done I created the scaffolding for tutorial: sails-tutorial-1

```ShellSession
$ sails new sails-tutorial-1
$ ls sails-tutorial-1
Gruntfile.js  api/          assets/       node_modules/ tasks/
README.md     app.js        config/       package.json  views/
```

## Starting sails for the first time

Do this from within the top-level project directory:

```ShellSession
$ sails lift
```

You should see this:

```ShellSession

info: Starting app...

info: 
info: 
info:    Sails              <|
info:    v0.10.5             |\
info:                       /|.\
info:                      / || \
info:                    ,'  |'  \
info:                 .-'.-==|/_--'
info:                 `--'-------' 
info:    __---___--___---___--___---___--___
info:  ____---___--___---___--___---___--___-__
info: 
info: Server lifted in `/Users/rogerbush8/Documents/workspace/node/learning/sails/sails-tutorial-1`
info: To see your app, visit http://localhost:1337
info: To shut down Sails, press <CTRL> + C at any time.

debug: --------------------------------------------------------
debug: :: Thu Dec 11 2014 16:25:58 GMT-0800 (PST)

debug: Environment : development
debug: Port        : 1337
debug: --------------------------------------------------------

```

When you start Sails, this is what it should look like if everything is configured properly.
Since starting Sails does a bunch of preparatory work, there are a lot of configuration errors
that will be caught at the start of the application.  In these cases we generally get a
stack trace with the thrown exception.

Now point our web browser to:

```ShellSession
http://localhost:1337/
```

You should see a homepage with basic Sails information.  So at this point, even though it doesn't
do anything useful, we have a web server.


## Creating the first model and controller

Sails comes with some rudimentary generator plugins, which can be executed from the CLI.
We'll create a user model and controller to implement the CRUD ReST methods.

```ShellSession
# We must be in the top-level-directory for the project to execute generator commands
# N.B. Bad things happen if you're in a subdir

$ cd sails-tutorial-1

$ sails generate model user firstName:string lastName:string email:string
$ sails generate controller user

# We just created two files in the api subdirs

$ ls api/controllers api/models
api/controllers:
UserController.js

api/models:
User.js
```

Let's take a look at the User.js file.

```Javascript
/**                                                                                                                                    
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    firstName : { type: 'string' },

    lastName : { type: 'string' },

    email : { type: 'string' }

  }
};
```

And now the UserController.js file.

```Javascript
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
};
```

## Let's start the application again

```ShellSession
$ sails lift

info: Starting app...

-----------------------------------------------------------------

 Excuse my interruption, but it looks like this app
 does not have a project-wide "migrate" setting configured yet.
 (perhaps this is the first time you're lifting it with models?)
 
 In short, this setting controls whether/how Sails will attempt to automatically
 rebuild the tables/collections/sets/etc. in your database schema.
 You can read more about the "migrate" setting here:
 http://sailsjs.org/#/documentation/concepts/ORM/model-settings.html?q=migrate

 In a production environment (NODE_ENV==="production") Sails always uses
 migrate:"safe" to protect inadvertent deletion of your data.
 However during development, you have a few other options for convenience:

 1. safe  - never auto-migrate my database(s). I will do it myself (by hand) 
 2. alter - auto-migrate, but attempt to keep my existing data (experimental)
 3. drop  - wipe/drop ALL my data and rebuild models every time I lift Sails

What would you like Sails to do?

info: To skip this prompt in the future, set `sails.config.models.migrate`.
info: (conventionally, this is done in `config/models.js`)

warn: ** DO NOT CHOOSE "2" or "3" IF YOU ARE WORKING WITH PRODUCTION DATA **

prompt: ?:  
```

OK, so we are to our first important decision.  For now, since we are prototyping/learning
we are going to set the migration type to "alter".  What alter does is it automatically
adjusts your schema to conform to your code.  This can be extremely dangerous, particularly
if it somehow gets out into production.  The reason for this is alter will drop any
columns that are not represented in the model.  So if you comment out a model attribute
and then do "sails lift", Sails will drop the column and data.

Note that alter is experimental.  It works really well for prototyping, however, in
situations where we are being very careful about data, it's not the right choice.
If alter were changed to not drop columns, things might be different.  That is,
if the behavior of alter could be channged so that it didn't delete columns, but
just left them, it would make it less dangerous for full time use.

For now, for the purposes of prototyping, we are going to set "migrate: alter".

Rather than enter a number at the prompt, let's learn how to set a config setting.

So hit CTRL-C to stop Sails.

## Setting our first config setting

Note that the warning says "set sails.config.models.migrate".  The first component in
this dotted property is "sails" which is the top level global.  Next is "config"
which corresponds to the config directory, then models which is the file models.js
and migrate which is the migrate property in that file.

We can see that the file has a commented out line.  Just leave this line and add
a line below it (the commented lines act as documentation for the config).  Note
that generally the commented lines specify the default, but in this case the
default is an unset value (which Sails asks us for if there are any models):

```Javascript
    // migrate: alter
    migrate: alter
```

Now when we start Sails all should be well.  Always make sure you are in the top-level
application directory when you attempt to start Sails.

```
$ sails lift
```

You should get the happy sailboat ASCII art signifying things are working.  Let's now
see what functionality we've added by creating our simple User model, default controller,
and change of config.

## First attempt using automatic routes

Recall the generated files we just saw were very sparse, but already, due to built-in
default behavior that Sails provides,
we have a set of RESTful and shortcut routes that can be used for simple CRUD on the new
User model we've created.  Let's give it a try.

First we need to start the sails server:
```ShellSession
$ sails lift
```

You should have seen a nice bit of ASCII art with a little sailboat and this on the end:

```ShellSession
debug: Environment : development
debug: Port        : 1337
debug: --------------------------------------------------------
```

Now we'll use a shortcut route to create an User entry.  Shortcut routes are not RESTful,
per se, as they are designed to be used in the browser address bar in lieu of a more full
featured tool like Postman.  I find the shortcut routes helpful and pragmatic, but they
may be slightly controversial with REST purists.  They are very helpful for tutorials,
since they occupy a single line and can be readily cut and pasted.  So we'll use them
for these tutorials.

```ShellSession
# Type this URL into your browser address bar
http://localhost:1337/user/create?firstName=Roger&lastName=Bush&email=rogerbush8@yahoo.com

# Response I got:
{
    firstName: "Roger",
    lastName: "Bush",
    email: "rogerbush8@yahoo.com",
    createdAt: "2014-12-10T15:10:17.370Z",
    updatedAt: "2014-12-10T15:10:17.370Z",
    id: 1
}

# Now let's try to retrieve this
http://localhost:1337/user/1

# Cool!
{
    firstName: "Roger",
    lastName: "Bush",
    email: "rogerbush8@yahoo.com",
    createdAt: "2014-12-10T15:10:17.370Z",
    updatedAt: "2014-12-10T15:10:17.370Z",
    id: 1
}
```

## Sensible defaults and automatic routes

Based on the minimal amount of work we've done so far, we've yielded some quick results.
Let's make a few observations:

* Although we didn't write any code, or even specify any REST methods, we have a set of them
  that have been generated.  These were not generated as code (e.g. in the UserController) but are
  part of Sails framework default behavior.
* Our object was persisted, in spite of the fact that we didn't set up a database or other persistent store.
* Several fields were added to our object automatically, and they have built-in behavior (id, createdAt, updatedAt).

We will definitely want to make some changes to the system since:

* We would like to specify a particular datastore that is fitting for our project.
* We don't necessarily want to expose all these default routes.
* The create method has no field validation.
* There is no authentication mechanism, so all these routes are fully exposed.

Sails gives us a nice, simple, incremental path to doing each of these.  It's pretty good about letting
you get started quickly, and then surgically amending the default behavior as you go.  Being able to work
in this way is crucial for rapid-prototyping, as well as being able to incrementally amend the code to
a full working system.

## sails-disk the default datastore and changing the datastore

Sails out-of-the-box has sails-disk as the default datastore.  The entire database schema and data
is persisted to a local JSON file representation, in .tmp/localDiskDb.db.  This is extremely useful
for demo and test, as well as a nice out-of-the-box experience, but probably not for production use.

Sails takes a "lazy creation" approach to datastores, tables, files, etc. which is extremely
useful in prototyping.  If we delete this file, it will simply get recreated.  You'll note that if
you delete the .tmp/localDiskDb.db file in this case, it will regenerate it on the next attempt
to update something (so the data is cached in memory).

Sails is pretty simple, and so I've found that deleting files doesn't get you into trouble.  This
isn't to say that you won't get into trouble with the occasional dangling reference here or there,
but it seems fairly simple and robust.  You should generally shutdown Sails and restart it if
you delete a file.

Sails will typically complain and exit with a stack trace for any number of configuration issues,
which is nice in that you can typically find out what it's mad about.  This does typically require
you to look through some code.  But this is far better than the system not detecting something
is wrong and putting you on the "muddle through" path.


## Changing the default datastore

Changing the datastore requires the following:

* Adding a connection for our specific datastore to config/connections.js
* Specifying a connection for each model, either in the model file (e.g. api/models/User.js), or
  changing the default in config/models.js

I'll be using MySQL for the remaining tutorials.  Note that the waterline ORM does a great job
at abstracting away most of the details so that datastores are interchangeable.  However, there
will always be important differences.  So be aware of this if you have a different datastore
while following the tutorial.

Here's what I added at the end of config/connections.js:

```Javascript

  // insert as last entry of config/connection.js:

  mysql1: {
    adapter: 'sails-mysql',
    host: '127.0.0.1',
    user: 'webapp',
    password: 'pa55word',
    database: 'sails'
  }
```

Next, we'll change the default connection from localDiskDb to mysql1 in config/models.js.
While we can do this on a per-table basis, it makes more sense to set the default once and
override it in the unlikely case it is different.

```Javascript

  // change at top of config/models.js

  // connection: 'localDiskDb',

  connection: 'mysql1',
```

Note the convention of a comment block followed by a comment-disabled property
along with it's default value.  From the existing comment we can see that
the default model connection is 'localDiskDb'.  If you do replace a value, make sure to leave
the comment-disabled property.  Don't delete it as this internal self-documentation
is important for understanding the system.

Next, we will need to install the sails-mysql adapter (I chose to do this locally in
my project directory, but globally should be fine too).

```ShellSession
# Make sure your working directory is sails-tutorial-1
$ npm install sails-mysql
```

Finally, we need to startup mysql, create a new database, create a user, and grant
database permissions.  Note that we do not have to create the User table, as sails
will do that for us.

```ShellSession
# If you don't have mysql running, you can start it this way
$ sudo /usr/local/mysql/bin/mysqld_safe &

$ mysql -u root -p

Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 24
Server version: 5.5.28 MySQL Community Server (GPL)
...
<snip>
mysql> CREATE DATABASE sails;
mysql> CREATE USER sails IDENTIFIED BY PASSWORD('pa55word');
mysql> GRANT USAGE ON sails.* TO 'webapp'@'localhost';
mysql> FLUSH PRIVILEGES;
```

Now lets restart sails.  You can stop it by doing CTRL-C.

```ShellSession
$ sails lift
```

Now we will test creating a User record through the browser, which will test
everything.  Sails will make a connection with the database, create a new
User table (since one doesn't exist), and write a record into it.  If we've
done anything wrong, it will complain vociferously here.  The way Sails
currently complains is to dump a stack trace and exit.  It typically takes
a little detective work to figure out what is wrong (but at this stage
it's likely to be something simple, so just start by double checking
everything).

```ShellSession
# Type this URL into your browser address bar
http://localhost:1337/user/create?firstName=Roger&lastName=Bush&email=rogerbush8@yahoo.com

# Response I got:
{
    firstName: "Roger",
    lastName: "Bush",
    email: "rogerbush8@yahoo.com",
    createdAt: "2014-12-10T17:11:19.000Z",
    updatedAt: "2014-12-10T17:11:19.000Z",
    id: 1
}

# Now let's try to retrieve this
http://localhost:1337/user/1

# Seems to work
{
    firstName: "Roger",
    lastName: "Bush",
    email: "rogerbush8@yahoo.com",
    createdAt: "2014-12-10T17:11:19.000Z",
    updatedAt: "2014-12-10T17:11:19.000Z",
    id: 1
}
```

Let's check the database:

```ShellSession
mysql> SHOW CREATE TABLE user;
...
| user  | CREATE TABLE `user` (
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 |
...
1 row in set (0.00 sec)
mysql> SELECT * FROM user;
+-----------+----------+----------------------+----+---------------------+---------------------+
| firstName | lastName | email                | id | createdAt           | updatedAt           |
+-----------+----------+----------------------+----+---------------------+---------------------+
| Roger     | Bush     | rogerbush8@yahoo.com |  1 | 2014-12-10 09:11:19 | 2014-12-10 09:11:19 |
+-----------+----------+----------------------+----+---------------------+---------------------+
1 row in set (0.00 sec)
```

## Automatic Routes

Despite the small amount of work we've done, we already have a reasonable set of ReST calls
which are defined on the User model.  We have both RESTful routes (GET, POST, DELETE) and
shortcut routes.  Shortcut routes are utility routes where GET is the only verb, and what
might go into a POST body is concatenated into the query parameters.  This is great for
one-liners from the command-line or in the browser address bar.

Automatic routes are enabled by default, and the corresponding implementation provided.
The implementation may be selectively overridden by adding a corresponding method in
the controller.  Automatic routes may be turned off for the application using configuration in
config/blueprint.js.  More information on blueprints can be found in the
[sails blueprint api reference](http://sailsjs.org/#/documentation/reference/blueprint-api).


##  Attributes and simple data constraints

Note that we still haven't written what could be considered a single line of code.  The Javascript we
are writing is just property settings that amount to overriding configuration.  So we are getting a tremendous amount of power
without much effort through Sails adherence to the familiar principle of
[convention over configuration](http://en.wikipedia.org/wiki/Convention_over_configuration).

We would now like to evolve our system incrementally, by first adding some constraints.  We can see
from the MySQL user table created by the sails-mysql adapter what the conventions are, namely:

* Strings are varchar(255) and default to NULL.
* Added fields createdAt and updatedAt are datetime and default to NULL.
* id is a autoincrement int (typical MySQL key - it is the PRIMARY key).
* There are no other indexes by default.

For basic validation we will want to make sure that firstName and lastName are valid names, that
email is a valid email, and further that email is unique.

The attributes of a model are described in the [Sails ORM Attributes](http://sailsjs.org/#/documentation/concepts/ORM/Attributes.html).
Attributes for the MySQL datastore, map to columns in the table schema.  We can use the 'unique' property of the attribute
to handle uniqueness of the email.

Note in the current online documentation, there is an example that shows type=email, which
does not seem like a fundamental type.  For now, we are going to avoid using this, and instead use a validation
for email.  Validations are data rules that can be applied to incoming values to make sure we don't
persist garbage in our datastore.

Here are some of the more important attribute properties:

* required: <boolean> - field must be specified.  This means it can't be null.
* unique: <boolean> - field must be unique in the table.  Unique is a bit of an oddball as far as these properties are concerned.
  Since it is a global feature of the model, it's nontrivial to guarantee.  In a relational database, like MySQL, this will just be a
  uniqueness constraint on the column.  In a NoSQL database, this might just be ignored.  So this useful feature probably
  breaks the abstraction slightly, making our model SQL dependent.
* defaultsTo: <value> - default value
* type: <type> - data type for the column (string, text, integer, float, date, datetime, boolean, binary, array, json)

It would be a useful exercise to create each of these fields and see what the sails-mysql adapter generates in the
mysql schema, particularly for boolean, binary, array and json.

##  Validations

Sails uses validations from the [Validator library](https://github.com/chriso/validator.js).  Looking at the current list
of supported [Sails validations](http://sailsjs.org/#/documentation/concepts/ORM/Validations.html), we see one
for email.

Note that we can also create our own validation types, by adding a types section to our model, with
truth functions.  However, I suspect there is a better project-wide place to override this, as we
are not going to want to define a type just for one model (but it's useful to know we can do it here for
experimentation).  Also, it's unfortunate that these in model file custom validations are called "types" since that name
refers to the underlying data type for the attribute.

## Updated User.js

So now we are ready to update our api/models/User.js file.  The finished product should be this:

```Javascript
/**
* User.js
*
* @description :: User account information
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    firstName : { type: 'string', required: true },

    lastName : { type: 'string', required: true },

    email : { type: 'string', unique: true, required: true, email: true }

  }
};
```

And we should restart sails and test it.

```ShellSession
$ sails lift
```

Now let's try to cause some mischief by adding a duplicate email, missing fields, etc:

```ShellSession
# Let's try duplicate email
# Type URL into your browser address bar
http://localhost:1337/user/create?firstName=Roger&lastName=Bush&email=rogerbush8@yahoo.com

# Response I get
{
    error: "E_VALIDATION",
    status: 400,
    summary: "1 attribute is invalid",
    invalidAttributes: {
        email: [
            {
                value: "rogerbush8@yahoo.com",
                rule: "unique",
                message: "A record with that `email` already exists (`rogerbush8@yahoo.com`)."
            }
        ]
    }
}

# Type URL into your browser address bar
http://localhost:1337/user/create?firstName=Sam&email=sam@yahoo.com

# Response I get
{
    error: "E_VALIDATION",
    status: 400,
    summary: "1 attribute is invalid",
    model: "User",
    invalidAttributes: {
        lastName: [
            {
                rule: "string",
                message: "`undefined` should be a string (instead of "null", which is a object)"
            },
            {
                rule: "required",
                message: ""required" validation rule failed for input: null"
            }
        ]
    }
}
```

Cool, seems to work fine.  Note that the error message in the second case is slightly misleading as it
looks like we've failed two validation rules instead of one.  The type 'string', if specified without
'required: true', will allow a create call without specifying the parameter, and save with a NULL
value (as expected).  So the rule 'string' above is independent of the type 'string' (i.e. type =
string does not have a rule = string).

I find the multiple validation rules returned to not be helpful as this requires the
client to have smarts put into it in terms of error handling and display.  I find it better to
return the most salient single error, in order of importance.  If the order of validation rules
can be specified, this lets the server logic determine and return the most fitting error for a
single field.  Of course, there should be up to one error per submitted field (useful for UI
decoration to show errors in a post form), but having multiple errors per field is
unnecessarily complicated.

Note I am just nitpicking though.  Sails did a fantastic job overall as it made this
extremely simple.  Note that it did not add a "NOT NULL" constraint to the database, prefering
to handle this sort of thing in the application - the right thing to do, IMHO.

## Adding fields

Adding a field is a common operation, and is fairly simple.  The reason this works reasonably
well for the sails-mysql adapter, is that fields are all defined NULL-able.  What this means
is that when we add another column, and data pre-exists, MySQL can set that field as NULL in the
old records.  Otherwise we would have to specify a default value for the field.  Specifying a
default value where there isn't a sensible default makes no sense.  For example, if we
added the middleName field, having the default of "" (empty string) is non-sensical.  The
fact is, we don't have that data, and therefore NULL is the correct choice from a data
standpoint.

So by the sails-mysql adapter choosing to not use database features, such as column
validation NOT NULL, we gain flexibility.

## Changing/Deleting fields

We are not going to try this as it is simple, and quite destructive.  From a development
and prototyping perspective, it is reasonable and simple to use the "migrate: alter" option.
However, once we start adding other developers, and the possibility of a production
environment, we start running into trouble.  The reason for this is that data, starts to
matter a lot, once you have any that you care about.

Consider the following scenario:

* Developer comments out an attribute in the model file temporarily and checks in the file.
* Other developers do a git pull, and sails lift.
* Sadness ensues as the other developers realize their test data is deleted.

It would be even worse if somehow code got into production that silently deleted things.

This is why, typically, it is better to mutate your schema using a mechanism like
migrations.  For a little bit more trouble, we can easily change our schema, as well
as retain control over when those changes are done (and perhaps even be able to roll
them back).  Changing schema in this way is fairly standard and takes the guesswork
out of what is happening automatically.

We'll look at migrations, which are not a standard part of Sails, in a future installment.

For now, just realize that a mechanism like migrations is probably the way to go right
from the get-go so that you don't get lazy and accidentally have "migrate: alter"
wreaking havoc.  It's slightly more complex, but we start out with the mindset of
deploying to production.

Secondly, changing/deleting fields happens automatically, with "migrate: alter", and it
is a little unconservative in its current approach (although we've been warned, the
authors did mark it experimental).


## Convention over configuration

We get a lot of useful default behavior with minimal effort, which is par for the
course with frameworks such as Sails.js.  Learning the system requires understanding
what the default behaviors are, when to override them, and then where in the system
we must go to make our overriding change.

We have seen hints of this in the config system.  The first hint was to effectively
make this change:

sails.config.models.migrate: alter

We saw that the values for this came from config/models.js and the attribute
"migrate".  This happens when Sails starts up.  Once Sails is started, this config
object is initialized with the appropriate values, and may be read and used
for our own purposes.  In the case of models.js (and many other files), a particular
model file in the api/models directory, can override these configuration values.


## Conclusion

We've seen that Sails provides a lot of power out-of-the-box, without too much
typing.  In fact, in this lesson, we didn't really write any code (true, we
made changes to .js files, but these were acting as config files).  In the
next tutorial, we'll add specific code to our controller and show how to
incrementally evolve and override behavior to get exactly what we want.

