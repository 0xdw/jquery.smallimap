// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($) {
    var BlipEvent, ColorEffect, DelayEffect, Effect, Event, MapIcon, RadiusEffect, Smallimap;
    $.si || ($.si = {});
    $.si.smallimap = {
      version: '0.1',
      defaults: {
        colors: {
          lights: ["#fdf6e3", "#eee8d5", "#b8b0aa", "#93a1a1", "#839496"],
          darks: ["#002b36", "#073642", "#586e75", "#657b83"],
          land: {
            day: function(smallimap) {
              return smallimap.colors.lights.slice(1).concat(smallimap.colors.darks.slice(1).reverse());
            },
            night: function(smallimap) {
              return smallimap.colors.land.day().reverse();
            }
          }
        }
      }
    };
    Smallimap = (function() {

      function Smallimap(obj, cwidth, cheight, renderContext, world, options) {
        this.obj = obj;
        this.renderContext = renderContext;
        this.world = world;
        if (options == null) {
          options = {};
        }
        this.addMapIcon = __bind(this.addMapIcon, this);

        this.enqueueEvent = __bind(this.enqueueEvent, this);

        this.newMouseHover = __bind(this.newMouseHover, this);

        this.triggerOverlay = __bind(this.triggerOverlay, this);

        this.setColor = __bind(this.setColor, this);

        this.setRadius = __bind(this.setRadius, this);

        this.reset = __bind(this.reset, this);

        this.markDirty = __bind(this.markDirty, this);

        this.render = __bind(this.render, this);

        this.landinessOf = __bind(this.landinessOf, this);

        this.convertToWorldY = __bind(this.convertToWorldY, this);

        this.convertToWorldX = __bind(this.convertToWorldX, this);

        this.colorFor = __bind(this.colorFor, this);

        this.dot = __bind(this.dot, this);

        this.generateGrid = __bind(this.generateGrid, this);

        this.refresh = __bind(this.refresh, this);

        this.run = __bind(this.run, this);

        this.dotRadius = 3.2;
        this.dotDiameter = this.dotRadius * 2;
        this.width = cwidth / this.dotDiameter;
        this.height = cheight / this.dotDiameter;
        this.lastX = -1;
        this.lastY = -1;
        this.dirtyXs = void 0;
        this.eventQueue = [];
        this.lastRefresh = 0;
        this.fps = 20;
        $.extend(true, this, $.si.smallimap.defaults, options);
        this.grid = this.generateGrid(this.width, this.height);
      }

      Smallimap.prototype.run = function() {
        return this.refresh();
      };

      Smallimap.prototype.refresh = function() {
        var dt, event, now, ongoingEvents, x, y, _i, _j, _k, _l, _len, _ref, _ref1, _ref2, _ref3;
        now = new Date().getTime();
        dt = now - this.lastRefresh;
        this.lastRefresh = now;
        ongoingEvents = [];
        _ref = this.eventQueue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          event = _ref[_i];
          if (event.refresh(dt)) {
            ongoingEvents.push(event);
          }
        }
        this.eventQueue = ongoingEvents;
        if (!this.dirtyXs) {
          this.dirtyXs = [];
          for (x = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
            this.dirtyXs[x] = true;
          }
        }
        for (x = _k = 0, _ref2 = this.width - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; x = 0 <= _ref2 ? ++_k : --_k) {
          if (this.dirtyXs[x]) {
            this.dirtyXs[x] = false;
            for (y = _l = 0, _ref3 = this.height - 1; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; y = 0 <= _ref3 ? ++_l : --_l) {
              if (this.grid[x][y].dirty) {
                this.render(x, y);
              }
            }
          }
        }
        return requestAnimationFrame(this.refresh);
      };

      Smallimap.prototype.generateGrid = function(width, height) {
        var grid, x, y, _i, _j, _ref, _ref1;
        grid = [];
        for (x = _i = 0, _ref = width - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
          for (y = _j = 0, _ref1 = height - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
            grid[x] || (grid[x] = []);
            grid[x][y] = this.dot(x, y, this.landinessOf(x, y));
          }
        }
        return grid;
      };

      Smallimap.prototype.dot = function(x, y, landiness) {
        var newDot,
          _this = this;
        newDot = {
          x: x,
          y: y,
          landiness: landiness,
          initial: {
            color: this.colorFor(this.xToLong(x), this.yToLat(y), landiness),
            radius: this.dotRadius * 0.64
          },
          target: {},
          dirty: true,
          setRadius: function(radius) {
            return _this.setRadius(x, y, radius);
          },
          setColor: function(color) {
            return _this.setColor(x, y, color);
          }
        };
        return newDot;
      };

      Smallimap.prototype.longToX = function(longitude) {
        return Math.floor((longitude + 180) * this.width / 360 + 0.5);
      };

      Smallimap.prototype.latToY = function(latitude) {
        return Math.floor((-latitude + 90) * this.height / 180 + 0.5);
      };

      Smallimap.prototype.xToLong = function(x) {
        return Math.floor(x * 360 / this.width - 180 + 0.5);
      };

      Smallimap.prototype.yToLat = function(y) {
        return -Math.floor(y * 180 / this.height - 90 + 0.5);
      };

      Smallimap.prototype.colorFor = function(longitude, latitude, landiness) {
        var darkness, idx, landColors, now, sunSet;
        darkness = landiness * landiness;
        now = new Date();
        sunSet = new SunriseSunset(now.getYear(), now.getMonth() + 1, now.getDate(), latitude, longitude);
        landColors = this.colors.land.day(this);
        idx = Math.floor(darkness * (landColors.length - 2));
        if (sunSet.isDaylight(now.getHours()) || latitude >= 69) {
          return new Color(landColors[idx]);
        } else {
          return new Color(landColors[idx + 1]);
        }
      };

      Smallimap.prototype.convertToWorldX = function(x) {
        return Math.floor(x * this.world.length / this.width);
      };

      Smallimap.prototype.convertToWorldY = function(y) {
        return Math.floor(y * this.world[0].length / this.height);
      };

      Smallimap.prototype.landinessOf = function(x, y) {
        var existsCount, i, j, totalCount, worldXEnd, worldXStart, worldYEnd, worldYStart, _i, _j;
        worldXStart = this.convertToWorldX(x);
        worldXEnd = this.convertToWorldX(x + 1) - 1;
        worldYStart = this.convertToWorldY(y);
        worldYEnd = this.convertToWorldY(y + 1) - 1;
        totalCount = 0;
        existsCount = 0;
        for (i = _i = worldXStart; worldXStart <= worldXEnd ? _i <= worldXEnd : _i >= worldXEnd; i = worldXStart <= worldXEnd ? ++_i : --_i) {
          for (j = _j = worldYStart; worldYStart <= worldYEnd ? _j <= worldYEnd : _j >= worldYEnd; j = worldYStart <= worldYEnd ? ++_j : --_j) {
            totalCount += 1;
            if (this.world[i] && this.world[i][j]) {
              existsCount += 1;
            }
          }
        }
        return existsCount / totalCount;
      };

      Smallimap.prototype.render = function(x, y, millis) {
        var color, dot, radius;
        dot = this.grid[x][y];
        color = dot.target.color || dot.initial.color;
        radius = dot.target.radius || dot.initial.radius;
        this.renderContext.clearRect(x * this.dotDiameter, y * this.dotDiameter, this.dotDiameter, this.dotDiameter);
        this.renderContext.fillStyle = color.rgbString();
        this.renderContext.beginPath();
        this.renderContext.arc(x * this.dotDiameter + this.dotRadius, y * this.dotDiameter + this.dotRadius, radius, 0, Math.PI * 2, true);
        this.renderContext.closePath();
        this.renderContext.fill();
        dot.dirty = false;
        return dot.target = {};
      };

      Smallimap.prototype.markDirty = function(x, y) {
        if (this.dirtyXs) {
          this.dirtyXs[x] = true;
        }
        return this.grid[x][y].dirty = true;
      };

      Smallimap.prototype.reset = function(x, y) {
        return this.markDirty(x, y);
      };

      Smallimap.prototype.setRadius = function(x, y, r) {
        var target;
        target = this.grid[x][y].target;
        if (target.radius) {
          target.radius = (target.radius + r) / 2;
        } else {
          target.radius = r;
        }
        return this.markDirty(x, y);
      };

      Smallimap.prototype.setColor = function(x, y, color) {
        var target;
        target = this.grid[x][y].target;
        if (target.color) {
          target.color = target.color.mix(color);
        } else {
          target.color = color;
        }
        return this.markDirty(x, y);
      };

      Smallimap.prototype.triggerOverlay = function() {
        var push, y, _i, _ref, _results,
          _this = this;
        y = 0;
        push = function(x, dt) {
          var dot, r, setDots;
          dot = _this.grid[x][0];
          r = dot.initial.radius;
          setDots = function(r) {
            var _i, _ref, _results;
            _results = [];
            for (y = _i = 0, _ref = _this.height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
              _results.push(_this.setRadius(x, y, r));
            }
            return _results;
          };
          return _this.eventQueue.push(function() {
            setDots(r + dt);
            return setTimeout(function() {
              setDots(r);
              return _this.eventQueue.push(function() {
                return push((x + 1) % _this.width, dt);
              });
            }, 1000 / _this.width * 8);
          });
        };
        _results = [];
        for (y = _i = 0, _ref = this.height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
          _results.push(push(0, 0.5));
        }
        return _results;
      };

      Smallimap.prototype.newMouseHover = function(px, py) {
        var d, dot, i, j, lastX, lastY, pushDown, radius, x, y, _i, _j;
        x = Math.floor(px / this.dotDiameter);
        y = Math.floor(py / this.dotDiameter);
        radius = 2;
        pushDown = function(x, y, initial, target) {
          return true;
        };
        if (this.grid[x] && this.grid[x][y]) {
          if (this.lastX !== x && this.lastY !== y) {
            dot = this.grid[x][y];
            for (i = _i = -radius; -radius <= radius ? _i <= radius : _i >= radius; i = -radius <= radius ? ++_i : --_i) {
              for (j = _j = -radius; -radius <= radius ? _j <= radius : _j >= radius; j = -radius <= radius ? ++_j : --_j) {
                d = Math.sqrt(i * i + j * j);
                if (d < radius) {
                  pushDown(x + i, y + j, dot.initial.radius, 2);
                }
              }
            }
            lastX = x;
            return lastY = y;
          }
        }
      };

      Smallimap.prototype.enqueueEvent = function(event) {
        event.init();
        return this.eventQueue.push(event);
      };

      Smallimap.prototype.addMapIcon = function(title, label, iconUrl, longitude, latitude) {
        return this.mapIcons.push(new MapIcon(title, label, iconUrl, this.longToX, this.latToY));
      };

      return Smallimap;

    })();
    Effect = (function() {

      function Effect(dot, duration, options) {
        this.dot = dot;
        this.duration = duration;
        this.refresh = __bind(this.refresh, this);

        this.update = __bind(this.update, this);

        this.timeElapsed = 0;
        this.easing = options.easing || this.linearEasing;
        this.callback = options.callback;
      }

      Effect.prototype.linearEasing = function(progress) {
        return progress;
      };

      Effect.prototype.update = function(dt) {
        this.timeElapsed += dt;
        this.refresh(Math.min(1, this.easing(this.timeElapsed / this.duration)));
        if (this.timeElapsed > this.duration) {
          if (typeof this.callback === "function") {
            this.callback();
          }
          return false;
        } else {
          return true;
        }
      };

      Effect.prototype.refresh = function(progress) {
        return "unimplemented";
      };

      return Effect;

    })();
    RadiusEffect = (function(_super) {

      __extends(RadiusEffect, _super);

      function RadiusEffect(dot, duration, options) {
        this.refresh = __bind(this.refresh, this);
        RadiusEffect.__super__.constructor.call(this, dot, duration, options);
        this.startRadius = options.startRadius;
        this.endRadius = options.endRadius;
      }

      RadiusEffect.prototype.refresh = function(progress) {
        return this.dot.setRadius(this.endRadius * progress + this.startRadius * (1 - progress));
      };

      return RadiusEffect;

    })(Effect);
    ColorEffect = (function(_super) {

      __extends(ColorEffect, _super);

      function ColorEffect(dot, duration, options) {
        this.refresh = __bind(this.refresh, this);
        ColorEffect.__super__.constructor.call(this, dot, duration, options);
        this.startColor = options.startColor;
        this.endColor = options.endColor;
      }

      ColorEffect.prototype.refresh = function(progress) {
        var start;
        start = new Color(this.startColor.rgbString());
        return this.dot.setColor(start.mix(this.endColor, progress));
      };

      return ColorEffect;

    })(Effect);
    DelayEffect = (function(_super) {

      __extends(DelayEffect, _super);

      function DelayEffect(dot, duration, options) {
        this.refresh = __bind(this.refresh, this);
        DelayEffect.__super__.constructor.call(this, dot, duration, options);
      }

      DelayEffect.prototype.refresh = function(progress) {
        return "nothing to do";
      };

      return DelayEffect;

    })(Effect);
    Event = (function() {

      function Event(smallimap, callback) {
        this.smallimap = smallimap;
        this.callback = callback;
        this.refresh = __bind(this.refresh, this);

        this.init = __bind(this.init, this);

        this.enqueue = __bind(this.enqueue, this);

        this.queue = [];
      }

      Event.prototype.enqueue = function(effect) {
        return this.queue.push(effect);
      };

      Event.prototype.init = function() {
        return "no init, dude";
      };

      Event.prototype.refresh = function(dt) {
        var currentEffects, effect, _i, _len;
        currentEffects = this.queue.splice(0);
        this.queue = [];
        for (_i = 0, _len = currentEffects.length; _i < _len; _i++) {
          effect = currentEffects[_i];
          if (effect.update(dt)) {
            this.queue.push(effect);
          }
        }
        return this.queue.length > 0;
      };

      return Event;

    })();
    BlipEvent = (function(_super) {

      __extends(BlipEvent, _super);

      function BlipEvent(smallimap, options) {
        this.initEventsForDot = __bind(this.initEventsForDot, this);

        this.init = __bind(this.init, this);
        BlipEvent.__super__.constructor.call(this, smallimap, options.callback);
        this.latitude = options.latitude;
        this.longitude = options.longitude;
        this.color = new Color(options.color || "#336699");
        this.eventRadius = options.eventRadius || 8;
        this.duration = options.duration || 1024;
      }

      BlipEvent.prototype.init = function() {
        var d, dot, i, j, nx, ny, x, y, _i, _ref, _ref1, _results;
        x = this.smallimap.longToX(this.longitude);
        y = this.smallimap.latToY(this.latitude);
        _results = [];
        for (i = _i = _ref = -this.eventRadius, _ref1 = this.eventRadius; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          _results.push((function() {
            var _j, _ref2, _ref3, _results1;
            _results1 = [];
            for (j = _j = _ref2 = -this.eventRadius, _ref3 = this.eventRadius; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
              nx = x + i;
              ny = y + j;
              d = Math.sqrt(i * i + j * j);
              if (d < this.eventRadius && this.smallimap.grid[nx] && this.smallimap.grid[nx][ny]) {
                dot = this.smallimap.grid[nx][ny];
                _results1.push(this.initEventsForDot(nx, ny, d, dot));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        }
        return _results;
      };

      BlipEvent.prototype.initEventsForDot = function(nx, ny, d, dot) {
        var delay, duration, endColor, endRadius, startColor, startRadius,
          _this = this;
        delay = this.duration * d / this.eventRadius;
        duration = this.duration - delay;
        startColor = dot.initial.color;
        startRadius = dot.initial.radius;
        endColor = new Color(this.color.rgbString());
        endRadius = (this.smallimap.dotRadius - startRadius) / (d + 1) + startRadius;
        if (duration > 0) {
          this.enqueue(new ColorEffect(dot, duration, {
            startColor: startColor,
            endColor: endColor,
            callback: function() {
              return _this.enqueue(new ColorEffect(dot, duration, {
                startColor: endColor,
                endColor: startColor
              }));
            }
          }));
          return this.enqueue(new RadiusEffect(dot, duration, {
            startRadius: startRadius,
            endRadius: endRadius,
            callback: function() {
              return _this.enqueue(new RadiusEffect(dot, duration, {
                startRadius: endRadius,
                endRadius: startRadius
              }));
            }
          }));
        }
      };

      return BlipEvent;

    })(Event);
    MapIcon = (function() {

      function MapIcon(mapContainer, title, label, iconUrl, x, y) {
        this.title = title;
        this.label = label;
        this.iconUrl = iconUrl;
        this.x = x;
        this.y = y;
        this.remove = __bind(this.remove, this);

        this.init = __bind(this.init, this);

        this.init();
      }

      MapIcon.prototype.init = function() {
        var iconHtml;
        iconHtml = "<div class=\"smallipop\">\n  <img src=\"" + this.iconUrl + "\" alt=\"" + this.title + "\"/>\n  <div class=\"smallipopHint\">\n    <b class=\"smallimap-icon-title\">" + this.title + "</b><br/>\n    <p class=\"smallimap-icon-label\">" + this.label + "</p>\n  </div>\n</div>";
        this.iconObj = $(iconHtml).css({
          left: this.x,
          top: this.y
        });
        mapContainer.append(this.iconObj);
        return this.iconObj.smallipop();
      };

      MapIcon.prototype.remove = function() {
        return this.iconObj.remove();
      };

      return MapIcon;

    })();
    $.si.smallimap.effects = {
      Effect: Effect,
      ColorEffect: ColorEffect,
      RadiusEffect: RadiusEffect
    };
    $.si.smallimap.events = {
      Event: Event,
      BlipEvent: BlipEvent
    };
    return $.fn.smallimap = function(options) {
      if (options == null) {
        options = {};
      }
      options = $.extend({}, $.si.smallimap.defaults, options);
      return this.each(function() {
        var canvas, ctx, self, smallimap;
        self = $(this);
        canvas = this;
        ctx = canvas.getContext('2d');
        smallimap = new Smallimap(self, canvas.width, canvas.height, ctx, smallimapWorld, options);
        return self.data('api', smallimap);
      });
    };
  })(jQuery);

}).call(this);
