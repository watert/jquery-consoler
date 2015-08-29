var $Consoler, BaseView, ConsolerView, addCSS,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

BaseView = (function() {
  BaseView.prototype.tagName = "div";

  function BaseView() {
    this.$el = $("<" + this.tagName + ">", {
      "class": this.className || ""
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

  ConsolerView.prototype.className = "consoler-mask";

  ConsolerView.prototype.css = "body { transition:all .3s; }\nbody.show-console > :not(.consoler-mask) {  -webkit-filter: blur(3px); -moz-filter: blur(3px);\n    -o-filter: blur(3px); -ms-filter: blur(3px); filter: blur(3px);\n}\n.show-console .consoler-mask {\n    height:100%; width:100%; background: rgba(255,255,255,.6);\n}\n.show-console #consoler {  height:60%; max-width: 400px; position: absolute; bottom: 0; right: 0; }\n.show-console #consoler .logs { display:block; }\n.show-console #consoler .status { text-align:left; }\n.consoler-mask, .consoler-mask * { margin: 0; padding: 0; border: 0;\n    font-size: 100%; font: inherit; vertical-align: baseline; }\n.consoler-mask { position:fixed; overflow:hidden; bottom:0;right:0;\n    width:140px; transition:all .3s;\n    font-size:10px; font-family: monospace, Monaco, Consolas;\n}\n#consoler { box-sizing:border-box; padding:10px; }\n#consoler .dialog { height:100%; overflow:hidden; border:1px solid #DDD;\n    background:#F9F9F9; border-radius:6px;\n    display:flex; space-between: flex-end; flex-direction:column;\n}\n\n@media (max-width: 420px) {\n    .show-console #consoler { width:100%; }\n}\n\n#consoler .logs {display:none; overflow:auto; }\n#consoler .logs ul {padding:0; margin:0; list-style:none;}\n#consoler .logs pre {margin:0; word-wrap: break-word; }\n#consoler .logs pre .object { color:blue; }\n\n#consoler .status {padding:10px; text-align:right; transition:all .3s;\n    background:#f7F7F7; border-top:1px solid #DDD;}\n#consoler .status > * {display:inline-block;}\n\n#consoler .log-item { background:#FFF; border-bottom: 1px solid #E7E7E7;\n    padding: 2px 8px; line-height: 1.4em;}\n#consoler .log-item:first-child { border-radius:4px 4px 0 0; }\n#consoler .log-item.log, #consoler .status .log { color:#666; }\n#consoler .log-item.warn {background: hsl(60, 100%, 95%); border-color: hsl(45, 100%, 85%); }\n#consoler .log-item.warn, #consoler .status .warn { color:hsl(30, 100%, 60%); }\n#consoler .log-item.info, #consoler .status .info { color:hsl(210, 100%, 75%); }\n#consoler .log-item.debug { border-color: hsl(240, 100%, 90%); }\n#consoler .log-item.debug, #consoler .status .debug { color:blue; }\n#consoler .log-item.success, #consoler .status .success { color:green; }\n#consoler .log-item.error { background:hsl(0, 100%, 95%); border-color:hsl(0, 100%, 90%); }\n#consoler .log-item.error, #consoler .status .error { color:red; }\n\n#consoler .status .type-status {\n    display:inline-block; margin-right:6px;\n}";

  ConsolerView.prototype.initialize = function() {
    this.render();
    addCSS(this.css);
    return this.$el.appendTo($("body"));
  };

  ConsolerView.prototype.show = function() {
    $("body").addClass("show-console");
    return this.scrollToBottom();
  };

  ConsolerView.prototype.hide = function() {
    return $("body").removeClass("show-console");
  };

  ConsolerView.prototype.template = "<div id=\"consoler\">\n    <div class=\"dialog\">\n        <div class=\"logs\">\n            <ul class=\"logs-body\"></ul>\n        </div>\n        <div class=\"input\"></div>\n        <div class=\"status\">\n            <span class=\"desc\">Logs:</span>\n        </div>\n    </div>\n</div>";

  ConsolerView.prototype.parseLog = function(input) {
    var type;
    console.debug("parseLog", input);
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

  $Consoler.prototype.debug = function() {
    return this.addLog.apply(this, ["debug"].concat(slice.call(arguments)));
  };

  return $Consoler;

})();
