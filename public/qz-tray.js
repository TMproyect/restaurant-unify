
/**
 * QZ Tray Connector
 * @version 2.2.5
 * @file qz-tray.js
 */
var qz = (function() {
    // Private properties
    var _qz = {
        VERSION: "2.2.5",
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
        
        // WebSocket settings
        websocket: {
            /** The actual websocket object managing the connection. */
            connection: null,
            /** Internal tracking of connection status. */
            connected: false,
            /** Internal tracking of if the websocket has been closed. */
            closed: false,
            /** The maximum number of reconnection attempts for websocket. */
            maxRetries: 0,
            /** The milliseconds to wait between reconnection attempts. */
            retryInterval: 0,
            /** The last known value of connected state, used to fire onchange events. */
            lastState: null,
            /** The number of total connection attempts tried so far. */
            attempts: 0,
            /** Connection timeout in milliseconds. */
            connectTimeout: 10000,
            /** Promise tracking the connection attempt. */
            connectPromise: null,
            /** WebSocket error code constants. */
            ERRORS: {
                RECONNECT: { code: 'ECONNECTIONATTEMPTS', message: 'Connection retry limit reached' }
            }
        },
        
        // Stream types
        streams: {
            serial: 'SERIAL', usb: 'USB', hid: 'HID', printer: 'PRINTER', file: 'FILE'
        }
    };
    
    // Public API
    return {
        /**
         * Version of this QZ Tray API
         */
        VERSION: _qz.VERSION,
        
        /**
         * Enable or disable debug mode
         */
        setDebug: function(debug) {
            _qz.DEBUG = debug;
            return this;
        },
        
        /**
         * Returns whether debug mode is enabled
         */
        isDebug: function() {
            return _qz.DEBUG;
        },
        
        /**
         * Initialize the library for use
         */
        api: {
            isActive: function() {
                return _qz.websocket.connection != null && _qz.websocket.connected;
            },
            
            showDebug: function() {
                return _qz.DEBUG;
            }
        },
        
        /**
         * Functions for interacting with the websocket connection
         */
        websocket: {
            /**
             * Setup connection information
             */
            setup: function(config) {
                if (config && typeof config === 'object') {
                    if (config.retries && config.retries > 0) {
                        _qz.websocket.maxRetries = config.retries;
                    }
                    if (config.delay && config.delay > 0) {
                        _qz.websocket.retryInterval = config.delay;
                    }
                    if (config.connectTimeout && config.connectTimeout > 0) {
                        _qz.websocket.connectTimeout = config.connectTimeout;
                    }
                }
                return this;
            },
            
            /**
             * Start connection
             */
            connect: function(options) {
                options = options || {};
                
                if (_qz.websocket.connection != null) {
                    return _qz.websocket.connectPromise || Promise.resolve(_qz.websocket.connection);
                }
                
                if (options.retries) { _qz.websocket.maxRetries = options.retries; }
                if (options.delay) { _qz.websocket.retryInterval = options.delay; }
                
                // Create new connection promise if needed
                _qz.websocket.connectPromise = _qz.websocket.connectPromise || new Promise(function(resolve, reject) {
                    _qz.log.info("Connecting to QZ Tray Websocket");
                    
                    // Reset state tracking
                    _qz.websocket.closed = false;
                    _qz.websocket.attempts = 0;
                    
                    // Start connection attempts
                    function attempt() {
                        _qz.websocket.attempts++;
                        
                        var address = "ws://localhost:8181";
                        var ws = new WebSocket(address);
                        
                        var connectTimeout = setTimeout(function() {
                            _qz.log.info("Connection attempt timed out");
                            ws.close();
                        }, _qz.websocket.connectTimeout);
                        
                        ws.onopen = function() {
                            clearTimeout(connectTimeout);
                            _qz.log.info("Websocket connection established to " + address);
                            
                            _qz.websocket.connection = ws;
                            _qz.websocket.connected = true;
                            
                            // Call listeners
                            if (_qz.websocket.openCallbacks) {
                                _qz.websocket.openCallbacks();
                            }
                            
                            if (_qz.websocket.lastState === false) {
                                _qz.log.info("Connection reestablished");
                            }
                            
                            _qz.websocket.lastState = true;
                            _qz.websocket.connectPromise = null;
                            
                            resolve(ws);
                        };
                        
                        ws.onclose = function() {
                            clearTimeout(connectTimeout);
                            
                            // Handle reconnection if needed
                            if (!_qz.websocket.connected) {
                                _qz.log.info("Retry connection", (_qz.websocket.attempts - 1), "of", _qz.websocket.maxRetries);
                                
                                // Retry if needed
                                if (!_qz.websocket.closed && _qz.websocket.maxRetries >= _qz.websocket.attempts) {
                                    setTimeout(attempt, _qz.websocket.retryInterval);
                                } else {
                                    _qz.log.error("Unable to establish connection with QZ Tray");
                                    _qz.websocket.connectPromise = null;
                                    reject(new Error("Unable to establish connection with QZ Tray"));
                                }
                            } else {
                                _qz.websocket.connection = null;
                                _qz.websocket.connected = false;
                                
                                // Call listeners
                                if (_qz.websocket.closedCallbacks) {
                                    _qz.websocket.closedCallbacks();
                                }
                                
                                if (_qz.websocket.lastState === true) {
                                    _qz.log.info("Connection closed");
                                }
                                
                                _qz.websocket.lastState = false;
                            }
                        };
                        
                        ws.onerror = function(event) {
                            _qz.log.warn("Websocket connection error", event);
                            
                            // Call listeners
                            if (_qz.websocket.errorCallbacks) {
                                _qz.websocket.errorCallbacks(event);
                            }
                        };
                    }
                    
                    attempt();
                });
                
                return _qz.websocket.connectPromise;
            },
            
            /**
             * Disconnect from QZ Tray
             */
            disconnect: function() {
                _qz.websocket.closed = true;
                
                if (_qz.websocket.connection) {
                    _qz.websocket.connection.close();
                    _qz.websocket.connection = null;
                    return true;
                }
                
                return false;
            },
            
            /**
             * Check if currently connected to QZ Tray
             */
            isActive: function() {
                return _qz.websocket.connected && _qz.websocket.connection != null;
            },
            
            // Callback setup
            openCallbacks: null,
            closedCallbacks: null,
            errorCallbacks: null,
            
            /**
             * Set callback for open connection
             */
            setOpenCallbacks: function(callback) {
                _qz.websocket.openCallbacks = callback;
            },
            
            /**
             * Set callback for closed connection
             */
            setClosedCallbacks: function(callback) {
                _qz.websocket.closedCallbacks = callback;
            },
            
            /**
             * Set callback for websocket errors
             */
            setErrorCallbacks: function(callback) {
                _qz.websocket.errorCallbacks = callback;
            }
        },
        
        /**
         * Access to printer functionality
         */
        printers: {
            /**
             * List available printers
             */
            find: function() {
                if (!qz.websocket.isActive()) {
                    return Promise.reject(new Error("No connection to QZ Tray"));
                }
                
                // This is a simplified mock that should be replaced with the actual implementation
                // to communicate with QZ Tray via websocket
                return new Promise(function(resolve) {
                    // Mock response for testing
                    setTimeout(function() {
                        resolve(["Printer 1", "Printer 2", "PDF Printer"]);
                    }, 100);
                });
            },
            
            /**
             * Get default printer
             */
            getDefault: function() {
                if (!qz.websocket.isActive()) {
                    return Promise.reject(new Error("No connection to QZ Tray"));
                }
                
                // This is a simplified mock that should be replaced with the actual implementation
                return new Promise(function(resolve) {
                    // Mock response for testing
                    setTimeout(function() {
                        resolve("Printer 1");
                    }, 100);
                });
            }
        },
        
        /**
         * Heartbeat to maintain connection
         */
        heartbeat: {
            // Heartbeat interval handle
            intervalHandle: null,
            
            start: function(interval) {
                interval = interval || 30000; // Default 30 seconds
                
                if (this.intervalHandle) {
                    this.stop();
                }
                
                this.intervalHandle = setInterval(function() {
                    if (qz.websocket.isActive()) {
                        // Send heartbeat ping
                        console.log("Sending heartbeat to QZ Tray");
                        // In a real implementation, we would send a message to the websocket
                    } else {
                        console.warn("Cannot send heartbeat - no active connection");
                    }
                }, interval);
                
                return this;
            },
            
            stop: function() {
                if (this.intervalHandle) {
                    clearInterval(this.intervalHandle);
                    this.intervalHandle = null;
                }
                return this;
            }
        }
    };
})();

// Notify that the script has been loaded
if (typeof window !== 'undefined') {
    window.qzScriptLoaded = true;
    
    // Dispatch event for any listeners
    try {
        window.dispatchEvent(new CustomEvent('qz-tray-available', { detail: qz }));
        console.log("QZ Tray script loaded and event dispatched successfully");
    } catch (e) {
        console.error("Error dispatching qz-tray-available event:", e);
    }
}
