#!/usr/bin/env node

var minimist = require('minimist')
var Cli = require('cliclopts')
var pull = require('pull-stream/pull')
var drain = require('pull-stream/sinks/drain')
var pino = require('pino')
var parseRe = require('parse-regexp')
var watch = require('./')

var Log = require('pino')

var log = Log({
  name: 'watch-lr'
})

var options = [{
  name: 'files',
  abbr: 'f',
  alias: ['globs', 'paths'],
  default: './**/*.{js,html,css}',
  help: 'File paths to watch'
}, {
  name: 'event',
  abbr: 'e',
  default: 'change',
  help: 'Type of event (change | all) to reload on'
}, {
  name: 'host',
  abbr: 'h',
  default: 'localhost',
  help: 'Host of LiveReload server'
}, {
  name: 'port',
  abbr: 'p',
  default: 35729,
  help: 'Port of LiveReload server'
}, {
  name: 'followSymlinks', 
  abbr: 's',
  boolean: true,
  default: false,
  describe: 'When not set, only the symlinks themselves will be watched ' +
            'for changes instead of following the link references and ' +
            'bubbling events through the links path'
}, {
  name: 'ignore',
  abbr: 'i',
  default: null,
  help: 'Pattern for files which should be ignored. ' +
    'Needs to be surrounded with quotes to prevent shell globbing. ' +
    'The whole relative or absolute path is tested, not just filename. ' +
    'Supports glob patters or regexes using format: /yourmatch/i'
}, {
  name: 'polling',
  boolean: true,
  default: false,
  help: 'Whether to use fs.watchFile(backed by polling) instead of ' +
    'fs.watch. This might lead to high CPU utilization. ' +
    'It is typically necessary to set this to true to ' +
    'successfully watch files over a network, and it may be ' +
    'necessary to successfully watch files in other ' +
    'non-standard situations'
}, {
  name: 'pollInterval',
  default: 100,
  help: 'Interval of file system polling. Effective when --polling ' +
    'is set'
}, {
  name: 'pollIntervalBinary',
  default: 300,
  help: 'Interval of file system polling for binary files. ' +
    'Effective when --polling is set',
}, {
  name: 'help',
  abbr: 'h',
  boolean: true,
  help: 'Show help'
}]

module.exports = command
module.exports.options = options

function command (args) {
  var paths = args.paths
  var options = {
    event: args.event,
    /* tiny-lr options */
    host: args.host,
    port: args.port,
    /* chokidar options */
    ignore: resolveIgnore(args.ignore),
    followSymlinks: args.followSymlinks,
    usePolling: args.polling,
    interval: args.pollInterval,
    binaryInterval: args.pollIntervalBinary
  }
  var notify = watch(paths, options, onReady)

  pull(
    notify.listen(),
    drain(function (path) {
      log.info({
        type: 'reload',
        path: path
      })
    })
  )

  function onReady (server, watcher) {
    log.info({
      type: 'listen',
      host: args.host,
      port: args.port,
    })
    log.info({
      type: 'ready',
      paths: args.paths,
      event: args.event,
      ignore: args.ignore
    })
  }
}

if (!module.parent) {
  var cli = Cli(options)
   
  var args = minimist(process.argv.slice(2), cli.options())
   
  if (args.help) {
    console.log('Usage: watch-lr [options]')
    cli.print()
    process.exit()
  }

  command(args)

  process.stdin.pipe(process.stdout)
}

// Takes string or array of strings
function resolveIgnore (ignoreOpt) {
  if (!ignoreOpt) {
    return ignoreOpt
  }

  var ignores = !Array.isArray(ignoreOpt) ? [ignoreOpt] : ignoreOpt

  return Object.keys(ignores).map(function(ignoreKey) {
    var ignore = ignores[ignoreKey]

    var parsed = parseRe(ignore)

    return parsed !== ignore ? parsed : ignore
  })
}
