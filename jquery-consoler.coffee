class BaseView
    tagName:"div"
    constructor:()->
        @$el = $("<#{@tagName}>", {class: @className or ""})
        @el = @$el[0]
        @$ = @$el.find.bind(@$el)
        @initialize?()
    render:()->
        html = @template
        # if
        @$el.html(html)
    template: "hello world"

addCSS = (rules)-> $("<style>",{type:"text/css",html:rules}).appendTo($("body"))
    # var css = document.createElement("style");
    # css.type = "text/css";
    # css.innerHTML = rules;
    # document.body.appendChild(css);

class ConsolerView extends BaseView
    id: "consoler"
    className: "consoler-mask"
    css:"""
        body { transition:all .3s; }
        body.show-console > :not(.consoler-mask) {  -webkit-filter: blur(3px); -moz-filter: blur(3px);
            -o-filter: blur(3px); -ms-filter: blur(3px); filter: blur(3px);
        }
        .show-console .consoler-mask {
            height:100%; width:100%; background: rgba(255,255,255,.6);
        }
        .show-console #consoler {  height:60%; max-width: 400px; position: absolute; bottom: 0; right: 0; }
        .show-console #consoler .logs { display:block; }
        .show-console #consoler .status { text-align:left; }
        .consoler-mask, .consoler-mask * { margin: 0; padding: 0; border: 0;
            font-size: 100%; font: inherit; vertical-align: baseline; }
        .consoler-mask { position:fixed; overflow:hidden; bottom:0;right:0;
            width:140px; transition:all .3s;
            font-size:10px; font-family: monospace, Monaco, Consolas;
        }
        #consoler { box-sizing:border-box; padding:10px; }
        #consoler .dialog { height:100%; overflow:hidden; border:1px solid #DDD;
            background:#F9F9F9; border-radius:6px;
            display:flex; space-between: flex-end; flex-direction:column;
        }

        @media (max-width: 420px) {
            .show-console #consoler { width:100%; }
        }

        #consoler .logs {display:none; overflow:auto; }
        #consoler .logs ul {padding:0; margin:0; list-style:none;}
        #consoler .logs pre {margin:0; word-wrap: break-word; }
        #consoler .logs pre .object { color:blue; }

        #consoler .status {padding:10px; text-align:right; transition:all .3s;
            background:#f7F7F7; border-top:1px solid #DDD;}
        #consoler .status > * {display:inline-block;}

        #consoler .log-item { background:#FFF; border-bottom: 1px solid #E7E7E7;
            padding: 2px 8px; line-height: 1.4em;}
        #consoler .log-item:first-child { border-radius:4px 4px 0 0; }
        #consoler .log-item.log, #consoler .status .log { color:#666; }
        #consoler .log-item.warn {background: hsl(60, 100%, 95%); border-color: hsl(45, 100%, 85%); }
        #consoler .log-item.warn, #consoler .status .warn { color:hsl(30, 100%, 60%); }
        #consoler .log-item.info, #consoler .status .info { color:hsl(210, 100%, 75%); }
        #consoler .log-item.debug { border-color: hsl(240, 100%, 90%); }
        #consoler .log-item.debug, #consoler .status .debug { color:blue; }
        #consoler .log-item.success, #consoler .status .success { color:green; }
        #consoler .log-item.error { background:hsl(0, 100%, 95%); border-color:hsl(0, 100%, 90%); }
        #consoler .log-item.error, #consoler .status .error { color:red; }

        #consoler .status .type-status {
            display:inline-block; margin-right:6px;
        }
    """
    initialize:()->
        @render()
        addCSS(@css)
        @$el.appendTo($("body"))
    show:()->
        $("body").addClass("show-console")

        @scrollToBottom()
    hide:()->
        $("body").removeClass("show-console")
    template: """
        <div id="consoler">
            <div class="dialog">
                <div class="logs">
                    <ul class="logs-body"></ul>
                </div>
                <div class="input"></div>
                <div class="status">
                    <span class="desc">Logs:</span>
                </div>
            </div>
        </div>
    """
    parseLog:(input)->
        console.debug "parseLog", input
        # if "string" is typeof input then input = "\"#{input}\""
        type = typeof input
        # if type is "number" then input = """<span class="number">#{input}</span>"""
        if type is "object"
            input = JSON.stringify(input)
            if input.indexOf("{") is 0 then input = "Object "+input
            input = """<em>#{input}</em>"""
        input = """<span class="#{type}">#{input}</span>"""
    addLog:(type, args...)->
        $list = @$("ul.logs-body")
        text = $.map(args, @parseLog).join(" ")
        console.debug args,text
        html = """
            <li class="log-item #{type}">
                <pre>#{text}</pre>
            </li>
        """
        $list.append(html)
    setStyle:()->
        $dom = @$("#consoler")
        $.map ["width", "height"], (attr)=>
            $dom.css(attr,getComputedStyle($dom[0])[attr])
    scrollToBottom:()->
        $logs = @$(".logs")
        $logsBody = @$(".logs-body")
        $logs.scrollTop($logsBody.height() - $logs.height())


class $Consoler
    constructor:(options)->
        @view = new ConsolerView(options)
        @view.$el.on "click", ".status", ()=>
            @toggle()
    toggle:()->
        if $("body").hasClass("show-console") then @view.hide()
        else @view.show()
    addLog:(type, args...)->
        console[type](args...)
        @view.addLog(type, args...)
        $status = @view.$(".status .#{type}")
        if not $status.length
            $container = @view.$(".status")
            iconText = type.slice(0,1).toUpperCase()
            html = """ <span class="icon">#{iconText}</span><span class="count"></span> """
            $status = $("<span>", class:"type-status #{type}", html:html)
            $status.data("count", 0).appendTo($container)
        count = $status.data('count') || 0
        count++
        $status.data("count", count)
            .find(".count").text(count)
        # @view.setStyle()



    log:()-> @addLog("log", arguments...)
    warn:()-> @addLog("warn", arguments...)
    error:()-> @addLog("error", arguments...)
    info:()-> @addLog("info", arguments...)
    debug:()-> @addLog("debug", arguments...)
