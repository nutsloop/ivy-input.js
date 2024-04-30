# @ivyrun/input

___

###### Ivy Framework to build CLI applications. esModule.

___

## Index of Contents

___

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
  - [simple implementation in one file](#simple-implementation-in-one-file)
- [JetBrains OSS Licence](#jetbrains-oss-license)

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

## Installation Or Boilerplate

### Installation

with this command you can install the package and develop 'from scratch' the project.  
for a boilerplate project, ready to go, have a look at the next section.

```shell
npm install @ivyrun/input
```

### Boilerplate

with this command you can initialize a boilerplate project.

```shell
npx @ivyrun/input init \
  --project-name='cli-app' \
  --project-version='1.0.0' \
  --project-description='another cli app'
```

for a more detailed information, have a look at the [ivyrun/input-boilerplate](./docs/boilerplate.md)

___

## Usage

___

### simple implementation in one file.

initialize the project
```shell
npm init -y
npm pkg set type="module"; # mandatory to specify esModule
npm pkg set name="cli-app"; # let's name the project
npm pkg set version="1.0.0"; # let's give it a version
npm pkg set description="another cli app"; # let's give it a description

npm install @ivyrun/input # install the package

echo '{"some": "Jason", "data":["0", "1"]}' >> ./test.json

touch ./index.js
```

___

> ⚠ remember to give index.js file executable permission
>```shell
>chmod u+x ./index.js
>```

___

**file index.js**

___

```javascript
#!/usr/bin/env -S node --experimental-import-meta-resolve --no-warnings
import { cli, run, flag, command } from '@ivyrun/input';

async function input(parsedARGV) {
    await command('init', {
        description: 'init a new project',
        usage: 'hello-world init',
        has_flag: true,
        cb: () => {
            console.log('init');
        }
    });
    await flag('--bare', {
        description: 'init a new project without any dependencies',
        usage: 'hello-world init --bare',
        is_flag_of: 'init',
        cb: () => {
            console.log('init --bare');
        }
    });
    await cli(parsedARGV);
}
await run(process.argv, input, 'hello-world');
```

```javascript
#!/usr/bin/env node --experimental-meta-resolve --no-warnings

import { readFile } from 'node:fs/promises'
import { command, run } from '@ivyrun/input'
import { extname } from 'node:path'

// The very entry point of the cli application
const app = async (parsed) => {

  // The read command callback function
  const read_cb = async (data) => {

    let exitCode = 0

    // Get the filename
    const filename = `${process.cwd()}/${data.flag['--filename'] || data.flag['-f']}`

    // only json files are allowed
    if(extname(filename) !== '.json'){
      console.error('only json file')
      process.exit(1)
    }

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

  // Instantiate a new Command and pass to the constructor the parsed argument
  const read = new Command(parsed)

  /**
   *  Define your first command
   *
   *  1. name your command
   *  2. pass the read callback function
   *  3. give it a description & usage to populate the help system
   *
   *  READ COMMAND
   */
  await read.define('read', read_cb, {
    description: 'read a file and print the content',
    usage: './index.js read --filename=test.json'
  })

  /**
   * Define the flag --filename[-f]
   *
   * 1. define the names with a string[] one for short and one for long:
   *    '--filename', '-f'
   * 2. populate descriptor argument
   * 3. give it a description & usage to the descriptor to populate the help system
   *
   * READ --FILENAME FLAG
   */
  await read.flag(['--filename', '-f'], {
    short: '-f',
    long: '--filename',
    type: 'string',
    void: false,
    check: true,
    description: 'ONLY relative path to the current working dir of the app, ⚠️ no slash or dot needed!',
    usage: './index.js read --filename=test.json'
  })

  // This will intercept the given data and execute the routines
  await read.intercept()
};

// - entry_point will process the process.argv data and gives back the object version to app function
await entry_point(process.argv, app).catch(error => console.error(error))

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

## JetBrains OSS License

___

I want to thank JetBrains to grant me the Open Source Software license for all their products. This opportunity gives me
strength to keep on going with my studies and personal project.  
To learn more about this opportunity, have a look
at [Licenses for Open Source Development - Community Support](https://www.jetbrains.com/community/opensource/).

_Thank you_
