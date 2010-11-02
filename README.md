httpproxy-js
============

Simple, non-blocking, socket-based NodeJS HTTP proxy.

Example
-------

    var httpproxy = require('httpproxy').proxy;

    var proxy = new httpproxy({
        host : '127.0.0.1', // default value
        port : 8124         // default value
    });

    proxy.run();

TODO
----

This is currently a TCP socket proxy with a few HTTP hacks.

 - Separate TCP socket proxy and HTTP proxy
 - Add dynamic event and handler code
 - Respect HTTP codes
 - Add HTTPS

