/**
 * Visualization of departures and destinations.
 * Creates a custom visualization depicting countries of destinations and departures.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {uniqValues} from './vis-util';

// general attribtues
var margin;
var width;
var height;

// svg panel
var svg;

// color function assigning each place unique color
var color;

/**
 * Initializes all variables needed for visualization and creates a dataset from given data that is more suitable for working within visualization.
 */
export function destinations(data) {

	init(data);

	drawVis(updateData(data));

}

/**
 * Sets up all scales and attributes acc. to given data and creates a SVG panel.
 *
 * @param {array} data array of objects representing each spending
 */
function init(data) {	

	margin = {top: 10, right: 10, bottom: 10, left: 10};
	width = 810 - margin.left - margin.right;
	height = 500 - margin.top - margin.bottom;

	color = d3.scale.ordinal()
		//.range(['#2196f3', '#cddc39', '#ff8100']);
		.range(['#0a65ad', '#99a717', '#d27d00'])

	svg = d3.select('#vis-destinations')
		.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate('+ margin.left +','+ margin.top +')');
}

/**
 * Creates the visualization with nodes, edges and text labels.
 *
 * @param {array} data
 */
function drawVis(data) {
	
	var circles = svg.selectAll('.places')
		.data(data)
		.enter()
		.append('circle')
			.attr('cx', d => d.coord.x)
			.attr('cy', d => d.coord.y)
			.attr('r', 50)
			.attr('fill', (d, i) => color(i));

	var labels = svg.selectAll('.places-label')
		.data(data)
		.enter()
		.append('text')
			.attr('x', d => d.coord.x - d.place.length*4)
			.attr('y', d => d.coord.y + 5)
			.attr('fill', 'white')
			.style('font-weight', '600')
			.text( d => d.place );
}

/**
 * Creates a dataset more suitable for visuzalization.
 * The dataset is an array of objects representing spending for each place, destinations/departures, etc.
 *
 * @param {array} data
 */
function updateData(data) {

	var dataset = [];

	// get all places (destinations and departures are the same in the data)
	var places = uniqValues(data, 'destination');

	// coordinations of circles for each place
	var placesCoord = [ 
		{ x: width/2, y: height/4 }, 
		{ x: width/3, y: height/3*2 }, 
		{ x: width/3*2, y: height/3*2 }
	];

	// create new objects and add them in the dataset
	places.forEach( (place, i) => {
		var dataObj = {};

		dataObj.place = place;
		dataObj.destination = data.filter( d => d.destination === place );
		dataObj.departure = data.filter( d => d.departure === place );
		dataObj.coord = {x: placesCoord[i].x, y: placesCoord[i].y }

		dataset.push(dataObj);		
	});

	return dataset;
}