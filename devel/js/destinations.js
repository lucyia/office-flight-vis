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

// function for advanced tooltip
var tip;

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

	// create tooltip and call it
	tip = d3.tip()
		.attr('class', 'd3-tip')
		.html( d => {
			return '<span class="number">Flights out: <span class="pull-right">'+numeral(d.departure.length).format('0,0')+'</span></span>\
				<br/><span class="number">Flights in: <span class="pull-right">'+numeral(d.destination.length).format('0,0')+'</span></span>';
		});

	svg.call(tip);
	
	var r = 60;

	// create a circle for each place
	var circles = svg.selectAll('.places')
		.data(data)
		.enter()
		.append('circle')
			.attr('cx', d => d.coord.x)
			.attr('cy', d => d.coord.y)
			.attr('r', r)
			.attr('fill', (d, i) => color(i))
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

	// create a label for each place and place it inside the place's circle
	var labels = svg.selectAll('.places-label')
		.data(data)
		.enter()
		.append('text')
			.attr('x', d => d.coord.x - d.place.length*4)
			.attr('y', d => d.coord.y + 5)
			.attr('fill', 'white')
			.style('font-weight', '600')
			.text( d => d.place );

	// arrow marker for the lines
	svg.append('defs')
		.append('marker')
			.attr('id', 'markerArrow')
			.attr('markerWidth', 8)
			.attr('markerHeight', 6)
			.attr('refX', 3)
			.attr('refY', 3)
			.attr('orient', 'auto')
		.append('path')
			.attr('class', 'flight')
			.attr('d', 'M0,0 L0,6 L4,3 L0,0')
			.attr('fill', 'white');

	var shiftX = r/2;
	var shiftY = r/2;

	// line function
	var line = d3.svg.line()
		.interpolate('basis')
		.x( d => d.x)
		.y( d => d.y);

	arrowPlace2Self();

	arrowPlace2Out();

	arrowPlace2In();

	/**
	 * Draws an arrow from a place to itself, representing flights from the place returing to it.
	 */
	function arrowPlace2Self() {		

		// UK -> UK
		var centerX_UK = data[0].coord.x;
		var centerY_UK = data[0].coord.y-r/3;

		var flights_UK2UK_nodes = [ 
			{ x: centerX_UK+shiftX, y: centerY_UK-shiftY },
			{ x: centerX_UK+shiftX*1.5, y: centerY_UK-shiftY*2 },
			{ x: centerX_UK, y: centerY_UK-shiftY*3 },
			{ x: centerX_UK-shiftX*1.5, y: centerY_UK-shiftY*2 },
			{ x: centerX_UK-shiftX, y: centerY_UK-shiftY }
		];

		var flights_UK2UK = svg.append('path')
			.attr('d', line(flights_UK2UK_nodes))
			.attr('class', 'flight')
			.attr('stroke', 'white')
			.attr('stroke-width', 5)
			.attr('fill', 'none')
			.attr('marker-end', 'url(#markerArrow)');

		
		// nEEA -> nEEA
		var centerX_nEEA = data[1].coord.x;
		var centerY_nEEA = data[1].coord.y+r/3;

		var flights_nEEA2nEEA_nodes = [ 
			{ x: centerX_nEEA-shiftX, y: centerY_nEEA+shiftY },
			{ x: centerX_nEEA-shiftX*1.5, y: centerY_nEEA+shiftY*2 },
			{ x: centerX_nEEA, y: centerY_nEEA+shiftY*3 },
			{ x: centerX_nEEA+shiftX*1.5, y: centerY_nEEA+shiftY*2 },
			{ x: centerX_nEEA+shiftX, y: centerY_nEEA+shiftY }
		];

		var flights_nEEA2nEEA = svg.append('path')
			.attr('d', line(flights_nEEA2nEEA_nodes))
			.attr('class', 'flight')
			.attr('stroke', 'white')
			.attr('stroke-width', 5)
			.attr('fill', 'none')
			.attr('marker-end', 'url(#markerArrow)');

		
		// nEEA -> nEEA
		var centerX_EEA = data[2].coord.x;
		var centerY_EEA = data[2].coord.y+r/3;

		var flights_EEA2EEA_nodes = [ 
			{ x: centerX_EEA-shiftX, y: centerY_EEA+shiftY },
			{ x: centerX_EEA-shiftX*1.5, y: centerY_EEA+shiftY*2 },
			{ x: centerX_EEA, y: centerY_EEA+shiftY*3 },
			{ x: centerX_EEA+shiftX*1.5, y: centerY_EEA+shiftY*2 },
			{ x: centerX_EEA+shiftX, y: centerY_EEA+shiftY }
		];

		var flights_EEA2EEA = svg.append('path')
			.attr('d', line(flights_EEA2EEA_nodes))
			.attr('class', 'flight')
			.attr('stroke', 'white')
			.attr('stroke-width', 5)
			.attr('fill', 'none')
			.attr('marker-end', 'url(#markerArrow)');
	}

	function arrowPlace2Out() {
		/*
		var linesOut = svg.selectAll('.flight-out')
			.data(data)
			.enter()
			.append('line')
				.attr('x1', (d,i) => d.coord.x)
				.attr('y1', (d,i) => d.coord.y)
				.attr('x2', (d, i) => data[ (i+1) % 3].coord.x)
				.attr('y2', (d, i) => data[ (i+1) % 3].coord.y)
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');
		*/

		// UK -> nEEA
		var centerX_UK = data[0].coord.x-r;
		var centerY_UK = data[0].coord.y+r/4;

		var centerX_nEEA = data[1].coord.x;
		var centerY_nEEA = data[1].coord.y-r;

		var linesOut = svg.append('line')
				.attr('class', 'flight flight-out')
				.attr('x1', centerX_UK)
				.attr('y1', centerY_UK)
				.attr('x2', centerX_nEEA)
				.attr('y2', centerY_nEEA)
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');

		// UK -> EEA
		var centerX_UK = data[0].coord.x+r;
		var centerY_UK = data[0].coord.y+r/4;

		var centerX_EEA = data[2].coord.x;
		var centerY_EEA = data[2].coord.y-r;

		var linesOut = svg.append('line')
				.attr('class', 'flight flight-out')
				.attr('x1', centerX_UK)
				.attr('y1', centerY_UK)
				.attr('x2', centerX_EEA)
				.attr('y2', centerY_EEA)
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');
		
		// nEEA -> EEA
		var centerX_nEEA = data[1].coord.x+r-2;
		var centerY_nEEA = data[1].coord.y-r/4;

		var centerX_EEA = data[2].coord.x-r;
		var centerY_EEA = data[2].coord.y-r/4;

		var linesOut = svg.append('line')
				.attr('class', 'flight flight-out')
				.attr('x1', centerX_nEEA)
				.attr('y1', centerY_nEEA)
				.attr('x2', centerX_EEA)
				.attr('y2', centerY_EEA)
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');
	}

	function arrowPlace2In() {

		// nEEA -> UK
		var centerX_UK = data[0].coord.x-r/2;
		var centerY_UK = data[0].coord.y+r/3*2;

		var centerX_nEEA = data[1].coord.x+r/2+6;
		var centerY_nEEA = data[1].coord.y-r/3*2-6;

		var linesIn = svg.append('line')
				.attr('class', 'flight flight-out')
				.attr('x1', centerX_nEEA)
				.attr('y1', centerY_nEEA)
				.attr('x2', centerX_UK)
				.attr('y2', centerY_UK)
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');

		// EEA -> UK
		var centerX_UK = data[0].coord.x+r/2;
		var centerY_UK = data[0].coord.y+r/3*2;

		var centerX_EEA = data[2].coord.x-r/2-6;
		var centerY_EEA = data[2].coord.y-r/3*2-6;

		var linesIn = svg.append('line')
				.attr('class', 'flight flight-out')
				.attr('x1', centerX_EEA)
				.attr('y1', centerY_EEA)
				.attr('x2', centerX_UK)
				.attr('y2', centerY_UK)
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');

		// EEA -> nEEA
		var centerX_nEEA = data[1].coord.x+r;
		var centerY_nEEA = data[1].coord.y+r/3;

		var centerX_EEA = data[2].coord.x-r+3;
		var centerY_EEA = data[2].coord.y+r/3;

		var linesOut = svg.append('line')
				.attr('class', 'flight flight-out')
				.attr('x1', centerX_EEA)
				.attr('y1', centerY_EEA)
				.attr('x2', centerX_nEEA)
				.attr('y2', centerY_nEEA)				
				.attr('stroke', 'white')
				.attr('stroke-width', 5)
				.attr('fill', 'none')
				.attr('marker-end', 'url(#markerArrow)');

	}
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
	// ["UK", "Non EEA", "EEA"]
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