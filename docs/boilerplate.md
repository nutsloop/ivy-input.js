# @nutsloop/ivy-input - boilerplate

___

## Description

By using the command below, you can initialize a boilerplate project.

```shell
npx @nutsloop/ivy-input init \
  --name='cli-app' \
  --swemver='1.0.0' \
  --description='another cli app'
```

- It is TypeScript ready, and it will be compiled to JavaScript automatically.
- the executable file will be `./bin/index.js` and it will be given executable permission.
- It will make the following directory structure:

```
./
├── bin
│   └── index.js
├── src
│   ├── bin
│   │   └── index.ts
│   └── index.ts
├── types
│   ├── bin
│   │   └── index.d.ts
│   └── index.d.ts
├── index.js
├── package.json
└── tsconfig.json
```

___

contents of `./src/index.ts`

```typescript
#!/usr/bin/env -S node
import { cli, run, flag, command } from '@nutsloop/ivy-input';
import type { parsedARGV } from '@nutsloop/ivy-input';

async function input( parsedARGV: parsedARGV ): Promise<void>{

  await command( 'init', {
    description: 'init a new project',
    usage: 'hello-world init',
    has_flag: true,
    cb: () => {
      console.log( 'init' );
    }
  } );

  await flag( '--bare', {
    description: 'init a new project without any dependencies',
    usage: 'hello-world init --bare',
    is_flag_of: 'init',
    cb: () => {
      console.log( 'init --bare' );
    }
  } );

  await cli( parsedARGV );
}

await run( process.argv, input, 'hello-world' );
```

check the other files in the boilerplate project for more details, and adjust them to your needs.

___

once you have the boilerplate project, you can run the following command to check if it works:

```shell
./bin/index.js init --bare
```

the output should be:

```shell
init --bare
init
```

___

Happy coding!

___
