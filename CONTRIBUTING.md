# Contributing

## Branching model

We use [git-flow](http://nvie.com/posts/a-successful-git-branching-model/) as our branching model.

So, paella have two main branches:

* `master` is the stable version. And only is updated in each new release version.

* `develop` is the develop branch, all new features will be commited to this branch.

When we want to release a new stable version of paella, we create a new branch (`release/<version>`)

* `release/<version>` is a release candidate branch. In this branch we only anccept bug fixes. 
	No new features will be accepted in this branch. All new features will be commited to `develop` branch.


##  Contributing

If you want to create a new feature, you need to branch of `develop`. When your feature is finished,
you can make a pull-request to the `develop` branch.

If you are fixing a bug in a `release` version, you need to branch of `release/<version>`.
Once the bug is fixed, you can make a pull-request to the `release<version>` branch.


