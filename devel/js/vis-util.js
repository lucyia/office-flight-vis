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