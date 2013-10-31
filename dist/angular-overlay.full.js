
/*!
 * angular-overlay - A simple modal directive
 * v0.2.0
 * http://github.com/firstandthird/angular-overlay/
 * copyright First + Third 2013
 * MIT License
*/
/*!
 * fidel - a ui view controller
 * v2.2.3
 * https://github.com/jgallen23/fidel
 * copyright Greg Allen 2013
 * MIT License
*/
(function(w, $) {
  var _id = 0;
  var Fidel = function(obj) {
    this.obj = obj;
  };

  Fidel.prototype.__init = function(options) {
    $.extend(this, this.obj);
    this.id = _id++;
    this.obj.defaults = this.obj.defaults || {};
    $.extend(this, this.obj.defaults, options);
    $('body').trigger('FidelPreInit', this);
    this.setElement(this.el || $('<div/>'));
    if (this.init) {
      this.init();
    }
    $('body').trigger('FidelPostInit', this);
  };
  Fidel.prototype.eventSplitter = /^(\w+)\s*(.*)$/;

  Fidel.prototype.setElement = function(el) {
    this.el = el;
    this.getElements();
    this.delegateEvents();
    this.dataElements();
    this.delegateActions();
  };

  Fidel.prototype.find = function(selector) {
    return this.el.find(selector);
  };

  Fidel.prototype.proxy = function(func) {
    return $.proxy(func, this);
  };

  Fidel.prototype.getElements = function() {
    if (!this.elements)
      return;

    for (var selector in this.elements) {
      var elemName = this.elements[selector];
      this[elemName] = this.find(selector);
    }
  };

  Fidel.prototype.dataElements = function() {
    var self = this;
    this.find('[data-element]').each(function(index, item) {
      var el = $(item);
      var name = el.data('element');
      self[name] = el;
    });
  };

  Fidel.prototype.delegateEvents = function() {
    var self = this;
    if (!this.events)
      return;
    for (var key in this.events) {
      var methodName = this.events[key];
      var match = key.match(this.eventSplitter);
      var eventName = match[1], selector = match[2];

      var method = this.proxy(this[methodName]);

      if (selector === '') {
        this.el.on(eventName, method);
      } else {
        if (this[selector] && typeof this[selector] != 'function') {
          this[selector].on(eventName, method);
        } else {
          this.el.on(eventName, selector, method);
        }
      }
    }
  };

  Fidel.prototype.delegateActions = function() {
    var self = this;
    self.el.on('click', '[data-action]', function(e) {
      var el = $(this);
      var action = el.attr('data-action');
      if (self[action]) {
        self[action](e, el);
      }
    });
  };

  Fidel.prototype.on = function(eventName, cb) {
    this.el.on(eventName+'.fidel'+this.id, cb);
  };

  Fidel.prototype.one = function(eventName, cb) {
    this.el.one(eventName+'.fidel'+this.id, cb);
  };

  Fidel.prototype.emit = function(eventName, data, namespaced) {
    var ns = (namespaced) ? '.fidel'+this.id : '';
    this.el.trigger(eventName+ns, data);
  };

  Fidel.prototype.hide = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].hide();
      }
    }
    this.el.hide();
  };
  Fidel.prototype.show = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].show();
      }
    }
    this.el.show();
  };

  Fidel.prototype.destroy = function() {
    this.el.empty();
    this.emit('destroy');
    this.el.unbind('.fidel'+this.id);
  };

  Fidel.declare = function(obj) {
    var FidelModule = function(el, options) {
      this.__init(el, options);
    };
    FidelModule.prototype = new Fidel(obj);
    return FidelModule;
  };

  //for plugins
  Fidel.onPreInit = function(fn) {
    $('body').on('FidelPreInit', function(e, obj) {
      fn.call(obj);
    });
  };
  Fidel.onPostInit = function(fn) {
    $('body').on('FidelPostInit', function(e, obj) {
      fn.call(obj);
    });
  };
  w.Fidel = Fidel;
})(window, window.jQuery || window.Zepto);

(function($) {
  $.declare = function(name, obj) {

    $.fn[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      var options = args.shift();
      var methodValue;
      var els;

      els = this.each(function() {
        var $this = $(this);

        var data = $this.data(name);

        if (!data) {
          var View = Fidel.declare(obj);
          var opts = $.extend({}, options, { el: $this });
          data = new View(opts);
          $this.data(name, data); 
        }
        if (typeof options === 'string') {
          methodValue = data[options].apply(data, args);
        }
      });

      return (typeof methodValue !== 'undefined') ? methodValue : els;
    };

    $.fn[name].defaults = obj.defaults || {};

  };

  $.Fidel = window.Fidel;

})(jQuery);

/*!
 * overlay - Modal plugin
 * v0.2.0
 * https://github.com/firstandthird/overlay
 * copyright First + Third 2013
 * MIT License
*/

(function($) {
  $.declare('overlay', {
    defaults: {
      overlayClass: 'overlay',
      backdropClass: 'overlay-backdrop',
      backdropClick: true
    },

    init: function() {

      if ($('.'+this.overlayClass).length !== 0) {
        $('.'+this.overlayClass).overlay('hide');
      }

      this.show();
    },

    getBackdrop: function() {
      return $('.'+this.backdropClass);
    },

    showBackdrop: function() {
      this.hideBackdrop();
      var el = $('<div/>').addClass(this.backdropClass);
      if (this.backdropClick) {
        el.on('click', this.proxy(this.hide));
      }
      $('body').append(el);
    },

    hideBackdrop: function() {
      this.getBackdrop().remove();
    },

    show: function() {
      this.el.addClass(this.overlayClass);
      $('body').css('overflow', 'hidden');
      this.showBackdrop();
      this.el.show();
      this.emit('show');
    },

    hide: function() {
      this.el.removeClass(this.overlayClass);
      $('body').css('overflow', '');
      this.hideBackdrop();
      this.el.hide();
      this.emit('hide');
      this.el.removeData('overlay');
    }
  });
})(jQuery);

(function(){
  angular.module('ftOverlay', [])
    .factory('overlayTemplate', ['$http', '$templateCache', '$q', function($http, $templateCache, $q) {
      return function(templateUrl) {
        var ret = $templateCache.get(templateUrl) || $http.get(templateUrl);
        return $q.when(ret)
          .then(function(template) {
            if (typeof template !== 'string') {
              //return from http call
              template = template.data;
              $templateCache.put(templateUrl, template);
            }
            return template;
          });
      };
    }])
    .directive('overlay', ['overlayTemplate', '$compile', '$document', '$parse', '$controller', function(overlayTemplate, $compile, $document, $parse, $controller) {
      return {
        link: function(scope, el, attrs) {

          overlayTemplate(attrs.overlay);
          var controller = attrs.overlayController;

          var container;
          var options = $parse(attrs.overlayOptions)() || {};

          if(!$document.find('#overlayContainer').length) {
            $document.find('body').append('<div id="overlayContainer" style="display:none"></div>');
          }

          container = $document.find('#overlayContainer');

          el.bind('click', function() {
            scope.$apply(function() {
              overlayTemplate(attrs.overlay).then(function(template) {
                container.html('');
                container.append(template);
                if (controller) {
                  var ctrl = $controller(controller, { $scope: scope });
                }
                $compile(container.contents())(scope);
                scope.overlay = container.overlay(options).data('overlay');
              });
            });
          });
          scope.overlayClose = function() {
            scope.overlay.hide();
          };

        }
      };
    }]);
})();
