# sails-tutorial-1

a [Sails](http://sailsjs.org) application

## A Simple Sails Tutorial

I had some down time and was looking for a rapid prototyping system that would help
me quickly evolve backend ReST services.  Sails looked very promising for this purpose.
I figured in addition to playing around with Sails, I'd also document the process in
the form of some simple tutorials.  Taking the extra time to try to explain things
always helps me refine my own thought processes, as well as gaining the extra
benefit of documenting things for later use.

I intend on tagging the project at each point so you can see the changes that
were made.

Each successive tutorial is located in TUTORIALS/TUTORIALXX.md.

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
For example, in the tag list above, if you want the state at the end of TUTORIAL01.md,
you should get the tag "tutorial.01.2".  The minor number reflects a minor update
which is usually a documentation or tiny code fix.  In the listing of tags above
it shows I updated the tutorial twice (with minor fixes).

To make a new branch from the tag "tutorial.01.2" you can do:

```ScriptSession
$ git checkout -b new_branch_name tutorial.01.2
```

You can then compare the results of this branch to your existing branch if you
are having problems, or to a previous tag to see all the differences.


## Bon Voyage

Hope you enjoy the tutorials and happy sailing!

You can start with the first [TUTORIAL01.md](https://github.com/grokible/sails-tutorial-1/blob/master/TUTORIALS/TUTORIAL01.md)
