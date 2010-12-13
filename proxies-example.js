//
// httpproxy module example
//

require.paths.unshift('lib');
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

