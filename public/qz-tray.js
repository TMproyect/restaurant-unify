
/**
 * QZ Tray Connector
 * @version 2.2.4
 * @file qz-tray.js
 */
var qz = (function() {
    // Private methods and properties
    var _qz = {
        VERSION: "2.2.4",
        DEBUG: false,

        log: {
            /** Logs message with timestamp to browser console */
            trace: function(msg, ...params) {
                if (_qz.DEBUG) { console.log(msg, ...params); }
            },
            /** Logs error message with timestamp to browser console */
            err: function(msg, err) {
                if (_qz.DEBUG) { 
                    console.error(msg, err);
                    if (err && err.stack) { console.error(err.stack); }
                }
            }
        },

        // WebSocket connection
        websocket: {
            /** Connection timeout in milliseconds */
            connectTimeout: 5000,
            /** Active connection to QZ Tray websocket */
            connection: null,
            /** Connection status */
            connected: false,
            
            /** Establish connection to QZ Tray websocket */
            connect: function(options) {
                options = options || {};
                
                return new Promise(function(resolve, reject) {
                    if (_qz.websocket.connection && _qz.websocket.connected) {
                        resolve(_qz.websocket.connection);
                        return;
                    }
                    
                    var host = options.host || "localhost:8181";
                    var protocol = options.secure === false ? "ws://" : "wss://";
                    var url = protocol + host;
                    
                    _qz.log.trace("Connecting to QZ Tray on " + url);
                    
                    var ws = new WebSocket(url);
                    var connectionTimeout = setTimeout(function() {
                        if (ws.readyState !== WebSocket.OPEN) {
                            ws.close();
                            reject(new Error("Connection to QZ Tray timed out"));
                        }
                    }, _qz.websocket.connectTimeout);
                    
                    ws.onopen = function() {
                        clearTimeout(connectionTimeout);
                        _qz.log.trace("WebSocket connection established to " + url);
                        _qz.websocket.connection = ws;
                        _qz.websocket.connected = true;
                        resolve(ws);
                    };
                    
                    ws.onclose = function() {
                        clearTimeout(connectionTimeout);
                        _qz.log.trace("WebSocket closed");
                        _qz.websocket.connection = null;
                        _qz.websocket.connected = false;
                    };
                    
                    ws.onerror = function(event) {
                        clearTimeout(connectionTimeout);
                        _qz.log.err("WebSocket error", event);
                        _qz.websocket.connection = null;
                        _qz.websocket.connected = false;
                        reject(new Error("Failed to connect to QZ Tray"));
                    };
                });
            },
            
            /** Disconnect from QZ Tray */
            disconnect: function() {
                if (_qz.websocket.connection) {
                    _qz.websocket.connection.close();
                    _qz.websocket.connection = null;
                    _qz.websocket.connected = false;
                }
                return Promise.resolve();
            },
            
            /** Check if connected to QZ Tray */
            isActive: function() {
                return _qz.websocket.connected && _qz.websocket.connection && _qz.websocket.connection.readyState === WebSocket.OPEN;
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
