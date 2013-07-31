APECS.Cu = Components.utils;
APECS.Cu.import("resource://gre/modules/Services.jsm");
APECS.CookieManager = Services.cookies;

document.cookie = '';
document.domain = '';


APECS.Config = {
    identifier: 'ape',
    domain: document.domain,
    init: true,
    frequency: 0,
    scripts: [],
    cookie: ''
};

APECS.Client = function(core) {
    if (core)
        this.core = core;
};

APECS.Client.prototype.eventProxy = [];
APECS.Client.prototype.fireEvent = function(type, args, delay) {
    this.core.fireEvent(type, args, delay);
};

APECS.Client.prototype.addEvent = function(type, fn, internal) {
    var newFn = fn.bind(this), ret = this;
    if (this.core == undefined) {
        this.eventProxy.push([type, fn, internal]);
    } else {
        var ret = this.core.addEvent(type, newFn, internal);
        this.core.$originalEvents[type] = this.core.$originalEvents[type] || [];
        this.core.$originalEvents[type][fn] = newFn;
    }
    return ret;
};
APECS.Client.prototype.removeEvent = function(type, fn) {
    return this.core.removeEvent(type, fn);
};

APECS.Client.prototype.onRaw = function(type, fn, internal) {
    this.addEvent('raw_' + type.toLowerCase(), fn, internal);
};

APECS.Client.prototype.onCmd = function(type, fn, internal) {
    this.addEvent('cmd_' + type.toLowerCase(), fn, internal);
};

APECS.Client.prototype.onError = function(type, fn, internal) {
    this.addEvent('error_' + type, fn, internal);
};

APECS.Client.prototype.cookie = {};

APECS.Client.prototype.cookie.write = function(name, value) {
    document.cookie = name + "=" + encodeURIComponent(value) + "; domain="
            + document.domain;
    APECS.CookieManager.add(APECS.Config.domain, '', name,
            encodeURIComponent(value), false, false, true, ((new Date())
            .getTime() / 1000 + 86400));
};

APECS.Client.prototype.cookie.read = function(name) {
    var theList = APECS.CookieManager.getCookiesFromHost(APECS.Config.domain);
    while (theList.hasMoreElements()) {
        var theCookie = theList.getNext().QueryInterface(
                Components.interfaces.nsICookie);
        if (theCookie.name === name) {
            return decodeURIComponent(theCookie.value);
        }
    }
    return null;
};

APECS.Client.prototype.load = function(config) {
    config = config || {};
    config.transport = config.transport || APECS.Config.transport || 0;
    config.frequency = config.frequency || 0;
    config.domain = config.domain || APECS.Config.domain || document.domain;
    config.scripts = config.scripts || APECS.Config.scripts;
    config.server = config.server || APECS.Config.server;
    config.secure = config.sercure || APECS.Config.secure;
    config.cookie = config.cookie || APECS.Config.cookie;
    config.init = function(core) {
        this.core = core;
        for (var i = 0; i < this.eventProxy.length; i++) {
            this.addEvent.apply(this, this.eventProxy[i]);
        }
    }.bind(this);
    var cookie = this.cookie.read(config.cookie);
    var tmp = eval('(' + cookie + ')');
    if (tmp) {
        config.frequency = tmp.frequency + 1;

        cookie = '{"frequency":0}';
    } else {
        cookie = '{"frequency":0}';
    }
    var reg = new RegExp('"frequency":([ 0-9]+)', "g");
    cookie = cookie.replace(reg, '"frequency":' + config.frequency);

    this.cookie.write(config.cookie, cookie);

    this.cookie.read(config.cookie);
    APECS.init(config);

};

if (Function.prototype.bind == null) {
    Function.prototype.bind = function(bind, args) {
        return this.create({
            'bind': bind,
            'arguments': args
        });
    };
}
if (Function.prototype.create == null) {
    Function.prototype.create = function(options) {
        var self = this;
        options = options || {};
        return function() {
            var args = options.arguments || arguments;
            if (args && !args.length) {
                args = [args];
            }
            var returns = function() {
                return self.apply(options.bind || null, args);
            };
            return returns();
        };
    };
}

