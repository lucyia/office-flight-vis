/**
 * Visualization of departures and destinations.
 * Creates a custom visualization depicting countries of destinations and departures.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

// general attribtues
var margin;
var width;
var height;

// svg panel
var svg;

/**
 * Initializes all variables needed for visualization and creates a dataset from given data that is more suitable for working within visualization.
 */
export function destinations(data) {

	init(data);

}

/**
 * Sets up all scales and attributes acc. to given data and creates a svg panel.
 *
 * @param {array} data array of objects representing each spending
 */
function init(data) {	

	margin = {top: 10, right: 35, bottom: 30, left: 10};
	width = 810 - margin.left - margin.right;
	height = 500 - margin.top - margin.bottom;

}