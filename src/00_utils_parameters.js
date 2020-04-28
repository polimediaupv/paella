(function() {
    paella.utils = paella.utils || {};
    
    paella.utils.cookies = {
        set:function(name,value) {
            document.cookie = name + "=" + value;
        },
    
        get:function(name) {
            var i,x,y,ARRcookies=document.cookie.split(";");
            for (i=0;i<ARRcookies.length;i++) {
                x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
                y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
                x=x.replace(/^\s+|\s+$/g,"");
                if (x==name) {
                    return unescape(y);
                }
            }
        }
    };
    
    paella.utils.hashParams = {
        extractUrl:function() {
            var urlOnly = window.location.href;
            if (urlOnly.lastIndexOf('#')>=0) {
                urlOnly = urlOnly.substr(0,urlOnly.lastIndexOf('#'));
            }
            return urlOnly;
        },
    
        extractParams:function() {
            var params = window.location.href;
            if (params.lastIndexOf('#')>=0) {
                params = params.substr(window.location.href.lastIndexOf('#'));
            }
            else {
                params = "";
            }
            return params;
        },
    
        clear:function() {
            window.location.href = this.extractUrl() + '#';
        },
    
        unset:function(key) {
            var url = location.href;
            var lastIndex = url.lastIndexOf('#');
            var urlOnly = this.extractUrl();
            if (lastIndex>=0 && lastIndex+1<url.length) {
                var newParams = "";
                var params = url.substr(url.lastIndexOf('#')+1);
                params = params.split('&');
                for (var i=0;i<params.length;++i) {
                    var current = params[i];
                    var keyValue = current.split('=');
                    if ((keyValue.length>=2 && keyValue[0]!=key) || keyValue.length<2) {
                        if (newParams=="") newParams += '#';
                        else newParams += "&";
                        newParams += current;
                    }
                }
                if (newParams=="") newParams = "#";
                location.href = urlOnly + newParams;
            }
        },
    
        set:function(key,value) {
            if (key && value) {
                this.unset(key);
                var url = this.extractUrl();
                var params = this.extractParams();
                var result = url;
                if (params.length==0) {
                    result += '#' + key + '=' + value;
                }
                else if (params.length==1) {
                    result +=  params + key + '=' + value;
                }
                else {
                    result +=  params + "&" + key + '=' + value;
                }
                location.href = result;
            }
        },
    
        get:function(key) {
            var url = location.href;
            var index = url.indexOf("#");
            if (index==-1) return "";
            index = url.indexOf(key,index) + key.length;
            if (url.charAt(index)=="=") {
                var result = url.indexOf("&",index);
                if (result==-1) {
                    result = url.length;
                }
                return url.substring(index + 1, result);
            }
            return "";
        }
    }
    
    paella.utils.parameters = {
        list:null,
    
        parse:function() {
            if (!this.list) {
                var url = window.location.href;
                this.list = {};
                
                if (/(http|https|file)?:\/\/([a-z0-9.\-_\/\~:]*\?)([a-z0-9.\/\-_\%\=\&]*)\#*/i.test(url)) {
                    var params = RegExp.$3;
                    var paramArray = params.split('&');
                    this.list = {};
                    for (var i=0; i<paramArray.length;++i) {
                        var keyValue = paramArray[i].split('=');
                        var key = keyValue[0];
                        var value = keyValue.length==2 ? keyValue[1]:'';
                        this.list[key] = value;
                    }
                }
            }
        },
    
        get:function(parameter) {
            if (this.list==null) {
                this.parse();
            }
            return this.list[parameter];
        },
    
        extractUrl:function() {
            var urlOnly = paella.utils.hashParams.extractUrl();
            if (urlOnly.lastIndexOf('?')>=0) {
                urlOnly = urlOnly.substr(0,urlOnly.lastIndexOf('?'));
            }
            return urlOnly;
        },
    
        extractParams:function() {
            // Primero quitar los parámetros hash
            var urlAndParams = paella.utils.hashParams.extractUrl();
            var params = urlAndParams;
            if (params.lastIndexOf('?')>=0) {
                params = params.substr(window.location.href.lastIndexOf('?'));
            }
            else {
                params = "";
            }
            return params;
        },
    
        // Pasa los parámetros de la URL a hash. Esta acción recargará la página
        toHash:function() {
            var urlOnly = this.extractUrl();
            var hashParameters = paella.utils.hashParams.extractParams();
            var parameters = this.extractParams();
            var newHashParams = "";
            var result = urlOnly;
            if (parameters.length==0 || parameters.length==1) {
                result += hashParameters;
            }
            else {
                parameters = parameters.substr(1);
                parameters = parameters.split('&');
                for (var i=0;i<parameters.length;++i) {
                    keyValue = parameters[i].split('=');
                    if (keyValue.length>=2 && paella.utils.hashParams.get(keyValue[0])=='') {
                        if (hashParameters=="" && newHashParams=="") newHashParams += '#';
                        else newHashParams += '&';
                        newHashParams += keyValue[0] + '=' + keyValue[1];
                    }
                }
                result += hashParameters + newHashParams;
            }
            if (location.href!=result) {
                location.href = result;
            }
        }
    }

})();