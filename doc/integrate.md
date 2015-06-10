# Integrate Paella in your portal

Paella needs to know certain information to play your videos.

- How many videos there are
- The URLS of those videos
- The properties of those videos (length, size, ...)
- Preview pictures
- etc...

So, You need to pass all that information to paella. Paella provides you three ways to pass that information.

## The basic way

Paella is able lo read a file `data.json` to obtain the information needed to play the videos.
This is the simplest way to play videos with paella as you don't need to program anything or modify
any html file.

Using this method you need to have a repository folder and, there your `data.json` files and configure paella
to use that repository.

To know more about this, please read [How to integrate paella in your portal: the easy way](integrate_basic.md)


## The intermediate way

If you don't want to have a repository folder or you want to embed Paella into your own html page, you can
read [How to integrate paella in your portal: the intermediate way](integrate_intermediate.md)


## The advanced way

However, You can program (in javascript) some adaptors that Paella can use to obtain all the
information needed.

To know more about this, please read [How to integrate paella in your portal: the advanced way](integrate_advanced.md)


# Some adapters to use Paella in other portals.

There are some implementation to integrate Paella in third party portals:

## Paella & Opencast

If you want to use Paella as a engage player for [opencast](http://opencast.org/), please go to the [paella-matterhorn](http://github.com/polimediaupv/paella-matterhorn) project to read how to build the paella engage bundle.


## Paella & OpenEDX

Paella can be integrated into [edX](https://open.edx.org/) with an XBlock.  Please go to the [Paella Xblock](https://github.com/polimediaupv/paellaXBlock) project to read how to use it.

There is a [demo server](http://demo.edx.upv.es/courses/demo/Tests/2014-002/about) where you can view it working.
