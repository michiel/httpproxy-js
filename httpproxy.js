//
// Simplified for brevity
//
// See lib/httpproxy.js for module code
//

var net = require('net');
var dns = require('dns');

var LOCAL_PROXY_PORT = 8124;
var LOCAL_PROXY_HOST = "127.0.0.1";

var hostcache = {};

//
// These two functions are just helper junk
//

function extractHost(data) {
  data = data.split(/\r/);
  for (var i=0, line; line=data[i]; i++) {
    if (line.match(/Host:/)) {
      return line.substring(7, line.length);
    } 
  }
}

function resolveHost(host, callback) {
  if (hostcache[host]) {
    callback(host);
  } else {
    dns.lookup(host, function(err, addr) {
        if (err) {
          throw(err);
        } else {
          hostcache[host] = addr;
          callback(addr);
        }
      }
    );
  }
}

net.createServer(function (socket) {
    socket.setNoDelay(true);
    socket.setEncoding("utf8");
    socket.on("data", function (data) {
        resolveHost(extractHost(data), function(host) { 
            var stream = net.createConnection(80, host);
            stream.on("connect", function() {
                stream.write(data);
              });
            stream.on("data", function(resp) {
                socket.write(resp);
              });
            stream.on("end", function() {
                stream.end();
              });
          });
      });
  socket.on("end", function () {
      socket.end();
    });
  }).listen(LOCAL_PROXY_PORT, LOCAL_PROXY_HOST);

