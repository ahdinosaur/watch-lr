var xtend = require('xtend')
var LiveReload = require('tiny-lr')
var watch = require('pull-watch')
var pull = require('pull-stream/pull')
var map = require('pull-stream/throughs/map')
var filter = require('pull-stream/throughs/filter')
var drain = require('pull-stream/sinks/drain')
var Notify = require('pull-notify')
var parallel = require('run-parallel')

module.exports = watchLive

function watchLive (paths, options, onReady) {
  if (arguments.length === 2) {
    onReady = options
    options = {}
  }

  options = xtend({
    port: 35729,
    host: 'localhost',
    event: 'change'
  }, options)

  var livereload = LiveReload()
  var notify = Notify()
  var server, watcher

  var stream = {
    listen, abort, end
  }

  parallel([
    function (cb) {
      livereload.listen(options.port, options.host, function () {
        cb(null)
      })
    },
    function (cb) {
      var watchOptions = xtend(options, {
        ignored: isFunction(options.ignore) ? null : options.ignore
      })
      watcher = watch(paths, watchOptions, function () {
        cb(null, watcher)
      })

      pull(
        watcher.listen(),
        filter(function (event) {
          if (options.event === 'all') {
            return true
          }
          return event.type === options.event
        }),
        map(function (event) { return event.path }),
        filter(function (path) {
          if (isFunction(options.ignore)) {
            return !options.ignore(path)
          }
          return true
        }),
        drain(function (path) {
          livereload.changed(path)
          notify(path)
        })
      )
    }
  ], function (server, watcher) {
    if (onReady) onReady(server, watcher, stream)
  })

  livereload.server.on('error', abort)

  return stream

  function listen () {
    return notify.listen()
  }

  function abort (err) {
    notify.abort(err)
    watcher.abort(err)
    livereload.close()
  }

  function end () {
    abort(true)
  }
}

function isFunction (fn) {
  return typeof fn === 'function'
}
