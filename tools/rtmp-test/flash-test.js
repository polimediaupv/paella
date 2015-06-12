
function loadStreamingPlayer(server,stream,subscribe) {
	var container = $('#streamingPlayerContainer')[0];

	var objectData = '<object type="application/x-shockwave-flash" data="../../src/flash_streaming/player_streaming.swf" width="680" height="480">' +
			'<param name="movie" value="../../src/flash_streaming/player_streaming.swf" />' +
			'<param name="quality" value="high"/> ' +
			'<param name="flashvars" value="server=' + server +
					'&amp;stream=' + stream +
					'&amp;subscribe=' + (subscribe ? "true":"false") +
					'&amp;playerId=playerContainer_videoContainer_1Movie&amp;isLiveStream=true&amp;debugMode=true">' +
		'</object>';
	container.innerHTML = objectData;
}

function onLoad() {
	var form = $('#streamingForm')[0];
	var server = $('#server')[0];
	var stream = $('#stream')[0];
	var subscribe = $('#subscribe')[0];

	var paramsUrl = location.href.split('?');
	var params = {};

	if (paramsUrl.length==2) {
		paramsUrl = paramsUrl[1];
		paramsUrl.split('&').forEach(function(keyValue) {
			var keyValue = keyValue.split('=');
			var key = keyValue.length>0 ? keyValue[0]:null;
			var value = keyValue.length>1 ? keyValue[1]:null;
			if (key) {
				params[key] = value;
			}
		});
	}

	if (params.server) {
		server.value = params.server;
	}

	if (params.stream) {
		stream.value = params.stream;
	}

	var subscribeParam = params.subscribe=="true";

	if (subscribeParam) {
		subscribe.checked = true;
	}

	if (params.server && params.stream) {
		loadStreamingPlayer(params.server, params.stream, subscribeParam);
	}

	$(form).submit(function(event) {
		var server = $('#server')[0];
		var stream = $('#stream')[0];
		var subscribe = $('#subscribe')[0];


		location.href = '?server=' + $(server).val() + '&stream=' + $(stream).val() + '&subscribe=' + $(subscribe).is(':checked');
		event.preventDefault();
		return false;
	});
}


