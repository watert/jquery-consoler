class BaseView
    tagName:"div"
    constructor:()->
        @$el = $("<#{@tagName}>")
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
    css:"""
        .show-console #consoler {
            width:100%;
        }
        .show-console #consoler .logs { display:block; }
        #consoler { position:fixed;
            overflow:hidden;
            bottom:0;right:0;
            font-size:10px; font-family: Monaco, Consolas;
        }
        #consoler .dialog { margin:10px; border:1px solid #DDD; background:#F9F9F9; border-radius:6px; transition:all .3s; }
        #consoler .logs {display:none;}
        #consoler .logs ul {padding:0; margin:0; list-style:none;}
        #consoler .logs pre {margin:0;}

        #consoler .status {padding:4px 8px; }
        #consoler .status > * {display:inline-block;}

        #consoler .log-item { background:#FFF; border-bottom: 1px solid #E7E7E7; padding: 2px 8px; line-height: 1.4em;}
        #consoler .log-item:first-child { border-radius:4px 4px 0 0; }
        #consoler .log-item.log, #consoler .status .log { color:#666; }
        #consoler .log-item.warn {background: #fffbe6; border-color: #fff4c5; }
        #consoler .log-item.warn, #consoler .status .warn { color:hsl(30, 100%, 60%); }
        #consoler .log-item.info, #consoler .status .info { color:#9CF; }
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
        input
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
    success:()-> @addLog("success", arguments...)
