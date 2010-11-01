/*
 * Simple socket based HTTP proxy for NodeJS
 *
 */

var net = require('net');
var dns = require('dns');

var LOCAL_PROXY_PORT = 8124;
var LOCAL_PROXY_HOST = "127.0.0.1";

var hostcache = {};

var extractHeaders = function(data) {
  var headers = {};
  var lines = data.split(/\r/);
  for (var i=0; i<lines.length; i++) {
    var line = lines[i];
    if (line.match(/Host:/)) {
      headers['host'] = line.substring(6, line.length);
    } 
  }

  return headers;
}

var resolveHost = function(host, callback) {
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

    socket.on("connect", function (socket) {
        console.log("c2p : Connected");
      }
    );

    socket.on("data", function (data) {
        var headers = extractHeaders(data);
        console.log("Host is : " + headers.host);

        resolveHost(headers.host, function(host) { 
          var stream = net.createConnection(80, host);

          stream.on("connect", function() {
              console.log("p2s : connect");
              stream.write(data);
            }
          );

          stream.on("data", function(resp) {
              console.log("p2s : connect");
              socket.write(resp);
            }
          );

          stream.on("end", function() {
              stream.end();
            }
          );
        }
      );
    });

    socket.on("end", function () {
        console.log("c2p : end"); 
        socket.end();
      });

  }).listen(LOCAL_PROXY_PORT, LOCAL_PROXY_HOST);

