export class InputError extends Error{

  constructor( message: Buffer | string ) {

    super( Buffer.isBuffer( message ) ? message.toString() : message );

    Object.setPrototypeOf( this, InputError.prototype );
    InputError.captureStackTrace( this, InputError );

    this.name = 'InputError';
  }
}
