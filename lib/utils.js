'use strict';
var Promise = require( 'bluebird' );
var glob    = require( 'glob' );
var fs      = require( 'fs-extra' );

var utils = {
	'globber' : function ( pattern ) {
		return new Promise( function ( resolve, reject ) {
			glob( pattern, function ( err , files ) {
				if ( err ) {
					reject ( err );
				}
				resolve ( files );
			} );
		} );
	},
	'writeFile' : function ( path, data ) {
		fs.outputFileSync( path, data );
	}
};

module.exports = utils;