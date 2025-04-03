
/**
 * QZ Tray Connector
 * @version 2.2.5-SNAPSHOT
 * @file qz-tray.js
 */
var qz = (function() {
    // Private methods and properties
    var _qz = {
        VERSION: "2.2.5-SNAPSHOT",
        DEBUG: false,

        log: {
            /** Debugging messages */
            trace: function() { if (_qz.DEBUG) { console.log.apply(console, arguments); } },
            /** General messages */
            info: function() { console.info.apply(console, arguments); },
            /** General warnings */
            warn: function() { console.warn.apply(console, arguments); },
            /** Debugging errors */
            allay: function() { if (_qz.DEBUG) { console.warn.apply(console, arguments); } },
            /** General errors */
            error: function() { console.error.apply(console, arguments); }
        },
        
        //stream types
        streams: {
            serial: 'SERIAL', usb: 'USB', hid: 'HID', printer: 'PRINTER', file: 'FILE', socket: 'SOCKET'
        },
        
        websocket: {
            /** The actual websocket object managing the connection. */
            connection: null,
            /** Track if a connection attempt is being cancelled. */
            shutdown: false,
            /** Default parameters used on new connections. Override values using options parameter on {@link qz.websocket.connect}. */
            connectConfig: {
                host: ["localhost", "localhost.qz.io"], //hosts QZ Tray can be running on
                hostIndex: 0,                           //internal var - index on host array
                usingSecure: true,                      //boolean use of secure protocol
                protocol: {
                    secure: "wss://",                   //secure websocket
                    insecure: "ws://"                   //insecure websocket
                },
                port: {
                    secure: [8181, 8282, 8383, 8484],   //list of secure ports QZ Tray could be listening on
                    insecure: [8182, 8283, 8384, 8485], //list of insecure ports QZ Tray could be listening on
                    portIndex: 0                        //internal var - index on active port array
                },
                keepAlive: 60,                          //time between pings to keep connection alive, in seconds
                retries: 0,                             //number of times to reconnect before failing
                delay: 0                                //seconds before firing a connection
            },
            
            /** Establish connection to QZ Tray websocket */
            connect: function(options) {
                options = options || {};
                
                return new Promise(function(resolve, reject) {
                    if (_qz.websocket.connection && _qz.websocket.connection.readyState == WebSocket.OPEN) {
                        resolve(_qz.websocket.connection);
                        return;
                    }
                    
                    var host = options.host || "localhost:8181";
                    var protocol = options.secure === false ? "ws://" : "wss://";
                    var url = protocol + host;
                    
                    _qz.log.trace("Connecting to QZ Tray on " + url);
                    
                    var ws = new WebSocket(url);
                    var connectTimeout = setTimeout(function() {
                        if (ws.readyState !== WebSocket.OPEN) {
                            ws.close();
                            reject(new Error("Connection to QZ Tray timed out"));
                        }
                    }, _qz.websocket.connectConfig.keepAlive * 1000);
                    
                    ws.onopen = function() {
                        clearTimeout(connectTimeout);
                        _qz.log.trace("WebSocket connection established to " + url);
                        _qz.websocket.connection = ws;
                        resolve(ws);
                    };
                    
                    ws.onclose = function() {
                        clearTimeout(connectTimeout);
                        _qz.log.trace("WebSocket closed");
                        _qz.websocket.connection = null;
                    };
                    
                    ws.onerror = function(event) {
                        clearTimeout(connectTimeout);
                        _qz.log.error("WebSocket error", event);
                        _qz.websocket.connection = null;
                        reject(new Error("Failed to connect to QZ Tray"));
                    };
                });
            },
            
            /** Disconnect from QZ Tray */
            disconnect: function() {
                if (_qz.websocket.connection) {
                    _qz.websocket.connection.close();
                    _qz.websocket.connection = null;
                }
                return Promise.resolve();
            },
            
            /** Check if connected to QZ Tray */
            isActive: function() {
                return _qz.websocket.connection && _qz.websocket.connection.readyState === WebSocket.OPEN;
            }
        },
        
        // Print methods
        printers: {
            /** Get list of printers connected to QZ Tray */
            find: function() {
                return _qz.websocket.connection ? new Promise(function(resolve, reject) {
                    if (!_qz.websocket.isActive()) {
                        reject(new Error("No connection to QZ Tray"));
                        return;
                    }
                    
                    // Implement actual websocket call
                    // This is a simplified mock version
                    resolve([]);
                }) : Promise.reject(new Error("No connection to QZ Tray"));
            },
            
            /** Get default printer */
            getDefault: function() {
                return _qz.websocket.connection ? new Promise(function(resolve, reject) {
                    if (!_qz.websocket.isActive()) {
                        reject(new Error("No connection to QZ Tray"));
                        return;
                    }
                    
                    // Implement actual websocket call
                    // This is a simplified mock version
                    resolve("");
                }) : Promise.reject(new Error("No connection to QZ Tray"));
            }
        }
    };
    
    // Public API
    return {
        /** Connect to QZ Tray */
        websocket: {
            connect: function(options) {
                return _qz.websocket.connect(options);
            },
            disconnect: function() {
                return _qz.websocket.disconnect();
            },
            isActive: function() {
                return _qz.websocket.isActive();
            },
            /** Set up callbacks for websocket status changes */
            setOpenCallbacks: function(callback) {
                _qz.websocket.openCallbacks = callback || function() {};
            },
            setClosedCallbacks: function(callback) {
                _qz.websocket.closedCallbacks = callback || function() {};
            },
            setErrorCallbacks: function(callback) {
                _qz.websocket.errorCallbacks = callback || function() {};
            }
        },
        /** Printer operations */
        printers: {
            find: function() {
                return _qz.printers.find();
            },
            getDefault: function() {
                return _qz.printers.getDefault();
            }
        },
        /** Enable/disable debug mode */
        setDebug: function(debug) {
            _qz.DEBUG = debug;
        }
    };
})();

// Let any listeners know QZ is loaded
if (typeof window !== 'undefined') {
    window.qzScriptLoaded = true;
    try {
        window.dispatchEvent(new CustomEvent('qz-tray-available', { detail: qz }));
        console.log("QZ Tray script loaded and event dispatched successfully");
    } catch (e) {
        console.error("Error dispatching qz-tray-available event:", e);
    }
}
