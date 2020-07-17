#!/usr/bin/env node

const yargs = require("yargs");
const starter = require('./index');
const fs = require("fs");
const path = require("path");
const which = require('which');


const child_process = require('child_process');
//const exec = require('child_process').exec;
//const execSync = require('child_process').execSync;

const default_scripts = ['server.js', 'app.js'];
const commands = ['start', 'stop', 'logs'];

const processOperand = function(text)
{
    return text;
}

const builder = function(yargs) 
{
    return yargs
            .positional("command", {describe: "command to implement", default: "start"})
            .positional("script", {describe: "script to apply a command to"})
            /*
            .fail(function (msg, err, yargs) {
                if (err) throw err // preserve stack
                console.error('You broke it!')
                console.error(msg)
                console.error('You should be doing', yargs.help())
                process.exit(1)
              })
            */
}

//const handler = function( {firstOperand, secondOperand} ) => console.log( add(firstOperand, secondOperand) );

function stop( script_path, explicit_command )
{
    return new Promise( (resolve, reject) => 
    {
        child_process.exec(`forever stop ${script_path}`,
        {
            //timeout : 1000
        }, function (error, stdout, stderr) 
        {
            if( !error )
            {
                if( explicit_command )
                    console.log(`Stopped '${script_path}'\n`);
                else
                    console.log(`Stopped`);
                    
                
                resolve(true);
                return;
            }
            
            else
            {
                if( stderr.indexOf('cannot find process with id') )
                {
                    if( explicit_command )
                    {
                        reject(`Cannot find process: '${script_path}'\n`);
                        return;
                    }
                    
                    else
                    {
                        resolve(true);
                        return;
                    } 
                }

                // another error
                else
                {
                    //console.error( typeof stderr );
                    reject(error);
                    return;
                } 
            }

        }) })
}

function start( script_path )
{
    return new Promise( (resolve, reject) => 
    {
        var logs_path = path.join(path.dirname(script_path), 'starter.out');
        
        var nodemon_path = which.sync('nodemon', {nothrow: true});
        if( !nodemon_path ) 
            nodemon_path = '/usr/bin/nodemon';
            
        //var spawn = child_process.spawn('bash', ['-c', `nohup nodemon -I -x 'forever --uid "${script_path}" ${script_path}' > ${logs_path} 2>&1 &`]);
        //var spawn = child_process.spawn('bash', ['-c', `nohup nodemon -I -x 'forever --killTree --uid "${script_path}" ${script_path}' > ${logs_path} 2>&1 &`]);
        //var spawn = child_process.spawn('bash', ['-c', `nohup forever --uid "${script_path}" /usr/bin/nodemon --exitcrash -I ${script_path} > ${logs_path} 2>&1 &`], 
        //var spawn = child_process.spawn('bash', ['-c', `nohup forever --killTree --uid "${script_path}" /usr/bin/nodemon --exitcrash -I ${script_path} > ${logs_path} 2>&1 &`], 
        //var spawn = child_process.spawn('bash', ['-c', `nohup forever --killTree --uid "${script_path}" /usr/bin/nodemon --ignore node_modules/ --exitcrash -I ${script_path} > ${logs_path} 2>&1 &`], 
        //var spawn = child_process.spawn('bash', ['-c', `nohup forever --killTree --uid "${script_path}" /usr/bin/nodemon --cwd ${path.dirname(script_path)} --exitcrash -I ${script_path} > ${logs_path} 2>&1 &`], 
        //var spawn = child_process.spawn('bash', ['-c', `forever start -c 'nodemon' server.js`]);

        var spawn = child_process.spawn('bash', ['-c', `nohup forever --killTree --uid "${script_path}" ${nodemon_path} --cwd ${path.dirname(script_path)} --exitcrash -I ${script_path} > ${logs_path} 2>&1 &`], 
        {detached: true, stdio: ['inherit']});

        spawn.on('exit', function(exit_code)
        {
            if( exit_code == 0 )
            {
                console.log('Started');
                
                resolve(true);
                return;
            }
            else
            {
                console.error(`Start: On exit: Nonzero exit code: ${exit_code}`);
                
                reject(exit_code);
                return;
            }                
        });
        
        spawn.stderr.on('data', function (data)
        {
            console.error(`Start: On error: Error data: ${data}`);
            
            reject(data);
            //return;
        });
        
        
        spawn.stdout.on('data', function (data) {
          console.log('stdout: ' + data);
        });
        
        
        //spawn.unref();

    })

}

