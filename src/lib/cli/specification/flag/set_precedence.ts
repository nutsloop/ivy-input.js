import { FlagSpecificationType } from '../../specs.js';

export function set_precedence( flag_data: FlagSpecificationType, precedence: number | undefined, flag: string ) {

  if( precedence === undefined ) {
    flag_data.set( 'precedence', 0 );

    return;
  }

  if( flag_data.get( 'cb' ) === false ) {
    throw new Error( `Cannot set precedence for flag ${ flag } because it has no callback.` );
  }

  if ( typeof precedence !== 'number' ) {
    throw new Error( `precedence must be a number for flag -> ${ flag }` );
  }

  if ( precedence && true && precedence >= 0 ) {

    flag_data.set( 'precedence', precedence );

    return;
  }
}
