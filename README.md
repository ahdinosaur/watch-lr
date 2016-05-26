# watch-lr

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A small command-line app that watches for file changes and triggers a live-reload on file save (using [LiveReload](http://livereload.com/)). Watches the current working directory for `js,html,css` file changes. Ignores `.git`, `node_modules`, and `bower_components`, and other hidden files. 

```sh
npm install watch-lr -g

#start watching ..
watch-lr
```

You can use [pino](https://github.com/mcollina/pino) for pretty-printing logs.

```js
watch-lr | pino
```

See [setup](#livereload-setup) for a basic how-to, and [tooling](#Tooling) for more advanced uses with browserify, watchify, etc.

PRs/suggestions welcome.

## Usage

[![NPM](https://nodei.co/npm/watch-lr.png)](https://www.npmjs.com/package/watch-lr)

```sh
Usage:
    watch-lr [globs] [opts]

Options:
    --dir -d        current working directory to watch (defaults to cwd)
    --extension -e  specifies an extension or a comma-separated list (default js,css,html)
    --event         the type of event to watch, "all" or "change" (default "change")
    --port -p       the port to run livereload (defaults to 35729)
    --poll          enable polling for file watching
```

By default, it looks for `**/*` with the specified extensions. If `globs` is specified, they will *override* this behaviour. So you can do this to only watch a single file:

```
watch-lr bundle.js
```

## API

#### `watch = require('watch-lr')`

#### `live = watch(glob, [opt])`

Returns a through stream that watches the glob (or array of globs) and returns an event emitter.

Supported options:

- `cwd` the current working directory for chokidar
- `poll` whether to use polling, default false
- `event` the type of event to watch, can be `"change"` (default, only file save) or `"all"` (remove/delete/etc)
- `port` the port for livereload, defaults to 35729
- `ignoreReload` allows ignoring LiveReload events for specific files; can be a file path, or an array of paths, or a function that returns `true` to ignore the reload, Example:

```js
watch('**/*.js', { 
  ignoreReload: function(file) {
    //don't trigger LiveReload for this file
    if (file === fileToIgnore)
      return true
    return false
  } 
})
  //instead, manually decide what to do when that file changes
  .on('watch', handler)
```

#### `live.on('connect')`

An event dispatched when the connection to live-reload server occurs.

#### `live.on('watch')`

An event dispatched when file change occurs. The first parameter is `event` type (e.g. `"change"`), the second is `file` path.

#### `live.on('reload')`

An event dispatched after the live reload trigger. First parameter will be the file path. 

## LiveReload Setup

There are two common ways of enabling LiveReload.

#### Script Tag

You can insert the following script tag in your HTML file. This will work across browsers and devices.

```html
<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
```

Or you could use [inject-lr-script](https://github.com/mattdesl/inject-lr-script) to inject it while serving HTML content.

Or you could use [ecstatic-lr](https://github.com/ahdinosaur/ecstatic-lr) to serve static files with automatic injection.

#### Browser Plugin

First, install the LiveReload plugin for your browser of choice (e.g. [Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)). 

Now, install some tools globally. 

```sh
npm install watch-lr http-server pino -g
```

Create a basic `index.html` file that references scripts and/or CSS files.

Then, you can run your development server like so:

```sh
http-server | watch-lr | pino
```

Open `localhost:8080` and enable LiveReload by clicking the plugin. The center circle will turn black. You may need to refresh the page first.

![Click to enable](http://i.imgur.com/YdCgusY.png)

Now when you save a JS/HTML/CSS file in the current directory, it will trigger a live-reload event on your `localhost:8080` tab. CSS files will be injected without a page refresh.

## Tooling

This can be used for live-reloading alongside [wzrd](https://github.com/maxogden/wzrd), [beefy](https://github.com/maxogden/beefy) and similar development servers. For example:   

```sh
ecstatic-lr test | watch-lr -d test -e js,css,es6 | pino
```

It can also be used to augment [watchify](https://github.com/maxogden/watchify) with a browser live-reload event. This is better suited for larger bundles.

```sh
watchify index.js -o bundle.js | watch-lr bundle.js
```

See [this package.json's](https://github.com/mattdesl/wtch/blob/master/package.json) script field for more detailed examples. 

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/wtch/blob/master/LICENSE.md) for details.
