/**
 * Finds out the unique values of given data for given parameter.
 *
 * @param {array} data array of objects representing all year spending
 * @param {string} param parameter which should be looked up
 * @return {array} uniqueValues array of all unique values for given parameter
 */
export function uniqValues(data, param) {
	return [ ...new Set(data.map(d => d[param]))];
}

/**
 * Calculates the whole year's spending for a given param (e.g. supplier, directorate) and returns it in updated array of objects.
 *
 * @param {array} data
 * @param {string} param
 * @return {array} allSpending array of updated objects, e.g. [ {fare: x, param: a}, {fare: y, param: b}, ...]
 */
export function calcSpending(data, param) {
	var uniqItems = uniqValues(data, param);
	
	var allParams = uniqItems.map( item => data.filter( d => d[param] === item ));

	var allSpending = [];

	allParams.forEach( itemArray => {
		var obj = {};

		obj['fare'] = itemArray.reduce( (a,b) => a + b.fare, 0);
		obj[param] = itemArray[0][param];

		allSpending.push(obj);
	});

	return allSpending;
}