var test = require('tape')
var watch = require('../')
var fs = require('fs')
var path = require('path')

test('should connect to live reload server', function(t) {
    var filepath = path.join(__dirname, 'tmp.txt')
    var live = watch(filepath)
    t.plan(4)
    live.on('connect', function() {
        t.ok(true, 'connected to server')
        setTimeout(function() {
            fs.writeFileSync(filepath, ''+new Date())
        }, 10)
    })

    live.on('watch', function(event, file) {
        t.equal(event, 'change', 'received change event')
        t.equal(file, filepath, 'received change file')
    })

    live.on('reload', function(file) {
        t.equal(file, filepath, 'received livereload trigger')
        live.close()
    })
})


test('should allow ignoring live reload events', function(t) {
    var filepath = path.join(__dirname, 'tmp.txt')
    var live = watch(filepath, { ignoreReload: filepath })
    t.plan(3)
    live.on('connect', function() {
        t.ok(true, 'connected to server')
        setTimeout(function() {
            fs.writeFileSync(filepath, ''+new Date())
        }, 300)
    })

    live.on('watch', function(event, file) {
        t.equal(event, 'change', 'received change event')
        t.equal(file, filepath, 'received change file')
        live.close()
    })

    live.on('reload', function(file) {
        t.fail('should not have received the live reload event')
    })
})

test('should allow ignoring live reload events', function(t) {
    t.plan(4)
    var filepath = path.join(__dirname, 'tmp.txt')
    var live = watch(filepath, { 
        ignoreReload: function(file) {
            t.equal(file, filepath, 'about to ignore file')
            return file === filepath
        } 
    })
    live.on('connect', function() {
        t.ok(true, 'connected to server')
        setTimeout(function() {
            fs.writeFileSync(filepath, ''+new Date())
        }, 10)
    })

    live.on('watch', function(event, file) {
        t.equal(event, 'change', 'received change event')
        t.equal(file, filepath, 'received change file')
        live.close()
    })

    live.on('reload', function(file) {
        t.fail('should not have received the live reload event')
    })
})
