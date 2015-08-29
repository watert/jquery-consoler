var $Consoler, BaseView, ConsolerView, addCSS,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

BaseView = (function() {
  BaseView.prototype.tagName = "div";

  function BaseView() {
    this.$el = $("<" + this.tagName + ">");
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

  ConsolerView.prototype.css = ".show-console #consoler {\n    width:100%;\n}\n.show-console #consoler .logs { display:block; }\n#consoler { position:fixed;\n    overflow:hidden;\n    bottom:0;right:0;\n    font-size:10px; font-family: Monaco, Consolas;\n}\n#consoler .dialog { margin:10px; border:1px solid #DDD; background:#F9F9F9; border-radius:6px; transition:all .3s; }\n#consoler .logs {display:none;}\n#consoler .logs ul {padding:0; margin:0; list-style:none;}\n#consoler .logs pre {margin:0;}\n\n#consoler .status {padding:4px 8px; }\n#consoler .status > * {display:inline-block;}\n\n#consoler .log-item { background:#FFF; border-bottom: 1px solid #E7E7E7; padding: 2px 8px; line-height: 1.4em;}\n#consoler .log-item:first-child { border-radius:4px 4px 0 0; }\n#consoler .log-item.log, #consoler .status .log { color:#666; }\n#consoler .log-item.warn {background: #fffbe6; border-color: #fff4c5; }\n#consoler .log-item.warn, #consoler .status .warn { color:hsl(30, 100%, 60%); }\n#consoler .log-item.info, #consoler .status .info { color:#9CF; }\n#consoler .log-item.success, #consoler .status .success { color:green; }\n#consoler .log-item.error { background:hsl(0, 100%, 95%); border-color:hsl(0, 100%, 90%); }\n#consoler .log-item.error, #consoler .status .error { color:red; }\n\n#consoler .status .type-status {\n    display:inline-block; margin-right:6px;\n}";

  ConsolerView.prototype.initialize = function() {
    this.render();
    addCSS(this.css);
    return this.$el.appendTo($("body"));
  };

  ConsolerView.prototype.show = function() {
    return $("body").addClass("show-console");
  };

  ConsolerView.prototype.hide = function() {
    return $("body").removeClass("show-console");
  };

  ConsolerView.prototype.template = "<div id=\"consoler\">\n    <div class=\"dialog\">\n        <div class=\"logs\">\n            <ul class=\"logs-body\"></ul>\n        </div>\n        <div class=\"input\"></div>\n        <div class=\"status\">\n            <span class=\"desc\">Logs:</span>\n        </div>\n    </div>\n</div>";

  ConsolerView.prototype.parseLog = function(input) {
    console.debug("parseLog", input);
    return input;
  };

  ConsolerView.prototype.addLog = function() {
    var $list, args, html, text, type;
    type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    $list = this.$("ul.logs-body");
    text = $.map(args, this.parseLog).join(" ");
    console.debug(args, text);
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
    return $status.data("count", count).find(".count").text(count);
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

  $Consoler.prototype.success = function() {
    return this.addLog.apply(this, ["success"].concat(slice.call(arguments)));
  };

  return $Consoler;

})();
