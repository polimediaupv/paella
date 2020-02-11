
paella.addPlugin(function() {
  return class MatomoTracking extends paella.userTracking.SaverPlugIn {
    getName() { return "org.opencast.usertracking.MatomoSaverPlugIn"; }

    checkEnabled(onSuccess) {

      var site_id = this.config.site_id,
          server = this.config.server,
          heartbeat = this.config.heartbeat,
          thisClass = this;

      if (server && site_id){
        if (server.substr(-1) != '/') server += '/';
        require([server + "piwik.js"], function(matomo) {
          base.log.debug("Matomo Analytics Enabled");
          paella.userTracking.matomotracker = Piwik.getAsyncTracker( server + "piwik.php", site_id );
          paella.userTracking.matomotracker.client_id = thisClass.config.client_id;
          if (heartbeat && heartbeat > 0) paella.userTracking.matomotracker.enableHeartBeatTimer(heartbeat);
          if (Piwik && Piwik.MediaAnalytics) {
            paella.events.bind(paella.events.videoReady, () => {
              Piwik.MediaAnalytics.scanForMedia();
            });
          }
          thisClass.registerVisit();
        });
        onSuccess(true);
      }	else {
        base.log.debug("No Matomo Site ID found in config file. Disabling Matomo Analytics PlugIn");
        onSuccess(false);
      }
    }

    registerVisit() {
      var title,
          event_id,
          series_title,
          series_id,
          presenter,
          view_mode;

      if (paella.opencast && paella.opencast._episode) {
        title = paella.opencast._episode.dcTitle;
        event_id = paella.opencast._episode.id;
        presenter = paella.opencast._episode.dcCreator;
        paella.userTracking.matomotracker.setCustomVariable(5, "client",
          (paella.userTracking.matomotracker.client_id || "Paella Opencast"));
      } else {
        paella.userTracking.matomotracker.setCustomVariable(5, "client",
          (paella.userTracking.matomotracker.client_id || "Paella Standalone"));
      }

      if (paella.opencast && paella.opencast._episode && paella.opencast._episode.mediapackage) {
        series_id = paella.opencast._episode.mediapackage.series;
        series_title = paella.opencast._episode.mediapackage.seriestitle;
      }

      if (title)
        paella.userTracking.matomotracker.setCustomVariable(1, "event", title + " (" + event_id + ")", "page");
      if (series_title)
        paella.userTracking.matomotracker.setCustomVariable(2, "series", series_title + " (" + series_id + ")", "page");
      if (presenter) paella.userTracking.matomotracker.setCustomVariable(3, "presenter", presenter, "page");
      paella.userTracking.matomotracker.setCustomVariable(4, "view_mode", view_mode, "page");
      if (title && presenter) {
        paella.userTracking.matomotracker.setDocumentTitle(title + " - " + (presenter || "Unknown"));
        paella.userTracking.matomotracker.trackPageView(title + " - " + (presenter || "Unknown"));
      } else {
        paella.userTracking.matomotracker.trackPageView();
      }
    }

    loadTitle() {
      var title = paella.player.videoLoader.getMetadata() && paella.player.videoLoader.getMetadata().title;
      return title;
    }

    log(event, params) {
      if (paella.userTracking.matomotracker === undefined) {
        base.log.debug("Matomo Tracker is missing");
        return;
      }
      if ((this.config.category === undefined) || (this.config.category ===true)) {

        var value = "";

        try {
          value = JSON.stringify(params);
        } catch(e) {}

        switch (event) {
          case paella.events.play:
            paella.userTracking.matomotracker.trackEvent("Player.Controls","Play", this.loadTitle());
            break;
          case paella.events.pause:
            paella.userTracking.matomotracker.trackEvent("Player.Controls","Pause", this.loadTitle());
            break;
          case paella.events.endVideo:
            paella.userTracking.matomotracker.trackEvent("Player.Status","Ended", this.loadTitle());
            break;
          case paella.events.showEditor:
            paella.userTracking.matomotracker.trackEvent("Player.Editor","Show", this.loadTitle());
            break;
          case paella.events.hideEditor:
            paella.userTracking.matomotracker.trackEvent("Player.Editor","Hide", this.loadTitle());
            break;
          case paella.events.enterFullscreen:
            paella.userTracking.matomotracker.trackEvent("Player.View","Fullscreen", this.loadTitle());
            break;
          case paella.events.exitFullscreen:
            paella.userTracking.matomotracker.trackEvent("Player.View","ExitFullscreen", this.loadTitle());
            break;
          case paella.events.loadComplete:
            paella.userTracking.matomotracker.trackEvent("Player.Status","LoadComplete", this.loadTitle());
            break;
          case paella.events.showPopUp:
            paella.userTracking.matomotracker.trackEvent("Player.PopUp","Show", value);
            break;
          case paella.events.hidePopUp:
            paella.userTracking.matomotracker.trackEvent("Player.PopUp","Hide", value);
            break;
          case paella.events.captionsEnabled:
            paella.userTracking.matomotracker.trackEvent("Player.Captions","Enabled", value);
            break;
          case paella.events.captionsDisabled:
            paella.userTracking.matomotracker.trackEvent("Player.Captions","Disabled", value);
            break;
          case paella.events.setProfile:
            paella.userTracking.matomotracker.trackEvent("Player.View","Profile", value);
            break;
          case paella.events.seekTo:
          case paella.events.seekToTime:
            paella.userTracking.matomotracker.trackEvent("Player.Controls","Seek", value);
            break;
          case paella.events.setVolume:
            paella.userTracking.matomotracker.trackEvent("Player.Settings","Volume", value);
            break;
          case paella.events.resize:
            paella.userTracking.matomotracker.trackEvent("Player.View","resize", value);
            break;
          case paella.events.setPlaybackRate:
            paella.userTracking.matomotracker.trackEvent("Player.Controls","PlaybackRate", value);
            break;

        }
      }
    }

  }
});






