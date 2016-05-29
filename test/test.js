var test = require('tape')
var fs = require('fs')
var path = require('path')
var pull = require('pull-stream')
var watch = require('../')

var port = 35730

test('should connect to live reload server', function(t) {
  t.plan(2)

  var filepath = path.join(__dirname, 'tmp.txt')
  var live = watch(filepath, { port: port++ }, onReady)

  function onReady () {
    t.ok(true, 'connected to server')
    fs.writeFileSync(filepath, ''+new Date())
  }

  pull(
    live.listen(),
    pull.drain(function (path) {
      t.equal(path, filepath, 'received livereload trigger')
      live.end()
    })
  )
})

test('should allow ignoring live reload events', function(t) {
  t.plan(1)

  var filepath = path.join(__dirname, 'tmp.txt')
  var live = watch(filepath, { port: port++, ignore: filepath }, onReady)

  function onReady (server, watcher) {
    t.ok(true, 'connected to server')
    fs.writeFileSync(filepath, ''+new Date())

    setTimeout(function () {
      live.end()
    }, 300)
  }

  pull(
    live.listen(),
    pull.drain(function (path) {
      t.fail('should not have received the live reload event')
    })
  )
})

test('should allow ignoring live reload events', function(t) {
  t.plan(2)

  var filepath = path.join(__dirname, 'tmp.txt')
  var live = watch(filepath, { 
    port: port++,
    ignore: function(path) {
      t.equal(path, filepath, 'about to ignore file')
      return path === filepath
    } 
  }, onReady)


  function onReady (server, watcher) {
    t.ok(true, 'connected to server')
    fs.writeFileSync(filepath, ''+new Date())

    setTimeout(function () {
      live.end()
    }, 300)
  }

  pull(
    live.listen(),
    pull.drain(function (path) {
      t.fail('should not have received the live reload event')
    })
  )
})
