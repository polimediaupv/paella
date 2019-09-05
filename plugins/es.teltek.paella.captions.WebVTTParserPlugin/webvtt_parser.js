paella.addPlugin(function () {
    /////////////////////////////////////////////////
    // WebVTT Parser
    /////////////////////////////////////////////////
    return class WebVTTParserPlugin extends paella.CaptionParserPlugIn {
        get ext() { return ["vtt"] }
        getName() { return "es.teltek.paella.captions.WebVTTParserPlugin"; }

        parse(content, lang, next) {
            var captions = [];
            var self = this;
            var lls = content.split("\n");
            var c;
            var id = 0;
            var skip = false;
            for (var idx = 0; idx < lls.length; ++idx) {
                var ll = lls[idx].trim();
                if ((/^WEBVTT/.test(ll) && c === undefined) || ll.length === 0) {
                    continue;
                }
                if ((/^[0-9]+$/.test(ll) || /^[0-9]+ -/.test(ll)) && lls[idx - 1].trim().length === 0) {
                    continue;
                }
                if (/^NOTE/.test(ll) || /^STYLE/.test(ll)) {
                    skip = true;
                    continue;
                }
                if (/^(([0-9]+:)?[0-9]{2}:[0-9]{2}.[0-9]{3} --> ([0-9]+:)?[0-9]{2}:[0-9]{2}.[0-9]{3})/.test(ll)) {
                    skip = false;
                    if (c != undefined) {
                        captions.push(c);
                        id++;
                    }
                    c = {
                        id: id,
                        begin: self.parseTimeTextToSeg(ll.split("-->")[0]),
                        end: self.parseTimeTextToSeg(ll.split("-->")[1]),
                    }
                    continue;
                }
                if (c !== undefined && !skip) {
                    ll = ll.replace(/^- /, "");
                    ll = ll.replace(/<[^>]*>/g, "");
                    if (c.content === undefined) {
                        c.content = ll;
                    } else {
                        c.content += "\n" + ll;
                    }
                }
            }
            captions.push(c);
            if (captions.length > 0) {
                next(false, captions);
            } else {
                next(true);
            }
        }

        parseTimeTextToSeg(ttime) {
            var nseg = 0;
            var factor = 1;
            ttime = /(([0-9]+:)?[0-9]{2}:[0-9]{2}.[0-9]{3})/.exec(ttime);
            var split = ttime[0].split(":");
            for (var i = split.length - 1; i >= 0; i--) {
                factor = Math.pow(60, (split.length - 1 - i));
                nseg += split[i] * factor;
            }
            return nseg;
        }
    }
})
