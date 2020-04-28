(function() {

    paella.utils = paella.utils || {};
        
    class Dictionary {
        constructor() {
            this._dictionary = {};
        }

        addDictionary(dict) {
            for (let key in dict) {
                this._dictionary[key] = dict[key];
            }
        }

        translate(key) {
            return this._dictionary[key] || key;
        }

        currentLanguage() {
            let lang = navigator.language || window.navigator.userLanguage;
            return lang.substr(0, 2).toLowerCase();
        }
    }

    paella.utils.dictionary = new Dictionary();

})();
