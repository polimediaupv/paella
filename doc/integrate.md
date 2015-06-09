# Integrate Paella in your portal

Paella needs to know certain information to play your videos.

- How many videos there are
- The URLS of those videos
- The properties of those videos (length, size, ...)
- Preview pictures
- etc...

So, You need to pass all that information to paella. Paella provides you two ways to pass that.

## The basic way

Paella is able lo read a file `data.json` to obtain the information needed to play the videos.
This is the simplest way to play videos with paella as you don't need to program anything.

To know more about this, please read [How to integrate paella in your portal: the easy way](integrate_basic.md)

## The advanced way

However, You can program (in javascript) some Adaptors that paella can use to obtain all the
information needed.

To know more about this, please read [How to integrate paella in your portal: the advanced way](integrate_advanced.md)


## Paella & Opencast

If you want to use Paella as a engage player for [opencast](http://opencast.org/), please go to the [paella-matterhorn](http://github.com/polimediaupv/paella-matterhorn) project to read how to build the paella engage bundle.
