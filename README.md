# starter

Starter is a CLI tool for starting a server. It's a wrapper for [nodemon](https://www.npmjs.com/package/nodemon) and [forever](https://www.npmjs.com/package/forever) and needs them to be installed globally. 

When you start an app with Starter:
* The app automatically restarts when file changes in the directory are detected 
* The app runs continuously and restarts after a crash
* You can close the terminal/ssh session without terminating the app

Start: `starter start app.js`, stop: `starter stop app.js`, show logs: `starter logs app.js`

## Install

```bash
npm install -g @valerypopoff/starter
npm install -g nodemon
npm install -g forever
```

## Usage

Starter accepts parameters in the form:
```bash
starter [command] [script] [-options]
```

Both `command` and `script` are optional. If you miss out `script`, it'll try to find a script in the current durectory and use it. It'll look for `server.js`, `app.js`, `index.js` (in this order) and will take the first it finds. If nothing of the above found, the command will do nothing. If you miss out both `command` and `script`, it'll default `command` to `start`.

### Start
```bash
starter start app.js
```
If you start the app that is already running, Starter will stop it and then start it again.

After a successfull start Starter outputs logs both into `starter.out` file in the script directory and into the terminal. The latter you can stop with Ctrl+C (for Linux). It will not stop the app or it's logging into `starter.out` file. You can later see the logs again with starter's `logs` command.

Since Starter can assume `command` and `script`, the following commands do the same:
```bash
starter start app.js
```
```bash
starter start
```
```bash
starter
```

### Stop
```bash
starter stop app.js
```
or
```bash
starter stop
```

### Logs
App's logs are collected in the `starter.out` file in the script directory. To see them in the terminal:
```bash
starter logs app.js
```
or
```bash
starter logs
```

## Options

### -silent
The `-silent` option only works with `start` command:
```bash
starter start app.js -silent
```
It prevents showing logs in the terminal after a start. It doesn't prevent logs from collecting in the `starter.out` file.

### -nodemon_opts
This option is for passing additional options to `nodemon`
```bash
starter start app.js -nodemon_opts='--ignore test.js --verbose'
```
### -forever_opts
This option is for passing additional options to `forever`
```bash
starter start app.js -forever_opts='--minUptime 5000'
```

## Configuration and other tricks
Starter is a wrapper for [nodemon](https://www.npmjs.com/package/nodemon) and [forever](https://www.npmjs.com/package/forever). When you start an app with Starter, it does
```bash
nohup forever ${forever_opts} --killTree --uid "${script_path}" ${nodemon_path} --cwd ${path.dirname(script_path)} ${nodemon_opts} --exitcrash -I ${script_path} > ${path.join(path.dirname(script_path), 'starter.out')} 2>&1 &
```
`${nodemon_opts}` and `${forever_opts}` are strings that you pass to Starter with `-nodemon_opts` and `-forever_opts`. Use them to configure `nodemon` and `forever` when starting an app. Or turn to other configuration possibilities that don't include passing arguments. Like, [placing `nodemon.json` file into your app's directory](https://www.npmjs.com/package/nodemon#config-files). After the app is strated, you can manipulate it with `forever`. Like, [see forever's list of running apps with `forever list` command](https://www.npmjs.com/package/forever#command-line-usage).
