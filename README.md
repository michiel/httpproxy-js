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

    proxy.start();


For starting multiple proxies,


    var httpproxy = require('httpproxy').proxy;
  
    var proxies = [];

    for (var port=4000; port<4010; port++) {
      proxies.push(
        new httpproxy({
            host : '127.0.0.1',
            port : port
          })
      );
    }
  
    proxies.map(function(p) {
        p.start();
      });
  

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



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/michiel/httpproxy-js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

