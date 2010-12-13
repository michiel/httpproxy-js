var net = require('net');
var dns = require('dns');

//
// Local vars
//

var hostcache = {};
var logging   = true;

var default_local_port  = 8124;        // Some default
var default_local_host  = "127.0.0.1"; // Some default
var default_remote_port = 80;          // Default to TCP:80/HTTP for now

var log_timeout = 10;

//
// Helper functions
//

function dumpObject(obj) {
  for (var key in obj) {
    log("DUMPING " + key + " : " + obj[key]);
  }
}

function log(msg) {
  logging && setTimeout(function() {
      console.log(["httpproxy : ", msg, "\r"].join(""));
  }, log_timeout);
}

//
// Currently only using 'Host:' to determine where to bounce the request to
//

function extractHeaders(data) {
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

function resolveHost(host, callback) {
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

function createServer(args) {
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
              var stream = net.createConnection(args.remote_port, host);

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

    }).listen(args.local_port, args.local_host);
}

//
// Exports
//

exports.proxy = function(args) {

  args = args || {};
  var server;
  var local_port  = default_local_port;
  var local_host  = default_local_host;
  var remote_port = default_remote_port;

  function proxyId() {
    return ["[", local_host, ":", local_port, "]"].join("");
  }

  function log(msg) {
    logging && setTimeout(function() {
        console.log(["httpproxy", proxyId(), " : ", msg, "\r"].join(""));
    }, log_timeout);
  }

  if (!args.port) {
    log("No port found in arguments hash, defaulting to " + local_port.toString());
  } else {
    local_port = args.port
  }

  if (!args.host) {
    log("No host found in arguments hash, defaulting to " + local_host.toString());
  } else {
    local_host = args.host;
  }

  if (!args.remote) {
    log("No remote port found in arguments hash, defaulting to " + remote_port.toString());
  } else {
    local_host = args.host;
  }

  this.start = function() {
    log("Starting proxy server ...");
    server = createServer({
        local_port  : local_port,
        local_host  : local_host,
        remote_port : remote_port
      });
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

