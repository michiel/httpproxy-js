var net = require('net');
var dns = require('dns');

//
// Local vars
//

var hostcache = {};
var logging   = true;

var LOCAL_PORT_DEFAULT = 8124;
var LOCAL_HOST_DEFAULT = "127.0.0.1";

//
// Helper functions
//

var log = function(msg) {
  logging && console.log("httpproxy : " + msg);
}

//
// Currently only using 'Host:' to determine where to bounce the request to
//

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

//
// Exports
//

exports.proxy = function(args) {
  var local_port = LOCAL_PORT_DEFAULT;
  var local_host = LOCAL_HOST_DEFAULT;

  args = args || {};

  if (!args.port) {
    log("no port found, defaulting to 8124");
  } else {
    local_port = args.port
  }

  if (!args.host) {
    log("no host found, defaulting to 127.0.0.1");
  } else {
    local_host = args.host;
  }

  this.run = function() {

    log("Starting proxy...");

    net.createServer(function (socket) {

        socket.setNoDelay(true);
        socket.setEncoding("utf8");

        socket.on("connect", function (socket) {
            log("client2proxy : Connected");
          }
        );

        socket.on("data", function (data) {
            var headers = extractHeaders(data);
            log("Host is : " + headers.host);

            resolveHost(headers.host, function(host) { 
              var stream = net.createConnection(80, host);

              stream.on("connect", function() {
                  log("proxy2server : connect");
                  stream.write(data);
                }
              );

              stream.on("data", function(resp) {
                  log("proxy2server : connect");
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
            log("client2proxy : end"); 
            socket.end();
          });

      }).listen(local_port, local_host);

    return this;
  }
}

