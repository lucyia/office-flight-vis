(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.destinations = destinations;

var _visUtil = require('./vis-util');

// general attribtues
var margin; /**
             * Visualization of departures and destinations.
             * Creates a custom visualization depicting countries of destinations and departures.
             *
             * @author lucyia <ping@lucyia.com>
             * @version 0.1
             */

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
function destinations(data) {

	init(data);

	drawVis(updateData(data));
}

/**
 * Sets up all scales and attributes acc. to given data and creates a SVG panel.
 *
 * @param {array} data array of objects representing each spending
 */
function init(data) {

	margin = { top: 10, right: 10, bottom: 10, left: 10 };
	width = 810 - margin.left - margin.right;
	height = 500 - margin.top - margin.bottom;

	color = d3.scale.ordinal()
	//.range(['#2196f3', '#cddc39', '#ff8100']);
	.range(['#0a65ad', '#99a717', '#d27d00']);

	svg = d3.select('#vis-destinations').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

/**
 * Creates the visualization with nodes, edges and text labels.
 *
 * @param {array} data
 */
function drawVis(data) {

	// create tooltip for places and call it
	tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
		return '<span class="number">Flights out: <span class="pull-right">' + numeral(d.departure.length).format('0,0') + '</span></span>\
				<br/><span class="number">Flights in: <span class="pull-right">' + numeral(d.destination.length).format('0,0') + '</span></span>';
	});

	svg.call(tip);

	var r = 60;

	// create a circle for each place
	var circles = svg.selectAll('.places').data(data).enter().append('circle').attr('cx', function (d) {
		return d.coord.x;
	}).attr('cy', function (d) {
		return d.coord.y;
	}).attr('r', r).attr('fill', function (d, i) {
		return color(i);
	}).on('mouseover', tip.show).on('mouseout', tip.hide);

	// create a label for each place and place it inside the place's circle
	var labels = svg.selectAll('.places-label').data(data).enter().append('text').attr('x', function (d) {
		return d.coord.x - d.place.length * 4;
	}).attr('y', function (d) {
		return d.coord.y + 5;
	}).attr('fill', 'white').style('font-weight', '600').text(function (d) {
		return d.place;
	});

	// arrow marker for the lines
	svg.append('defs').append('marker').attr('id', 'markerArrow').attr('markerWidth', 6).attr('markerHeight', 4).attr('refX', 2).attr('refY', 2).attr('orient', 'auto').append('path').attr('class', 'flight').attr('d', 'M0,0 L0,4 L3,2 L0,0').attr('fill', 'white');

	var shiftX = r / 2;
	var shiftY = r / 2;

	// line function
	var line = d3.svg.line().interpolate('basis').x(function (d) {
		return d.x;
	}).y(function (d) {
		return d.y;
	});

	arrowPlace2Self();

	arrowPlace2Out();

	arrowPlace2In();

	/**
  * Draws an arrow from a place to itself, representing flights from the place returing to it.
  */
	function arrowPlace2Self() {

		// UK -> UK
		var centerX_UK = data[0].coord.x;
		var centerY_UK = data[0].coord.y - r / 3;

		var flights_UK2UK_nodes = [{ x: centerX_UK + shiftX, y: centerY_UK - shiftY }, { x: centerX_UK + shiftX * 1.5, y: centerY_UK - shiftY * 2 }, { x: centerX_UK, y: centerY_UK - shiftY * 3 }, { x: centerX_UK - shiftX * 1.5, y: centerY_UK - shiftY * 2 }, { x: centerX_UK - shiftX, y: centerY_UK - shiftY }];

		var flights_UK2UK = svg.append('path').attr('d', line(flights_UK2UK_nodes)).attr('class', 'flight').attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');

		// nEEA -> nEEA
		var centerX_nEEA = data[1].coord.x;
		var centerY_nEEA = data[1].coord.y + r / 3;

		var flights_nEEA2nEEA_nodes = [{ x: centerX_nEEA - shiftX, y: centerY_nEEA + shiftY }, { x: centerX_nEEA - shiftX * 1.5, y: centerY_nEEA + shiftY * 2 }, { x: centerX_nEEA, y: centerY_nEEA + shiftY * 3 }, { x: centerX_nEEA + shiftX * 1.5, y: centerY_nEEA + shiftY * 2 }, { x: centerX_nEEA + shiftX, y: centerY_nEEA + shiftY }];

		var flights_nEEA2nEEA = svg.append('path').attr('d', line(flights_nEEA2nEEA_nodes)).attr('class', 'flight').attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');

		// nEEA -> nEEA
		var centerX_EEA = data[2].coord.x;
		var centerY_EEA = data[2].coord.y + r / 3;

		var flights_EEA2EEA_nodes = [{ x: centerX_EEA - shiftX, y: centerY_EEA + shiftY }, { x: centerX_EEA - shiftX * 1.5, y: centerY_EEA + shiftY * 2 }, { x: centerX_EEA, y: centerY_EEA + shiftY * 3 }, { x: centerX_EEA + shiftX * 1.5, y: centerY_EEA + shiftY * 2 }, { x: centerX_EEA + shiftX, y: centerY_EEA + shiftY }];

		var flights_EEA2EEA = svg.append('path').attr('d', line(flights_EEA2EEA_nodes)).attr('class', 'flight').attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');
	}

	/**
  * Draws an arrow from a place to another place, in the direction representing flights out.
  */
	function arrowPlace2Out() {

		// UK -> nEEA
		var centerX_UK = data[0].coord.x - r;
		var centerY_UK = data[0].coord.y + r / 4;

		var centerX_nEEA = data[1].coord.x;
		var centerY_nEEA = data[1].coord.y - r;

		var linesOut = svg.append('line').attr('class', 'flight flight-out').attr('x1', centerX_UK).attr('y1', centerY_UK).attr('x2', centerX_nEEA).attr('y2', centerY_nEEA).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');

		// UK -> EEA
		var centerX_UK = data[0].coord.x + r;
		var centerY_UK = data[0].coord.y + r / 4;

		var centerX_EEA = data[2].coord.x;
		var centerY_EEA = data[2].coord.y - r;

		var linesOut = svg.append('line').attr('class', 'flight flight-out').attr('x1', centerX_UK).attr('y1', centerY_UK).attr('x2', centerX_EEA).attr('y2', centerY_EEA).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');

		// nEEA -> EEA
		var centerX_nEEA = data[1].coord.x + r - 2;
		var centerY_nEEA = data[1].coord.y - r / 4;

		var centerX_EEA = data[2].coord.x - r;
		var centerY_EEA = data[2].coord.y - r / 4;

		var linesOut = svg.append('line').attr('class', 'flight flight-out').attr('x1', centerX_nEEA).attr('y1', centerY_nEEA).attr('x2', centerX_EEA).attr('y2', centerY_EEA).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');
	}

	/**
  * Draws an arrow from a place to another place, in the direction representing flights in.
  */
	function arrowPlace2In() {

		// nEEA -> UK
		var centerX_UK = data[0].coord.x - r / 2 - 8;
		var centerY_UK = data[0].coord.y + r / 3 * 2 + 8;

		var centerX_nEEA = data[1].coord.x + r / 2 + 6;
		var centerY_nEEA = data[1].coord.y - r / 3 * 2 - 6;

		var linesIn = svg.append('line').attr('class', 'flight flight-out').attr('x1', centerX_nEEA).attr('y1', centerY_nEEA).attr('x2', centerX_UK).attr('y2', centerY_UK).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');

		// EEA -> UK
		var centerX_UK = data[0].coord.x + r / 2 + 8;
		var centerY_UK = data[0].coord.y + r / 3 * 2 + 8;

		var centerX_EEA = data[2].coord.x - r / 2 - 6;
		var centerY_EEA = data[2].coord.y - r / 3 * 2 - 6;

		var linesIn = svg.append('line').attr('class', 'flight flight-out').attr('x1', centerX_EEA).attr('y1', centerY_EEA).attr('x2', centerX_UK).attr('y2', centerY_UK).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');

		// EEA -> nEEA
		var centerX_nEEA = data[1].coord.x + r;
		var centerY_nEEA = data[1].coord.y + r / 3;

		var centerX_EEA = data[2].coord.x - r + 3;
		var centerY_EEA = data[2].coord.y + r / 3;

		var linesOut = svg.append('line').attr('class', 'flight flight-out').attr('x1', centerX_EEA).attr('y1', centerY_EEA).attr('x2', centerX_nEEA).attr('y2', centerY_nEEA).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');
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
	var places = (0, _visUtil.uniqValues)(data, 'destination');

	// coordinations of circles for each place
	var placesCoord = [{ x: width / 2, y: height / 4 }, { x: width / 3, y: height / 3 * 2 }, { x: width / 3 * 2, y: height / 3 * 2 }];

	// create new objects and add them in the dataset
	places.forEach(function (place, i) {
		var dataObj = {};

		dataObj.place = place;
		dataObj.destination = data.filter(function (d) {
			return d.destination === place;
		});
		dataObj.departure = data.filter(function (d) {
			return d.departure === place;
		});
		dataObj.coord = { x: placesCoord[i].x, y: placesCoord[i].y };

		dataset.push(dataObj);
	});

	return dataset;
}

},{"./vis-util":7}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.distribution = distribution;
/**
 * Visualization of data distribution.
 * Creates a box-and-whiskey plot from given data.
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

var min;
var max;

var chart;

function distribution(data) {

  init(data);
}

function init(data) {
  margin = { top: 10, right: 10, bottom: 30, left: 10 };
  width = 260 - margin.left - margin.right;
  height = 345 - margin.top - margin.bottom;
}

},{}],3:[function(require,module,exports){
'use strict';

var _visualize = require('./visualize');

(function ready(fn) {
	if (document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
})(init);

/**
 * Initializes reading of file and then visualization process.
 */
/**
 * Initialization of all modules 
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

function init() {

	// setup numeral for correct number formatting
	numeral.language('en-gb');

	// parse file
	d3.csv('Home_Office_Air_Travel_Data_2011.csv').row(function (d) {
		return {
			departure: d.Departure,
			destination: d.Destination,
			directorate: d.Directorate,
			month: d.Departure_2011,
			fare: parseFloat(d.Paid_fare),
			ticket: d.Ticket_class_description,
			supplier: d.Supplier_name
		};
	}).get(function (error, data) {
		if (error) console.log(error);

		(0, _visualize.visualize)(data);
	});
}

},{"./visualize":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.spending = spending;

var _visUtil = require('./vis-util');

var _visualize = require('./visualize');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Visualization of monthly spending.
                                                                                                                                                                                                     * Creates a bar chart from given data and adds listeners for filtering one month.
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
// node for created filter
var filter;

// function for positioning elements in x direction
var xScale;
// function for positioning elements in y direction
var yScale;

// month axis
var xAxis;
// number axis
var yAxis;

// function for binding a color to a ticket type
var color;

// function for advanced tooltip
var tip;

// scale for stacking rectangles
var stack;

// transformed data
var dataset;

/**
 * Initializes all variables needed for visualization and creates a dataset from given data that is more suitable for working within visualization.
 */
function spending(data) {

	init(data);

	dataset = spendingDataset(data);

	createBarChart(dataset);

	createLegend(dataset);
}

/**
 * Sets up all scales and attributes acc. to given data and creates a svg panel.
 *
 * @param {array} data array of objects representing each spending
 */
