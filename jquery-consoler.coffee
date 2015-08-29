class BaseView
    tagName:"div"
    constructor:()->
        @$el = $("<#{@tagName}>", {class: @className or "", id:@id or null})
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
    className: ""
    initialize:()->
        @render() 
        @$el.appendTo($("body"))
    show:()->
        $body = $("body").addClass("show-console")
        @scrollToBottom()
    hide:()->
        $("body").removeClass("show-console")
    template: """
        <div class="dialog-mask">
            <div class="dialog">
                <div class="logs">
                    <ul class="logs-body"></ul>
                </div>
                <div class="input"></div>
            </div>
        </div>
        <div class="status">
            <span class="desc">Logs:</span>
        </div>
    """
    parseLog:(input)->
        # console.debug "parseLog", input
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
        # console.debug args,text
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
    # wrapNative:()->
    #     methods = ["log", "warn", "error", "info", "debug"]
    #     console = window.console || {}
    #     for method in methods
    #         console[method] = ()=>
    #             @[method].bind(@)(arguments...)
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
        return null
        # @view.setStyle()



    log:()-> @addLog("log", arguments...)
    warn:()-> @addLog("warn", arguments...)
    error:()-> @addLog("error", arguments...)
    info:()-> @addLog("info", arguments...)
    debug:()-> @addLog("debug", arguments...)
