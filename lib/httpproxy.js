var net = require('net');
var dns = require('dns');

//
// Local vars
//

var hostcache = {};
var logging   = true;

var local_port  = 8124;        // Some default
var local_host  = "127.0.0.1"; // Some default
var remote_port = 80;          // Default to TCP:80/HTTP for now

var log_timeout = 10;

var server;

//
// Helper functions
//

var dumpObject = function(obj) {
  for (var key in obj) {
    log("DUMPING " + key + " : " + obj[key]);
  }
}

var proxyId = function() {
  return ["[", local_host, ":", local_port, "]"].join("");
}

var log = function(msg) {
  logging && setTimeout(function() {
      console.log(["httpproxy", proxyId(), " : ", msg].join(""));
  }, log_timeout);
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
      headers['host'] = line.substring(7, line.length);
    }  else if (line.match(/GET/)) {
      headers['get'] = line.substring(4, line.length);
    } else if (line.match(/POST/)) {
      headers['post'] = line.substring(5, line.length);
    } 
  }
  return headers;
}

var resolveHost = function(host, callback) {
  if (hostcache[host]) {
    log("resolveHost : using cache for " + host);
    callback(host);
  } else {
    log("resolveHost : resolving " + host);
    dns.lookup(host, function(err, addr) {
        if (err) {
          log(err.toString());
          throw(err);
        } else {
          hostcache[host] = addr;
          callback(addr);
        }
      }
    );
  }
}

var createServer = function() {
  return net.createServer(function (socket) {
      socket.setNoDelay(true);
      socket.setEncoding("utf8");

      socket.on("connect", function (socket) {
          log("client2proxy : Connected");
        }
      );

      socket.on("data", function (data) {
          var headers = extractHeaders(data);
          // dumpObject(headers);
          log("Host is : " + headers.host);

          resolveHost(headers.host, function(host) { 
              var stream = net.createConnection(remote_port, host);

              stream.on("connect", function() {
                  log("proxy2server : Connected");
                  stream.write(data);
                }
              );

              stream.on("data", function(resp) {
                  log("proxy2server : Receiving data");
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
}

//
// Exports
//

exports.proxy = function(args) {

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
    log("Starting proxy server ...");
    server = createServer();
    return this;
  }

  this.stop = function() {
    log("Stopping proxy server ...");
    server.stop();
    return this;
  }

  this.startLogging = function() {
    logging = true;
    return this;
  }

  this.stopLogging = function() {
    logging = false;
    return this;
  }

}