function init(data) {

	margin = { top: 10, right: 35, bottom: 35, left: 10 };
	width = 1085 - margin.left - margin.right;
	height = 345 - margin.top - margin.bottom;

	xScale = d3.scale.ordinal().domain(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']).rangeRoundBands([0, width], .05);

	// round the maximum value from data to thousands
	var roundedMax = Math.round(Math.max.apply(Math, _toConsumableArray(monthFares(data))) / 1000) * 1000;
	yScale = d3.scale.linear().domain([0, roundedMax]).range([height, 0]);

	xAxis = d3.svg.axis().scale(xScale).orient('bottom');

	yAxis = d3.svg.axis().scale(yScale).orient('right').tickFormat(function (d) {
		return numeral(d).format('0a');
	});

	color = d3.scale.ordinal().domain((0, _visUtil.uniqValues)(data, 'ticket')).range(["#00bcd4", "#1d6dd0", "#edcd02"]);

	stack = d3.layout.stack();

	svg = d3.select('#vis-spending').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	/**
  * Calculates the monthly spending for all ticket types and returns the created array.
  *
  * @param {array} data array of objects represending all year spedning
  * @return {array} sumMonthlyFares array of numbers representing each months spending on all tickets
  */
	function monthFares(data) {
		// get all fares for each month
		var fares = (0, _visUtil.uniqValues)(data, 'month').map(function (month) {
			return data.filter(function (d) {
				return d.month === month;
			});
		});
		// sum up all fares in each month
		var sumMonthlyFares = fares.map(function (fare) {
			return fare.reduce(function (a, b) {
				return a + b.fare;
			}, 0);
		});

		return sumMonthlyFares;
	}
}

/**
 * Creates a stacked bar chart according to given data. The chart has layers for each ticket type.
 * There are listeners for creating a tooltip and filter for selecting only one month.
 * 
 * @param {array} data array of objects in the form of 
 */
function createBarChart(data) {
	// create stacked data for the visualization
	stack(data);

	// create tooltip and call it
	tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
		var index = color.range().indexOf(color(d.ticket));
		return '<span class="type type-' + index + '">' + d.ticket + '</span>\
				<br/><span class="value">' + numeral(d.y).format('$0,0') + '</span>\
				<br/><span class="number">' + numeral(d.values.length).format('0,0') + ' tickets</span>';
	});

	svg.call(tip);

	// create a rectangle as a background
	var background = svg.append('rect').attr('class', 'svg-background').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height).attr('fill', 'transparent').on('click', deselect);

	// create group for each ticket type
	var groups = svg.selectAll('g').data(data).enter().append('g').attr('class', function (d, i) {
		return 'ticket-' + i;
	});

	// create bars for each ticket group
	groups.selectAll('.bar').data(function (d) {
		return d;
	}).enter().append('rect').attr('class', 'bar').attr('x', function (d) {
		return xScale(d.x);
	}).attr('y', function (d) {
		return yScale(d.y + d.y0);
	}).attr('width', function (d) {
		return xScale.rangeBand();
	}).attr('height', function (d) {
		return yScale(d.y0) - yScale(d.y + d.y0);
	}).attr('fill', function (d) {
		return color(d.ticket);
	}).on('mouseover', mouseover).on('mouseout', mouseout).on('click', mouseclick);

	svg.append('g').attr('class', 'axis axis-x').attr('transform', 'translate(' + 0 + ',' + height + ')').call(xAxis);

	svg.append('g').attr('class', 'axis axis-y').attr('transform', 'translate(' + width + ',' + 0 + ')').call(yAxis);

	filter = svg.append('g').attr('class', 'filter');

	/**
  * Deletes the filter containing selected month and updates all other visualizations.
  */
	function deselect() {

		var filter = document.getElementsByClassName('filter')[0];

		if (filter.childNodes.length > 0) {
			// delete selected month
			filter.removeChild(filter.childNodes[0]);

			// update all other visualizations
			(0, _visualize.updatedSpending)();
		}
	}

	/**
  * Creates a filter for a whole month after the user clicks on any ticket ticket type. The filter is represented with a white-bordered rectangle.
  * All other visualizations are updated according to selected month.
  *
  * @param {object} data
  */
	function mouseclick(data) {
		// update other visualizations according to selected month
		(0, _visualize.updatedSpending)(data.x);

		// get all ticket types for selected month
		var ticketsMonth = dataset.map(function (tickets) {
			return tickets.filter(function (d) {
				return d.x === data.x;
			});
		});

		// flatten the array
		ticketsMonth = [].concat.apply([], ticketsMonth);

		// calculate the height and starting point of months bar
		var y0 = ticketsMonth[0].y0;
		var barHeight = ticketsMonth.reduce(function (a, b) {
			return a + b.y;
		}, 0);

		// create and update rectangle for highlighting the selected month
		var selected = filter.selectAll('.selected').data([data]);

		selected.attr('x', function (d) {
			return xScale(d.x);
		}).attr('y', function (d) {
			return yScale(barHeight);
		}).attr('height', yScale(y0) - yScale(barHeight));

		selected.enter().append('rect').attr('class', 'selected').attr('stroke-width', 3).attr('stroke', 'white').attr('fill', 'none').attr('x', function (d) {
			return xScale(d.x);
		}).attr('y', function (d) {
			return yScale(barHeight);
		}).attr('width', function (d) {
			return xScale.rangeBand();
		}).attr('height', yScale(y0) - yScale(barHeight));

		selected.exit().remove();
	}

	/**
  * Hihglight the hovered element and shows tooltip.
  *
  * @param {object} data
  */
	function mouseover(d) {
		d3.select(this).attr('fill', function (d) {
			return d3.rgb(color(d.ticket)).brighter(.5);
		});

		tip.show(d);
	}

	/**
  * Resets the color of the element and hides the tooltip.
  */
	function mouseout() {
		d3.select(this).attr('fill', function (d) {
			return color(d.ticket);
		});

		tip.hide();
	}
}

/**
 * Creates a legend for the spending visualization.
 * For each ticket type a rectangle and a text label is created.
 *
 * @param {array} data
 */
function createLegend(data) {

	// rectangle size
	var size = 10;

	// svg panel for the legend
	var svgLegend = d3.select('#spending-legend').append('svg').attr('width', 200).attr('height', 90).append('g').attr('transform', 'translate(20,20)');

	// create rectangles for each element
	svgLegend.selectAll('.s-legend').data(data).enter().append('rect').attr('class', 's-legend legend').attr('x', 0).attr('y', function (d, i) {
		return i * size * 2;
	}).attr('height', size).attr('width', size).attr('fill', function (d) {
		return color(d[0].ticket);
	});

	// create text label
	svgLegend.selectAll('.s-legend-label').data(data).enter().append('text').attr('class', 's-legend-label legend').attr('x', 0).attr('y', function (d, i) {
		return i * size * 2;
	}).attr('dx', size + 5).attr('dy', size).attr('fill', 'white').text(function (d) {
		return d[0].ticket;
	});
}

/**
 * Transform data into a new dataset which has rearranged values
 * so that it is an array of ticket type arrays
 *
 * @param {array} data array of data objects extracted from file
 * @return {array} dataset array of data objects grouped by ticket types and months
 */
function spendingDataset(data) {
	var dataset = [];

	var tickets = (0, _visUtil.uniqValues)(data, 'ticket');

	var months = (0, _visUtil.uniqValues)(data, 'month');

	var monthlyData = months.map(function (month) {
		return data.filter(function (d) {
			return d.month === month;
		});
	});

	tickets.forEach(function (ticket) {
		var ticketArray = [];

		monthlyData.forEach(function (monthData, i) {
			var dataObj = {};

			dataObj.ticket = ticket;
			dataObj.values = monthData.filter(function (d) {
				return d.ticket === ticket;
			});
			dataObj.x = months[i];

			dataObj.y = dataObj.values.reduce(function (a, b) {
				if (b.ticket === ticket) {
					return a + b.fare;
				} else {
					return a;
				}
			}, 0);

			ticketArray.push(dataObj);
		});

		dataset.push(ticketArray);
	});

	return dataset;
}

},{"./vis-util":7,"./visualize":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ticket = ticket;
/**
 * Visualization for tickets number and average price.
 * Creates a donut chart representing the partial relationship and text element.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

// general attribtues
var margin;
var width;
var height;

/**
 * Initializes all variables needed and creates the visualization.
 *
 * @param {array} data array of data objects
 * @param {string} param name of the parameter which will be used for visualization of top spending
 * @param {string} visId id of the visualization panel
 * @param {string} color fill color used for arcs
 */
function ticket(data, param, visId, color) {
	var vis = {};
	vis.update = updateChart;
	vis.param = param;

	var colorType;

	var svg;

	var pie;
	var arc;
	var path;

	var percentage;
	var exactValue;

	var allItems;
	var partItems;

	var initilized = false;

	init(data);

	createVis(data);

	initilized = true;

	return vis;

	/**
  * Initializes all needed variables for visualization and creates a SVG panel. 
  *
  * @param {array} data
  */
	function init(data) {
		margin = { top: 0, right: 0, bottom: 10, left: 5 };
		width = 260 - margin.left - margin.right;
		height = 130 - margin.top - margin.bottom;

		colorType = d3.scale.ordinal().range([color, 'rgba(0,0,0,.3)']);

		svg = d3.select('#' + visId).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + width / 2 + ',' + (height / 2 - margin.bottom) + ')');

		arc = d3.svg.arc().outerRadius(50 - 10).innerRadius(50 - 20);

		pie = d3.layout.pie().sort(null).value(function (d) {
			return d.value;
		});
	}

	/**
  * Creates the visualization - pie chart and text values - percentage and exact value. 
  *
  * @param {array} dataset 
  */
	function createVis(dataset) {
		// update data according to change
		data = updateData(dataset, param);

		// update the chart
		path = svg.selectAll('.arc-' + param).data(data).enter().append('path').attr('class', 'arc-' + param).attr('d', arc).attr('fill', function (d, i) {
			return colorType(i);
		}).each(function (d) {
			this._current = d;
		});

		// update
		percentage = svg.selectAll('.perc-' + param).data([data[0]]).enter().append('text').attr('class', 'perc-' + param).attr('x', -15).attr('y', 5).attr('fill', 'white').text(percent);

		exactValue = svg.selectAll('.exval-' + param).data([data[0]]).enter().append('text').attr('class', 'exval-' + param).attr('x', -15).attr('y', 65).attr('fill', 'white').attr('font-size', 18).text(roundValue);
	}

	/**
  * Updates the chart and all text values according to new given data. 
  */
	function updateChart(dataset) {

		var data = updateData(dataset);

		// compute the new angles
		path = path.data(data);
		// redraw all arcs
		path.transition().attrTween('d', arcTween);

		// update text - percentage number
		percentage.data([data[0]]).text(percent);

		// update text - exact value number
		exactValue.data([data[0]]).text(roundValue);

		/**
   * Store the displayed angles in _current.
   * Then, interpolate from _current to the new angles.
   * During the transition, _current is updated in-place by d3.interpolate.
   *
   * code taken from: https://bl.ocks.org/mbostock/1346410
   */
		function arcTween(a) {
			var i = d3.interpolate(this._current, a);

			this._current = i(0);

			return function (t) {
				return arc(i(t));
			};
		}
	}

	/**
  * Creates a dataset from given data for the visualization in the form of array of two objects
  * where first object represents a part of the whole and the second objects represents the rest of the whole.
  * The whole is calculated according to a parameter, e.g. the whole can be number of tickets.
  *
  * @param {array} data 
  * @return {array} piedData array of objects as returned from d3.pie function
  */
	function updateData(data) {
		var dataset;

		if (vis.param === 'fare') {

			if (!initilized) {
				allItems = avgPrice(data);
			}

			partItems = avgPrice(data);
		} else {

			if (!initilized) {
				allItems = data[param];
			}

			partItems = data[param];
		}

		if (allItems === partItems) {
			dataset = [{ value: allItems }, { value: 0 }];
		} else {
			dataset = [{ value: partItems }, { value: allItems - partItems }];
		}

		return pie(dataset);
	}

	/**
  * Formats the value of the given object - either as a number with currency or just a number. 
  *
  * @param {object} d data object
  * @return {string} roundValue formatted value
  */
	function roundValue(d) {
		if (vis.param === 'fare') {
			return numeral(d.value).format('$0,0');
		} else {
			return numeral(d.value).format('0,0');
		}
	}

	/**
  * Formats the value of the given object into a rounded percentage.
  *
  * @param {object} d data object
  * @return {string} percent formatted string
  */
	function percent(d) {
		var percent = d.value / allItems * 100;
		return Math.round(percent) + '%';
	}
}

/**
 * Calculates the average price of tickets from given data - sum of all fares over number of all tickets.
 *
 * @param {array} data
 * @return {number} avgPrice
 */
