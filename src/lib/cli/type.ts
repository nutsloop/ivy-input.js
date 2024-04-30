import type { OptionType } from './specs.js';

export function type( value: unknown, type: OptionType ): Promise<Error|boolean|string[]>{

  return new Promise( ( resolve, reject ) => {

    if( value === null && type !== 'void' ){

      reject( 'null' );
    }
    else if( value === null && type === 'void' ){

      resolve( true );
    }

    switch ( type ) {

      case 'string': {

        if ( value.constructor.name === 'String' ) {

          resolve( true );
        }


        reject( value.constructor.name );

      }
        break;

      case 'number': {

        if ( value.constructor.name === 'Number' ) {

          resolve( true );
        }


        reject( value.constructor.name );

      }
        break;

      case 'boolean': {

        if ( value.constructor.name === 'Boolean' ) {

          resolve( true );
        }


        reject( value.constructor.name );

      }
        break;

      case 'object': {

        if ( value.constructor.name === 'Object' ) {

          resolve( true );
        }

        reject( value.constructor.name );

      }
        break;

      case 'array': {

        if( typeof value === 'string' ){

          resolve( value.split( ',' ) );
        }
        else if ( value.constructor.name === 'Array' ) {

          resolve( true );
        }


        reject( value.constructor.name );

      }
        break;

      case 'kvp': {

        if ( value.constructor.name === 'Map' ) {

          resolve( true );
        }

        reject( value.constructor.name );

      }
        break;

      case 'json': {

        if ( value.constructor.name === 'Object' ) {

          resolve( true );
        }

        reject( value.constructor.name );
      }
        break;

      case 'void': {

        resolve( true );
      }

        break;

      default: {

        reject( `type ${ type } not supported` );
      }
    }
  } );
}

export function multi_type( value:unknown, multi_type: OptionType[] ): Promise<Error|boolean|string[]>{

  return new Promise( ( resolve, reject ) => {

    for( const _m_type of multi_type ) {

      if( value === null && multi_type.includes( 'void' ) ){

        resolve( type( value, 'void' ).catch( error => error ) );
      }

      else if( typeof value === 'string' && multi_type.includes( 'array' ) ){

        resolve( type( value, 'array' ).catch( error => error ) );
      }

      else if( value.constructor.name === 'Array' && multi_type.includes( 'array' ) ){

        resolve( type( value, 'array' ).catch( error => error ) );
      }

      else if( value.constructor.name === 'Map' && multi_type.includes( 'kvp' ) ){

        resolve( type( value, 'kvp' ).catch( error => error ) );
      }

      else if( value.constructor.name === 'Object' && ( multi_type.includes( 'json' ) || multi_type.includes( 'object' ) ) ){

        resolve( type( value, 'json' ).catch( error => error ) );
      }

      else if( value.constructor.name === 'Boolean' && multi_type.includes( 'boolean' ) ){

        resolve( type( value, 'boolean' ).catch( error => error ) );
      }

      else if( value.constructor.name === 'Number' && multi_type.includes( 'number' ) ){

        resolve( type( value, 'number' ).catch( error => error ) );
      }

      else if( value.constructor.name === 'String' && multi_type.includes( 'string' ) ){

        resolve( type( value, 'string' ).catch( error => error ) );
      }
      else {
        reject( value );
      }
    }
  } );
}
