# watch-lr

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

api and cli to watch for file changes and trigger a live-reload on file save (using [LiveReload](http://livereload.com/)).

```sh
npm install watch-lr -g

#start watching ..
watch-lr
```

you can use [pino](https://github.com/mcollina/pino) for pretty-printing logs.

```js
watch-lr | pino
```

see [setup](#livereload-setup) for a basic how-to, and [tooling](#tooling) for more advanced uses with browserify, watchify, etc.

PRs/suggestions welcome.

## cli

[![NPM](https://nodei.co/npm/watch-lr.png)](https://www.npmjs.com/package/watch-lr)

```sh
Usage: watch-lr [options]
    --files, -f           File paths to watch (default: "./**/*.{js,html,css}")
    --event, -e           Type of event (change | all) to reload on (default: "change")
    --host, -h            Host of LiveReload server (default: "localhost")
    --port, -p            Port of LiveReload server (default: 35729)
    --ignore, -i          Pattern for files which should be ignored. Needs to be surrounded with quotes to prevent shell globbing. The whole relative or absolute path is tested, not just filename. Supports glob patters or regexes using format: /yourmatch/i (default: null)
    --polling             Whether to use fs.watchFile(backed by polling) instead of fs.watch. This might lead to high CPU utilization. It is typically necessary to set this to true to successfully watch files over a network, and it may be necessary to successfully watch files in other non-standard situations (default: false)
    --pollInterval        Interval of file system polling. Effective when --polling is set (default: 100)
    --pollIntervalBinary  Interval of file system polling for binary files. Effective when --polling is set (default: 300)
    --help, -h            Show help
```

by default,

- watches the current working directory for `js,html,css` file changes
- ignores `.git`, `node_modules`, and `bower_components`, and other hidden files

to watch a single file:

```
watch-lr -f bundle.js
```

## api

### `watchLive = require('watch-lr')`

### `live = watchLive(paths,[ options,][ onReady])`

where `paths` is a files, dirs to be watched recursively, or glob patterns.

optional options are for [`chokidar`](https://github.com/paulmillr/chokidar#api) and the following additions:

- `event`: the type of event to watch, can be `"change"` (default, only file save) or `"all"` (remove/delete/etc)
- `port`: the port for livereload, defaults to 35729
- `host`: the host for livereload, defaults to 'localhost'
- `ignore`: allows ignoring LiveReload events for specific files; can be a file path, or an array of paths, or a function that returns `true` to ignore the reload.

watch returns a [`pull-notify`](https://github.com/pull-stream/pull-notify) stream with properties:

- `listen()`: function to create a pull source stream of the reloaded paths
- `abort(err)`: function to end the file watcher and signal an error to all respective streams
- `end()`: function to end the file watcher and signal completion to all respective streams

`onReady(server, watcher, live)` is called on "ready" event.

where `server` is [`tiny-lr`](https://github.com/mklabs/tiny-lr) server and `watcher` is [`pull-watch`](https://github.com/pull-stream/pull-watch) stream.

### using `options.ignore`

manually handling specific file changes:

```js
watch('**/*.js', { 
  ignore: function(path) {
    //don't trigger LiveReload for this file
    if (path === fileToIgnore)
      return true
    return false
  } 
}, function onReady (server, watcher) {
  //instead, manually decide what to do when that file changes
  pull(
    watcher.listen(),
    pull.drain(handler)
  )
})
```

## LiveReload setup

there are two common ways of enabling LiveReload.

### script tag

you can insert the following script tag in your HTML file. this will work across browsers and devices.

```html
<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
```

or you could use [inject-lr-script](https://github.com/mattdesl/inject-lr-script) to inject it while serving HTML content.

or you could use [ecstatic-lr](https://github.com/ahdinosaur/ecstatic-lr) to serve static files with automatic injection.

### browser plugin

first, install the LiveReload plugin for your browser of choice (e.g. [Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)). 

now, install some tools globally. 

```sh
npm install watch-lr http-server pino -g
```

create a basic `index.html` file that references scripts and/or CSS files.

then, you can run your development server like so:

```sh
http-server | watch-lr | pino
```

open `localhost:8080` and enable LiveReload by clicking the plugin. the center circle will turn black. you may need to refresh the page first.

![Click to enable](http://i.imgur.com/YdCgusY.png)

now when you save a JS/HTML/CSS file in the current directory, it will trigger a live-reload event on your `localhost:8080` tab. CSS files will be injected without a page refresh.

## tooling

this can be used for live-reloading alongside live reload servers like [ecstatic-lr](https://github.com/ahdinosaur/ecstatic-lr). for example:   

```sh
ecstatic-lr test | watch-lr -f 'test/**/*.{js,html,css}' | pino
```

it can also be used to augment [watchify](https://github.com/substack/watchify) with a browser live-reload event. this is better suited for larger bundles.

```sh
watchify index.js -o bundle.js | watch-lr bundle.js
```

see [this package.json's](./package.json) script field for more detailed examples. 

## license

MIT, see [LICENSE.md](./LICENSE.md) for details.