function logs( script_path )
{
    return new Promise( (resolve, reject) => 
    {
        var logs_path = path.join(path.dirname(script_path), 'starter.out');
        
        var spawn = child_process.spawn('bash', ['-c', `tail ${logs_path} -f`], 
        {detached: true, stdio: ['inherit']});
        
        console.log("Showing logs...");

        spawn.on('exit', function(exit_code)
        {
            if( exit_code == 0 )
            {
                //console.log("Started");
                
                resolve(true);
                return;
            }
            else
            {
                reject(exit_code);
                return;
            }                
        });
        
        spawn.stderr.on('data', function (data)
        {
            if( data.indexOf('No such file or directory') )
            {
                reject(`Log file not found: '${logs_path}'\n`);
                return;
            } 
            else
            {
                reject(`${data}`);
                return;
            }
        });
        
        
        /*
        spawn.stdout.on('data', function (data)
        {
            //console.log("Showing logs");
            console.log('stdout: ' + data);
        });
        */
        
        spawn.stdout.pipe( process.stdout );
        
        
        
        /*
        child_process.exec(`tail ${logs_path} -f`,
        {
            //timeout : 1
        }, function (error, stdout, stderr) 
        {
            if( !error )
            {
                console.log("Showing logs");
                
                resolve(true);
                return;
            }
            else
            {
                //console.error(error);
                
                reject(true);
                return;
            }
        
        })
        */
        
    })
}


const handler = function( argv )
{
    //console.log(  );
    
    // Unknown command
    if( !commands.includes(argv.command) )
    {
        console.error( `Unknown command: '${argv.command}'` );
        return;
    }
    
    // Try to guess the script if needed
    if( argv.script === undefined )
    {
        for( var i=0; i<default_scripts.length; i++ )
        {
            var curr_path = path.join(process.env.PWD, default_scripts[i]);
            
            //console.log(curr_path)
            //console.log( path.dirname(curr_path) )
            
            if( fs.existsSync(curr_path) )
            {
                argv.script = default_scripts[i];
                break;
            }
        }
    }

    // Script is still undefined
    if( argv.script === undefined )
    {
        console.error( `Need a script name` );
        return;        
    }

    // Script does not exist
    if( argv.script !== undefined )
    {
        if( !fs.existsSync( path.join(process.env.PWD, argv.script) ) )
        {
            console.error( `Script does not exist: '${argv.script}'` );
            return;             
        }
    }
    
    var abs_script_path = path.join(process.env.PWD, argv.script);
    
    switch (argv.command)
    {
        case 'start':
            {
                //console.log(`About to start with command '${argv.command}', script name '${argv.script}'`)

                return stop( abs_script_path )
                .then( ()=> 
                {
                    return start( abs_script_path );   
                })
                .then( ()=> 
                {
                    return logs( abs_script_path );
                })
                .catch( err => 
                {
                    console.error( `Hmm... ${err}` );
                })
                
            } break;
        
        case 'stop':
            {
                return stop( abs_script_path, true )
                .catch( err => 
                {
                    console.error( `Hmm... ${err}` );
                })
                
            } break;
            
        case 'logs':
            {
                return logs( abs_script_path )
                .catch( err => 
                {
                    console.error( `Hmm... ${err}` );
                })
                
            } break;
    }
}

yargs.command("* [command] [script]", "Control the app", builder, handler).parse()
