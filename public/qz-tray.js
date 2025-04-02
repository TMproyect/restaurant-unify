/**
 * @version 2.2.4
 * @overview QZ Tray Connector
 * <p/>
 * Connects a web client to the QZ Tray software.
 * <p/>
 * Depends:
 *     rsvp.js
 *
 * Copyright (c) 2023 QZ Industries, LLC
 * All rights reserved.
 */

var qz = (function() {
    ///// POLYFILLS /////
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    if (!Number.isInteger) {
        Number.isInteger = function(value) {
            return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
        };
    }

    if (!Object.assign) {
        Object.assignPolyfill = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
        Object.assign = Object.assignPolyfill;
    }


    ///// PRIVATE METHODS /////

    var _qz = {
        VERSION: "2.2.4",                              //must match @version above
        DEBUG: false,

        log: {
            /** Logs message to console if debug is enabled */
            trace: function(msg, ...params) {
                if (_qz.DEBUG) { console.log(msg, ...params); }
            },
            /** Logs message to console if debug is enabled, shows stack trace if available */
            err: function(msg, err) {
                if (_qz.DEBUG) {
                    console.error(msg, err);
                    if(err && err.stack) {
                        console.error(err.stack);
                    }
                }
            },
            /** Sends message to socket to notify of an internal error */
            socketError: function(reason, cause) {
                if (Array.isArray(reason)) {
                    if (typeof reason[0] === 'undefined') {
                        _qz.log.err("Unknown socket error");
                        return;
                    }

                    //... log it
                    _qz.log.err(reason[0], cause);
                    reason = reason[0];
                } else {
                    _qz.log.err(reason, cause);
                }

                //send it
                if (_qz.ws) { _qz.ws.send("closed::" + reason); }
                if (_qz.cfgSocket && _qz.cfgSocket.ws) { _qz.cfgSocket.ws.send("closed::" + reason); }
            }
        },


        //stream types
        streams: {
            serial: 'SERIAL', usb: 'USB', hid: 'HID', printer: 'PRINTER', file: 'FILE', socket: 'SOCKET'
        },

        //websocket statuses
        ws: null, //reference to ws connection
        cfgSocket: {},
        websocketSuccess: false,

        //config for reconnect attempts
        reconnect: {
            time: 0, //time spent reconnecting
            count: 0, //reconnect attempt count
            max: 3, //maximum reconnect attempts
            delay: 5 //seconds before firing next reconnect
        },

        //connection timeout before starting reconnect attempts
        connectTimeout: 5,

        //if users close the websocket through disconnect(), we don't attempt a reconnect
        userClose: false,

        //aliases for device search parameters
        deviceSearchParameters: {
            USB: ['vendorId', 'productId', 'usb', 'usbClass', 'usbSubClass', 'usbProtocol', 'hidUsage', 'hidUsagePage', 'interface'],
            HID: ['vendorId', 'productId', 'usb', 'usbClass', 'usbSubClass', 'usbProtocol', 'hidUsage', 'hidUsagePage', 'interface', 'serial', 'manufacturer'],
            SERIAL: ['vendorId', 'productId', 'usb', 'usbClass', 'usbSubClass', 'usbProtocol', 'hidUsage', 'hidUsagePage', 'interface'],
            SOCKET: ['host', 'port'],
            PRINTER: ['name']
        },

        //aliases for flavors of commands
        printerCommandTypes: {
            RAW: 'RAW', PS: 'PS', PDF: 'PDF', ESCPOS: 'ESCPOS', ZPL: 'ZPL', EPL: 'EPL', BIN: 'BIN', BINARY: 'BINARY'
        },

        //last print options if requested by user
        lastPrintData: null,
        lastPrintRaw: null,
        lastPrintFile: null,

        //default config for new printer connections
        defaultConfig: {
            host: ["localhost", "localhost.qz.io"], //deprecated
            usingSecure: true,
            keepAlive: 60,
            retries: 0,
            delay: 0,
            maxPrinterCallbacks: 1, //permit multiple callbacks before deploy.printers() completes
            usePrinterName: false,
            singlePrinterName: null,
            altPrinting: false,
            alternatePrinter: null,
            recentPrinterName: null
        },

        //list of functions waiting for a connection before running
        connectionQueue: [],

        //stored reference to deployment version
        deployVersion: 0,

        //default timestamp for allowance check
        startTime: 0,
        processingTime: 0, //how long a processing call should take

        //flag for continuous processing call
        processing: false,
        pendingProcessing: false,

        sslH: "wss://",
        encryption: null,
        signature: null,
        certificateSha1: null,
        certificatePromise: null,

        //config for file saving purposes
        //assigned in qz.api.setSaveLocation
        savePath: "",
        saveFile: [], //array of JSON objects - only used when savePath is not set
        saveBuffer: [], //array of data entries
        trigger: null, //response for closing saveBuffer

        //config for cookie saving purposes
        //assigned in qz.api.setCookie
        cookiePath: "",
        cookieParams: [],
        cookieSaved: false
    };

    /** Gets the RSVP API. */
    function getRsvpApi() {
        if (typeof RSVP !== 'undefined') {
            _qz.log.trace("Using global RSVP");
            return RSVP;
        }
        try {
            _qz.log.trace("Using imported RSVP");
            return require('rsvp');
        }
        catch(e) {
            _qz.log.warn("RSVP not found");
            return null;
        }
    }

    var RSVP = getRsvpApi();

    /**
     * Internal mapping of common boolean strings
     */
    function isBool(val) {
        if (!val) { return false; }
        return (val === true || val === 'true');
    }

    /** Determine if value is in suppressible range */
    function isSuppressible(params, opt) {
        return params[opt.def] !== undefined && opt.suppressible !== undefined && params[opt.suppressible] !== undefined && isBool(params[opt.suppressible]);
    }

    /** Get the dominant value */
    function getDominant(params, opt) {
        if (isSuppressible(params, opt)) {
            return isBool(params[opt.suppressible]) ? params[opt.def] : undefined;
        }
        return params[opt.def];
    }

    /** Get the default value if not set */
    function getDefaults(params, opt) {
        return params[opt.def] !== undefined ? params[opt.def] : opt.defValue;
    }

    /** Perform deep copy of a parameter if set */
    function copyProperty(params, opt, copy) {
        if (params[opt.name] !== undefined) {
            copy[opt.name] = opt.type === 'object' ? Object.assign({}, params[opt.name]) : (opt.type === 'array' ? params[opt.name].slice() : params[opt.name]);
        }
    }

    /** Perform deep copy of a parameter (possibly scaling) */
    function copyPropertyScale(params, opt, copy) {
        if (params[opt.name] !== undefined) {
            copy[opt.name] = opt.type === 'object' ? Object.assign({}, params[opt.name]) : params[opt.name];
            if (typeof copy[opt.name] === 'number') {
                if (copy[opt.name] >= 1) {
                    copy[opt.name] /= opt.scaling;
                }
            }
        }
    }

    /** Promise resolver for handling Function objects */
    function newPromise(toResolve, processor) {
        return new RSVP.Promise(function(resolve, reject) {
            try {
                resolve(processor ? processor(toResolve) : toResolve);
            }
            catch(err) {
                reject(err);
            }
        });
    }

    /** Promise resolver for handling Function objects */
    function processPrinter(toProcess) {
        if (toProcess !== undefined) {
            if (typeof toProcess === 'function') {
                return toProcess();
            }
            return toProcess;
        }
        return null;
    }

    /** Attempt to parse string as JSON, otherwise return string */
    function parse(obj) {
        if(obj === undefined) { return null; }
        try {
            return JSON.parse(obj);
        }
        catch(err) {
            return obj;
        }
    }

    /** Make a unique id to identify a call in the websocket logs */
    function uuid() {
        return Math.floor((1 + Math.random()) * 0x100000)
            .toString(16)
            .substring(1);
    }

    /** Checks whether a given string is invalid unicode */
    function isUnicode(input) {
        return input && input.length && input.substring
            && input.substring(0, 2) == '\\u'
            && input.length >= 6;
    }

    /** Converts a unicode prompt to ascii */
    function unicodeToAscii(input) {
        return isUnicode(input) ?
            String.fromCharCode(parseInt(input.substring(2), 16)) : input;
    }

    /** Converts unicode array to ascii array */
    function unicodeToAsciiArray(data) {
        if (_qz.tools.isArray(data)) {
            for(var i = 0; i < data.length; i++) {
                if (typeof data[i] === 'object') {
                    data[i] = unicodeToAsciiArray(data[i]);
                } else {
                    data[i] = unicodeToAscii(data[i]);
                }
            }
            return data;
        }
        return unicodeToAscii(data);
    }

    /** Default error handler */
    function handleError(err) {
        return err;
    }

    /** Performs deep copy to target fromt src */
    function deepCopy(src, target) {
        for(var prop in src) {
            if(src.hasOwnProperty(prop)) {
                if(prop === "__type__") { continue; }
                if(Array.isArray(src[prop])) {
                    target[prop] = src[prop].slice();
                } else if(typeof src[prop] === "object" && src[prop] !== null) {
                    if(target[prop] === undefined) { target[prop] = {}; }
                    deepCopy(src[prop], target[prop]);
                } else {
                    target[prop] = src[prop];
                }
            }
        }
    }

    /** Chained API calls with RSVP Promises. */
    function _chain(callback, args, linkData, repeatCall) {
        //ensure RSVP is loaded
        if (!RSVP) {
            throw new Error("RSVP not loaded. Cannot support chaining calls. See qz.api.setPromiseType");
        }

        //use reference to saved callback if provided
        if (typeof callback === 'string') {
            if (_qz.api.callbacks[callback]) {
                callback = _qz.api.callbacks[callback];
            } else {
                throw new Error("Cannot find saved callback: " + callback);
            }
        }

        //setup mapping for argument reassignment
        if (typeof args !== 'object' && typeof args !== 'function') {
            if (args !== undefined) {
                args = [args];
            } else {
                args = [];
            }
        }

        var data = linkData !== undefined ? linkData : {};

        //create promise-compatible function
        var chainFunc;
        if (typeof callback === 'function') {
            chainFunc = function invokeCallbackFromChain() {
                return callback.apply(this, args);
            };
        } else {
            chainFunc = function convertCallbackFromChain() {
                return callback;
            };
        }

        //determine whether to use the same call parameters
        var promise;
        if (repeatCall && typeof repeatCall === 'number' && repeatCall > 0) {
            promise = new RSVP.Promise(function(resolve, reject) {
                chainFunc().then(function(result) {
                    //successful; include as chain data but also bump repetition counter
                    data = { data: result, count: repeatCall - 1 };
                    resolve(data);
                }, function(err) {
                    //failed; include as chain data but don't bump counter
                    data = { error: err, count: repeatCall };
                    resolve(data);
                });
            });
        } else {
            promise = newPromise(chainFunc());
        }

        //return promise for incoming calls to chain together
        return promise;
    }

    /** FireFox 61+ compatibility bridge for createImageBitmap */
    if (typeof window !== 'undefined' && window.navigator && navigator.userAgent && navigator.userAgent.match(/Firefox\/([^ )]+)/)) {
        var matches = navigator.userAgent.match(/Firefox\/([^ )]+)/);
        if (matches[1] && parseFloat(matches[1]) >= 61.0) {
            if (typeof window.createImageBitmap === 'function' && !window.TouchEvent) {
                //ensure createImageBitmap properly applies options
                window._createImageBitmap = window.createImageBitmap;
                window.createImageBitmap = function(imageData, ...args) {
                    //extract potential options
                    let opts;
                    const lastArg = args[args.length - 1];
                    if (args.length !== 0 && lastArg !== undefined && typeof lastArg === 'object'
                        && (lastArg.imageOrientation !== undefined || lastArg.premultiplyAlpha !== undefined
                            || lastArg.colorSpaceConversion !== undefined || lastArg.resizeWidth !== undefined
                            || lastArg.resizeHeight !== undefined || lastArg.resizeQuality !== undefined)) {
                        opts = lastArg;
                        args.pop();
                    }

                    //if no options or options have no effect, fire as-is
                    if (!opts || opts.premultiplyAlpha !== "none") {
                        return window._createImageBitmap.apply(this, [imageData, ...args]);
                    }

                    //for premultiplyAlpha=none we need to do some hacky canvas pushing
                    return new Promise(function(resolve, reject) {
                        window._createImageBitmap.apply(this, [imageData, ...args]).then(img => {
                            var canvas = document.createElement('canvas');
                            canvas.width = img.width; canvas.height = img.height;
                            const ctx = canvas.getContext('2d');

                            ctx.drawImage(img, 0, 0);
                            img && img.close && img.close();

                            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            for(let i = 0; i < imgData.data.length; i += 4) {
                                if (imgData.data[i + 3] === 0) {
                                    imgData.data[i] = 0; imgData.data[i + 1] = 0; imgData.data[i + 2] = 0;
                                }
                            }
                            ctx.putImageData(imgData, 0, 0);
                            window._createImageBitmap.apply(this, [canvas, 0, 0, canvas.width, canvas.height]).then(bitmap => {
                                //hacky firefox workaround when nested inside a canvas element
                                Object.defineProperty(bitmap, 'width', { writable: false, value: img.width });
                                Object.defineProperty(bitmap, 'height', { writable: false, value: img.height });
                                resolve(bitmap);
                            }, function(e) {
                                reject(e);
                            });
                        }, function(e) {
                            reject(e);
                        });
                    });
                };
                _qz.log.trace("Applied Firefox createImageBitmap fix");
            }
        }
    }

    /**
     * Reset API to appropriate defaults
     */
    function resetMethods() {
        this.api = _qz.api = {
            edition: null,
            title: null,
            version: {},
            /** Method called for handling promises. Defaults to RSVP's thennable Promise object */
            dispatchPromise: function(resolve, reject) {
                resolve(new RSVP.Promise(function(fulfill, deny) { resolve = fulfill; reject = deny; }));

                return { resolve: resolve, reject: reject };
            },
            /** The promise type used by this API */
            promiseType: function() {
                return "RSVP";
            },
            /**
             * Set the promise implementation used by this API.
             *  Implementations include 'RSVP' (default), 'Q', and 'Angular'
             */
            setPromiseType: function(implType) {
                //Verify a valid implType value (location.search/hash will have a "?" or "#")
                var validImpl = true;

                switch(implType) {
                    case 'esPromise':
                    case 'RSVP':
                    case 'Q':
                    case 'Angular':
                        break;
                    default:
                        validImpl = false;
                        break;
                }

                if (validImpl) {
                    _qz.api.dispatchPromise = function(resolve, reject) {
                        //purposely no "break" statements here to have inheritence
                        switch(implType) {
                            case 'esPromise':
                                resolve(new Promise(function(fulfill, deny) { resolve = fulfill; reject = deny; }));
                                break;
                            case 'RSVP':
                                resolve(new RSVP.Promise(function(fulfill, deny) { resolve = fulfill; reject = deny; }));
                                break;
                            case 'Q':
                                var Q = _qz.tools.ws.getVariable('Q');
                                var q = Q ? Q.defer() : { resolve: resolve, reject: reject };
                                resolve(q.promise);
                                resolve = q.resolve;
                                reject = q.reject;
                                break;
                            case 'Angular':
                                var $q = _qz.tools.ws.getVariable('$q');
                                if ($q) {
                                    var q = $q.defer();
                                    resolve(q.promise);
                                    resolve = q.resolve;
                                    reject = q.reject;
                                }
                                break;
                        }

                        return { resolve: resolve, reject: reject };
                    };

                    _qz.api.promiseType = function() {
                        return implType;
                    };

                    _qz.log.trace("Promise type: " + implType);
                    return true;
                }

                return false;
            },

            /**
             * Initialize the library, returning a Promise once completed.
             * @returns {Promise<null|Error>}
             */
            api: function() {
                return _qz.websocket.init();
            },

            /**
             * Check connection status to QZ Tray.
             *
             * @param {Object} [params] - Object containing WebSocket parameters.
             *  @param {String|Array<String>} [params.host=[window.location.host, "localhost.qz.io"]] - Set of host addresses to try
             *  @param {Object} [params.port=[8181, 8282, 8383, 8484]] - Set of ports to try
             *  @param {boolean} [params.usingSecure=true] - If the page is using secure content, i.e. HTTPS
             *  @param {boolean} [params.forceLocal=false] - Whether to allow connections to hosts other than 127.0.0.1/localhost
             *
             * @returns {Promise<Object>} Response object from the websocket capable of lazy authentication.
             *
             * @memberof qz.api
             */
            isActive: function(params) {
                //backward compatibility
                if (typeof params === 'boolean') {
                    _qz.log.warn("Boolean isActive() is deprecated. Please use config object instead.");
                    params = { usingSecure: params };
                } else if (params !== undefined && typeof params !== 'object') {
                    _qz.log.warn("Unrecognized parameter for isActive(): " + params);
                    params = undefined;
                }

                var param = params;

                return _qz.tools.promise(function(resolve, reject) {
                    var result = _qz.websocket.isActive(param);
                    result ? resolve(result) : reject(result);
                });
            },

            /**
             * Start connection with QZ Tray using previously configured parameters
             *
             * @returns {Promise<null|Error>}
             *
             * @memberof qz.api
             */
            connect: function() {
                return _qz.websocket.connect();
            },

            /**
             * Close active connection with QZ Tray.
             *
             * @returns {Promise<null|Error>}
             *
             * @memberof qz.api
             */
            disconnect: function() {
                return _qz.websocket.disconnect();
            },

            /**
             * List all available printers connected to this computer.
             * The QZ Tray 2.0.4+ data type is Object with the structure:
             *   <pre><code>{
             *     driver: String, //printer driver name
             *     name: String, //formatted name connected to this computer
             *     connection: String, //connection name, usually port
             *     alternate: Boolean, //whether this is an alternate name for the same printer
             *     default: Boolean, //whether this is the default printer
             *     density: {
             *       cross: Number, //cross feed density, constituting dots/mm
             *       feed: Number, //feed density, constituting dots/mm
             *       same: Boolean //whether feed and cross are the same density
             *     },
             *     precision: {
             *       cross: Number, //precision 0-9 in the cross feed, 0 means unknown
             *       feed: Number, //precision 0-9 in the feed, 0 means unknown
             *       same: Boolean //whether feed and cross have the same precision
             *     },
             *     reports: {
             *       dpix: Number, //dots per inch in the cross direction
             *       dpiy: Number, //dots per inch in the feed direction
             *       physicalWidth: Number, //physical dimensions in mm
             *       physicalHeight: Number //physical dimensions in mm
             *     }
             *   }</code></pre>
             *
             * @returns {Promise<Object[]|Error>} The array of printer objects.
             *
             * @memberof qz.api
             */
            printers: function() {
                return _qz.websocket.dataPromise('printers');
            },

            /**
             * List name of default printer.
             * @returns {Promise<String|Error>}
             *
             * @since 2.0.3
             * @memberof qz.api
             */
            defaultPrinter: function() {
                return _qz.websocket.dataPromise('defaultPrinter');
            },

            /**
             * List of file system information, such as FILESEP
             * @returns {Promise<Object|Error>}
             *
             * @since 2.0.5
             * @memberof qz.api
             */
            getFileInfo: function() {
                return _qz.websocket.dataPromise('getFileInfo');
            },

            /**
             * Returns the output of <code>java.lang.System.getProperty()</code>
             * @param propertyName the name of the Java system property
             * @returns {Promise<String|Error>}
             *
             * @since 2.1.0
             * @memberof qz.api
             */
            getSystemProperty: function(propertyName) {
                return _qz.websocket.dataPromise('getSystemProperty', {property: propertyName});
            },

            /**
             * Returns an array of all Java system properties
             * @returns {Promise<Object|Error>}
             *
             * @since 2.1.0
             * @memberof qz.api
             */
            getSystemProperties: function() {
                return _qz.websocket.dataPromise('getSystemProperties');
            },

            /**
             * Returns information about the QZ Tray version and connected printer capabilities
             * @param {string|Object} [printer] - printer or printer name
             * @returns {Promise<Object|Error>}
             *
             * @since 2.2.0
             * @memberof qz.api
             */
            getNetworkInfo: function(printer) {
                var params = {};
                if (printer) { params.printer = printer; }
                return _qz.websocket.dataPromise('getNetworkInfo', params);
            },

            /**
             * Return the string representation of the Connected Device Information<p>
             * String format is model,serialNumber</p>
             * @param {Object} [params] - Connection parameters.
             *  @param {string} [params.deviceType] Device type, one of {@link qz.streams}.  Defaults to &quot;usb&quot;.
             *  @param {string} [params.endpoint] Specific hardware endpoint to find value in
             *  @param {string} [params.vendor] USB vendor ID. Required for importing.
             *  @param {string} [params.product] USB product ID. Required for importing.
             *  @param {boolean} [params.mock] If the function should return a mocked out map of devices keys<->values
             * @returns {Promise<Array<Object>|Error>}
             * @memberof qz.api
             * @since 2.1.0
             */
            getConnectedDevices: function(params) {
                return _qz.websocket.dataPromise('getConnectedDevices', params);
            },

            /**
             * List of functions called for various tasks.
             * @mixin
             *
             * @memberof qz.api
             */
            callbacks: {
                /** Function called when error is returned. */
                error: handleError,

                /** Called after receiving and processing list of printers */
                printerList: null,
                /** Called after receiving particular printer status */
                printerStatus: null,
                /** Function called when network info is returned. */
                networkInfo: null,
                /** Function called when receiving info about the filesystem */
                fileInfo: null,
                /** Function called when receiving info about a system property */
                systemInfo: null,
                /** Function called when receiving info about the connected USB devices */
                usbInfo: null,

                /** Called when receiving display's UID */
                displayUID: null,
                /** Called when display is removed */
                displayRemoved: null
            },

            /**
             * Settings to control certificate retrieval.
             * @mixin
             *
             * @memberof qz.api
             * @since 2.0.4
             */
            security: {
                /**
                 * Indicates how communication with the newer versions of QZ Tray
                 * will be established.
                 *
                 * @param {Object} [options] - Object containing security details.
                 *  @param {boolean|string} [options.signed=true] - Enable certificate usage for signed editions of QZ Tray. Valid values: true, false, 'updatekeys', 'verifypeer'
                 *  @param {string} [options.host="localhost.qz.io"] - Host to validate against (domain or IP)
                 *
                 * @returns {Promise<null|Error>}
                 *
                 * @see <a href="https://qz.io/wiki/2.0-tls-options">https://qz.io/wiki/2.0-tls-options</a>
                 */
                setCertificatePromise: function(options) {
                    return _qz.tools.promise(function(resolve, reject) {
                        try {
                            _qz.security.setCertificate(options, resolve);
                        }
                        catch(e) {
                            reject(e);
                        }
                    });
                }
            },

            /**
             * Set the promise library to use.
             * Should be called before any initialization to avoid possible errors.
             *
             * @param {string} promiseLib - The name of the promise library to use for internal QZ Tray calls.
             *  @returns {boolean}
             *
             * @see qz.api.setPromiseType
             * @memberof qz.api
             */
            setPromiseLib: function(promiseLib) {
                return _qz.api.setPromiseType(promiseLib);
            },

            /**
             * Used to save a reference to an HTML button being clicked.
             * This is primarly used by the Java certificate.
             *
             * @param buttonRef - The HTML button being referenced.
             *
             * @memberof qz.api
             */
            setPromiseReference: function(buttonRef) {
                _qz.security.callbackRef = buttonRef;
            },

            /**
             * Get the version of socket.js loaded. Not the same as QZ Tray version.
             *
             * @returns {string} Version of socket.js file.
             *
             * @memberof qz.api
             */
            getVersion: function() {
                return _qz.VERSION;
            },

            /**
             * Get the version of QZ Tray installed.
             *
             * @returns {Promise<string|Error>}
             *
             * @memberof qz.api
             */
            getQZVersion: function() {
                return _qz.websocket.dataPromise('getVersion');
            },

            /**
             * Allows a promise of a WebSocket connection to QZ Tray to be shared across functions.
             *
             * Used by internal calls to maintain connection state.
             * Can also be used by API users to force their own connection instances to share the same singularity as the API.
             * Useful for gateway applications that need a single connection reference.
             *
             * @param {Promise<websocket>|null} sharedConnection - Promise of the WebSocket connection, or null to clear the saved value.
             *
             * @memberof qz.api
             */
            setWebsocket: function(sharedConnection) {
                _qz.tools.ws.connection = sharedConnection;
            },

            /**
             * Allows a promise of an open WebSocket connection to QZ Tray to be shared across functions sharing the same singularity.
             * Only useful in conjunction with calls to <code>qz.api.setWebsocket(...)</code>
             *
             * Used by internal calls to maintain connection state.
             * Can also be used by API users to force their own connection instances to share the same singularity as the API.
             * Useful for gateway applications that need a single connection reference.
             *
             * @param {Promise<open-websocket>|null} connection - Promise of an open WebSocket connection, or null to clear the saved value.
             *
             * @memberof qz.api
             */
            setWebsocketActive: function(connection) {
                _qz.tools.ws.connection.full = connection;
            },

            /**
             * @param {boolean} debug - Whether to enable development logging.
             *
             * @memberof qz.api
             */
            setDebug: function(debug) {
                _qz.DEBUG = debug;
            },

            /**
             * @returns {boolean} Whether debugging is turned on.
             *
             * @memberof qz.api
             */
            getDebug: function() {
                return _qz.DEBUG;
            }
        };


        /**
         * Calls related to compatibility adjustments
         * @namespace qz.compatibility
         * @since 2.0.5
         */
        this.compatibility = _qz.compatibility = {
            /**
             * Allows adjustments to the way Certificates are understood by QZ Tray.
             *
             * @param {Object} params - Object containing compatibility options.
             *  @param {string} [params.ca] - Specify a CA to use (or append) for signing purposes.
             *  @param {boolean} [params.warnMultiple] - Whether to warn about multiple certificates.
             *
             * @memberof qz.compatibility
             */
            setCertificationCompatibility: function(params) {
                if (params.warnMultiple !== undefined) { _qz.compatibility.warnMultiple = params.warnMultiple; }
                if (params.ca !== undefined) {
                    if (typeof params.ca === "string") {
                        _qz.compatibility.caCerts.push(params.ca);
                    } else if(Array.isArray(params.ca)) {
                        _qz.compatibility.caCerts = _qz.compatibility.caCerts.concat(params.ca);
                    } else {
                        _qz.log.warn("Unknown CA Type:", params.ca);
                    }
                }
            },

            /**
             * Gets the current array of extra CA's.
             * @returns {Array<String>}
             *
             * @memberof qz.compatibility
             */
            getCertificationCompatibility: function() {
                return {
                    warnMultiple: _qz.compatibility.warnMultiple,
                    ca: _qz.compatibility.caCerts
                }
            },

            /**
             * Set the algorithm used for key signatures.
             *
             * @param {string} algorithm - Algorithm used for websocket signing.
             *  @returns {boolean}
             *
             * @memberof qz.compatibility
             */
            setSignatureAlgorithm: function(algorithm) {
                return _qz.compatibility.setAlgorithm(algorithm);
            }
        };

        /**
         * Calls related to getting data from
