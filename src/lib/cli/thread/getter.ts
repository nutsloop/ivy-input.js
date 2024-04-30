export async function thread_getter( name: string, path: string ) {

  const cb_heavy = await import( path )
    .catch( ( error ) => {
      throw( `import of callback at path '${path}' for thread flag callback named '${ name }' failed. error -> ${ error.message || error }` );
    } );

  if( ! cb_heavy[ name ] ){

    throw( `thread flag doesn't have an exported callback with this name ${ name }` );
  }

  return cb_heavy[ name ];
}
