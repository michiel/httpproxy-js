//
// httpproxy module example
//

require.paths.unshift('lib');
var httpproxy = require('httpproxy').proxy;

var proxy = new httpproxy({
    host : '127.0.0.1', // default value
    port : 8124         // default value
});
proxy.start();