function avgPrice(data) {

	var priceSum = data.reduce(function (a, b) {
		return a + b.fare;
	}, 0);

	var ticketNum = data.length;

	return priceSum / ticketNum;
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.topSpending = topSpending;

var _visUtil = require('./vis-util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Visualization of top spending for given element.
                                                                                                                                                                                                     * Creates five bar charts stating the top elements which spend the most.
                                                                                                                                                                                                     *
                                                                                                                                                                                                     * @author lucyia <ping@lucyia.com>
                                                                                                                                                                                                     * @version 0.1
                                                                                                                                                                                                     */

// general attribtues
var margin;
var width;
var height;

// function for advanced tooltip
var tip;

/**
 * Initializes all variables needed and creates the visualization.
 *
 * @param {array} data array of data objects
 * @param {string} param name of the parameter which will be used for visualization of top spending
 * @param {string} visId id of the visualization panel
 * @param {string} color fill color used for all rectangles
 * @param {number} maxNumber number of param displayed
 * @param {number} panelHeight height of the SVG panel
 */
function topSpending(data, param, visId, color, maxNumber, panelHeight) {

	var vis = {};
	vis.update = updateTopSpending;

	var xScale;
	var yScale;
	var svg;

	// calculate data, initialize and draw chart
	var topData = calcTop(data);

	init(topData);

	createBarChart(topData);

	return vis;

	/**
  * Firstly, calculates the new top data and then updates the bar chart and text values according to new data.
  *
  * @param {array} data
  */
	function updateTopSpending(data) {
		update(calcTop(data));
	}

	/**
  * Calculates top five items from data according to spending (fare) values.
  *
  * @param {array} data
  * @return {array} dataset updated 
  */
	function calcTop(data) {
		return (0, _visUtil.calcSpending)(data, param).sort(function (a, b) {
			return b.fare - a.fare;
		}).slice(0, maxNumber);
	}

	/**
  * Initializes all needed variables for visualization and creates a SVG panel. 
  *
  * @param {array} data
  */
	function init(data) {
		margin = { top: 0, right: 0, bottom: 0, left: 5 };
		width = 260 - margin.left - margin.right;
		height = panelHeight - margin.top - margin.bottom;

		yScale = d3.scale.ordinal().domain(data.map(function (d) {
			return d[param];
		})).rangeRoundBands([0, height], .1);

		xScale = d3.scale.linear().domain([0, Math.max.apply(Math, _toConsumableArray(data.map(function (d) {
			return d.fare;
		})))]).range([0, width]);

		svg = d3.select('#' + visId).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	}

	/**
  * Creates bar chart and a tooltip.
  *
  * @param {array} data
  */
	function createBarChart(data) {

		// create tooltip and call it
		tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
			return '<span class="value">' + numeral(d.fare).format('$0,0') + '</span>\
					<br/><span class="number">' + numeral(d.values.length).format('0,0') + ' tickets</span>';
		});

		svg.call(tip);

		// create bar charts
		update(data);
	}

	/**
  * Updates the bar chart visualization with all names and fare values.
  *
  * @param {array} data array of objects; e.g. [ { fare: x, otherParam: a }, { fare: y, otherParam: b }, ... ]
  */
	function update(data) {
		// update scale so relative differencies can be seen
		xScale.domain([0, Math.max.apply(Math, _toConsumableArray(data.map(function (d) {
			return d.fare;
		})))]);

		// draw rectangle representing spending
		var bars = svg.selectAll('.bar-' + param).data(data);

		bars.transition().attr('width', function (d) {
			return xScale(d.fare);
		});

		bars.enter().append('rect').attr('class', 'bar-' + param).attr('x', function (d) {
			return 0;
		}).attr('y', function (d) {
			return yScale(d[param]);
		}).attr('height', function (d) {
			return yScale.rangeBand();
		}).attr('width', function (d) {
			return xScale(d.fare);
		}).attr('fill', color).on('mouseover', tip.show).on('mouseout', tip.hide);

		bars.exit().remove();

		// draw text to the left of each bar representing the name
		var names = svg.selectAll('.bar-' + param + '-name').data(data);

		names.transition().text(function (d) {
			return d[param];
		});

		names.enter().append('text').attr('class', 'bar-' + param + '-name').attr('x', 0).attr('y', function (d) {
			return yScale(d[param]);
		}).attr('dy', yScale.rangeBand() / 4 * 3).attr('dx', 5).attr('fill', 'white').text(function (d) {
			return d[param];
		}).on('mouseover', tip.show).on('mouseout', tip.hide);

		names.exit().remove();

		// draw text to the right of each bar representing the rounded spending
		var fares = svg.selectAll('.bar-' + param + '-fare').data(data);

		fares.transition().text(function (d) {
			return numeral(d.fare).format('0a');
		});

		fares.enter().append('text').attr('class', 'bar-' + param + '-fare').attr('x', width - 35).attr('y', function (d) {
			return yScale(d[param]);
		}).attr('dy', yScale.rangeBand() / 4 * 3).attr('dx', 5).attr('fill', 'white').text(function (d) {
			return numeral(d.fare).format('0a');
		});

		fares.exit().remove();
	}
}

},{"./vis-util":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.uniqValues = uniqValues;
exports.calcSpending = calcSpending;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Finds out the unique values of given data for given parameter.
 *
 * @param {array} data array of objects representing all year spending
 * @param {string} param parameter which should be looked up
 * @return {array} uniqueValues array of all unique values for given parameter
 */
function uniqValues(data, param) {
	return [].concat(_toConsumableArray(new Set(data.map(function (d) {
		return d[param];
	}))));
}

/**
 * Calculates the whole year's spending for a given param (e.g. supplier, directorate) and returns it in updated array of objects.
 *
 * @param {array} data
 * @param {string} param
 * @return {array} allSpending array of updated objects, e.g. [ {fare: x, param: a}, {fare: y, param: b}, ...]
 */
function calcSpending(data, param) {
	var uniqItems = uniqValues(data, param);

	var allParams = uniqItems.map(function (item) {
		return data.filter(function (d) {
			return d[param] === item;
		});
	});

	var allSpending = [];

	allParams.forEach(function (itemArray) {
		var obj = {};

		obj['fare'] = itemArray.reduce(function (a, b) {
			return a + b.fare;
		}, 0);
		obj[param] = itemArray[0][param];
		obj['values'] = itemArray;

		allSpending.push(obj);
	});

	return allSpending;
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.visualize = visualize;
exports.updatedSpending = updatedSpending;

var _spending = require('./spending');

var _distribution = require('./distribution');

var _topSpending = require('./topSpending');

var _ticket = require('./ticket');

var _destinations = require('./destinations');

var data;

/*
var panels = [
	{id: 'vis-spending', fn: spending, args: [data]}
	];
*/
/**
 * Main visualization module for creating charts and vis for passed data.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

var panels = ['vis-spending', 'vis-distribution', 'vis-ticket-num', 'vis-ticket-avg', 'vis-top-sup', 'vis-top-dir', 'vis-destinations', 'vis-top10-sup'];

var sup;
var dir;

var price;
var num;

/**
 *
 *
 * @param {array} dataset array of objects for visualization
 */
function visualize(dataset) {
	data = dataset;

	detectPanels(data);
}

/**
 * Data is firstly filtered according to month and all other visualizations are then redrawn with updated data.
 *
 * @param {string} month selected month which will be used for filtering data
 */
function updatedSpending(month) {
	var dataset;

	if (month) {
		// redraw all panels with only given month data
		dataset = data.filter(function (d) {
			return d.month === month;
		});
	} else {
		// redraw all panels with all months data
		dataset = data;
	}

	sup.update(dataset);
	dir.update(dataset);
	num.update(dataset);
	price.update(dataset);
}

/**
 *
 */
function detectPanels(data) {
	panels.forEach(function (panel) {
		if (document.getElementById(panel)) {
			switch (panel) {
				case panels[0]:
					(0, _spending.spending)(data);
					break;

				case panels[1]:
					(0, _distribution.distribution)(data);
					break;

				case panels[2]:
					num = (0, _ticket.ticket)(data, 'length', panels[2], '#d0725d');
					break;

				case panels[3]:
					price = (0, _ticket.ticket)(data, 'fare', panels[3], '#d2a24c');
					break;

				case panels[4]:
					sup = (0, _topSpending.topSpending)(data, 'supplier', panels[4], '#4b9226', 5, 130);
					break;

				case panels[5]:
					dir = (0, _topSpending.topSpending)(data, 'directorate', panels[5], '#af4c7e', 5, 130);
					break;

				case panels[6]:
					(0, _destinations.destinations)(data);
					break;

				case panels[7]:
					sup = (0, _topSpending.topSpending)(data, 'supplier', panels[7], '#4b9226', 10, 320);
					break;

			}
		}
	});
}

},{"./destinations":1,"./distribution":2,"./spending":4,"./ticket":5,"./topSpending":6}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGVzdGluYXRpb25zLmpzIiwianNcXGRpc3RyaWJ1dGlvbi5qcyIsImpzXFxpbml0LmpzIiwianNcXHNwZW5kaW5nLmpzIiwianNcXHRpY2tldC5qcyIsImpzXFx0b3BTcGVuZGluZy5qcyIsImpzXFx2aXMtdXRpbC5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQzJCZ0IsWSxHQUFBLFk7O0FBbkJoQjs7O0FBR0EsSUFBSSxNQUFKLEM7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFKO0FBQ0EsSUFBSSxNQUFKOzs7QUFHQSxJQUFJLEdBQUo7OztBQUdBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxHQUFKOzs7OztBQUtPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0Qjs7QUFFbEMsTUFBSyxJQUFMOztBQUVBLFNBQVEsV0FBVyxJQUFYLENBQVI7QUFFQTs7Ozs7OztBQU9ELFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0I7O0FBRW5CLFVBQVMsRUFBQyxLQUFLLEVBQU4sRUFBVSxPQUFPLEVBQWpCLEVBQXFCLFFBQVEsRUFBN0IsRUFBaUMsTUFBTSxFQUF2QyxFQUFUO0FBQ0EsU0FBUSxNQUFNLE9BQU8sSUFBYixHQUFvQixPQUFPLEtBQW5DO0FBQ0EsVUFBUyxNQUFNLE9BQU8sR0FBYixHQUFtQixPQUFPLE1BQW5DOztBQUVBLFNBQVEsR0FBRyxLQUFILENBQVMsT0FBVDs7QUFBQSxFQUVOLEtBRk0sQ0FFQSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLENBRkEsQ0FBUjs7QUFJQSxPQUFNLEdBQUcsTUFBSCxDQUFVLG1CQUFWLEVBQ0osTUFESSxDQUNHLEtBREgsRUFFSCxJQUZHLENBRUUsT0FGRixFQUVXLFFBQVEsT0FBTyxJQUFmLEdBQXNCLE9BQU8sS0FGeEMsRUFHSCxJQUhHLENBR0UsUUFIRixFQUdZLFNBQVMs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QWtCLFVBQWxCLEVBQThCLE9BQU8sQ0FBUCxDQUE5QixFQUF5QyxTQUF6QyxFQUFvRCxFQUFwRCxFQUF3RCxHQUF4RCxDQUFOO0FBQ0E7O0FBL0JGO0FBa0NBO0FBQ0QsRUFyQ0Q7QUFzQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgZGVwYXJ0dXJlcyBhbmQgZGVzdGluYXRpb25zLlxyXG4gKiBDcmVhdGVzIGEgY3VzdG9tIHZpc3VhbGl6YXRpb24gZGVwaWN0aW5nIGNvdW50cmllcyBvZiBkZXN0aW5hdGlvbnMgYW5kIGRlcGFydHVyZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dW5pcVZhbHVlc30gZnJvbSAnLi92aXMtdXRpbCc7XHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG4vLyBjb2xvciBmdW5jdGlvbiBhc3NpZ25pbmcgZWFjaCBwbGFjZSB1bmlxdWUgY29sb3JcclxudmFyIGNvbG9yO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIGRhdGFzZXQgZnJvbSBnaXZlbiBkYXRhIHRoYXQgaXMgbW9yZSBzdWl0YWJsZSBmb3Igd29ya2luZyB3aXRoaW4gdmlzdWFsaXphdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXN0aW5hdGlvbnMoZGF0YSkge1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkcmF3VmlzKHVwZGF0ZURhdGEoZGF0YSkpO1xyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqIFNldHMgdXAgYWxsIHNjYWxlcyBhbmQgYXR0cmlidXRlcyBhY2MuIHRvIGdpdmVuIGRhdGEgYW5kIGNyZWF0ZXMgYSBTVkcgcGFuZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgZWFjaCBzcGVuZGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaW5pdChkYXRhKSB7XHRcclxuXHJcblx0bWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAxMCwgbGVmdDogMTB9O1xyXG5cdHdpZHRoID0gODEwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0aGVpZ2h0ID0gNTAwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQvLy5yYW5nZShbJyMyMTk2ZjMnLCAnI2NkZGMzOScsICcjZmY4MTAwJ10pO1xyXG5cdFx0LnJhbmdlKFsnIzBhNjVhZCcsICcjOTlhNzE3JywgJyNkMjdkMDAnXSlcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLWRlc3RpbmF0aW9ucycpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgbWFyZ2luLmxlZnQgKycsJysgbWFyZ2luLnRvcCArJyknKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIHZpc3VhbGl6YXRpb24gd2l0aCBub2RlcywgZWRnZXMgYW5kIHRleHQgbGFiZWxzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBkcmF3VmlzKGRhdGEpIHtcclxuXHJcblx0Ly8gY3JlYXRlIHRvb2x0aXAgZm9yIHBsYWNlcyBhbmQgY2FsbCBpdFxyXG5cdHRpcCA9IGQzLnRpcCgpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cIm51bWJlclwiPkZsaWdodHMgb3V0OiA8c3BhbiBjbGFzcz1cInB1bGwtcmlnaHRcIj4nK251bWVyYWwoZC5kZXBhcnR1cmUubGVuZ3RoKS5mb3JtYXQoJzAsMCcpKyc8L3NwYW4+PC9zcGFuPlxcXHJcblx0XHRcdFx0PGJyLz48c3BhbiBjbGFzcz1cIm51bWJlclwiPkZsaWdodHMgaW46IDxzcGFuIGNsYXNzPVwicHVsbC1yaWdodFwiPicrbnVtZXJhbChkLmRlc3RpbmF0aW9uLmxlbmd0aCkuZm9ybWF0KCcwLDAnKSsnPC9zcGFuPjwvc3Bhbj4nO1xyXG5cdFx0fSk7XHRcclxuXHJcblx0c3ZnLmNhbGwodGlwKTtcclxuXHRcclxuXHR2YXIgciA9IDYwO1xyXG5cclxuXHQvLyBjcmVhdGUgYSBjaXJjbGUgZm9yIGVhY2ggcGxhY2VcclxuXHR2YXIgY2lyY2xlcyA9IHN2Zy5zZWxlY3RBbGwoJy5wbGFjZXMnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0XHQuYXR0cignY3gnLCBkID0+IGQuY29vcmQueClcclxuXHRcdFx0LmF0dHIoJ2N5JywgZCA9PiBkLmNvb3JkLnkpXHJcblx0XHRcdC5hdHRyKCdyJywgcilcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAoZCwgaSkgPT4gY29sb3IoaSkpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XHJcblxyXG5cdC8vIGNyZWF0ZSBhIGxhYmVsIGZvciBlYWNoIHBsYWNlIGFuZCBwbGFjZSBpdCBpbnNpZGUgdGhlIHBsYWNlJ3MgY2lyY2xlXHJcblx0dmFyIGxhYmVscyA9IHN2Zy5zZWxlY3RBbGwoJy5wbGFjZXMtbGFiZWwnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoJ3gnLCBkID0+IGQuY29vcmQueCAtIGQucGxhY2UubGVuZ3RoKjQpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiBkLmNvb3JkLnkgKyA1KVxyXG5cdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdC5zdHlsZSgnZm9udC13ZWlnaHQnLCAnNjAwJylcclxuXHRcdFx0LnRleHQoIGQgPT4gZC5wbGFjZSApO1xyXG5cclxuXHQvLyBhcnJvdyBtYXJrZXIgZm9yIHRoZSBsaW5lc1xyXG5cdHN2Zy5hcHBlbmQoJ2RlZnMnKVxyXG5cdFx0LmFwcGVuZCgnbWFya2VyJylcclxuXHRcdFx0LmF0dHIoJ2lkJywgJ21hcmtlckFycm93JylcclxuXHRcdFx0LmF0dHIoJ21hcmtlcldpZHRoJywgNilcclxuXHRcdFx0LmF0dHIoJ21hcmtlckhlaWdodCcsIDQpXHJcblx0XHRcdC5hdHRyKCdyZWZYJywgMilcclxuXHRcdFx0LmF0dHIoJ3JlZlknLCAyKVxyXG5cdFx0XHQuYXR0cignb3JpZW50JywgJ2F1dG8nKVxyXG5cdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQnKVxyXG5cdFx0XHQuYXR0cignZCcsICdNMCwwIEwwLDQgTDMsMiBMMCwwJylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKTtcclxuXHJcblx0dmFyIHNoaWZ0WCA9IHIvMjtcclxuXHR2YXIgc2hpZnRZID0gci8yO1xyXG5cclxuXHQvLyBsaW5lIGZ1bmN0aW9uXHJcblx0dmFyIGxpbmUgPSBkMy5zdmcubGluZSgpXHJcblx0XHQuaW50ZXJwb2xhdGUoJ2Jhc2lzJylcclxuXHRcdC54KCBkID0+IGQueClcclxuXHRcdC55KCBkID0+IGQueSk7XHJcblxyXG5cdGFycm93UGxhY2UyU2VsZigpO1xyXG5cclxuXHRhcnJvd1BsYWNlMk91dCgpO1xyXG5cclxuXHRhcnJvd1BsYWNlMkluKCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIERyYXdzIGFuIGFycm93IGZyb20gYSBwbGFjZSB0byBpdHNlbGYsIHJlcHJlc2VudGluZyBmbGlnaHRzIGZyb20gdGhlIHBsYWNlIHJldHVyaW5nIHRvIGl0LlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGFycm93UGxhY2UyU2VsZigpIHtcclxuXHJcblx0XHQvLyBVSyAtPiBVS1xyXG5cdFx0dmFyIGNlbnRlclhfVUsgPSBkYXRhWzBdLmNvb3JkLng7XHJcblx0XHR2YXIgY2VudGVyWV9VSyA9IGRhdGFbMF0uY29vcmQueS1yLzM7XHJcblxyXG5cdFx0dmFyIGZsaWdodHNfVUsyVUtfbm9kZXMgPSBbIFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfVUsrc2hpZnRYLCB5OiBjZW50ZXJZX1VLLXNoaWZ0WSB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfVUsrc2hpZnRYKjEuNSwgeTogY2VudGVyWV9VSy1zaGlmdFkqMiB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfVUssIHk6IGNlbnRlcllfVUstc2hpZnRZKjMgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX1VLLXNoaWZ0WCoxLjUsIHk6IGNlbnRlcllfVUstc2hpZnRZKjIgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX1VLLXNoaWZ0WCwgeTogY2VudGVyWV9VSy1zaGlmdFkgfVxyXG5cdFx0XTtcclxuXHJcblx0XHR2YXIgZmxpZ2h0c19VSzJVSyA9IHN2Zy5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHQuYXR0cignZCcsIGxpbmUoZmxpZ2h0c19VSzJVS19ub2RlcykpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQnKVxyXG5cdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHQuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI21hcmtlckFycm93KScpO1xyXG5cclxuXHRcdFxyXG5cdFx0Ly8gbkVFQSAtPiBuRUVBXHJcblx0XHR2YXIgY2VudGVyWF9uRUVBID0gZGF0YVsxXS5jb29yZC54O1xyXG5cdFx0dmFyIGNlbnRlcllfbkVFQSA9IGRhdGFbMV0uY29vcmQueStyLzM7XHJcblxyXG5cdFx0dmFyIGZsaWdodHNfbkVFQTJuRUVBX25vZGVzID0gWyBcclxuXHRcdFx0eyB4OiBjZW50ZXJYX25FRUEtc2hpZnRYLCB5OiBjZW50ZXJZX25FRUErc2hpZnRZIH0sXHJcblx0XHRcdHsgeDogY2VudGVyWF9uRUVBLXNoaWZ0WCoxLjUsIHk6IGNlbnRlcllfbkVFQStzaGlmdFkqMiB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfbkVFQSwgeTogY2VudGVyWV9uRUVBK3NoaWZ0WSozIH0sXHJcblx0XHRcdHsgeDogY2VudGVyWF9uRUVBK3NoaWZ0WCoxLjUsIHk6IGNlbnRlcllfbkVFQStzaGlmdFkqMiB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfbkVFQStzaGlmdFgsIHk6IGNlbnRlcllfbkVFQStzaGlmdFkgfVxyXG5cdFx0XTtcclxuXHJcblx0XHR2YXIgZmxpZ2h0c19uRUVBMm5FRUEgPSBzdmcuYXBwZW5kKCdwYXRoJylcclxuXHRcdFx0LmF0dHIoJ2QnLCBsaW5lKGZsaWdodHNfbkVFQTJuRUVBX25vZGVzKSlcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCcpXHJcblx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdC5hdHRyKCdtYXJrZXItZW5kJywgJ3VybCgjbWFya2VyQXJyb3cpJyk7XHJcblxyXG5cdFx0XHJcblx0XHQvLyBuRUVBIC0+IG5FRUFcclxuXHRcdHZhciBjZW50ZXJYX0VFQSA9IGRhdGFbMl0uY29vcmQueDtcclxuXHRcdHZhciBjZW50ZXJZX0VFQSA9IGRhdGFbMl0uY29vcmQueStyLzM7XHJcblxyXG5cdFx0dmFyIGZsaWdodHNfRUVBMkVFQV9ub2RlcyA9IFsgXHJcblx0XHRcdHsgeDogY2VudGVyWF9FRUEtc2hpZnRYLCB5OiBjZW50ZXJZX0VFQStzaGlmdFkgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX0VFQS1zaGlmdFgqMS41LCB5OiBjZW50ZXJZX0VFQStzaGlmdFkqMiB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfRUVBLCB5OiBjZW50ZXJZX0VFQStzaGlmdFkqMyB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfRUVBK3NoaWZ0WCoxLjUsIHk6IGNlbnRlcllfRUVBK3NoaWZ0WSoyIH0sXHJcblx0XHRcdHsgeDogY2VudGVyWF9FRUErc2hpZnRYLCB5OiBjZW50ZXJZX0VFQStzaGlmdFkgfVxyXG5cdFx0XTtcclxuXHJcblx0XHR2YXIgZmxpZ2h0c19FRUEyRUVBID0gc3ZnLmFwcGVuZCgncGF0aCcpXHJcblx0XHRcdC5hdHRyKCdkJywgbGluZShmbGlnaHRzX0VFQTJFRUFfbm9kZXMpKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnZmxpZ2h0JylcclxuXHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCA1KVxyXG5cdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERyYXdzIGFuIGFycm93IGZyb20gYSBwbGFjZSB0byBhbm90aGVyIHBsYWNlLCBpbiB0aGUgZGlyZWN0aW9uIHJlcHJlc2VudGluZyBmbGlnaHRzIG91dC5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhcnJvd1BsYWNlMk91dCgpIHtcclxuXHJcblx0XHQvLyBVSyAtPiBuRUVBXHJcblx0XHR2YXIgY2VudGVyWF9VSyA9IGRhdGFbMF0uY29vcmQueC1yO1xyXG5cdFx0dmFyIGNlbnRlcllfVUsgPSBkYXRhWzBdLmNvb3JkLnkrci80O1xyXG5cclxuXHRcdHZhciBjZW50ZXJYX25FRUEgPSBkYXRhWzFdLmNvb3JkLng7XHJcblx0XHR2YXIgY2VudGVyWV9uRUVBID0gZGF0YVsxXS5jb29yZC55LXI7XHJcblxyXG5cdFx0dmFyIGxpbmVzT3V0ID0gc3ZnLmFwcGVuZCgnbGluZScpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCBmbGlnaHQtb3V0JylcclxuXHRcdFx0XHQuYXR0cigneDEnLCBjZW50ZXJYX1VLKVxyXG5cdFx0XHRcdC5hdHRyKCd5MScsIGNlbnRlcllfVUspXHJcblx0XHRcdFx0LmF0dHIoJ3gyJywgY2VudGVyWF9uRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd5MicsIGNlbnRlcllfbkVFQSlcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI21hcmtlckFycm93KScpO1xyXG5cclxuXHRcdC8vIFVLIC0+IEVFQVxyXG5cdFx0dmFyIGNlbnRlclhfVUsgPSBkYXRhWzBdLmNvb3JkLngrcjtcclxuXHRcdHZhciBjZW50ZXJZX1VLID0gZGF0YVswXS5jb29yZC55K3IvNDtcclxuXHJcblx0XHR2YXIgY2VudGVyWF9FRUEgPSBkYXRhWzJdLmNvb3JkLng7XHJcblx0XHR2YXIgY2VudGVyWV9FRUEgPSBkYXRhWzJdLmNvb3JkLnktcjtcclxuXHJcblx0XHR2YXIgbGluZXNPdXQgPSBzdmcuYXBwZW5kKCdsaW5lJylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnZmxpZ2h0IGZsaWdodC1vdXQnKVxyXG5cdFx0XHRcdC5hdHRyKCd4MScsIGNlbnRlclhfVUspXHJcblx0XHRcdFx0LmF0dHIoJ3kxJywgY2VudGVyWV9VSylcclxuXHRcdFx0XHQuYXR0cigneDInLCBjZW50ZXJYX0VFQSlcclxuXHRcdFx0XHQuYXR0cigneTInLCBjZW50ZXJZX0VFQSlcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI21hcmtlckFycm93KScpO1xyXG5cdFx0XHJcblx0XHQvLyBuRUVBIC0+IEVFQVxyXG5cdFx0dmFyIGNlbnRlclhfbkVFQSA9IGRhdGFbMV0uY29vcmQueCtyLTI7XHJcblx0XHR2YXIgY2VudGVyWV9uRUVBID0gZGF0YVsxXS5jb29yZC55LXIvNDtcclxuXHJcblx0XHR2YXIgY2VudGVyWF9FRUEgPSBkYXRhWzJdLmNvb3JkLngtcjtcclxuXHRcdHZhciBjZW50ZXJZX0VFQSA9IGRhdGFbMl0uY29vcmQueS1yLzQ7XHJcblxyXG5cdFx0dmFyIGxpbmVzT3V0ID0gc3ZnLmFwcGVuZCgnbGluZScpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCBmbGlnaHQtb3V0JylcclxuXHRcdFx0XHQuYXR0cigneDEnLCBjZW50ZXJYX25FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3kxJywgY2VudGVyWV9uRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd4MicsIGNlbnRlclhfRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd5MicsIGNlbnRlcllfRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdtYXJrZXItZW5kJywgJ3VybCgjbWFya2VyQXJyb3cpJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEcmF3cyBhbiBhcnJvdyBmcm9tIGEgcGxhY2UgdG8gYW5vdGhlciBwbGFjZSwgaW4gdGhlIGRpcmVjdGlvbiByZXByZXNlbnRpbmcgZmxpZ2h0cyBpbi5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhcnJvd1BsYWNlMkluKCkge1xyXG5cclxuXHRcdC8vIG5FRUEgLT4gVUtcclxuXHRcdHZhciBjZW50ZXJYX1VLID0gZGF0YVswXS5jb29yZC54LXIvMi04O1xyXG5cdFx0dmFyIGNlbnRlcllfVUsgPSBkYXRhWzBdLmNvb3JkLnkrci8zKjIrODtcclxuXHJcblx0XHR2YXIgY2VudGVyWF9uRUVBID0gZGF0YVsxXS5jb29yZC54K3IvMis2O1xyXG5cdFx0dmFyIGNlbnRlcllfbkVFQSA9IGRhdGFbMV0uY29vcmQueS1yLzMqMi02O1xyXG5cclxuXHRcdHZhciBsaW5lc0luID0gc3ZnLmFwcGVuZCgnbGluZScpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCBmbGlnaHQtb3V0JylcclxuXHRcdFx0XHQuYXR0cigneDEnLCBjZW50ZXJYX25FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3kxJywgY2VudGVyWV9uRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd4MicsIGNlbnRlclhfVUspXHJcblx0XHRcdFx0LmF0dHIoJ3kyJywgY2VudGVyWV9VSylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI21hcmtlckFycm93KScpO1xyXG5cclxuXHRcdC8vIEVFQSAtPiBVS1xyXG5cdFx0dmFyIGNlbnRlclhfVUsgPSBkYXRhWzBdLmNvb3JkLngrci8yKzg7XHJcblx0XHR2YXIgY2VudGVyWV9VSyA9IGRhdGFbMF0uY29vcmQueStyLzMqMis4O1xyXG5cclxuXHRcdHZhciBjZW50ZXJYX0VFQSA9IGRhdGFbMl0uY29vcmQueC1yLzItNjtcclxuXHRcdHZhciBjZW50ZXJZX0VFQSA9IGRhdGFbMl0uY29vcmQueS1yLzMqMi02O1xyXG5cclxuXHRcdHZhciBsaW5lc0luID0gc3ZnLmFwcGVuZCgnbGluZScpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCBmbGlnaHQtb3V0JylcclxuXHRcdFx0XHQuYXR0cigneDEnLCBjZW50ZXJYX0VFQSlcclxuXHRcdFx0XHQuYXR0cigneTEnLCBjZW50ZXJZX0VFQSlcclxuXHRcdFx0XHQuYXR0cigneDInLCBjZW50ZXJYX1VLKVxyXG5cdFx0XHRcdC5hdHRyKCd5MicsIGNlbnRlcllfVUspXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHJcblx0XHQvLyBFRUEgLT4gbkVFQVxyXG5cdFx0dmFyIGNlbnRlclhfbkVFQSA9IGRhdGFbMV0uY29vcmQueCtyO1xyXG5cdFx0dmFyIGNlbnRlcllfbkVFQSA9IGRhdGFbMV0uY29vcmQueStyLzM7XHJcblxyXG5cdFx0dmFyIGNlbnRlclhfRUVBID0gZGF0YVsyXS5jb29yZC54LXIrMztcclxuXHRcdHZhciBjZW50ZXJZX0VFQSA9IGRhdGFbMl0uY29vcmQueStyLzM7XHJcblxyXG5cdFx0dmFyIGxpbmVzT3V0ID0gc3ZnLmFwcGVuZCgnbGluZScpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCBmbGlnaHQtb3V0JylcclxuXHRcdFx0XHQuYXR0cigneDEnLCBjZW50ZXJYX0VFQSlcclxuXHRcdFx0XHQuYXR0cigneTEnLCBjZW50ZXJZX0VFQSlcclxuXHRcdFx0XHQuYXR0cigneDInLCBjZW50ZXJYX25FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3kyJywgY2VudGVyWV9uRUVBKVx0XHRcdFx0XHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGRhdGFzZXQgbW9yZSBzdWl0YWJsZSBmb3IgdmlzdXphbGl6YXRpb24uXHJcbiAqIFRoZSBkYXRhc2V0IGlzIGFuIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIHNwZW5kaW5nIGZvciBlYWNoIHBsYWNlLCBkZXN0aW5hdGlvbnMvZGVwYXJ0dXJlcywgZXRjLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVEYXRhKGRhdGEpIHtcclxuXHJcblx0dmFyIGRhdGFzZXQgPSBbXTtcclxuXHJcblx0Ly8gZ2V0IGFsbCBwbGFjZXMgKGRlc3RpbmF0aW9ucyBhbmQgZGVwYXJ0dXJlcyBhcmUgdGhlIHNhbWUgaW4gdGhlIGRhdGEpXHJcblx0Ly8gW1wiVUtcIiwgXCJOb24gRUVBXCIsIFwiRUVBXCJdXHJcblx0dmFyIHBsYWNlcyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ2Rlc3RpbmF0aW9uJyk7XHRcclxuXHJcblx0Ly8gY29vcmRpbmF0aW9ucyBvZiBjaXJjbGVzIGZvciBlYWNoIHBsYWNlXHJcblx0dmFyIHBsYWNlc0Nvb3JkID0gWyBcclxuXHRcdHsgeDogd2lkdGgvMiwgeTogaGVpZ2h0LzQgfSwgXHJcblx0XHR7IHg6IHdpZHRoLzMsIHk6IGhlaWdodC8zKjIgfSwgXHJcblx0XHR7IHg6IHdpZHRoLzMqMiwgeTogaGVpZ2h0LzMqMiB9XHJcblx0XTtcclxuXHJcblx0Ly8gY3JlYXRlIG5ldyBvYmplY3RzIGFuZCBhZGQgdGhlbSBpbiB0aGUgZGF0YXNldFxyXG5cdHBsYWNlcy5mb3JFYWNoKCAocGxhY2UsIGkpID0+IHtcclxuXHRcdHZhciBkYXRhT2JqID0ge307XHJcblxyXG5cdFx0ZGF0YU9iai5wbGFjZSA9IHBsYWNlO1xyXG5cdFx0ZGF0YU9iai5kZXN0aW5hdGlvbiA9IGRhdGEuZmlsdGVyKCBkID0+IGQuZGVzdGluYXRpb24gPT09IHBsYWNlICk7XHJcblx0XHRkYXRhT2JqLmRlcGFydHVyZSA9IGRhdGEuZmlsdGVyKCBkID0+IGQuZGVwYXJ0dXJlID09PSBwbGFjZSApO1xyXG5cdFx0ZGF0YU9iai5jb29yZCA9IHt4OiBwbGFjZXNDb29yZFtpXS54LCB5OiBwbGFjZXNDb29yZFtpXS55IH1cclxuXHJcblx0XHRkYXRhc2V0LnB1c2goZGF0YU9iaik7XHRcdFxyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gZGF0YXNldDtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIGRhdGEgZGlzdHJpYnV0aW9uLlxyXG4gKiBDcmVhdGVzIGEgYm94LWFuZC13aGlza2V5IHBsb3QgZnJvbSBnaXZlbiBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG52YXIgbWluO1xyXG52YXIgbWF4O1xyXG5cclxudmFyIGNoYXJ0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RyaWJ1dGlvbihkYXRhKSB7XHJcblx0XHJcblx0aW5pdChkYXRhKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxufSIsIi8qKlxyXG4gKiBJbml0aWFsaXphdGlvbiBvZiBhbGwgbW9kdWxlcyBcclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt2aXN1YWxpemV9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbihmdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn0pKGluaXQpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHJlYWRpbmcgb2YgZmlsZSBhbmQgdGhlbiB2aXN1YWxpemF0aW9uIHByb2Nlc3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KCl7XHJcblxyXG5cdC8vIHNldHVwIG51bWVyYWwgZm9yIGNvcnJlY3QgbnVtYmVyIGZvcm1hdHRpbmdcclxuXHRudW1lcmFsLmxhbmd1YWdlKCdlbi1nYicpO1xyXG5cclxuXHQvLyBwYXJzZSBmaWxlXHJcblx0ZDMuY3N2KCdIb21lX09mZmljZV9BaXJfVHJhdmVsX0RhdGFfMjAxMS5jc3YnKVxyXG5cdFx0LnJvdyggZCA9PiB7IFxyXG5cdFx0XHRyZXR1cm4geyBcclxuXHRcdFx0XHRkZXBhcnR1cmU6IGQuRGVwYXJ0dXJlLCBcclxuXHRcdFx0XHRkZXN0aW5hdGlvbjogZC5EZXN0aW5hdGlvbiwgXHJcblx0XHRcdFx0ZGlyZWN0b3JhdGU6IGQuRGlyZWN0b3JhdGUsIFxyXG5cdFx0XHRcdG1vbnRoOiBkLkRlcGFydHVyZV8yMDExLCBcclxuXHRcdFx0XHRmYXJlOiBwYXJzZUZsb2F0KGQuUGFpZF9mYXJlKSwgXHJcblx0XHRcdFx0dGlja2V0OiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiwgXHJcblx0XHRcdFx0c3VwcGxpZXI6IGQuU3VwcGxpZXJfbmFtZSBcclxuXHRcdFx0fTtcclxuXHRcdH0pXHJcblx0XHQuZ2V0KCAoZXJyb3IsIGRhdGEpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSBjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHJcblx0XHRcdHZpc3VhbGl6ZShkYXRhKTtcclxuXHRcdH0pO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgbW9udGhseSBzcGVuZGluZy5cclxuICogQ3JlYXRlcyBhIGJhciBjaGFydCBmcm9tIGdpdmVuIGRhdGEgYW5kIGFkZHMgbGlzdGVuZXJzIGZvciBmaWx0ZXJpbmcgb25lIG1vbnRoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXN9IGZyb20gJy4vdmlzLXV0aWwnO1xyXG5pbXBvcnQge3VwZGF0ZWRTcGVuZGluZ30gZnJvbSAnLi92aXN1YWxpemUnO1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG4vLyBub2RlIGZvciBjcmVhdGVkIGZpbHRlclxyXG52YXIgZmlsdGVyO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIHBvc2l0aW9uaW5nIGVsZW1lbnRzIGluIHggZGlyZWN0aW9uXHJcbnZhciB4U2NhbGU7XHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB5IGRpcmVjdGlvblxyXG52YXIgeVNjYWxlO1xyXG5cclxuLy8gbW9udGggYXhpc1xyXG52YXIgeEF4aXM7XHJcbi8vIG51bWJlciBheGlzXHJcbnZhciB5QXhpcztcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBiaW5kaW5nIGEgY29sb3IgdG8gYSB0aWNrZXQgdHlwZVxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLy8gc2NhbGUgZm9yIHN0YWNraW5nIHJlY3RhbmdsZXNcclxudmFyIHN0YWNrO1xyXG5cclxuLy8gdHJhbnNmb3JtZWQgZGF0YVxyXG52YXIgZGF0YXNldDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIGRhdGFzZXQgZnJvbSBnaXZlbiBkYXRhIHRoYXQgaXMgbW9yZSBzdWl0YWJsZSBmb3Igd29ya2luZyB3aXRoaW4gdmlzdWFsaXphdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcGVuZGluZyhkYXRhKSB7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGRhdGFzZXQgPSBzcGVuZGluZ0RhdGFzZXQoZGF0YSk7XHJcblx0XHJcblx0Y3JlYXRlQmFyQ2hhcnQoZGF0YXNldCk7XHJcblxyXG5cdGNyZWF0ZUxlZ2VuZChkYXRhc2V0KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldHMgdXAgYWxsIHNjYWxlcyBhbmQgYXR0cmlidXRlcyBhY2MuIHRvIGdpdmVuIGRhdGEgYW5kIGNyZWF0ZXMgYSBzdmcgcGFuZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgZWFjaCBzcGVuZGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaW5pdChkYXRhKSB7XHRcclxuXHJcblx0bWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAzNSwgYm90dG9tOiAzNSwgbGVmdDogMTB9O1xyXG5cdHdpZHRoID0gMTA4NSAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbihbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSlcclxuXHRcdC5yYW5nZVJvdW5kQmFuZHMoWzAsIHdpZHRoXSwgLjA1KTtcclxuXHJcblx0Ly8gcm91bmQgdGhlIG1heGltdW0gdmFsdWUgZnJvbSBkYXRhIHRvIHRob3VzYW5kc1xyXG5cdHZhciByb3VuZGVkTWF4ID0gTWF0aC5yb3VuZCggTWF0aC5tYXgoLi4ubW9udGhGYXJlcyhkYXRhKSkgLyAxMDAwICkgKiAxMDAwO1xyXG5cdHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXHJcblx0XHQuZG9tYWluKFsgMCwgcm91bmRlZE1heCBdKVxyXG5cdFx0LnJhbmdlKFsgaGVpZ2h0LCAwIF0pO1xyXG5cclxuXHR4QXhpcyA9IGQzLnN2Zy5heGlzKClcclxuXHRcdC5zY2FsZSh4U2NhbGUpXHJcblx0XHQub3JpZW50KCdib3R0b20nKTtcclxuXHJcblx0eUF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeVNjYWxlKVxyXG5cdFx0Lm9yaWVudCgncmlnaHQnKVxyXG5cdFx0LnRpY2tGb3JtYXQoIGQgPT4gbnVtZXJhbChkKS5mb3JtYXQoJzBhJykpO1xyXG5cdFxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpKVx0XHRcclxuXHRcdC5yYW5nZShbXCIjMDBiY2Q0XCIsIFwiIzFkNmRkMFwiLCBcIiNlZGNkMDJcIl0pO1xyXG5cclxuXHRzdGFjayA9IGQzLmxheW91dC5zdGFjaygpO1xyXG5cclxuXHRzdmcgPSBkMy5zZWxlY3QoJyN2aXMtc3BlbmRpbmcnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG1vbnRobHkgc3BlbmRpbmcgZm9yIGFsbCB0aWNrZXQgdHlwZXMgYW5kIHJldHVybnMgdGhlIGNyZWF0ZWQgYXJyYXkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW5kaW5nIGFsbCB5ZWFyIHNwZWRuaW5nXHJcblx0ICogQHJldHVybiB7YXJyYXl9IHN1bU1vbnRobHlGYXJlcyBhcnJheSBvZiBudW1iZXJzIHJlcHJlc2VudGluZyBlYWNoIG1vbnRocyBzcGVuZGluZyBvbiBhbGwgdGlja2V0c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vbnRoRmFyZXMoZGF0YSkge1x0XHJcblx0XHQvLyBnZXQgYWxsIGZhcmVzIGZvciBlYWNoIG1vbnRoXHJcblx0XHR2YXIgZmFyZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0XHQvLyBzdW0gdXAgYWxsIGZhcmVzIGluIGVhY2ggbW9udGhcclxuXHRcdHZhciBzdW1Nb250aGx5RmFyZXMgPSBmYXJlcy5tYXAoIGZhcmUgPT4gZmFyZS5yZWR1Y2UoIChhLGIpID0+IGEgKyBiLmZhcmUsIDApKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHN1bU1vbnRobHlGYXJlcztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgc3RhY2tlZCBiYXIgY2hhcnQgYWNjb3JkaW5nIHRvIGdpdmVuIGRhdGEuIFRoZSBjaGFydCBoYXMgbGF5ZXJzIGZvciBlYWNoIHRpY2tldCB0eXBlLlxyXG4gKiBUaGVyZSBhcmUgbGlzdGVuZXJzIGZvciBjcmVhdGluZyBhIHRvb2x0aXAgYW5kIGZpbHRlciBmb3Igc2VsZWN0aW5nIG9ubHkgb25lIG1vbnRoLlxyXG4gKiBcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIGluIHRoZSBmb3JtIG9mIFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1xyXG5cdC8vIGNyZWF0ZSBzdGFja2VkIGRhdGEgZm9yIHRoZSB2aXN1YWxpemF0aW9uXHJcblx0c3RhY2soZGF0YSk7XHJcblxyXG5cdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0dGlwID0gZDMudGlwKClcclxuXHRcdC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxyXG5cdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHR2YXIgaW5kZXggPSBjb2xvci5yYW5nZSgpLmluZGV4T2YoY29sb3IoZC50aWNrZXQpKTtcclxuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cInR5cGUgdHlwZS0nK2luZGV4KydcIj4nKyBkLnRpY2tldCArJzwvc3Bhbj5cXFxyXG5cdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPicrbnVtZXJhbChkLnkpLmZvcm1hdCgnJDAsMCcpICsgJzwvc3Bhbj5cXFxyXG5cdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJudW1iZXJcIj4nK251bWVyYWwoZC52YWx1ZXMubGVuZ3RoKS5mb3JtYXQoJzAsMCcpKycgdGlja2V0czwvc3Bhbj4nOyBcclxuXHRcdH0pO1xyXG5cclxuXHRzdmcuY2FsbCh0aXApO1xyXG5cclxuXHQvLyBjcmVhdGUgYSByZWN0YW5nbGUgYXMgYSBiYWNrZ3JvdW5kXHJcblx0dmFyIGJhY2tncm91bmQgPSBzdmcuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdzdmctYmFja2dyb3VuZCcpXHJcblx0XHQuYXR0cigneCcsIDApXHJcblx0XHQuYXR0cigneScsIDApXHJcblx0XHQuYXR0cignd2lkdGgnLCB3aWR0aClcclxuXHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXHJcblx0XHQuYXR0cignZmlsbCcsICd0cmFuc3BhcmVudCcpXHJcblx0XHQub24oJ2NsaWNrJywgZGVzZWxlY3QpO1xyXG5cclxuXHQvLyBjcmVhdGUgZ3JvdXAgZm9yIGVhY2ggdGlja2V0IHR5cGVcclxuXHR2YXIgZ3JvdXBzID0gc3ZnLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsIChkLGkpID0+ICd0aWNrZXQtJytpICk7XHJcblxyXG5cdC8vIGNyZWF0ZSBiYXJzIGZvciBlYWNoIHRpY2tldCBncm91cFxyXG5cdGdyb3Vwcy5zZWxlY3RBbGwoJy5iYXInKVxyXG5cdFx0LmRhdGEoIGQgPT4gZCApXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXInKVxyXG5cdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUoZC55MCkgLSB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgbW91c2VvdmVyKVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgbW91c2VvdXQpXHJcblx0XHRcdC5vbignY2xpY2snLCBtb3VzZWNsaWNrKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXgnKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgMCArJywnKyBoZWlnaHQgKycpJylcclxuXHRcdC5jYWxsKHhBeGlzKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgd2lkdGggKycsJysgMCArJyknKVxyXG5cdFx0LmNhbGwoeUF4aXMpO1xyXG5cclxuXHRmaWx0ZXIgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdmaWx0ZXInKTtcclxuXHJcblx0LyoqXHJcblx0ICogRGVsZXRlcyB0aGUgZmlsdGVyIGNvbnRhaW5pbmcgc2VsZWN0ZWQgbW9udGggYW5kIHVwZGF0ZXMgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGRlc2VsZWN0KCkge1xyXG5cclxuXHRcdHZhciBmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaWx0ZXInKVswXTtcclxuXHJcblx0XHRpZiAoZmlsdGVyLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHQvLyBkZWxldGUgc2VsZWN0ZWQgbW9udGhcclxuXHRcdFx0ZmlsdGVyLnJlbW92ZUNoaWxkKGZpbHRlci5jaGlsZE5vZGVzWzBdKTtcclxuXHJcblx0XHRcdC8vIHVwZGF0ZSBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnNcclxuXHRcdFx0dXBkYXRlZFNwZW5kaW5nKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZmlsdGVyIGZvciBhIHdob2xlIG1vbnRoIGFmdGVyIHRoZSB1c2VyIGNsaWNrcyBvbiBhbnkgdGlja2V0IHRpY2tldCB0eXBlLiBUaGUgZmlsdGVyIGlzIHJlcHJlc2VudGVkIHdpdGggYSB3aGl0ZS1ib3JkZXJlZCByZWN0YW5nbGUuXHJcblx0ICogQWxsIG90aGVyIHZpc3VhbGl6YXRpb25zIGFyZSB1cGRhdGVkIGFjY29yZGluZyB0byBzZWxlY3RlZCBtb250aC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VjbGljayhkYXRhKSB7XHJcblx0XHQvLyB1cGRhdGUgb3RoZXIgdmlzdWFsaXphdGlvbnMgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR1cGRhdGVkU3BlbmRpbmcoZGF0YS54KTtcclxuXHJcblx0XHQvLyBnZXQgYWxsIHRpY2tldCB0eXBlcyBmb3Igc2VsZWN0ZWQgbW9udGhcclxuXHRcdHZhciB0aWNrZXRzTW9udGggPSBkYXRhc2V0Lm1hcCggdGlja2V0cyA9PiB0aWNrZXRzLmZpbHRlciggZCA9PiBkLnggPT09IGRhdGEueCApKTtcclxuXHJcblx0XHQvLyBmbGF0dGVuIHRoZSBhcnJheVxyXG5cdFx0dGlja2V0c01vbnRoID0gW10uY29uY2F0LmFwcGx5KFtdLCB0aWNrZXRzTW9udGgpO1xyXG5cclxuXHRcdC8vIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0IGFuZCBzdGFydGluZyBwb2ludCBvZiBtb250aHMgYmFyXHJcblx0XHR2YXIgeTAgPSB0aWNrZXRzTW9udGhbMF0ueTA7XHJcblx0XHR2YXIgYmFySGVpZ2h0ID0gdGlja2V0c01vbnRoLnJlZHVjZSggKGEsIGIpID0+IGEgKyBiLnksIDApO1xyXG5cdFx0XHJcblx0XHQvLyBjcmVhdGUgYW5kIHVwZGF0ZSByZWN0YW5nbGUgZm9yIGhpZ2hsaWdodGluZyB0aGUgc2VsZWN0ZWQgbW9udGhcclxuXHRcdHZhciBzZWxlY3RlZCA9IGZpbHRlci5zZWxlY3RBbGwoJy5zZWxlY3RlZCcpXHJcblx0XHRcdC5kYXRhKFtkYXRhXSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoYmFySGVpZ2h0KSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIHlTY2FsZSh5MCkgLSB5U2NhbGUoYmFySGVpZ2h0KSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnc2VsZWN0ZWQnKVx0XHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDMpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoYmFySGVpZ2h0KSlcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIaWhnbGlnaHQgdGhlIGhvdmVyZWQgZWxlbWVudCBhbmQgc2hvd3MgdG9vbHRpcC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdmVyKGQpIHtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gZDMucmdiKGNvbG9yKGQudGlja2V0KSkuYnJpZ2h0ZXIoLjUpKTtcclxuXHJcblx0XHR0aXAuc2hvdyhkKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyB0aGUgY29sb3Igb2YgdGhlIGVsZW1lbnQgYW5kIGhpZGVzIHRoZSB0b29sdGlwLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3V0KCkge1x0XHRcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKTtcclxuXHJcblx0XHR0aXAuaGlkZSgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBsZWdlbmQgZm9yIHRoZSBzcGVuZGluZyB2aXN1YWxpemF0aW9uLlxyXG4gKiBGb3IgZWFjaCB0aWNrZXQgdHlwZSBhIHJlY3RhbmdsZSBhbmQgYSB0ZXh0IGxhYmVsIGlzIGNyZWF0ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUxlZ2VuZChkYXRhKSB7XHJcblxyXG5cdC8vIHJlY3RhbmdsZSBzaXplXHJcblx0dmFyIHNpemUgPSAxMDtcclxuXHJcblx0Ly8gc3ZnIHBhbmVsIGZvciB0aGUgbGVnZW5kXHJcblx0dmFyIHN2Z0xlZ2VuZCA9IGQzLnNlbGVjdCgnI3NwZW5kaW5nLWxlZ2VuZCcpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCAyMDApXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCA5MClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgyMCwyMCknKTtcclxuXHJcblx0Ly8gY3JlYXRlIHJlY3RhbmdsZXMgZm9yIGVhY2ggZWxlbWVudFxyXG5cdHN2Z0xlZ2VuZC5zZWxlY3RBbGwoJy5zLWxlZ2VuZCcpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAncy1sZWdlbmQgbGVnZW5kJylcclxuXHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHQuYXR0cigneScsIChkLCBpKSA9PiBpKnNpemUqMilcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIHNpemUpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHNpemUpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkWzBdLnRpY2tldCkpO1xyXG5cclxuXHQvLyBjcmVhdGUgdGV4dCBsYWJlbFxyXG5cdHN2Z0xlZ2VuZC5zZWxlY3RBbGwoJy5zLWxlZ2VuZC1sYWJlbCcpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAncy1sZWdlbmQtbGFiZWwgbGVnZW5kJylcclxuXHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHQuYXR0cigneScsIChkLCBpKSA9PiBpKnNpemUqMilcclxuXHRcdFx0LmF0dHIoJ2R4Jywgc2l6ZSs1KVxyXG5cdFx0XHQuYXR0cignZHknLCBzaXplKVx0XHRcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHQudGV4dChkID0+IGRbMF0udGlja2V0KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBkYXRhIGludG8gYSBuZXcgZGF0YXNldCB3aGljaCBoYXMgcmVhcnJhbmdlZCB2YWx1ZXNcclxuICogc28gdGhhdCBpdCBpcyBhbiBhcnJheSBvZiB0aWNrZXQgdHlwZSBhcnJheXNcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHMgZXh0cmFjdGVkIGZyb20gZmlsZVxyXG4gKiBAcmV0dXJuIHthcnJheX0gZGF0YXNldCBhcnJheSBvZiBkYXRhIG9iamVjdHMgZ3JvdXBlZCBieSB0aWNrZXQgdHlwZXMgYW5kIG1vbnRoc1xyXG4gKi9cclxuZnVuY3Rpb24gc3BlbmRpbmdEYXRhc2V0KGRhdGEpIHtcclxuXHR2YXIgZGF0YXNldCA9IFtdO1xyXG5cclxuXHR2YXIgdGlja2V0cyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpO1xyXG5cclxuXHR2YXIgbW9udGhzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKTtcclxuXHJcblx0dmFyIG1vbnRobHlEYXRhID0gbW9udGhzLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblxyXG5cdHRpY2tldHMuZm9yRWFjaCggdGlja2V0ID0+IHtcclxuXHRcdHZhciB0aWNrZXRBcnJheSA9IFtdO1xyXG5cclxuXHRcdG1vbnRobHlEYXRhLmZvckVhY2goIChtb250aERhdGEsIGkpID0+IHtcclxuXHRcdFx0dmFyIGRhdGFPYmogPSB7fTtcclxuXHRcdFxyXG5cdFx0XHRkYXRhT2JqLnRpY2tldCA9IHRpY2tldDtcdFx0XHRcclxuXHRcdFx0ZGF0YU9iai52YWx1ZXMgPSBtb250aERhdGEuZmlsdGVyKCBkID0+IGQudGlja2V0ID09PSB0aWNrZXQpO1xyXG5cdFx0XHRkYXRhT2JqLnggPSBtb250aHNbaV07XHJcblxyXG5cdFx0XHRkYXRhT2JqLnkgPSBkYXRhT2JqLnZhbHVlcy5yZWR1Y2UoIChhLGIpID0+IHtcclxuXHRcdFx0XHRpZiAoIGIudGlja2V0ID09PSB0aWNrZXQgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYSArIGIuZmFyZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCAwKTtcclxuXHJcblx0XHRcdHRpY2tldEFycmF5LnB1c2goZGF0YU9iaik7XHRcdFx0XHJcblx0XHR9KTtcclxuXHJcblx0XHRkYXRhc2V0LnB1c2godGlja2V0QXJyYXkpO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gZGF0YXNldDtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIGZvciB0aWNrZXRzIG51bWJlciBhbmQgYXZlcmFnZSBwcmljZS5cclxuICogQ3JlYXRlcyBhIGRvbnV0IGNoYXJ0IHJlcHJlc2VudGluZyB0aGUgcGFydGlhbCByZWxhdGlvbnNoaXAgYW5kIHRleHQgZWxlbWVudC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBhbmQgY3JlYXRlcyB0aGUgdmlzdWFsaXphdGlvbi5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIHZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aXNJZCBpZCBvZiB0aGUgdmlzdWFsaXphdGlvbiBwYW5lbFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZmlsbCBjb2xvciB1c2VkIGZvciBhcmNzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGlja2V0KGRhdGEsIHBhcmFtLCB2aXNJZCwgY29sb3IpIHtcclxuXHR2YXIgdmlzID0ge307XHJcblx0dmlzLnVwZGF0ZSA9IHVwZGF0ZUNoYXJ0O1xyXG5cdHZpcy5wYXJhbSA9IHBhcmFtO1xyXG5cclxuXHR2YXIgY29sb3JUeXBlO1xyXG5cdFxyXG5cdHZhciBzdmc7XHJcblxyXG5cdHZhciBwaWU7XHJcblx0dmFyIGFyYztcclxuXHR2YXIgcGF0aDtcclxuXHJcblx0dmFyIHBlcmNlbnRhZ2U7XHJcblx0dmFyIGV4YWN0VmFsdWU7XHJcblxyXG5cdHZhciBhbGxJdGVtcztcclxuXHR2YXIgcGFydEl0ZW1zO1xyXG5cclxuXHR2YXIgaW5pdGlsaXplZCA9IGZhbHNlO1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRjcmVhdGVWaXMoZGF0YSk7XHJcblxyXG5cdGluaXRpbGl6ZWQgPSB0cnVlO1xyXG5cclxuXHRyZXR1cm4gdmlzO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplcyBhbGwgbmVlZGVkIHZhcmlhYmxlcyBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5pdChkYXRhKSB7XHJcblx0XHRtYXJnaW4gPSB7dG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAxMCwgbGVmdDogNX07XHJcblx0XHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdFx0aGVpZ2h0ID0gMTMwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG5cdFx0Y29sb3JUeXBlID0gZDMuc2NhbGUub3JkaW5hbCgpXHRcdFx0XHJcblx0XHRcdC5yYW5nZShbY29sb3IsICdyZ2JhKDAsMCwwLC4zKSddKVxyXG5cclxuXHRcdHN2ZyA9IGQzLnNlbGVjdCgnIycrdmlzSWQpXHJcblx0XHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIHdpZHRoLzIgKycsJysgKGhlaWdodC8yLW1hcmdpbi5ib3R0b20pICsnKScpO1xyXG5cclxuXHRcdGFyYyA9IGQzLnN2Zy5hcmMoKVxyXG5cdFx0XHQub3V0ZXJSYWRpdXMoNTAgLSAxMClcclxuXHRcdFx0LmlubmVyUmFkaXVzKDUwIC0gMjApO1xyXG5cclxuXHRcdHBpZSA9IGQzLmxheW91dC5waWUoKVxyXG5cdFx0XHQuc29ydChudWxsKVxyXG5cdFx0XHQudmFsdWUoZCA9PiBkLnZhbHVlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgdGhlIHZpc3VhbGl6YXRpb24gLSBwaWUgY2hhcnQgYW5kIHRleHQgdmFsdWVzIC0gcGVyY2VudGFnZSBhbmQgZXhhY3QgdmFsdWUuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YXNldCBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjcmVhdGVWaXMoZGF0YXNldCkge1xyXG5cdFx0Ly8gdXBkYXRlIGRhdGEgYWNjb3JkaW5nIHRvIGNoYW5nZVxyXG5cdFx0ZGF0YSA9IHVwZGF0ZURhdGEoZGF0YXNldCwgcGFyYW0pO1x0XHRcclxuXHJcblx0XHQvLyB1cGRhdGUgdGhlIGNoYXJ0XHJcblx0XHRwYXRoID0gc3ZnLnNlbGVjdEFsbCgnLmFyYy0nK3BhcmFtKVxyXG5cdFx0XHQuZGF0YShkYXRhKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdwYXRoJylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYXJjLScrcGFyYW0pXHRcdFx0XHJcblx0XHRcdFx0LmF0dHIoJ2QnLCBhcmMpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAoZCwgaSkgPT4gY29sb3JUeXBlKGkpKVxyXG5cdFx0XHRcdC5lYWNoKCBmdW5jdGlvbiAoZCkgeyB0aGlzLl9jdXJyZW50ID0gZCB9KTtcdFx0XHJcblxyXG5cdFx0Ly8gdXBkYXRlXHJcblx0XHRwZXJjZW50YWdlID0gc3ZnLnNlbGVjdEFsbCgnLnBlcmMtJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoW2RhdGFbMF1dKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAncGVyYy0nK3BhcmFtKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgLTE1IClcclxuXHRcdFx0XHQuYXR0cigneScsIDUgKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQudGV4dCggcGVyY2VudCApO1xyXG5cclxuXHRcdGV4YWN0VmFsdWUgPSBzdmcuc2VsZWN0QWxsKCcuZXh2YWwtJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoW2RhdGFbMF1dKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnZXh2YWwtJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIC0xNSApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCA2NSApXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdmb250LXNpemUnLCAxOClcclxuXHRcdFx0XHQudGV4dCggcm91bmRWYWx1ZSApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgY2hhcnQgYW5kIGFsbCB0ZXh0IHZhbHVlcyBhY2NvcmRpbmcgdG8gbmV3IGdpdmVuIGRhdGEuIFxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZUNoYXJ0KGRhdGFzZXQpIHtcclxuXHJcblx0XHR2YXIgZGF0YSA9IHVwZGF0ZURhdGEoZGF0YXNldCk7XHJcblxyXG5cdFx0Ly8gY29tcHV0ZSB0aGUgbmV3IGFuZ2xlc1xyXG5cdFx0cGF0aCA9IHBhdGguZGF0YSggZGF0YSApO1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBhcmNzXHJcblx0XHRwYXRoLnRyYW5zaXRpb24oKS5hdHRyVHdlZW4oJ2QnLCBhcmNUd2Vlbik7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHRleHQgLSBwZXJjZW50YWdlIG51bWJlclxyXG5cdFx0cGVyY2VudGFnZS5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LnRleHQoIHBlcmNlbnQgKTtcclxuXHJcblx0XHQvLyB1cGRhdGUgdGV4dCAtIGV4YWN0IHZhbHVlIG51bWJlclxyXG5cdFx0ZXhhY3RWYWx1ZS5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LnRleHQoIHJvdW5kVmFsdWUgKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN0b3JlIHRoZSBkaXNwbGF5ZWQgYW5nbGVzIGluIF9jdXJyZW50LlxyXG5cdFx0ICogVGhlbiwgaW50ZXJwb2xhdGUgZnJvbSBfY3VycmVudCB0byB0aGUgbmV3IGFuZ2xlcy5cclxuXHRcdCAqIER1cmluZyB0aGUgdHJhbnNpdGlvbiwgX2N1cnJlbnQgaXMgdXBkYXRlZCBpbi1wbGFjZSBieSBkMy5pbnRlcnBvbGF0ZS5cclxuXHRcdCAqXHJcblx0XHQgKiBjb2RlIHRha2VuIGZyb206IGh0dHBzOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMTM0NjQxMFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBhcmNUd2VlbihhKSB7XHJcblx0XHRcdHZhciBpID0gZDMuaW50ZXJwb2xhdGUodGhpcy5fY3VycmVudCwgYSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLl9jdXJyZW50ID0gaSgwKTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih0KSB7XHJcblx0XHRcdFx0cmV0dXJuIGFyYyhpKHQpKTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSBmb3IgdGhlIHZpc3VhbGl6YXRpb24gaW4gdGhlIGZvcm0gb2YgYXJyYXkgb2YgdHdvIG9iamVjdHNcclxuXHQgKiB3aGVyZSBmaXJzdCBvYmplY3QgcmVwcmVzZW50cyBhIHBhcnQgb2YgdGhlIHdob2xlIGFuZCB0aGUgc2Vjb25kIG9iamVjdHMgcmVwcmVzZW50cyB0aGUgcmVzdCBvZiB0aGUgd2hvbGUuXHJcblx0ICogVGhlIHdob2xlIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIGEgcGFyYW1ldGVyLCBlLmcuIHRoZSB3aG9sZSBjYW4gYmUgbnVtYmVyIG9mIHRpY2tldHMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIFxyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBwaWVkRGF0YSBhcnJheSBvZiBvYmplY3RzIGFzIHJldHVybmVkIGZyb20gZDMucGllIGZ1bmN0aW9uXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlRGF0YShkYXRhKSB7XHJcblx0XHR2YXIgZGF0YXNldDtcclxuXHJcblx0XHRpZiAodmlzLnBhcmFtID09PSAnZmFyZScpIHtcclxuXHJcblx0XHRcdGlmICghaW5pdGlsaXplZCkge1xyXG5cdFx0XHRcdGFsbEl0ZW1zID0gYXZnUHJpY2UoZGF0YSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHBhcnRJdGVtcyA9IGF2Z1ByaWNlKGRhdGEpO1x0XHRcdFxyXG5cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIWluaXRpbGl6ZWQpIHtcclxuXHRcdFx0XHRhbGxJdGVtcyA9IGRhdGFbcGFyYW1dO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJ0SXRlbXMgPSBkYXRhW3BhcmFtXTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGFsbEl0ZW1zID09PSBwYXJ0SXRlbXMpIHtcclxuXHRcdFx0ZGF0YXNldCA9IFt7IHZhbHVlOiBhbGxJdGVtcyB9LCB7IHZhbHVlOiAwIH1dO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZGF0YXNldCA9IFt7IHZhbHVlOiBwYXJ0SXRlbXMgfSwgeyB2YWx1ZTogYWxsSXRlbXMgLSBwYXJ0SXRlbXMgfV07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHBpZShkYXRhc2V0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZvcm1hdHMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBvYmplY3QgLSBlaXRoZXIgYXMgYSBudW1iZXIgd2l0aCBjdXJyZW5jeSBvciBqdXN0IGEgbnVtYmVyLiBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkIGRhdGEgb2JqZWN0XHJcblx0ICogQHJldHVybiB7c3RyaW5nfSByb3VuZFZhbHVlIGZvcm1hdHRlZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHJvdW5kVmFsdWUoZCkge1xyXG5cdFx0aWYgKHZpcy5wYXJhbSA9PT0gJ2ZhcmUnKSB7XHJcblx0XHRcdHJldHVybiBudW1lcmFsKGQudmFsdWUpLmZvcm1hdCgnJDAsMCcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG51bWVyYWwoZC52YWx1ZSkuZm9ybWF0KCcwLDAnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZvcm1hdHMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBvYmplY3QgaW50byBhIHJvdW5kZWQgcGVyY2VudGFnZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkIGRhdGEgb2JqZWN0XHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBwZXJjZW50IGZvcm1hdHRlZCBzdHJpbmdcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBwZXJjZW50KGQpIHtcclxuXHRcdHZhciBwZXJjZW50ID0gZC52YWx1ZS9hbGxJdGVtcyoxMDA7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChwZXJjZW50KSsnJSc7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYXZlcmFnZSBwcmljZSBvZiB0aWNrZXRzIGZyb20gZ2l2ZW4gZGF0YSAtIHN1bSBvZiBhbGwgZmFyZXMgb3ZlciBudW1iZXIgb2YgYWxsIHRpY2tldHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICogQHJldHVybiB7bnVtYmVyfSBhdmdQcmljZVxyXG4gKi9cclxuZnVuY3Rpb24gYXZnUHJpY2UoZGF0YSkge1xyXG5cdFxyXG5cdHZhciBwcmljZVN1bSA9IGRhdGEucmVkdWNlKCAoYSwgYikgPT4gYSArIGIuZmFyZSwgMCApO1xyXG5cdFxyXG5cdHZhciB0aWNrZXROdW0gPSBkYXRhLmxlbmd0aDtcclxuXHJcblx0cmV0dXJuIHByaWNlU3VtIC8gdGlja2V0TnVtO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nIGZvciBnaXZlbiBlbGVtZW50LlxyXG4gKiBDcmVhdGVzIGZpdmUgYmFyIGNoYXJ0cyBzdGF0aW5nIHRoZSB0b3AgZWxlbWVudHMgd2hpY2ggc3BlbmQgdGhlIG1vc3QuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dW5pcVZhbHVlcywgY2FsY1NwZW5kaW5nfSBmcm9tICcuL3Zpcy11dGlsJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGFuZCBjcmVhdGVzIHRoZSB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgdmlzdWFsaXphdGlvbiBvZiB0b3Agc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHZpc0lkIGlkIG9mIHRoZSB2aXN1YWxpemF0aW9uIHBhbmVsXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBmaWxsIGNvbG9yIHVzZWQgZm9yIGFsbCByZWN0YW5nbGVzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXhOdW1iZXIgbnVtYmVyIG9mIHBhcmFtIGRpc3BsYXllZFxyXG4gKiBAcGFyYW0ge251bWJlcn0gcGFuZWxIZWlnaHQgaGVpZ2h0IG9mIHRoZSBTVkcgcGFuZWxcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b3BTcGVuZGluZyhkYXRhLCBwYXJhbSwgdmlzSWQsIGNvbG9yLCBtYXhOdW1iZXIsIHBhbmVsSGVpZ2h0KSB7XHJcblxyXG5cdHZhciB2aXMgPSB7fTtcclxuXHR2aXMudXBkYXRlID0gdXBkYXRlVG9wU3BlbmRpbmc7XHRcclxuXHJcblx0dmFyIHhTY2FsZTtcclxuXHR2YXIgeVNjYWxlO1xyXG5cdHZhciBzdmc7XHJcblxyXG5cdC8vIGNhbGN1bGF0ZSBkYXRhLCBpbml0aWFsaXplIGFuZCBkcmF3IGNoYXJ0XHJcblx0dmFyIHRvcERhdGEgPSBjYWxjVG9wKGRhdGEpO1xyXG5cclxuXHRpbml0KHRvcERhdGEpO1xyXG5cclxuXHRjcmVhdGVCYXJDaGFydCh0b3BEYXRhKTtcclxuXHJcblx0cmV0dXJuIHZpcztcclxuXHJcblx0LyoqXHJcblx0ICogRmlyc3RseSwgY2FsY3VsYXRlcyB0aGUgbmV3IHRvcCBkYXRhIGFuZCB0aGVuIHVwZGF0ZXMgdGhlIGJhciBjaGFydCBhbmQgdGV4dCB2YWx1ZXMgYWNjb3JkaW5nIHRvIG5ldyBkYXRhLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZVRvcFNwZW5kaW5nKGRhdGEpIHtcdFxyXG5cdFx0dXBkYXRlKGNhbGNUb3AoZGF0YSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0b3AgZml2ZSBpdGVtcyBmcm9tIGRhdGEgYWNjb3JkaW5nIHRvIHNwZW5kaW5nIChmYXJlKSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICogQHJldHVybiB7YXJyYXl9IGRhdGFzZXQgdXBkYXRlZCBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjYWxjVG9wKGRhdGEpIHtcclxuXHRcdHJldHVybiBjYWxjU3BlbmRpbmcoZGF0YSwgcGFyYW0pLnNvcnQoIChhLCBiKSA9PiBiLmZhcmUgLSBhLmZhcmUgKS5zbGljZSgwLG1heE51bWJlcik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplcyBhbGwgbmVlZGVkIHZhcmlhYmxlcyBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5pdChkYXRhKSB7XHJcblx0XHRtYXJnaW4gPSB7dG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiA1fTtcclxuXHRcdHdpZHRoID0gMjYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0XHRoZWlnaHQgPSBwYW5lbEhlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuXHRcdHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0XHQuZG9tYWluKGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKVxyXG5cdFx0XHQucmFuZ2VSb3VuZEJhbmRzKFswLCBoZWlnaHRdLCAuMSk7XHJcblxyXG5cdFx0eFNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcclxuXHRcdFx0LmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSlcclxuXHRcdFx0LnJhbmdlKFsgMCwgd2lkdGggXSk7XHJcblxyXG5cdFx0c3ZnID0gZDMuc2VsZWN0KCcjJyt2aXNJZClcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgbWFyZ2luLmxlZnQgKycsJysgbWFyZ2luLnRvcCArJyknKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYmFyIGNoYXJ0IGFuZCBhIHRvb2x0aXAuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1x0XHRcclxuXHJcblx0XHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdFx0dGlwID0gZDMudGlwKClcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gJzxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC5mYXJlKS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+XFxcclxuXHRcdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJudW1iZXJcIj4nK251bWVyYWwoZC52YWx1ZXMubGVuZ3RoKS5mb3JtYXQoJzAsMCcpKycgdGlja2V0czwvc3Bhbj4nOyBcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0XHQvLyBjcmVhdGUgYmFyIGNoYXJ0c1xyXG5cdFx0dXBkYXRlKGRhdGEpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgdGhlIGJhciBjaGFydCB2aXN1YWxpemF0aW9uIHdpdGggYWxsIG5hbWVzIGFuZCBmYXJlIHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0czsgZS5nLiBbIHsgZmFyZTogeCwgb3RoZXJQYXJhbTogYSB9LCB7IGZhcmU6IHksIG90aGVyUGFyYW06IGIgfSwgLi4uIF1cclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGUoZGF0YSkge1xyXG5cdFx0Ly8gdXBkYXRlIHNjYWxlIHNvIHJlbGF0aXZlIGRpZmZlcmVuY2llcyBjYW4gYmUgc2VlblxyXG5cdFx0eFNjYWxlLmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSk7XHJcblxyXG5cdFx0Ly8gZHJhdyByZWN0YW5nbGUgcmVwcmVzZW50aW5nIHNwZW5kaW5nXHJcblx0XHR2YXIgYmFycyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0YmFycy50cmFuc2l0aW9uKClcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUoZC5mYXJlKSk7XHJcblxyXG5cdFx0YmFycy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4gMClcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGRbcGFyYW1dKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUoZC5mYXJlKSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsIGNvbG9yKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW91dCcsIHRpcC5oaWRlKTtcclxuXHJcblx0XHRiYXJzLmV4aXQoKS5yZW1vdmUoKTtcclxuXHJcblx0XHQvLyBkcmF3IHRleHQgdG8gdGhlIGxlZnQgb2YgZWFjaCBiYXIgcmVwcmVzZW50aW5nIHRoZSBuYW1lXHJcblx0XHR2YXIgbmFtZXMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0rJy1uYW1lJylcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0bmFtZXMudHJhbnNpdGlvbigpXHJcblx0XHRcdC50ZXh0KGQgPT4gZFtwYXJhbV0pO1xyXG5cclxuXHRcdG5hbWVzLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2Jhci0nK3BhcmFtKyctbmFtZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZFtwYXJhbV0pKVxyXG5cdFx0XHRcdC5hdHRyKCdkeScsICh5U2NhbGUucmFuZ2VCYW5kKCkvNCkqMylcclxuXHRcdFx0XHQuYXR0cignZHgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQudGV4dChkID0+IGRbcGFyYW1dKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW91dCcsIHRpcC5oaWRlKTtcclxuXHJcblx0XHRuYW1lcy5leGl0KCkucmVtb3ZlKCk7XHJcblxyXG5cdFx0Ly8gZHJhdyB0ZXh0IHRvIHRoZSByaWdodCBvZiBlYWNoIGJhciByZXByZXNlbnRpbmcgdGhlIHJvdW5kZWQgc3BlbmRpbmdcclxuXHRcdHZhciBmYXJlcyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSsnLWZhcmUnKVxyXG5cdFx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0XHRmYXJlcy50cmFuc2l0aW9uKClcclxuXHRcdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0XHRmYXJlcy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSsnLWZhcmUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4Jywgd2lkdGgtMzUpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkW3BhcmFtXSkpXHJcblx0XHRcdFx0LmF0dHIoJ2R5JywgKHlTY2FsZS5yYW5nZUJhbmQoKS80KSozKVxyXG5cdFx0XHRcdC5hdHRyKCdkeCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVx0XHRcdFx0XHJcblx0XHRcdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0XHRmYXJlcy5leGl0KCkucmVtb3ZlKCk7XHJcblx0fVxyXG59IiwiLyoqXHJcbiAqIEZpbmRzIG91dCB0aGUgdW5pcXVlIHZhbHVlcyBvZiBnaXZlbiBkYXRhIGZvciBnaXZlbiBwYXJhbWV0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgYWxsIHllYXIgc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIHBhcmFtZXRlciB3aGljaCBzaG91bGQgYmUgbG9va2VkIHVwXHJcbiAqIEByZXR1cm4ge2FycmF5fSB1bmlxdWVWYWx1ZXMgYXJyYXkgb2YgYWxsIHVuaXF1ZSB2YWx1ZXMgZm9yIGdpdmVuIHBhcmFtZXRlclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pIHtcclxuXHRyZXR1cm4gWyAuLi5uZXcgU2V0KGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSB3aG9sZSB5ZWFyJ3Mgc3BlbmRpbmcgZm9yIGEgZ2l2ZW4gcGFyYW0gKGUuZy4gc3VwcGxpZXIsIGRpcmVjdG9yYXRlKSBhbmQgcmV0dXJucyBpdCBpbiB1cGRhdGVkIGFycmF5IG9mIG9iamVjdHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtXHJcbiAqIEByZXR1cm4ge2FycmF5fSBhbGxTcGVuZGluZyBhcnJheSBvZiB1cGRhdGVkIG9iamVjdHMsIGUuZy4gWyB7ZmFyZTogeCwgcGFyYW06IGF9LCB7ZmFyZTogeSwgcGFyYW06IGJ9LCAuLi5dXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2FsY1NwZW5kaW5nKGRhdGEsIHBhcmFtKSB7XHJcblx0dmFyIHVuaXFJdGVtcyA9IHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pO1xyXG5cdFxyXG5cdHZhciBhbGxQYXJhbXMgPSB1bmlxSXRlbXMubWFwKCBpdGVtID0+IGRhdGEuZmlsdGVyKCBkID0+IGRbcGFyYW1dID09PSBpdGVtICkpO1xyXG5cclxuXHR2YXIgYWxsU3BlbmRpbmcgPSBbXTtcclxuXHJcblx0YWxsUGFyYW1zLmZvckVhY2goIGl0ZW1BcnJheSA9PiB7XHJcblx0XHR2YXIgb2JqID0ge307XHJcblxyXG5cdFx0b2JqWydmYXJlJ10gPSBpdGVtQXJyYXkucmVkdWNlKCAoYSxiKSA9PiBhICsgYi5mYXJlLCAwKTtcclxuXHRcdG9ialtwYXJhbV0gPSBpdGVtQXJyYXlbMF1bcGFyYW1dO1xyXG5cdFx0b2JqWyd2YWx1ZXMnXSA9IGl0ZW1BcnJheTtcclxuXHJcblx0XHRhbGxTcGVuZGluZy5wdXNoKG9iaik7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBhbGxTcGVuZGluZztcclxufSIsIi8qKlxyXG4gKiBNYWluIHZpc3VhbGl6YXRpb24gbW9kdWxlIGZvciBjcmVhdGluZyBjaGFydHMgYW5kIHZpcyBmb3IgcGFzc2VkIGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7c3BlbmRpbmd9IGZyb20gJy4vc3BlbmRpbmcnO1xyXG5pbXBvcnQge2Rpc3RyaWJ1dGlvbn0gZnJvbSAnLi9kaXN0cmlidXRpb24nO1xyXG5pbXBvcnQge3RvcFNwZW5kaW5nfSBmcm9tICcuL3RvcFNwZW5kaW5nJztcclxuaW1wb3J0IHt0aWNrZXR9IGZyb20gJy4vdGlja2V0JztcclxuaW1wb3J0IHtkZXN0aW5hdGlvbnN9IGZyb20gJy4vZGVzdGluYXRpb25zJztcclxuXHJcbnZhciBkYXRhO1xyXG5cclxuLypcclxudmFyIHBhbmVscyA9IFtcclxuXHR7aWQ6ICd2aXMtc3BlbmRpbmcnLCBmbjogc3BlbmRpbmcsIGFyZ3M6IFtkYXRhXX1cclxuXHRdO1xyXG4qL1xyXG52YXIgcGFuZWxzID0gW1xyXG5cdCd2aXMtc3BlbmRpbmcnLFxyXG5cdCd2aXMtZGlzdHJpYnV0aW9uJywgXHJcblx0J3Zpcy10aWNrZXQtbnVtJywgXHJcblx0J3Zpcy10aWNrZXQtYXZnJywgXHJcblx0J3Zpcy10b3Atc3VwJyxcclxuXHQndmlzLXRvcC1kaXInLCBcclxuXHQndmlzLWRlc3RpbmF0aW9ucycsXHJcblx0J3Zpcy10b3AxMC1zdXAnXHJcblx0XTtcclxuXHJcbnZhciBzdXA7XHJcbnZhciBkaXI7XHJcblxyXG52YXIgcHJpY2U7XHJcbnZhciBudW07XHJcblxyXG4vKipcclxuICpcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YXNldCBhcnJheSBvZiBvYmplY3RzIGZvciB2aXN1YWxpemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlzdWFsaXplKGRhdGFzZXQpe1x0XHJcblx0ZGF0YSA9IGRhdGFzZXQ7XHJcblxyXG5cdGRldGVjdFBhbmVscyhkYXRhKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGEgaXMgZmlyc3RseSBmaWx0ZXJlZCBhY2NvcmRpbmcgdG8gbW9udGggYW5kIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdGhlbiByZWRyYXduIHdpdGggdXBkYXRlZCBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbW9udGggc2VsZWN0ZWQgbW9udGggd2hpY2ggd2lsbCBiZSB1c2VkIGZvciBmaWx0ZXJpbmcgZGF0YVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZWRTcGVuZGluZyhtb250aCkge1xyXG5cdHZhciBkYXRhc2V0O1xyXG5cdFxyXG5cdGlmIChtb250aCkge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBvbmx5IGdpdmVuIG1vbnRoIGRhdGFcclxuXHRcdGRhdGFzZXQgPSBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyByZWRyYXcgYWxsIHBhbmVscyB3aXRoIGFsbCBtb250aHMgZGF0YVxyXG5cdFx0ZGF0YXNldCA9IGRhdGE7XHJcblx0fVxyXG5cclxuXHRzdXAudXBkYXRlKGRhdGFzZXQpO1xyXG5cdGRpci51cGRhdGUoZGF0YXNldCk7XHJcblx0bnVtLnVwZGF0ZShkYXRhc2V0KTtcclxuXHRwcmljZS51cGRhdGUoZGF0YXNldCk7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGRldGVjdFBhbmVscyhkYXRhKSB7XHJcblx0cGFuZWxzLmZvckVhY2goIHBhbmVsID0+IHtcclxuXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5lbCkpIHtcclxuXHRcdFx0c3dpdGNoIChwYW5lbCkge1xyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzBdOlxyXG5cdFx0XHRcdFx0c3BlbmRpbmcoZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbMV06XHJcblx0XHRcdFx0XHRkaXN0cmlidXRpb24oZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbMl06XHJcblx0XHRcdFx0XHRudW0gPSB0aWNrZXQoZGF0YSwgJ2xlbmd0aCcsIHBhbmVsc1syXSwgJyNkMDcyNWQnKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1szXTpcclxuXHRcdFx0XHRcdHByaWNlID0gdGlja2V0KGRhdGEsICdmYXJlJywgcGFuZWxzWzNdLCAnI2QyYTI0YycpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzRdOlxyXG5cdFx0XHRcdFx0c3VwID0gdG9wU3BlbmRpbmcoZGF0YSwgJ3N1cHBsaWVyJywgcGFuZWxzWzRdLCAnIzRiOTIyNicsIDUsIDEzMCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbNV06XHJcblx0XHRcdFx0XHRkaXIgPSB0b3BTcGVuZGluZyhkYXRhLCAnZGlyZWN0b3JhdGUnLCBwYW5lbHNbNV0sICcjYWY0YzdlJywgNSwgMTMwKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1s2XTpcclxuXHRcdFx0XHRcdGRlc3RpbmF0aW9ucyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1s3XTpcclxuXHRcdFx0XHRcdHN1cCA9IHRvcFNwZW5kaW5nKGRhdGEsICdzdXBwbGllcicsIHBhbmVsc1s3XSwgJyM0YjkyMjYnLCAxMCwgMzIwKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0fVxyXG5cdFx0fVx0XHRcclxuXHR9KTtcclxufSJdfQ==
