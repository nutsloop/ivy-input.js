import type { FlagThreadSpecification } from '../flag.js';

export function thread_setter( name: string, path:string ): FlagThreadSpecification{

  return {
    thread_cb_name: name,
    thread_cb_path: path
  };
}
