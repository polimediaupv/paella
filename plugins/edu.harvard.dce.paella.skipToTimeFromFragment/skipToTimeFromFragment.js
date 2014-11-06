// Enable this plugin in config.json to allow urls in the format of:
// http://paella-video-url.com/<more stuff>#t=100
//
// to jump to the 100th second of a video when play starts. This emulates how
// timecode linking works for youtube and other sites.
//
// Notes:
//
// * This will not work for live streams
// * This should work fine if there are other fragments or no fragments at all
// * See: http://en.wikipedia.org/wiki/Fragment_identifier#Examples
//

Class ("paella.plugins.SkipToTimeFromFragment", paella.EventDrivenPlugin, {
  getName: function() {
    return 'edu.harvard.dce.paella.SkipToTimeFromFragment';
  },
  hasNotSkippedYet: true,
  getFragments: function() {
    var fragments = [], hash;
    var fragmentSeparatorLocation = window.location.href.indexOf('#') + 1;
    var hashes = window.location.href.slice(fragmentSeparatorLocation).split('&');
    for(var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      fragments[hash[0]] = hash[1];
    }
    return fragments;
  },
  getEvents:function() { return [paella.events.play]; },
  checkEnabled:function(onSuccess) {
    onSuccess(!paella.player.isLiveStream());
  },
  onEvent: function(eventType, params) {
    var fragments = this.getFragments();
    var desiredTime = parseFloat(fragments['t']);
    if( desiredTime && this.hasNotSkippedYet ) {
      this.hasNotSkippedYet = false;
      setTimeout(function() { paella.events.trigger(paella.events.seekToTime,{time: desiredTime}); },500);
    }
  }
});

paella.plugins.skipToTimeFromFragment = new paella.plugins.SkipToTimeFromFragment();
