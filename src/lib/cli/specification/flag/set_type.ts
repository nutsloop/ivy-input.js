import { FlagSpecificationType, OptionType } from '../../specs.js';

type type_setting = {
  multi_type: OptionType[];
  type: OptionType;
  void: boolean;
};

export function set_type( flag_data: FlagSpecificationType, { multi_type, type, void: _void }: type_setting, flag: string ) {

  if( _void ){

    if( type ){
      throw( `void flag '${flag.yellow()}' cannot set type property` );
    }
    if( multi_type ){
      throw( `void flag '${flag.yellow()}' cannot set multi_type property` );
    }
  }

  if( type && multi_type ){
    throw( `type and multi_type properties cannot be defined together\n flag -> '${flag.yellow()}'` );
  }

  // void is set to true if type or multi_type properties are not defined, or if void is explicitly set to true
  flag_data.set( 'void', _void || ! ( type || multi_type ) );

  if( type ){

    flag_data.set( 'type', type );
  }

  if( multi_type ){

    flag_data.set( 'multi_type', multi_type );
  }
}
