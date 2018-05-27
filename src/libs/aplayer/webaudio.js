/**
 * Created by hongjac on 2017/3/22.
 */
var WebAudio = function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    this.audioContext = new AudioContext();
    this.audios = {};
};

WebAudio.prototype = {
    load: function (items) {
        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];
            this.audios[item.id] = {};
            this.audios[item.id].url = item.url;
            this.audios[item.id].loop = item.loop || false;
            this.audios[item.id].autoPlay = item.autoPlay || false;
            this.audios[item.id].volume = item.volume || 1;
            this._load(item.url, item.id);
        }
    },

    _load: function (url, id) {
        var _self = this;
        var _xhr = new XMLHttpRequest();
        _xhr.open('GET', url, true);
        _xhr.responseType = 'arraybuffer';
        _xhr.onload = function () {
            var _arraybuffer = _xhr.response;
            _self.audioContext.decodeAudioData(_arraybuffer, function (buffer) {
                _self.audios[id].buffer = buffer;
                _self.audios[id].gain = _self.audioContext.createGain();
                _self.audios[id].gain.connect(_self.audioContext.destination);
                if (_self.audios[id].autoPlay) _self.play(id);
                if (_self.audios[id].volume) _self.volume(id, _self.audios[id].volume);
            }, function (e) {
                console.log("!Decode Error:(");
            });
        };
        _xhr.send();
    },

    play: function (id) {
        if (!this.audios[id]) return;

        if (this.audios[id].source) return;

        if (this.audios[id].buffer) {
            var source = this.audioContext.createBufferSource();
            source.connect(this.audios[id].gain);
            source.buffer = this.audios[id].buffer;
            source.loop = this.audios[id].loop;
            source.start(0);
            this.audios[id].source = source;
            this.audios[id].autoPlay = false;
        } else {
            this.audios[id].autoPlay = true;
        }
    },

    stop: function (id) {
        if (!this.audios[id]) return;

        if (this.audios[id].source) {
            this.audios[id].source.stop();
            this.audios[id].source = null;
        }
    },

    volume: function (id, n) {
        if (!this.audios[id]) return;

        if (this.audios[id].gain) {
            this.audios[id].gain.gain.setValueAtTime(n, this.audioContext.currentTime)
        }
    },

    ready: function () {
        this.audioContext.createBufferSource();
    }
};

export {WebAudio};