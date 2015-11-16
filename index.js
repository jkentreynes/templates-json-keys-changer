var _       = require( 'lodash' );
var Promise = require( 'bluebird' );
var glob    = require( 'glob' );
var fs      = require( 'fs-extra' );
var moment  = require( 'moment' );
var utils   = require( './lib/utils.js');

( function change( ) {

	var keys = {
		'title'        : 'name',
		'description'  : 'questionText',
		'multieSelect' : 'type',
		'options'      : 'answerOptions',
		'odescription' : 'optionText'
	};

	var types = {
		'Open-Ended'     : 1,
		'SingleSelect'   : 2,
		'MultipleSelect' : 3,
		'Rubric'         : 4,
		'Label'          : 5
	};

	var date = new Date();

	utils.globber( './templates-json/*.txt' ).then( function ( jsonFiles ) {
		_.forEach( jsonFiles, function ( json ) {
			json = JSON.parse( fs.readFileSync( json, 'utf8' ) );
				_.forEach( json.groups, function ( groups, groupIndex ) {
					delete json.description;
					_.forOwn( groups, function ( groupValue, groupKey ) {
						if ( groupKey === 'title' ){
							json.groups[groupIndex][keys[groupKey]] = groupValue;
							delete json.groups[groupIndex][groupKey];
						} else if ( groupKey === 'indicators') {
							_.forEach( groupValue, function ( indicators, indicatorIndex ) {
								_.forOwn( indicators, function ( indicatorValue, indicatorKey ) {
									if ( indicatorKey === 'description') {
										json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]] = indicatorValue;
										delete 	json.groups[groupIndex].indicators[indicatorIndex][indicatorKey];
									} else if ( indicatorKey === 'type') {
										json.groups[groupIndex].indicators[indicatorIndex].type = types[indicatorValue];
									} else if ( indicatorKey === 'multieSelect' && indicatorValue ) {
										json.groups[groupIndex].indicators[indicatorIndex].type = types.MultipleSelect;
										delete json.groups[groupIndex].indicators[indicatorIndex].multieSelect;
									} else if ( indicatorKey === 'multieSelect' && !indicatorValue ) {
										json.groups[groupIndex].indicators[indicatorIndex].type = types.SingleSelect;
										delete json.groups[groupIndex].indicators[indicatorIndex].multieSelect;
									} else if ( indicatorKey === 'options') {
										json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]] = indicatorValue;
										_.forEach( indicatorValue, function ( options, optionsIndex) {
											_.forOwn( options, function ( optionsValue, optionsKey ) {
												if( optionsKey === 'description' ) {
													if ( json.groups[groupIndex].indicators[indicatorIndex].type === 4) {
														json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex].type = types.SingleSelect;
													} else {
														json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex].type = json.groups[groupIndex].indicators[indicatorIndex].type;
													}
													json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex][keys['o' + optionsKey]] = optionsValue;
													delete json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex][optionsKey];
												} else if ( optionsKey === 'subOptions') {
													_.forEach( optionsValue, function ( sOptions, sOptionsIndex) {
														_.forOwn( sOptions, function ( sOptionsValue, sOptionsKey ) {
															json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex][optionsKey][sOptionsIndex].type = json.groups[groupIndex].indicators[indicatorIndex].type;
															json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex][optionsKey][sOptionsIndex][keys['o' + sOptionsKey]] = sOptionsValue;
															delete json.groups[groupIndex].indicators[indicatorIndex][keys[indicatorKey]][optionsIndex][optionsKey][sOptionsIndex][sOptionsKey];
														} );
													} );
												}
											} )
										} );
										delete 	json.groups[groupIndex].indicators[indicatorIndex][indicatorKey];
									}
								} );
							} );
						}
					} );

					var newJson = {};

					newJson.data = json;
					newJson.scenarioId   = 'T-' + moment().format('THH:mm:ss');
					newJson.scenario     = 'create-template';
					newJson.scenarioType = 'success';

					utils.writeFile( './converted-jsons/' + json.name + moment().format('THH:mm:ss') + '.json', JSON.stringify( newJson ) );
			} );
		} );
	} );
} )()
