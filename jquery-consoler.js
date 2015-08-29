var $Consoler, BaseView, ConsolerView, addCSS,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

BaseView = (function() {
  BaseView.prototype.tagName = "div";

  function BaseView() {
    this.$el = $("<" + this.tagName + ">", {
      "class": this.className || "",
      id: this.id || null
    });
    this.el = this.$el[0];
    this.$ = this.$el.find.bind(this.$el);
    if (typeof this.initialize === "function") {
      this.initialize();
    }
  }

  BaseView.prototype.render = function() {
    var html;
    html = this.template;
    return this.$el.html(html);
  };

  BaseView.prototype.template = "hello world";

  return BaseView;

})();

addCSS = function(rules) {
  return $("<style>", {
    type: "text/css",
    html: rules
  }).appendTo($("body"));
};

ConsolerView = (function(superClass) {
  extend(ConsolerView, superClass);

  function ConsolerView() {
    return ConsolerView.__super__.constructor.apply(this, arguments);
  }

  ConsolerView.prototype.id = "consoler";

  ConsolerView.prototype.className = "";

  ConsolerView.prototype.initialize = function() {
    this.render();
    return this.$el.appendTo($("body"));
  };

  ConsolerView.prototype.show = function() {
    var $body;
    $body = $("body").addClass("show-console");
    return this.scrollToBottom();
  };

  ConsolerView.prototype.hide = function() {
    return $("body").removeClass("show-console");
  };

  ConsolerView.prototype.template = "<div class=\"dialog-mask\">\n    <div class=\"dialog\">\n        <div class=\"logs\">\n            <ul class=\"logs-body\"></ul>\n        </div>\n        <div class=\"input\"></div>\n    </div>\n</div>\n<div class=\"status\">\n    <span class=\"desc\">Logs:</span>\n</div>";

  ConsolerView.prototype.parseLog = function(input) {
    var type;
    type = typeof input;
    if (type === "object") {
      input = JSON.stringify(input);
      if (input.indexOf("{") === 0) {
        input = "Object " + input;
      }
      input = "<em>" + input + "</em>";
    }
    return input = "<span class=\"" + type + "\">" + input + "</span>";
  };

  ConsolerView.prototype.addLog = function() {
    var $list, args, html, text, type;
    type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    $list = this.$("ul.logs-body");
    text = $.map(args, this.parseLog).join(" ");
    html = "<li class=\"log-item " + type + "\">\n    <pre>" + text + "</pre>\n</li>";
    return $list.append(html);
  };

  ConsolerView.prototype.setStyle = function() {
    var $dom;
    $dom = this.$("#consoler");
    return $.map(["width", "height"], (function(_this) {
      return function(attr) {
        return $dom.css(attr, getComputedStyle($dom[0])[attr]);
      };
    })(this));
  };

  ConsolerView.prototype.scrollToBottom = function() {
    var $logs, $logsBody;
    $logs = this.$(".logs");
    $logsBody = this.$(".logs-body");
    return $logs.scrollTop($logsBody.height() - $logs.height());
  };

  return ConsolerView;

})(BaseView);

$Consoler = (function() {
  function $Consoler(options) {
    this.view = new ConsolerView(options);
    this.view.$el.on("click", ".status", (function(_this) {
      return function() {
        return _this.toggle();
      };
    })(this));
  }

  $Consoler.prototype.toggle = function() {
    if ($("body").hasClass("show-console")) {
      return this.view.hide();
    } else {
      return this.view.show();
    }
  };

  $Consoler.prototype.addLog = function() {
    var $container, $status, args, count, html, iconText, ref, type;
    type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    console[type].apply(console, args);
    (ref = this.view).addLog.apply(ref, [type].concat(slice.call(args)));
    $status = this.view.$(".status ." + type);
    if (!$status.length) {
      $container = this.view.$(".status");
      iconText = type.slice(0, 1).toUpperCase();
      html = " <span class=\"icon\">" + iconText + "</span><span class=\"count\"></span> ";
      $status = $("<span>", {
        "class": "type-status " + type,
        html: html
      });
      $status.data("count", 0).appendTo($container);
    }
    count = $status.data('count') || 0;
    count++;
    $status.data("count", count).find(".count").text(count);
    return null;
  };

  $Consoler.prototype.log = function() {
    return this.addLog.apply(this, ["log"].concat(slice.call(arguments)));
  };

  $Consoler.prototype.warn = function() {
    return this.addLog.apply(this, ["warn"].concat(slice.call(arguments)));
  };

  $Consoler.prototype.error = function() {
    return this.addLog.apply(this, ["error"].concat(slice.call(arguments)));
  };

  $Consoler.prototype.info = function() {
    return this.addLog.apply(this, ["info"].concat(slice.call(arguments)));
  };

  $Consoler.prototype.debug = function() {
    return this.addLog.apply(this, ["debug"].concat(slice.call(arguments)));
  };

  return $Consoler;

})();
