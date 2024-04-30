type package_json_option = {
  project_description: string;
  project_name: string;
  project_version: string;
}

import { generate_name } from '../../constant/project-name.js';

export function package_json( option: package_json_option ): string {

  return `{
  "name": "${ option.project_name || generate_name() }",
  "version": "${ option.project_version || '1.0.0' }",
  "description": "${ option.project_description || 'yet another cli project' }",
  "main": "index.js",
  "type": "module",
  "types": "types/index.d.ts",
  "engines": {
    "node": "^21"
  },
  "files": [
    "bin",
    "lib",
    "index.js",
    "types"
  ],
  "publishConfig": {
    "access": "public"
  },
  "bin": {
    "${ option.project_name || generate_name() }": "bin/index.js"
  },
  "scripts": {
    "test": "echo 'Error: no test specified' && exit 1",
    "build": "npx tsc && chmod u+x bin/index.js",
    "tsc-watch": "npx tsc-watch --onSuccess 'chmod u+x ./bin/index.js'"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
     "@ivy-industries/input": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest",
    "tsc-watch": "latest"
  }
}
`;
}
