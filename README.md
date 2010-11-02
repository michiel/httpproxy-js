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

When running the proxy, try,

    ~/$ http_proxy=localhost:8124 curl http://www.yahoo.com -o - 

if you want your terminal filled with junk.

TODO
----

This is currently a TCP socket proxy with a few HTTP hacks.

 - Separate TCP socket proxy and HTTP proxy
 - Add dynamic event and handler code
 - Respect HTTP codes
 - Add HTTPS

