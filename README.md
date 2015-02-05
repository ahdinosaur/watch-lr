# wtch

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

A small command-line app that watches for file changes and triggers a live-reload on file save (to be used with the LiveReload plugin). Watches the current working directory for `js,html,css` file changes. Ignores `.git`, `node_modules` and `bower_components` folders. 

```sh
npm install wtch -g

#start watching ..
wtch
```

Particularly useful alongside tools like [wzrd](https://github.com/maxogden/wzrd).

```js
wzrd index.js | wtch
```

With options, and using [garnish](https://github.com/mattdesl/garnish) for pretty-printing.

```js
wzrd test/index.js | wtch --dir test -e js,css,es6 | garnish
```

PRs/suggestions welcome.

## Usage

[![NPM](https://nodei.co/npm/wtch.png)](https://www.npmjs.com/package/wtch)

```sh
Usage:
    wtch [opts]

Options:
    --dir -d        current working directory to watch (defaults to cwd)
    --extension -e  specifies an extension or a comma-separated list (default js,css,html)
    --event         the type of event to watch, "all" or "change" (default "change")
    --port -p       the port to run livereload (defaults to 35729)
    --verbose       log the file changes as well
    --poll          enable polling for file watching
```

## API

#### `wtch(glob, [opt, cb])`

Returns a through stream that watches the glob (or array of globs) with the given options and an optional callback.

Supported options:

- `cwd` the current working directory for chokidar
- `poll` whether to use polling, default false
- `event` the type of event to watch, can be `"change"` (default, only file save) or `"all"` (remove/delete/etc)
- `port` the port for livereload, defaults to 35729
- `verbose` to log file changes

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/wtch/blob/master/LICENSE.md) for details.
