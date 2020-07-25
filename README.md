# starter

Starter is a CLI wrapper for [nodemon](https://www.npmjs.com/package/nodemon) and [forever](https://www.npmjs.com/package/forever) and needs them to be installed globally. When you start an app with Starter, it automatically restarts the app when file changes in the directory are detected and ensures that the app runs continuously (restarts after a crash). Starter needs 

## Install

```bash
npm install -g starter
npm install -g nodemon
npm install -g forever
```

## Usage

Starter accepts parameters in the form:
```bash
starter [command] [script] [-options]
```

Both `command` and `script` are optional. If you miss out `script`, it'll try to find a script in the current durectory and start it. It'll look for `server.js`, `app.js`, `index.js` (in this order) and will take the first it finds. If nothing of the above found, it won't start. If you miss out both `command` and `script`, it'll default `command` to `start`.

Every script is identifyed by it's absilute path before and after it's started. 

#### Start
```bash
starter start server.js
```
If you start the app that is already running, Starter will stop it and then start it again.

After a successfull start Starter outputs logs both into `starter.out` file in the script directory and into the terminal. The latter you can stop with Ctrl+C (for Linux). It will not stop the app or it's logging into `starter.out` file. You can later see the logs again with starter's` logs` command.

Since Starter can assume `command` and `script`, the following commands do the same:
```bash
starter start server.js
```
```bash
starter start
```
```bash
starter
```

#### Stop
```bash
starter stop server.js
```
```bash
starter stop
```

#### Logs
App's logs are collected in the `starter.out` file in the script directory. To see them in the terminal:
```bash
starter logs server.js
```
```bash
starter logs
```

## Options
The only option supported yet is `-silent` and it only works with `start` command:
```bash
starter start server.js -silent
```

It starts the app without outputting showing logs into terminal. It doesn't prevemt logs from collecting in the `starter.out` file.

## Configuration and other tricks
Since starter is a wrapper for `nodemon` you can:
* Config nodemon as described [here](https://www.npmjs.com/package/nodemon#config-files)
* After the app is strated, you can do [whatever is possible](https://www.npmjs.com/package/forever#command-line-usage) to do with a started app with `forever`. Like, see it in forever's list of running apps `forever list`
