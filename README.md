# @nutsloop/ivy-input.js

___

###### Ivy Framework to build CLI applications. esModule.

___

## Index of Contents

___

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
  - [simple implementation in one file](#simple-implementation-in-one-file)

___

## Description

___

Framework to build CLI applications:

- spawn new thread for complex operation.
- [help][-h][--help] commands automatic generation.
- [version][-v][--version] commands automatic generation.
- callbacks and callbacks rest-parameters for commands, global flags and flags.
- callbacks can be async or sync for all commands, global flags and flags.
- callback for flags can return a value, that will be passed to the command callback.
- globals callback DO NOT return any value to the command and are executed before everything else.
  - good for setting environment variables.
- pass extra data to callbacks for all commands, global flags and flags.
- flags and global-flags features:
  - `--flag=3` style.
  - infer type from the value passed to flags & global-flags.
    - `string` `number` `boolean` `array` `kvp` `json`
  - flags callbacks can be prioritized.
  - flags can be mandatory.
  - global-flags must be called before the command.
  - flags and global flags can have conflicts.
  - accept key->value pair `(kvp)` as argument `--flag='!key:value|key2:value2'` exclamation mark is mandatory.

___

## Boilerplate OR Scratch

### Boilerplate

with this command you can initialize a boilerplate project.

```shell
npx @nutsloop/ivy-input init \
  --name='cli-app' \
  --semver='1.0.0' \
  --description='another cli app'
```

for a more detailed information, have a look at the [ivyrun/input-boilerplate](./docs/boilerplate.md)

### Scratch

with this command you can install the package and develop 'from scratch' the project.

```shell
npm install @nutsloop/ivy-input
```

___

### simple implementation in one file.

initialize a simple JavaScript project.

```shell
mkdir ./hello-world && cd ./hello-world
npm init -y
npm pkg set type="module"; # mandatory to specify esModule
npm pkg set name="hello-world"; # let's name the project
npm pkg set version="1.0.0"; # let's give it a version
npm pkg set description="another hello world cli app"; # let's give it a description

npm add @nutsloop/ivy-input # install the package

touch ./index.js
```

___

> ⚠ remember to give index.js file executable permission
```shell
chmod u+x ./index.js
```

___

**file index.js**

This hello-world cli application has
  - one command called `say-it` and
  - one flag called `--silent`

It doesn't do anything special, it just prints a message to the console.
If the `--silent` flag is passed, the message will not be printed.

___

```javascript
#!/usr/bin/env -S node
import { cli, run, flag, command } from '@nutsloop/ivy-input';

// the logic function where all the commands and flags are defined.
async function logic(parsed_argv) {
  // set the SILENCED environment variable to false.
  process.env.SILENT = 'false'
  await command('say-it', {
    description: 'print the message "hello world!".',
    usage: 'hello-world say-it',
    has_flag: true,
      cb: () => {
        if(process.env.SILENT === 'false'){
          console.log('hello world!');
        }
      }
    });
  await flag('--silent', {
    alias: 'silent',
    description: 'do not print the hello world message.',
    usage: 'hello-world say-it --silent',
    is_flag_of: 'say-it',
    cb: {
      fn: () => {
        process.env.SILENT = 'true';
      },
      type: 'sync'
    }
  });
  	// `cli` method will be called when the `run` method parses the process.argv
  await cli(parsed_argv);
}
// the method `run` will parse the process.argv and call the logic function.
// no need to remove the first two elements of the process.argv.
await run(process.argv, logic, 'hello-world');
```

### let's go complex.

initialize a simple JavaScript project.

```shell
mkdir ./read-that && cd ./read-that
npm init -y
npm pkg set type="module"; # mandatory to specify esModule
npm pkg set name="read-that"; # let's name the project
npm pkg set version="1.0.0"; # let's give it a version
npm pkg set description="read a Json file. and log the content."; # let's give it a description

npm add @nutsloop/ivy-input # install the package

echo '{"some": "Jason", "data":["0", "1"]}' >> ./data.json

touch ./index.js
```

___

> ⚠ remember to give index.js file executable permission
```shell
chmod u+x ./index.js
```

___

**file index.js**

This read-that cli application has
  - one command called `data` and
  - one flag called `--filename[-f]`

It will read a json file and log the content to the console.

___

```javascript
#!/usr/bin/env -S node

import { access, readFile } from 'node:fs/promises'
import { command, run, cli, flag } from '@nutsloop/ivy-input'
import { extname, resolve } from 'node:path'

// The very entry of the read-that cli application.
const logic = async (parsed_argv) => {

  // The read command callback function
  const read_cb = async (data) => {

    let exitCode = 0

    // filename from the given flag is now absolute path.
    const filename = data.get('filename');

    // It reads the file, and if the readFile fails, it returns a json string with the error message given.
    const content = await readFile(filename, { encoding: 'utf-8' }).catch(error => {
      exitCode = 1

      return `{"error":"${ error.message }"}`
    })

    // It converts to object the give json data.
    let json_data
    try{
      json_data = JSON.parse(content)
    }catch ( error ) {
      json_data = `{"error":"${error.message}"}`
      exitCode = 1
    }

    console.log(json_data)
    process.exit(exitCode)
  };

  await command('data', {
      description: 'read a Json file given from the flag --filename[-f]',
      usage: `npx read-that data --filename='data.json'`,
      has_flag: true,
      // to use the `required_flag` property, you need to use the alias given to the flag while defining it.
      required_flag: [ 'filename' ],
      cb: read_cb
  });

  // the filename callback function
  const filename_cb = async (data) => {
    // only json files are allowed
    if(extname(data) !== '.json'){
      console.error('only json file')
      process.exit(1)
    }

    // check if the file exists
    const file_exists = await access(resolve(process.cwd(), data)).then(() => true).catch(() => false)
    if(!file_exists){
      console.error('file does not exist')
      process.exit(1)
    }

    return resolve(process.cwd(), data)
  };

  await flag(['--filename', '-f'], {
    alias: 'filename',
    description: `the filename of the json file to read
ONLY relative path to the current working dir of the app, ⚠️ no initial slash or dot needed!
`,
    usage: `npx read-that --filename='data.json'`,
    is_flag_of: 'data',
    cb: {
      type: 'async',
      fn: filename_cb
      },
    type: 'string'
  });

  // `cli` method will be called when the `run` method parses the process.argv
  await cli(parsed_argv).catch(console.error);
};

// - the `run` method will parse the process.argv and call the logic function.
await run(process.argv, logic, 'read-that').catch(console.error);

```

the Command class automatically creates two commands:

- **help:**
  to access the doc entries, you need to pass:
  - key->value (opts) to the --view flag to retrieve the doc for the flag
    where `key` is the `command-name` & `value` is the `flag-name`
    - example `./index.js help --view=read:--filename` to retrieve the flag doc
  - just the name of the command to the --view flag to retrieve the doc for the command
    - example `./index.js help --view=read` to retrieve the command doc


- **version**:
  the command version relays to the `package.json` file entry `version`

**let's run the app and all its functionalities**

```shell
# usage
./index.js read --filename='test.json' # will print the object
./index.js read --filename='test.js' # will print 'only json files'
./index.js read --filename='no-file.json' # will print the ENOENT error message

# automatic commands help & version
./index.js version # will print the version
./index.js help --view=read:--filename # will print the doc entry for the --filename flag
./index.js help --view=read:-f # same same as above

```

___
