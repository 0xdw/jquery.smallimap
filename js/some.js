// Generated by CoffeeScript 1.3.3

/*!
  Sound Metrics client file
  www.sonicmetrics.com
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function($) {
    var log;
    $.some || ($.some = {
      debug: true,
      defaults: {
        sourceId: 'SonicMetricClient',
        soundEnabled: true,
        useLocalStorage: true,
        useLastKeyOnRequests: true,
        animationSpeed: 150,
        alertTimeout: 3000,
        pollingInterval: 15000,
        clientComputationPollingOffset: 1000,
        minEventSchedulingDistance: 40,
        serverUrl: 'http://localhost:8080',
        loginPath: 'login',
        registerPath: 'register',
        getEventsPath: 'events',
        createEventPath: 'post',
        getServerTime: 'time',
        alertsContainerId: 'sonicMetricsAlerts',
        highlightColor: '#63f',
        listeners: []
      }
    });
    if (!Array.prototype.last) {
      Array.prototype.last = function() {
        return this[this.length - 1];
      };
    }
    log = function(message) {
      var caller, _ref;
      caller = 'DOM';
      if (arguments.callee.caller.toString().match(/function ([^\(]+)/)) {
        caller = arguments.callee.caller.toString().match(/function ([^\(]+)/)[1];
      }
      if ($.some.debug != null) {
        return (_ref = window.console) != null ? _ref.log("SOME [" + caller + "]: " + message) : void 0;
      }
    };
    return $.some.SonicMetricsClient = (function() {

      function SonicMetricsClient(id, options) {
        if (options == null) {
          options = {};
        }
        this.registerListener = __bind(this.registerListener, this);

        this.removeListener = __bind(this.removeListener, this);

        this.requestServerTime = __bind(this.requestServerTime, this);

        this.getEvents = __bind(this.getEvents, this);

        this.getEventsForListener = __bind(this.getEventsForListener, this);

        this.createEvent = __bind(this.createEvent, this);

        this.register = __bind(this.register, this);

        this.logout = __bind(this.logout, this);

        this.login = __bind(this.login, this);

        this.play = __bind(this.play, this);

        this.scheduleHighlight = __bind(this.scheduleHighlight, this);

        this.scheduleSound = __bind(this.scheduleSound, this);

        this.feedback = __bind(this.feedback, this);

        this.pollServer = __bind(this.pollServer, this);

        this.toggleSound = __bind(this.toggleSound, this);

        this.storeData = __bind(this.storeData, this);

        this.setRunning = __bind(this.setRunning, this);

        this.setPaused = __bind(this.setPaused, this);

        this.init = __bind(this.init, this);

        this.hasLocalStorage = __bind(this.hasLocalStorage, this);

        this.getUrlForPath = __bind(this.getUrlForPath, this);

        this.id = id;
        this.pollingTimeoutId = -1;
        this.loggedIn = false;
        this.username = void 0;
        this.password = void 0;
        this.serverTimedelta = 0;
        this.paused = false;
        $.extend(true, this, $.some.defaults, options);
        this.alertsContainer = $('#' + this.alertsContainerId);
      }

      SonicMetricsClient.prototype.getCurrentTime = function() {
        return new Date().getTime();
      };

      SonicMetricsClient.prototype.getUrlForPath = function(path, jsonp) {
        var url;
        if (jsonp == null) {
          jsonp = false;
        }
        url = "" + this.serverUrl + "/" + path;
        if (jsonp) {
          return url + "?callback=?";
        } else {
          return url;
        }
      };

      SonicMetricsClient.prototype.getUrlForClient = function() {
        return '';
      };

      SonicMetricsClient.prototype.updateListenerList = function(listeners) {
        return true;
      };

      SonicMetricsClient.prototype.guidGenerator = function() {
        var S4;
        S4 = function() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
      };

      SonicMetricsClient.prototype.hasLocalStorage = function() {
        if ((typeof Modernizr !== "undefined" && Modernizr !== null ? Modernizr.localstorage : void 0) && this.useLocalStorage) {
          log('Localstorage enabled');
          return true;
        } else {
          log('Localstorage disabled');
          return false;
        }
      };

      SonicMetricsClient.prototype.init = function() {
        var sound, src, storageData, _ref, _ref1, _ref2;
        if (this.hasLocalStorage()) {
          storageData = JSON.parse(localStorage.getItem('sonicMetricsData'));
          if (storageData) {
            log('Retrieved data from local storage');
            log(storageData);
            if ((_ref = storageData.listeners) != null ? _ref.length : void 0) {
              this.listeners = storageData.listeners;
            }
            if (storageData.username != null) {
              this.username = storageData.username;
            }
            if (storageData.password != null) {
              this.password = storageData.password;
            }
            this.updateListenerList(this.listeners);
          }
        }
        this.requestServerTime();
        $(window).blur(this.setPaused).focus(this.setRunning);
        if (this.soundEnabled) {
          if ((typeof Modernizr !== "undefined" && Modernizr !== null ? (_ref1 = Modernizr.audio) != null ? _ref1.ogg : void 0 : void 0) != null) {
            log('Ogg support for this browser is enabled');
            for (sound in sounds) {
              src = sounds[sound];
              sounds[sound] = src.replace(/mp3/g, 'ogg');
            }
            return log(sounds);
          } else if ((typeof Modernizr !== "undefined" && Modernizr !== null ? (_ref2 = Modernizr.audio) != null ? _ref2.mp3 : void 0 : void 0) != null) {
            return log('Mp3 support for this browser is enabled');
          } else {
            this.soundEnabled = false;
            return this.feedback('Your browser does not support our audio player at this time :-(');
          }
        }
      };

      SonicMetricsClient.prototype.setPaused = function() {
        log('Client paused');
        return this.paused = true;
      };

      SonicMetricsClient.prototype.setRunning = function() {
        log('Client running');
        return this.paused = false;
      };

      SonicMetricsClient.prototype.storeData = function() {
        var storageData;
        log('Storing data in local storage');
        storageData = {
          listeners: this.listeners,
          username: this.username,
          password: this.password
        };
        return localStorage.setItem('sonicMetricsData', JSON.stringify(storageData));
      };

      SonicMetricsClient.prototype.toggleSound = function() {
        return this.soundEnabled = !this.soundEnabled;
      };

      SonicMetricsClient.prototype.pollServer = function() {
        if (!this.loggedIn) {
          return;
        }
        if (!this.paused) {
          this.getEvents();
        }
        return this.pollingTimeoutId = window.setTimeout(this.pollServer, this.pollingInterval - this.clientComputationPollingOffset);
      };

      SonicMetricsClient.prototype.feedback = function(message, type) {
        var alert,
          _this = this;
        if (type == null) {
          type = 'success';
        }
        log(message);
        alert = $("<div style=\"display:none;\" class=\"alert alert-" + type + "\">" + message + "</div>");
        this.alertsContainer.append(alert);
        alert.show(this.animationSpeed);
        return window.setTimeout(function() {
          return alert.hide(_this.animationSpeed, alert.remove);
        }, this.alertTimeout);
      };

      SonicMetricsClient.prototype.scheduleSound = function(listener, scheduledTimeout) {
        var _this = this;
        if (!this.soundEnabled) {
          return;
        }
        log("Scheduling sound for listener " + listener.name + " and offset " + scheduledTimeout);
        return window.setTimeout(function() {
          if (_this.soundEnabled) {
            return _this.play(listener.sound);
          }
        }, scheduledTimeout);
      };

      SonicMetricsClient.prototype.scheduleHighlight = function(listener, scheduledTimeout) {
        var _this = this;
        log("Scheduling highlight for listener " + listener.name + " and offset " + scheduledTimeout);
        return window.setTimeout(function() {
          return $("#listener-" + listener.id).animateHighlight(_this.highlightColor);
        }, scheduledTimeout);
      };

      SonicMetricsClient.prototype.play = function(soundId) {
        var audio;
        if (!this.soundEnabled) {
          return;
        }
        log("Playing sound " + (getUrlForClient() + sounds[soundId]));
        audio = new Audio();
        audio.src = this.getUrlForClient() + sounds[soundId];
        audio.play();
        return $(audio).bind('ended', function() {
          return $(this).remove();
        });
      };

      SonicMetricsClient.prototype.login = function(username, password) {
        this.loggedIn = false;
        if (username && password) {
          this.loggedIn = true;
          this.username = username;
          this.password = password;
        }
        if (this.loggedIn) {
          this.feedback('You are now logged in!');
        } else {
          this.feedback('Login failed!', 'error');
        }
        this.pollServer();
        return this.loggedIn;
      };

      SonicMetricsClient.prototype.logout = function() {
        this.loggedIn = false;
        this.username = '';
        this.password = '';
        this.listeners = [];
        this.storeData();
        this.feedback('You are now logged out!');
        return true;
      };

      SonicMetricsClient.prototype.register = function(username, password) {
        return true;
      };

      SonicMetricsClient.prototype.createEvent = function(subject, category, action, label) {
        var _this = this;
        if (subject == null) {
          subject = '';
        }
        if (category == null) {
          category = '';
        }
        if (action == null) {
          action = '';
        }
        if (label == null) {
          label = '';
        }
        log('Sending event creation request');
        $.getJSON(getUrlForPath(this.createEventPath, true), {
          username: this.username,
          password: this.password,
          subject: subject,
          category: category,
          action: action,
          label: label,
          source: this.sourceId
        }, function(data) {
          return _this.feedback('Your event has been created!');
        });
        return true;
      };

      SonicMetricsClient.prototype.getEventsForListener = function(listener) {
        var _this = this;
        log("Requesting events for listener " + listener.name);
        return $.getJSON(this.getUrlForPath(this.getEventsPath, true), {
          username: this.username,
          password: this.password,
          subject: listener.subject,
          category: listener.category,
          action: listener.action,
          label: listener.label,
          lastkey: this.useLastKeyOnRequests ? listener.lastkey : '',
          start: this.getCurrentTime() - this.pollingInterval - this.serverTimedelta
        }, function(data) {
          var event, lastEventTimestamp, scheduledTimeout, timeoutOffset, _i, _len, _results;
          if (!data) {
            return;
          }
          lastEventTimestamp = 0;
          timeoutOffset = _this.serverTimedelta + _this.pollingInterval - _this.getCurrentTime();
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            event = data[_i];
            log("Received event " + event.key + " for listener " + listener.name);
            listener.lastkey = event.key;
            if (Math.abs(event.when - lastEventTimestamp) > _this.minEventSchedulingDistance) {
              lastEventTimestamp = event.when;
              scheduledTimeout = event.when + timeoutOffset;
              if (scheduledTimeout > 0) {
                log("Scheduling event " + event.key + " for listener " + listener.name);
                _results.push(listener.callback(listener, scheduledTimeout, event));
              } else {
                _results.push(log("Dropped event " + event.key + " from the past at delta " + scheduledTimeout));
              }
            } else {
              _results.push(log("Dropped event " + event.key + " which repeated to fast"));
            }
          }
          return _results;
        });
      };

      SonicMetricsClient.prototype.getEvents = function() {
        var listener, _i, _len, _ref, _results;
        _ref = this.listeners;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          listener = _ref[_i];
          _results.push(this.getEventsForListener(listener));
        }
        return _results;
      };

      SonicMetricsClient.prototype.requestServerTime = function() {
        var requestTime,
          _this = this;
        requestTime = this.getCurrentTime();
        return $.getJSON(this.getUrlForPath(this.getServerTime, true), function(data) {
          var responseTime, servertime;
          responseTime = _this.getCurrentTime();
          if (data) {
            servertime = parseInt(data);
            if (servertime) {
              _this.serverTimedelta = Math.round((responseTime + requestTime) / 2 - servertime);
              return log("Using time delta " + _this.serverTimedelta);
            }
          }
        }).error(function() {
          log("Failed getting time from server, using local time");
          return this.serverTimedelta = 0;
        });
      };

      SonicMetricsClient.prototype.removeListener = function(id) {
        var idx, _i, _ref;
        log("Removing listener with " + id);
        for (idx = _i = 0, _ref = this.listeners.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; idx = 0 <= _ref ? ++_i : --_i) {
          if (this.listeners[idx].id === id) {
            this.listeners.splice(idx, 1);
          }
        }
        this.storeData();
        return this.updateListenerList(this.listeners);
      };

      SonicMetricsClient.prototype.registerListener = function(name, callback, sound, subject, category, action, label) {
        var newListener;
        if (callback == null) {
          callback = this.scheduleSound;
        }
        if (sound == null) {
          sound = '';
        }
        if (subject == null) {
          subject = '';
        }
        if (category == null) {
          category = '';
        }
        if (action == null) {
          action = '';
        }
        if (label == null) {
          label = '';
        }
        if (name && callback && (subject || category || action || label)) {
          this.feedback("Your listener with name '" + name + "', sound '" + sound + "', category '" + category + "', action '" + action + "' and label '" + label + "' has been registered!");
          newListener = {
            id: this.guidGenerator(),
            name: name,
            callback: callback || this.scheduleSound,
            sound: sound,
            subject: subject != null ? subject.toLowerCase() : void 0,
            category: category != null ? category.toLowerCase() : void 0,
            action: action != null ? action.toLowerCase() : void 0,
            label: label != null ? label.toLowerCase() : void 0
          };
          this.listeners.push(newListener);
          this.storeData();
          return this.updateListenerList(this.listeners);
        } else {
          if (!callback) {
            this.feedback('Your listener requires a name and a callback!', 'error');
          }
          if (!(subject || category || action || label)) {
            return this.feedback('Your listener requires a subject, category, action or label!', 'error');
          }
        }
      };

      return SonicMetricsClient;

    })();
  })(jQuery);

}).call(this);