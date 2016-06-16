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
function ticket(data, visId, param, color) {
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
function topSpending(data, visId, param, color, maxNumber, panelHeight) {

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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Main visualization module for creating charts and vis for passed data.
                                                                                                                                                                                                     *
                                                                                                                                                                                                     * @author lucyia <ping@lucyia.com>
                                                                                                                                                                                                     * @version 0.1
                                                                                                                                                                                                     */

// array of objects representing spending
var data;

// panels for visualizations, including callable function and parameters to set them up
var panels = [{ id: 'vis-spending', fn: _spending.spending, args: [] }, { id: 'vis-distribution', fn: _distribution.distribution, args: [] }, { id: 'vis-ticket-num', fn: _ticket.ticket, args: ['length', '#d0725d'] }, { id: 'vis-ticket-avg', fn: _ticket.ticket, args: ['fare', '#d2a24c'] }, { id: 'vis-top-sup', fn: _topSpending.topSpending, args: ['supplier', '#4b9226', 5, 130] }, { id: 'vis-top-dir', fn: _topSpending.topSpending, args: ['directorate', '#af4c7e', 5, 130] }, { id: 'vis-destinations', fn: _destinations.destinations, args: [] }, { id: 'vis-top10-sup', fn: _topSpending.topSpending, args: ['supplier', '#4b9226', 10, 320] }];

/**
 * Stores the given data into module's global variable.
 * Then detects what visualizations are possible to create and sets them up with defined parameters.
 *
 * @param {array} dataset array of objects
 */
function visualize(dataset) {

	data = dataset;

	panels.forEach(function (panel) {
		if (document.getElementById(panel.id)) {
			// some visualizations return object, store it, so it is callable later
			panel.vis = panel.fn.apply(panel, [data, panel.id].concat(_toConsumableArray(panel.args)));
		}
	});
}

/**
 * Data is firstly filtered according to month and all other visualizations are then redrawn with updated data.
 * If nothing is passed, then the default data with all months are visualized.
 *
 * @param {string} month selected month which will be used for filtering data
 */
function updatedSpending(month) {
	// data to be visualized - either filtered or default data with all months
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

	panels.forEach(function (panel) {
		// if the visualization has an object returned, call update on it with the new dataset
		if (panel.vis) {
			panel.vis.update(dataset);
		}
	});
}

},{"./destinations":1,"./distribution":2,"./spending":4,"./ticket":5,"./topSpending":6}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGVzdGluYXRpb25zLmpzIiwianNcXGRpc3RyaWJ1dGlvbi5qcyIsImpzXFxpbml0LmpzIiwianNcXHNwZW5kaW5nLmpzIiwianNcXHRpY2tldC5qcyIsImpzXFx0b3BTcGVuZGluZy5qcyIsImpzXFx2aXMtdXRpbC5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQzJCZ0IsWSxHQUFBLFk7O0FBbkJoQjs7O0FBR0EsSUFBSSxNQUFKLEM7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFKO0FBQ0EsSUFBSSxNQUFKOzs7QUFHQSxJQUFJLEdBQUo7OztBQUdBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxHQUFKOzs7OztBQUtPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0Qjs7QUFFbEMsTUFBSyxJQUFMOztBQUVBLFNBQVEsV0FBVyxJQUFYLENBQVI7QUFFQTs7Ozs7OztBQU9ELFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0I7O0FBRW5CLFVBQVMsRUFBQyxLQUFLLEVBQU4sRUFBVSxPQUFPLEVBQWpCLEVBQXFCLFFBQVEsRUFBN0IsRUFBaUMsTUFBTSxFQUF2QyxFQUFUO0FBQ0EsU0FBUSxNQUFNLE9BQU8sSUFBYixHQUFvQixPQUFPLEtBQW5DO0FBQ0EsVUFBUyxNQUFNLE9BQU8sR0FBYixHQUFtQixPQUFPLE1BQW5DOztBQUVBLFNBQVEsR0FBRyxLQUFILENBQVMsT0FBVDs7QUFBQSxFQUVOLEtBRk0sQ0FFQSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLENBRkEsQ0FBUjs7QUFJQSxPQUFNLEdBQUcsTUFBSCxDQUFVLG1CQUFWLEVBQ0osTUFESSxDQUNHLEtBREgsRUFFSCxJQUZHLENBRUUsT0FGRixFQUVXLFFBQVEsT0FBTyxJQUFmLEdBQXNCLE9BQU8sS0FGeEMsRUFHSCxJQUhHLENBR0UsUUFIRixFQUdZLFNBQVMs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QkFBckIsRUFBc0MsTUFBTSxDQUFDLGFBQUQsRUFBZ0IsU0FBaEIsRUFBMkIsQ0FBM0IsRUFBOEIsR0FBOUIsQ0FBNUMsRUFOWSxFQU9aLEVBQUUsSUFBSSxrQkFBTixFQUEwQiw4QkFBMUIsRUFBNEMsTUFBTSxFQUFsRCxFQVBZLEVBUVosRUFBRSxJQUFJLGVBQU4sRUFBdUIsNEJBQXZCLEVBQXdDLE1BQU0sQ0FBQyxVQUFELEVBQWEsU0FBYixFQUF3QixFQUF4QixFQUE0QixHQUE1QixDQUE5QyxFQVJZLENBQWI7Ozs7Ozs7O0FBaUJPLFNBQVMsU0FBVCxDQUFtQixPQUFuQixFQUEyQjs7QUFFakMsUUFBTyxPQUFQOztBQUVBLFFBQU8sT0FBUCxDQUFnQixpQkFBUztBQUN4QixNQUFJLFNBQVMsY0FBVCxDQUF3QixNQUFNLEVBQTlCLENBQUosRUFBdUM7O0FBRXRDLFNBQU0sR0FBTixHQUFZLE1BQU0sRUFBTixlQUFVLElBQVYsRUFBZ0IsTUFBTSxFQUF0Qiw0QkFBNkIsTUFBTSxJQUFuQyxHQUFaO0FBQ0E7QUFDRCxFQUxEO0FBTUE7Ozs7Ozs7O0FBUU0sU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQWdDOztBQUV0QyxLQUFJLE9BQUo7O0FBRUEsS0FBSSxLQUFKLEVBQVc7O0FBRVYsWUFBVSxLQUFLLE1BQUwsQ0FBYTtBQUFBLFVBQUssRUFBRSxLQUFGLEtBQVksS0FBakI7QUFBQSxHQUFiLENBQVY7QUFDQSxFQUhELE1BR087O0FBRU4sWUFBVSxJQUFWO0FBQ0E7O0FBRUQsUUFBTyxPQUFQLENBQWdCLGlCQUFTOztBQUV4QixNQUFJLE1BQU0sR0FBVixFQUFlO0FBQ2QsU0FBTSxHQUFOLENBQVUsTUFBVixDQUFpQixPQUFqQjtBQUNBO0FBQ0QsRUFMRDtBQU1BIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIGRlcGFydHVyZXMgYW5kIGRlc3RpbmF0aW9ucy5cclxuICogQ3JlYXRlcyBhIGN1c3RvbSB2aXN1YWxpemF0aW9uIGRlcGljdGluZyBjb3VudHJpZXMgb2YgZGVzdGluYXRpb25zIGFuZCBkZXBhcnR1cmVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXN9IGZyb20gJy4vdmlzLXV0aWwnO1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG5cclxuLy8gY29sb3IgZnVuY3Rpb24gYXNzaWduaW5nIGVhY2ggcGxhY2UgdW5pcXVlIGNvbG9yXHJcbnZhciBjb2xvcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBhZHZhbmNlZCB0b29sdGlwXHJcbnZhciB0aXA7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSB0aGF0IGlzIG1vcmUgc3VpdGFibGUgZm9yIHdvcmtpbmcgd2l0aGluIHZpc3VhbGl6YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVzdGluYXRpb25zKGRhdGEpIHtcclxuXHJcblx0aW5pdChkYXRhKTtcclxuXHJcblx0ZHJhd1Zpcyh1cGRhdGVEYXRhKGRhdGEpKTtcclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGFsbCBzY2FsZXMgYW5kIGF0dHJpYnV0ZXMgYWNjLiB0byBnaXZlbiBkYXRhIGFuZCBjcmVhdGVzIGEgU1ZHIHBhbmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGVhY2ggc3BlbmRpbmdcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMTAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDUwMCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuXHRjb2xvciA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0Ly8ucmFuZ2UoWycjMjE5NmYzJywgJyNjZGRjMzknLCAnI2ZmODEwMCddKTtcclxuXHRcdC5yYW5nZShbJyMwYTY1YWQnLCAnIzk5YTcxNycsICcjZDI3ZDAwJ10pXHJcblxyXG5cdHN2ZyA9IGQzLnNlbGVjdCgnI3Zpcy1kZXN0aW5hdGlvbnMnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIHRoZSB2aXN1YWxpemF0aW9uIHdpdGggbm9kZXMsIGVkZ2VzIGFuZCB0ZXh0IGxhYmVscy5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gZHJhd1ZpcyhkYXRhKSB7XHJcblxyXG5cdC8vIGNyZWF0ZSB0b29sdGlwIGZvciBwbGFjZXMgYW5kIGNhbGwgaXRcclxuXHR0aXAgPSBkMy50aXAoKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHQuaHRtbCggZCA9PiB7XHJcblx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJudW1iZXJcIj5GbGlnaHRzIG91dDogPHNwYW4gY2xhc3M9XCJwdWxsLXJpZ2h0XCI+JytudW1lcmFsKGQuZGVwYXJ0dXJlLmxlbmd0aCkuZm9ybWF0KCcwLDAnKSsnPC9zcGFuPjwvc3Bhbj5cXFxyXG5cdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJudW1iZXJcIj5GbGlnaHRzIGluOiA8c3BhbiBjbGFzcz1cInB1bGwtcmlnaHRcIj4nK251bWVyYWwoZC5kZXN0aW5hdGlvbi5sZW5ndGgpLmZvcm1hdCgnMCwwJykrJzwvc3Bhbj48L3NwYW4+JztcclxuXHRcdH0pO1x0XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblx0XHJcblx0dmFyIHIgPSA2MDtcclxuXHJcblx0Ly8gY3JlYXRlIGEgY2lyY2xlIGZvciBlYWNoIHBsYWNlXHJcblx0dmFyIGNpcmNsZXMgPSBzdmcuc2VsZWN0QWxsKCcucGxhY2VzJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdFx0LmF0dHIoJ2N4JywgZCA9PiBkLmNvb3JkLngpXHJcblx0XHRcdC5hdHRyKCdjeScsIGQgPT4gZC5jb29yZC55KVxyXG5cdFx0XHQuYXR0cigncicsIHIpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgdGlwLmhpZGUpO1xyXG5cclxuXHQvLyBjcmVhdGUgYSBsYWJlbCBmb3IgZWFjaCBwbGFjZSBhbmQgcGxhY2UgaXQgaW5zaWRlIHRoZSBwbGFjZSdzIGNpcmNsZVxyXG5cdHZhciBsYWJlbHMgPSBzdmcuc2VsZWN0QWxsKCcucGxhY2VzLWxhYmVsJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiBkLmNvb3JkLnggLSBkLnBsYWNlLmxlbmd0aCo0KVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4gZC5jb29yZC55ICsgNSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHQuc3R5bGUoJ2ZvbnQtd2VpZ2h0JywgJzYwMCcpXHJcblx0XHRcdC50ZXh0KCBkID0+IGQucGxhY2UgKTtcclxuXHJcblx0Ly8gYXJyb3cgbWFya2VyIGZvciB0aGUgbGluZXNcclxuXHRzdmcuYXBwZW5kKCdkZWZzJylcclxuXHRcdC5hcHBlbmQoJ21hcmtlcicpXHJcblx0XHRcdC5hdHRyKCdpZCcsICdtYXJrZXJBcnJvdycpXHJcblx0XHRcdC5hdHRyKCdtYXJrZXJXaWR0aCcsIDYpXHJcblx0XHRcdC5hdHRyKCdtYXJrZXJIZWlnaHQnLCA0KVxyXG5cdFx0XHQuYXR0cigncmVmWCcsIDIpXHJcblx0XHRcdC5hdHRyKCdyZWZZJywgMilcclxuXHRcdFx0LmF0dHIoJ29yaWVudCcsICdhdXRvJylcclxuXHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnZmxpZ2h0JylcclxuXHRcdFx0LmF0dHIoJ2QnLCAnTTAsMCBMMCw0IEwzLDIgTDAsMCcpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJyk7XHJcblxyXG5cdHZhciBzaGlmdFggPSByLzI7XHJcblx0dmFyIHNoaWZ0WSA9IHIvMjtcclxuXHJcblx0Ly8gbGluZSBmdW5jdGlvblxyXG5cdHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKVxyXG5cdFx0LmludGVycG9sYXRlKCdiYXNpcycpXHJcblx0XHQueCggZCA9PiBkLngpXHJcblx0XHQueSggZCA9PiBkLnkpO1xyXG5cclxuXHRhcnJvd1BsYWNlMlNlbGYoKTtcclxuXHJcblx0YXJyb3dQbGFjZTJPdXQoKTtcclxuXHJcblx0YXJyb3dQbGFjZTJJbigpO1xyXG5cclxuXHQvKipcclxuXHQgKiBEcmF3cyBhbiBhcnJvdyBmcm9tIGEgcGxhY2UgdG8gaXRzZWxmLCByZXByZXNlbnRpbmcgZmxpZ2h0cyBmcm9tIHRoZSBwbGFjZSByZXR1cmluZyB0byBpdC5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhcnJvd1BsYWNlMlNlbGYoKSB7XHJcblxyXG5cdFx0Ly8gVUsgLT4gVUtcclxuXHRcdHZhciBjZW50ZXJYX1VLID0gZGF0YVswXS5jb29yZC54O1xyXG5cdFx0dmFyIGNlbnRlcllfVUsgPSBkYXRhWzBdLmNvb3JkLnktci8zO1xyXG5cclxuXHRcdHZhciBmbGlnaHRzX1VLMlVLX25vZGVzID0gWyBcclxuXHRcdFx0eyB4OiBjZW50ZXJYX1VLK3NoaWZ0WCwgeTogY2VudGVyWV9VSy1zaGlmdFkgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX1VLK3NoaWZ0WCoxLjUsIHk6IGNlbnRlcllfVUstc2hpZnRZKjIgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX1VLLCB5OiBjZW50ZXJZX1VLLXNoaWZ0WSozIH0sXHJcblx0XHRcdHsgeDogY2VudGVyWF9VSy1zaGlmdFgqMS41LCB5OiBjZW50ZXJZX1VLLXNoaWZ0WSoyIH0sXHJcblx0XHRcdHsgeDogY2VudGVyWF9VSy1zaGlmdFgsIHk6IGNlbnRlcllfVUstc2hpZnRZIH1cclxuXHRcdF07XHJcblxyXG5cdFx0dmFyIGZsaWdodHNfVUsyVUsgPSBzdmcuYXBwZW5kKCdwYXRoJylcclxuXHRcdFx0LmF0dHIoJ2QnLCBsaW5lKGZsaWdodHNfVUsyVUtfbm9kZXMpKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnZmxpZ2h0JylcclxuXHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCA1KVxyXG5cdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHJcblx0XHRcclxuXHRcdC8vIG5FRUEgLT4gbkVFQVxyXG5cdFx0dmFyIGNlbnRlclhfbkVFQSA9IGRhdGFbMV0uY29vcmQueDtcclxuXHRcdHZhciBjZW50ZXJZX25FRUEgPSBkYXRhWzFdLmNvb3JkLnkrci8zO1xyXG5cclxuXHRcdHZhciBmbGlnaHRzX25FRUEybkVFQV9ub2RlcyA9IFsgXHJcblx0XHRcdHsgeDogY2VudGVyWF9uRUVBLXNoaWZ0WCwgeTogY2VudGVyWV9uRUVBK3NoaWZ0WSB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfbkVFQS1zaGlmdFgqMS41LCB5OiBjZW50ZXJZX25FRUErc2hpZnRZKjIgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX25FRUEsIHk6IGNlbnRlcllfbkVFQStzaGlmdFkqMyB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfbkVFQStzaGlmdFgqMS41LCB5OiBjZW50ZXJZX25FRUErc2hpZnRZKjIgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX25FRUErc2hpZnRYLCB5OiBjZW50ZXJZX25FRUErc2hpZnRZIH1cclxuXHRcdF07XHJcblxyXG5cdFx0dmFyIGZsaWdodHNfbkVFQTJuRUVBID0gc3ZnLmFwcGVuZCgncGF0aCcpXHJcblx0XHRcdC5hdHRyKCdkJywgbGluZShmbGlnaHRzX25FRUEybkVFQV9ub2RlcykpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQnKVxyXG5cdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHQuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI21hcmtlckFycm93KScpO1xyXG5cclxuXHRcdFxyXG5cdFx0Ly8gbkVFQSAtPiBuRUVBXHJcblx0XHR2YXIgY2VudGVyWF9FRUEgPSBkYXRhWzJdLmNvb3JkLng7XHJcblx0XHR2YXIgY2VudGVyWV9FRUEgPSBkYXRhWzJdLmNvb3JkLnkrci8zO1xyXG5cclxuXHRcdHZhciBmbGlnaHRzX0VFQTJFRUFfbm9kZXMgPSBbIFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfRUVBLXNoaWZ0WCwgeTogY2VudGVyWV9FRUErc2hpZnRZIH0sXHJcblx0XHRcdHsgeDogY2VudGVyWF9FRUEtc2hpZnRYKjEuNSwgeTogY2VudGVyWV9FRUErc2hpZnRZKjIgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX0VFQSwgeTogY2VudGVyWV9FRUErc2hpZnRZKjMgfSxcclxuXHRcdFx0eyB4OiBjZW50ZXJYX0VFQStzaGlmdFgqMS41LCB5OiBjZW50ZXJZX0VFQStzaGlmdFkqMiB9LFxyXG5cdFx0XHR7IHg6IGNlbnRlclhfRUVBK3NoaWZ0WCwgeTogY2VudGVyWV9FRUErc2hpZnRZIH1cclxuXHRcdF07XHJcblxyXG5cdFx0dmFyIGZsaWdodHNfRUVBMkVFQSA9IHN2Zy5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHQuYXR0cignZCcsIGxpbmUoZmxpZ2h0c19FRUEyRUVBX25vZGVzKSlcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCcpXHJcblx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdC5hdHRyKCdtYXJrZXItZW5kJywgJ3VybCgjbWFya2VyQXJyb3cpJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEcmF3cyBhbiBhcnJvdyBmcm9tIGEgcGxhY2UgdG8gYW5vdGhlciBwbGFjZSwgaW4gdGhlIGRpcmVjdGlvbiByZXByZXNlbnRpbmcgZmxpZ2h0cyBvdXQuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYXJyb3dQbGFjZTJPdXQoKSB7XHJcblxyXG5cdFx0Ly8gVUsgLT4gbkVFQVxyXG5cdFx0dmFyIGNlbnRlclhfVUsgPSBkYXRhWzBdLmNvb3JkLngtcjtcclxuXHRcdHZhciBjZW50ZXJZX1VLID0gZGF0YVswXS5jb29yZC55K3IvNDtcclxuXHJcblx0XHR2YXIgY2VudGVyWF9uRUVBID0gZGF0YVsxXS5jb29yZC54O1xyXG5cdFx0dmFyIGNlbnRlcllfbkVFQSA9IGRhdGFbMV0uY29vcmQueS1yO1xyXG5cclxuXHRcdHZhciBsaW5lc091dCA9IHN2Zy5hcHBlbmQoJ2xpbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQgZmxpZ2h0LW91dCcpXHJcblx0XHRcdFx0LmF0dHIoJ3gxJywgY2VudGVyWF9VSylcclxuXHRcdFx0XHQuYXR0cigneTEnLCBjZW50ZXJZX1VLKVxyXG5cdFx0XHRcdC5hdHRyKCd4MicsIGNlbnRlclhfbkVFQSlcclxuXHRcdFx0XHQuYXR0cigneTInLCBjZW50ZXJZX25FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHJcblx0XHQvLyBVSyAtPiBFRUFcclxuXHRcdHZhciBjZW50ZXJYX1VLID0gZGF0YVswXS5jb29yZC54K3I7XHJcblx0XHR2YXIgY2VudGVyWV9VSyA9IGRhdGFbMF0uY29vcmQueStyLzQ7XHJcblxyXG5cdFx0dmFyIGNlbnRlclhfRUVBID0gZGF0YVsyXS5jb29yZC54O1xyXG5cdFx0dmFyIGNlbnRlcllfRUVBID0gZGF0YVsyXS5jb29yZC55LXI7XHJcblxyXG5cdFx0dmFyIGxpbmVzT3V0ID0gc3ZnLmFwcGVuZCgnbGluZScpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2ZsaWdodCBmbGlnaHQtb3V0JylcclxuXHRcdFx0XHQuYXR0cigneDEnLCBjZW50ZXJYX1VLKVxyXG5cdFx0XHRcdC5hdHRyKCd5MScsIGNlbnRlcllfVUspXHJcblx0XHRcdFx0LmF0dHIoJ3gyJywgY2VudGVyWF9FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3kyJywgY2VudGVyWV9FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHRcdFxyXG5cdFx0Ly8gbkVFQSAtPiBFRUFcclxuXHRcdHZhciBjZW50ZXJYX25FRUEgPSBkYXRhWzFdLmNvb3JkLngrci0yO1xyXG5cdFx0dmFyIGNlbnRlcllfbkVFQSA9IGRhdGFbMV0uY29vcmQueS1yLzQ7XHJcblxyXG5cdFx0dmFyIGNlbnRlclhfRUVBID0gZGF0YVsyXS5jb29yZC54LXI7XHJcblx0XHR2YXIgY2VudGVyWV9FRUEgPSBkYXRhWzJdLmNvb3JkLnktci80O1xyXG5cclxuXHRcdHZhciBsaW5lc091dCA9IHN2Zy5hcHBlbmQoJ2xpbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQgZmxpZ2h0LW91dCcpXHJcblx0XHRcdFx0LmF0dHIoJ3gxJywgY2VudGVyWF9uRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd5MScsIGNlbnRlcllfbkVFQSlcclxuXHRcdFx0XHQuYXR0cigneDInLCBjZW50ZXJYX0VFQSlcclxuXHRcdFx0XHQuYXR0cigneTInLCBjZW50ZXJZX0VFQSlcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI21hcmtlckFycm93KScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRHJhd3MgYW4gYXJyb3cgZnJvbSBhIHBsYWNlIHRvIGFub3RoZXIgcGxhY2UsIGluIHRoZSBkaXJlY3Rpb24gcmVwcmVzZW50aW5nIGZsaWdodHMgaW4uXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYXJyb3dQbGFjZTJJbigpIHtcclxuXHJcblx0XHQvLyBuRUVBIC0+IFVLXHJcblx0XHR2YXIgY2VudGVyWF9VSyA9IGRhdGFbMF0uY29vcmQueC1yLzItODtcclxuXHRcdHZhciBjZW50ZXJZX1VLID0gZGF0YVswXS5jb29yZC55K3IvMyoyKzg7XHJcblxyXG5cdFx0dmFyIGNlbnRlclhfbkVFQSA9IGRhdGFbMV0uY29vcmQueCtyLzIrNjtcclxuXHRcdHZhciBjZW50ZXJZX25FRUEgPSBkYXRhWzFdLmNvb3JkLnktci8zKjItNjtcclxuXHJcblx0XHR2YXIgbGluZXNJbiA9IHN2Zy5hcHBlbmQoJ2xpbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQgZmxpZ2h0LW91dCcpXHJcblx0XHRcdFx0LmF0dHIoJ3gxJywgY2VudGVyWF9uRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd5MScsIGNlbnRlcllfbkVFQSlcclxuXHRcdFx0XHQuYXR0cigneDInLCBjZW50ZXJYX1VLKVxyXG5cdFx0XHRcdC5hdHRyKCd5MicsIGNlbnRlcllfVUspXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxuXHJcblx0XHQvLyBFRUEgLT4gVUtcclxuXHRcdHZhciBjZW50ZXJYX1VLID0gZGF0YVswXS5jb29yZC54K3IvMis4O1xyXG5cdFx0dmFyIGNlbnRlcllfVUsgPSBkYXRhWzBdLmNvb3JkLnkrci8zKjIrODtcclxuXHJcblx0XHR2YXIgY2VudGVyWF9FRUEgPSBkYXRhWzJdLmNvb3JkLngtci8yLTY7XHJcblx0XHR2YXIgY2VudGVyWV9FRUEgPSBkYXRhWzJdLmNvb3JkLnktci8zKjItNjtcclxuXHJcblx0XHR2YXIgbGluZXNJbiA9IHN2Zy5hcHBlbmQoJ2xpbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQgZmxpZ2h0LW91dCcpXHJcblx0XHRcdFx0LmF0dHIoJ3gxJywgY2VudGVyWF9FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3kxJywgY2VudGVyWV9FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3gyJywgY2VudGVyWF9VSylcclxuXHRcdFx0XHQuYXR0cigneTInLCBjZW50ZXJZX1VLKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdtYXJrZXItZW5kJywgJ3VybCgjbWFya2VyQXJyb3cpJyk7XHJcblxyXG5cdFx0Ly8gRUVBIC0+IG5FRUFcclxuXHRcdHZhciBjZW50ZXJYX25FRUEgPSBkYXRhWzFdLmNvb3JkLngrcjtcclxuXHRcdHZhciBjZW50ZXJZX25FRUEgPSBkYXRhWzFdLmNvb3JkLnkrci8zO1xyXG5cclxuXHRcdHZhciBjZW50ZXJYX0VFQSA9IGRhdGFbMl0uY29vcmQueC1yKzM7XHJcblx0XHR2YXIgY2VudGVyWV9FRUEgPSBkYXRhWzJdLmNvb3JkLnkrci8zO1xyXG5cclxuXHRcdHZhciBsaW5lc091dCA9IHN2Zy5hcHBlbmQoJ2xpbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdmbGlnaHQgZmxpZ2h0LW91dCcpXHJcblx0XHRcdFx0LmF0dHIoJ3gxJywgY2VudGVyWF9FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3kxJywgY2VudGVyWV9FRUEpXHJcblx0XHRcdFx0LmF0dHIoJ3gyJywgY2VudGVyWF9uRUVBKVxyXG5cdFx0XHRcdC5hdHRyKCd5MicsIGNlbnRlcllfbkVFQSlcdFx0XHRcdFxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCdtYXJrZXItZW5kJywgJ3VybCgjbWFya2VyQXJyb3cpJyk7XHJcblxyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkYXRhc2V0IG1vcmUgc3VpdGFibGUgZm9yIHZpc3V6YWxpemF0aW9uLlxyXG4gKiBUaGUgZGF0YXNldCBpcyBhbiBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBzcGVuZGluZyBmb3IgZWFjaCBwbGFjZSwgZGVzdGluYXRpb25zL2RlcGFydHVyZXMsIGV0Yy5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlRGF0YShkYXRhKSB7XHJcblxyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdC8vIGdldCBhbGwgcGxhY2VzIChkZXN0aW5hdGlvbnMgYW5kIGRlcGFydHVyZXMgYXJlIHRoZSBzYW1lIGluIHRoZSBkYXRhKVxyXG5cdC8vIFtcIlVLXCIsIFwiTm9uIEVFQVwiLCBcIkVFQVwiXVxyXG5cdHZhciBwbGFjZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdkZXN0aW5hdGlvbicpO1x0XHJcblxyXG5cdC8vIGNvb3JkaW5hdGlvbnMgb2YgY2lyY2xlcyBmb3IgZWFjaCBwbGFjZVxyXG5cdHZhciBwbGFjZXNDb29yZCA9IFsgXHJcblx0XHR7IHg6IHdpZHRoLzIsIHk6IGhlaWdodC80IH0sIFxyXG5cdFx0eyB4OiB3aWR0aC8zLCB5OiBoZWlnaHQvMyoyIH0sIFxyXG5cdFx0eyB4OiB3aWR0aC8zKjIsIHk6IGhlaWdodC8zKjIgfVxyXG5cdF07XHJcblxyXG5cdC8vIGNyZWF0ZSBuZXcgb2JqZWN0cyBhbmQgYWRkIHRoZW0gaW4gdGhlIGRhdGFzZXRcclxuXHRwbGFjZXMuZm9yRWFjaCggKHBsYWNlLCBpKSA9PiB7XHJcblx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cclxuXHRcdGRhdGFPYmoucGxhY2UgPSBwbGFjZTtcclxuXHRcdGRhdGFPYmouZGVzdGluYXRpb24gPSBkYXRhLmZpbHRlciggZCA9PiBkLmRlc3RpbmF0aW9uID09PSBwbGFjZSApO1xyXG5cdFx0ZGF0YU9iai5kZXBhcnR1cmUgPSBkYXRhLmZpbHRlciggZCA9PiBkLmRlcGFydHVyZSA9PT0gcGxhY2UgKTtcclxuXHRcdGRhdGFPYmouY29vcmQgPSB7eDogcGxhY2VzQ29vcmRbaV0ueCwgeTogcGxhY2VzQ29vcmRbaV0ueSB9XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKGRhdGFPYmopO1x0XHRcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiBkYXRhIGRpc3RyaWJ1dGlvbi5cclxuICogQ3JlYXRlcyBhIGJveC1hbmQtd2hpc2tleSBwbG90IGZyb20gZ2l2ZW4gZGF0YS5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG5cclxudmFyIG1pbjtcclxudmFyIG1heDtcclxuXHJcbnZhciBjaGFydDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0cmlidXRpb24oZGF0YSkge1xyXG5cdFxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0KGRhdGEpIHtcclxuXHRtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiAxMH07XHJcblx0d2lkdGggPSAyNjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSAzNDUgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcbn0iLCIvKipcclxuICogSW5pdGlhbGl6YXRpb24gb2YgYWxsIG1vZHVsZXMgXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dmlzdWFsaXplfSBmcm9tICcuL3Zpc3VhbGl6ZSc7XHJcblxyXG4oZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuXHRpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuXHRcdGZuKCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcblx0fVxyXG59KShpbml0KTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyByZWFkaW5nIG9mIGZpbGUgYW5kIHRoZW4gdmlzdWFsaXphdGlvbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5pdCgpe1xyXG5cclxuXHQvLyBzZXR1cCBudW1lcmFsIGZvciBjb3JyZWN0IG51bWJlciBmb3JtYXR0aW5nXHJcblx0bnVtZXJhbC5sYW5ndWFnZSgnZW4tZ2InKTtcclxuXHJcblx0Ly8gcGFyc2UgZmlsZVxyXG5cdGQzLmNzdignSG9tZV9PZmZpY2VfQWlyX1RyYXZlbF9EYXRhXzIwMTEuY3N2JylcclxuXHRcdC5yb3coIGQgPT4geyBcclxuXHRcdFx0cmV0dXJuIHsgXHJcblx0XHRcdFx0ZGVwYXJ0dXJlOiBkLkRlcGFydHVyZSwgXHJcblx0XHRcdFx0ZGVzdGluYXRpb246IGQuRGVzdGluYXRpb24sIFxyXG5cdFx0XHRcdGRpcmVjdG9yYXRlOiBkLkRpcmVjdG9yYXRlLCBcclxuXHRcdFx0XHRtb250aDogZC5EZXBhcnR1cmVfMjAxMSwgXHJcblx0XHRcdFx0ZmFyZTogcGFyc2VGbG9hdChkLlBhaWRfZmFyZSksIFxyXG5cdFx0XHRcdHRpY2tldDogZC5UaWNrZXRfY2xhc3NfZGVzY3JpcHRpb24sIFxyXG5cdFx0XHRcdHN1cHBsaWVyOiBkLlN1cHBsaWVyX25hbWUgXHJcblx0XHRcdH07XHJcblx0XHR9KVxyXG5cdFx0LmdldCggKGVycm9yLCBkYXRhKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikgY29uc29sZS5sb2coZXJyb3IpXHJcblx0XHRcdFxyXG5cdFx0XHR2aXN1YWxpemUoZGF0YSk7XHJcblx0XHR9KTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIG1vbnRobHkgc3BlbmRpbmcuXHJcbiAqIENyZWF0ZXMgYSBiYXIgY2hhcnQgZnJvbSBnaXZlbiBkYXRhIGFuZCBhZGRzIGxpc3RlbmVycyBmb3IgZmlsdGVyaW5nIG9uZSBtb250aC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt1bmlxVmFsdWVzfSBmcm9tICcuL3Zpcy11dGlsJztcclxuaW1wb3J0IHt1cGRhdGVkU3BlbmRpbmd9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBzdmcgcGFuZWxcclxudmFyIHN2ZztcclxuLy8gbm9kZSBmb3IgY3JlYXRlZCBmaWx0ZXJcclxudmFyIGZpbHRlcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB4IGRpcmVjdGlvblxyXG52YXIgeFNjYWxlO1xyXG4vLyBmdW5jdGlvbiBmb3IgcG9zaXRpb25pbmcgZWxlbWVudHMgaW4geSBkaXJlY3Rpb25cclxudmFyIHlTY2FsZTtcclxuXHJcbi8vIG1vbnRoIGF4aXNcclxudmFyIHhBeGlzO1xyXG4vLyBudW1iZXIgYXhpc1xyXG52YXIgeUF4aXM7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYmluZGluZyBhIGNvbG9yIHRvIGEgdGlja2V0IHR5cGVcclxudmFyIGNvbG9yO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8vIHNjYWxlIGZvciBzdGFja2luZyByZWN0YW5nbGVzXHJcbnZhciBzdGFjaztcclxuXHJcbi8vIHRyYW5zZm9ybWVkIGRhdGFcclxudmFyIGRhdGFzZXQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSB0aGF0IGlzIG1vcmUgc3VpdGFibGUgZm9yIHdvcmtpbmcgd2l0aGluIHZpc3VhbGl6YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3BlbmRpbmcoZGF0YSkge1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkYXRhc2V0ID0gc3BlbmRpbmdEYXRhc2V0KGRhdGEpO1xyXG5cdFxyXG5cdGNyZWF0ZUJhckNoYXJ0KGRhdGFzZXQpO1xyXG5cclxuXHRjcmVhdGVMZWdlbmQoZGF0YXNldCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGFsbCBzY2FsZXMgYW5kIGF0dHJpYnV0ZXMgYWNjLiB0byBnaXZlbiBkYXRhIGFuZCBjcmVhdGVzIGEgc3ZnIHBhbmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGVhY2ggc3BlbmRpbmdcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMzUsIGJvdHRvbTogMzUsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDEwODUgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSAzNDUgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHRcclxuXHR4U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdC5kb21haW4oWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10pXHJcblx0XHQucmFuZ2VSb3VuZEJhbmRzKFswLCB3aWR0aF0sIC4wNSk7XHJcblxyXG5cdC8vIHJvdW5kIHRoZSBtYXhpbXVtIHZhbHVlIGZyb20gZGF0YSB0byB0aG91c2FuZHNcclxuXHR2YXIgcm91bmRlZE1heCA9IE1hdGgucm91bmQoIE1hdGgubWF4KC4uLm1vbnRoRmFyZXMoZGF0YSkpIC8gMTAwMCApICogMTAwMDtcclxuXHR5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0LmRvbWFpbihbIDAsIHJvdW5kZWRNYXggXSlcclxuXHRcdC5yYW5nZShbIGhlaWdodCwgMCBdKTtcclxuXHJcblx0eEF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeFNjYWxlKVxyXG5cdFx0Lm9yaWVudCgnYm90dG9tJyk7XHJcblxyXG5cdHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxyXG5cdFx0LnNjYWxlKHlTY2FsZSlcclxuXHRcdC5vcmllbnQoJ3JpZ2h0JylcclxuXHRcdC50aWNrRm9ybWF0KCBkID0+IG51bWVyYWwoZCkuZm9ybWF0KCcwYScpKTtcclxuXHRcclxuXHRjb2xvciA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbih1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKSlcdFx0XHJcblx0XHQucmFuZ2UoW1wiIzAwYmNkNFwiLCBcIiMxZDZkZDBcIiwgXCIjZWRjZDAyXCJdKTtcclxuXHJcblx0c3RhY2sgPSBkMy5sYXlvdXQuc3RhY2soKTtcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLXNwZW5kaW5nJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBtb250aGx5IHNwZW5kaW5nIGZvciBhbGwgdGlja2V0IHR5cGVzIGFuZCByZXR1cm5zIHRoZSBjcmVhdGVkIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VuZGluZyBhbGwgeWVhciBzcGVkbmluZ1xyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBzdW1Nb250aGx5RmFyZXMgYXJyYXkgb2YgbnVtYmVycyByZXByZXNlbnRpbmcgZWFjaCBtb250aHMgc3BlbmRpbmcgb24gYWxsIHRpY2tldHNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb250aEZhcmVzKGRhdGEpIHtcdFxyXG5cdFx0Ly8gZ2V0IGFsbCBmYXJlcyBmb3IgZWFjaCBtb250aFxyXG5cdFx0dmFyIGZhcmVzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKS5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cdFx0Ly8gc3VtIHVwIGFsbCBmYXJlcyBpbiBlYWNoIG1vbnRoXHJcblx0XHR2YXIgc3VtTW9udGhseUZhcmVzID0gZmFyZXMubWFwKCBmYXJlID0+IGZhcmUucmVkdWNlKCAoYSxiKSA9PiBhICsgYi5mYXJlLCAwKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiBzdW1Nb250aGx5RmFyZXM7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHN0YWNrZWQgYmFyIGNoYXJ0IGFjY29yZGluZyB0byBnaXZlbiBkYXRhLiBUaGUgY2hhcnQgaGFzIGxheWVycyBmb3IgZWFjaCB0aWNrZXQgdHlwZS5cclxuICogVGhlcmUgYXJlIGxpc3RlbmVycyBmb3IgY3JlYXRpbmcgYSB0b29sdGlwIGFuZCBmaWx0ZXIgZm9yIHNlbGVjdGluZyBvbmx5IG9uZSBtb250aC5cclxuICogXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyBpbiB0aGUgZm9ybSBvZiBcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUJhckNoYXJ0KGRhdGEpIHtcclxuXHQvLyBjcmVhdGUgc3RhY2tlZCBkYXRhIGZvciB0aGUgdmlzdWFsaXphdGlvblxyXG5cdHN0YWNrKGRhdGEpO1xyXG5cclxuXHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdHRpcCA9IGQzLnRpcCgpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0dmFyIGluZGV4ID0gY29sb3IucmFuZ2UoKS5pbmRleE9mKGNvbG9yKGQudGlja2V0KSk7XHJcblx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJ0eXBlIHR5cGUtJytpbmRleCsnXCI+JysgZC50aWNrZXQgKyc8L3NwYW4+XFxcclxuXHRcdFx0XHQ8YnIvPjxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC55KS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+XFxcclxuXHRcdFx0XHQ8YnIvPjxzcGFuIGNsYXNzPVwibnVtYmVyXCI+JytudW1lcmFsKGQudmFsdWVzLmxlbmd0aCkuZm9ybWF0KCcwLDAnKSsnIHRpY2tldHM8L3NwYW4+JzsgXHJcblx0XHR9KTtcclxuXHJcblx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0Ly8gY3JlYXRlIGEgcmVjdGFuZ2xlIGFzIGEgYmFja2dyb3VuZFxyXG5cdHZhciBiYWNrZ3JvdW5kID0gc3ZnLmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnc3ZnLWJhY2tncm91bmQnKVxyXG5cdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0LmF0dHIoJ3knLCAwKVxyXG5cdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGgpXHJcblx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxyXG5cdFx0LmF0dHIoJ2ZpbGwnLCAndHJhbnNwYXJlbnQnKVxyXG5cdFx0Lm9uKCdjbGljaycsIGRlc2VsZWN0KTtcclxuXHJcblx0Ly8gY3JlYXRlIGdyb3VwIGZvciBlYWNoIHRpY2tldCB0eXBlXHJcblx0dmFyIGdyb3VwcyA9IHN2Zy5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAoZCxpKSA9PiAndGlja2V0LScraSApO1xyXG5cclxuXHQvLyBjcmVhdGUgYmFycyBmb3IgZWFjaCB0aWNrZXQgZ3JvdXBcclxuXHRncm91cHMuc2VsZWN0QWxsKCcuYmFyJylcclxuXHRcdC5kYXRhKCBkID0+IGQgKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyJylcclxuXHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGQgPT4geVNjYWxlKGQueTApIC0geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIG1vdXNlb3ZlcilcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsIG1vdXNlb3V0KVxyXG5cdFx0XHQub24oJ2NsaWNrJywgbW91c2VjbGljayk7XHJcblxyXG5cdHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy14JylcclxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIDAgKycsJysgaGVpZ2h0ICsnKScpXHJcblx0XHQuY2FsbCh4QXhpcyk7XHJcblxyXG5cdHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy15JylcclxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIHdpZHRoICsnLCcrIDAgKycpJylcclxuXHRcdC5jYWxsKHlBeGlzKTtcclxuXHJcblx0ZmlsdGVyID0gc3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZmlsdGVyJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZXMgdGhlIGZpbHRlciBjb250YWluaW5nIHNlbGVjdGVkIG1vbnRoIGFuZCB1cGRhdGVzIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucy5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBkZXNlbGVjdCgpIHtcclxuXHJcblx0XHR2YXIgZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZmlsdGVyJylbMF07XHJcblxyXG5cdFx0aWYgKGZpbHRlci5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Ly8gZGVsZXRlIHNlbGVjdGVkIG1vbnRoXHJcblx0XHRcdGZpbHRlci5yZW1vdmVDaGlsZChmaWx0ZXIuY2hpbGROb2Rlc1swXSk7XHJcblxyXG5cdFx0XHQvLyB1cGRhdGUgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zXHJcblx0XHRcdHVwZGF0ZWRTcGVuZGluZygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGZpbHRlciBmb3IgYSB3aG9sZSBtb250aCBhZnRlciB0aGUgdXNlciBjbGlja3Mgb24gYW55IHRpY2tldCB0aWNrZXQgdHlwZS4gVGhlIGZpbHRlciBpcyByZXByZXNlbnRlZCB3aXRoIGEgd2hpdGUtYm9yZGVyZWQgcmVjdGFuZ2xlLlxyXG5cdCAqIEFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdXBkYXRlZCBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgbW9udGguXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlY2xpY2soZGF0YSkge1xyXG5cdFx0Ly8gdXBkYXRlIG90aGVyIHZpc3VhbGl6YXRpb25zIGFjY29yZGluZyB0byBzZWxlY3RlZCBtb250aFxyXG5cdFx0dXBkYXRlZFNwZW5kaW5nKGRhdGEueCk7XHJcblxyXG5cdFx0Ly8gZ2V0IGFsbCB0aWNrZXQgdHlwZXMgZm9yIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR2YXIgdGlja2V0c01vbnRoID0gZGF0YXNldC5tYXAoIHRpY2tldHMgPT4gdGlja2V0cy5maWx0ZXIoIGQgPT4gZC54ID09PSBkYXRhLnggKSk7XHJcblxyXG5cdFx0Ly8gZmxhdHRlbiB0aGUgYXJyYXlcclxuXHRcdHRpY2tldHNNb250aCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGlja2V0c01vbnRoKTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGhlIGhlaWdodCBhbmQgc3RhcnRpbmcgcG9pbnQgb2YgbW9udGhzIGJhclxyXG5cdFx0dmFyIHkwID0gdGlja2V0c01vbnRoWzBdLnkwO1xyXG5cdFx0dmFyIGJhckhlaWdodCA9IHRpY2tldHNNb250aC5yZWR1Y2UoIChhLCBiKSA9PiBhICsgYi55LCAwKTtcclxuXHRcdFxyXG5cdFx0Ly8gY3JlYXRlIGFuZCB1cGRhdGUgcmVjdGFuZ2xlIGZvciBoaWdobGlnaHRpbmcgdGhlIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR2YXIgc2VsZWN0ZWQgPSBmaWx0ZXIuc2VsZWN0QWxsKCcuc2VsZWN0ZWQnKVxyXG5cdFx0XHQuZGF0YShbZGF0YV0pO1xyXG5cclxuXHRcdHNlbGVjdGVkLmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGJhckhlaWdodCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3NlbGVjdGVkJylcdFxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCAzKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGJhckhlaWdodCkpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIHlTY2FsZSh5MCkgLSB5U2NhbGUoYmFySGVpZ2h0KSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGloZ2xpZ2h0IHRoZSBob3ZlcmVkIGVsZW1lbnQgYW5kIHNob3dzIHRvb2x0aXAuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3ZlcihkKSB7XHJcblx0XHRkMy5zZWxlY3QodGhpcylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGQzLnJnYihjb2xvcihkLnRpY2tldCkpLmJyaWdodGVyKC41KSk7XHJcblxyXG5cdFx0dGlwLnNob3coZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldHMgdGhlIGNvbG9yIG9mIHRoZSBlbGVtZW50IGFuZCBoaWRlcyB0aGUgdG9vbHRpcC5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZW91dCgpIHtcdFx0XHJcblx0XHRkMy5zZWxlY3QodGhpcylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSk7XHJcblxyXG5cdFx0dGlwLmhpZGUoKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbGVnZW5kIGZvciB0aGUgc3BlbmRpbmcgdmlzdWFsaXphdGlvbi5cclxuICogRm9yIGVhY2ggdGlja2V0IHR5cGUgYSByZWN0YW5nbGUgYW5kIGEgdGV4dCBsYWJlbCBpcyBjcmVhdGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVMZWdlbmQoZGF0YSkge1xyXG5cclxuXHQvLyByZWN0YW5nbGUgc2l6ZVxyXG5cdHZhciBzaXplID0gMTA7XHJcblxyXG5cdC8vIHN2ZyBwYW5lbCBmb3IgdGhlIGxlZ2VuZFxyXG5cdHZhciBzdmdMZWdlbmQgPSBkMy5zZWxlY3QoJyNzcGVuZGluZy1sZWdlbmQnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgMjAwKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgOTApXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMjAsMjApJyk7XHJcblxyXG5cdC8vIGNyZWF0ZSByZWN0YW5nbGVzIGZvciBlYWNoIGVsZW1lbnRcclxuXHRzdmdMZWdlbmQuc2VsZWN0QWxsKCcucy1sZWdlbmQnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3MtbGVnZW5kIGxlZ2VuZCcpXHJcblx0XHRcdC5hdHRyKCd4JywgMClcclxuXHRcdFx0LmF0dHIoJ3knLCAoZCwgaSkgPT4gaSpzaXplKjIpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBzaXplKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCBzaXplKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZFswXS50aWNrZXQpKTtcclxuXHJcblx0Ly8gY3JlYXRlIHRleHQgbGFiZWxcclxuXHRzdmdMZWdlbmQuc2VsZWN0QWxsKCcucy1sZWdlbmQtbGFiZWwnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3MtbGVnZW5kLWxhYmVsIGxlZ2VuZCcpXHJcblx0XHRcdC5hdHRyKCd4JywgMClcclxuXHRcdFx0LmF0dHIoJ3knLCAoZCwgaSkgPT4gaSpzaXplKjIpXHJcblx0XHRcdC5hdHRyKCdkeCcsIHNpemUrNSlcclxuXHRcdFx0LmF0dHIoJ2R5Jywgc2l6ZSlcdFx0XHJcblx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0LnRleHQoZCA9PiBkWzBdLnRpY2tldCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm0gZGF0YSBpbnRvIGEgbmV3IGRhdGFzZXQgd2hpY2ggaGFzIHJlYXJyYW5nZWQgdmFsdWVzXHJcbiAqIHNvIHRoYXQgaXQgaXMgYW4gYXJyYXkgb2YgdGlja2V0IHR5cGUgYXJyYXlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2YgZGF0YSBvYmplY3RzIGV4dHJhY3RlZCBmcm9tIGZpbGVcclxuICogQHJldHVybiB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2YgZGF0YSBvYmplY3RzIGdyb3VwZWQgYnkgdGlja2V0IHR5cGVzIGFuZCBtb250aHNcclxuICovXHJcbmZ1bmN0aW9uIHNwZW5kaW5nRGF0YXNldChkYXRhKSB7XHJcblx0dmFyIGRhdGFzZXQgPSBbXTtcclxuXHJcblx0dmFyIHRpY2tldHMgPSB1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKTtcclxuXHJcblx0dmFyIG1vbnRocyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJyk7XHJcblxyXG5cdHZhciBtb250aGx5RGF0YSA9IG1vbnRocy5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cclxuXHR0aWNrZXRzLmZvckVhY2goIHRpY2tldCA9PiB7XHJcblx0XHR2YXIgdGlja2V0QXJyYXkgPSBbXTtcclxuXHJcblx0XHRtb250aGx5RGF0YS5mb3JFYWNoKCAobW9udGhEYXRhLCBpKSA9PiB7XHJcblx0XHRcdHZhciBkYXRhT2JqID0ge307XHJcblx0XHRcclxuXHRcdFx0ZGF0YU9iai50aWNrZXQgPSB0aWNrZXQ7XHRcdFx0XHJcblx0XHRcdGRhdGFPYmoudmFsdWVzID0gbW9udGhEYXRhLmZpbHRlciggZCA9PiBkLnRpY2tldCA9PT0gdGlja2V0KTtcclxuXHRcdFx0ZGF0YU9iai54ID0gbW9udGhzW2ldO1xyXG5cclxuXHRcdFx0ZGF0YU9iai55ID0gZGF0YU9iai52YWx1ZXMucmVkdWNlKCAoYSxiKSA9PiB7XHJcblx0XHRcdFx0aWYgKCBiLnRpY2tldCA9PT0gdGlja2V0ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGEgKyBiLmZhcmU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgMCk7XHJcblxyXG5cdFx0XHR0aWNrZXRBcnJheS5wdXNoKGRhdGFPYmopO1x0XHRcdFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKHRpY2tldEFycmF5KTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBmb3IgdGlja2V0cyBudW1iZXIgYW5kIGF2ZXJhZ2UgcHJpY2UuXHJcbiAqIENyZWF0ZXMgYSBkb251dCBjaGFydCByZXByZXNlbnRpbmcgdGhlIHBhcnRpYWwgcmVsYXRpb25zaGlwIGFuZCB0ZXh0IGVsZW1lbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgYW5kIGNyZWF0ZXMgdGhlIHZpc3VhbGl6YXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2YgZGF0YSBvYmplY3RzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciB2aXN1YWxpemF0aW9uIG9mIHRvcCBzcGVuZGluZ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmlzSWQgaWQgb2YgdGhlIHZpc3VhbGl6YXRpb24gcGFuZWxcclxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGZpbGwgY29sb3IgdXNlZCBmb3IgYXJjc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tldChkYXRhLCB2aXNJZCwgcGFyYW0sIGNvbG9yKSB7XHJcblx0dmFyIHZpcyA9IHt9O1xyXG5cdHZpcy51cGRhdGUgPSB1cGRhdGVDaGFydDtcclxuXHR2aXMucGFyYW0gPSBwYXJhbTtcclxuXHJcblx0dmFyIGNvbG9yVHlwZTtcclxuXHRcclxuXHR2YXIgc3ZnO1xyXG5cclxuXHR2YXIgcGllO1xyXG5cdHZhciBhcmM7XHJcblx0dmFyIHBhdGg7XHJcblxyXG5cdHZhciBwZXJjZW50YWdlO1xyXG5cdHZhciBleGFjdFZhbHVlO1xyXG5cclxuXHR2YXIgYWxsSXRlbXM7XHJcblx0dmFyIHBhcnRJdGVtcztcclxuXHJcblx0dmFyIGluaXRpbGl6ZWQgPSBmYWxzZTtcclxuXHJcblx0aW5pdChkYXRhKTtcclxuXHJcblx0Y3JlYXRlVmlzKGRhdGEpO1xyXG5cclxuXHRpbml0aWxpemVkID0gdHJ1ZTtcclxuXHJcblx0cmV0dXJuIHZpcztcclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZXMgYWxsIG5lZWRlZCB2YXJpYWJsZXMgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBTVkcgcGFuZWwuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdFx0bWFyZ2luID0ge3RvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMTAsIGxlZnQ6IDV9O1xyXG5cdFx0d2lkdGggPSAyNjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRcdGhlaWdodCA9IDEzMCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuXHRcdGNvbG9yVHlwZSA9IGQzLnNjYWxlLm9yZGluYWwoKVx0XHRcdFxyXG5cdFx0XHQucmFuZ2UoW2NvbG9yLCAncmdiYSgwLDAsMCwuMyknXSlcclxuXHJcblx0XHRzdmcgPSBkMy5zZWxlY3QoJyMnK3Zpc0lkKVxyXG5cdFx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyB3aWR0aC8yICsnLCcrIChoZWlnaHQvMi1tYXJnaW4uYm90dG9tKSArJyknKTtcclxuXHJcblx0XHRhcmMgPSBkMy5zdmcuYXJjKClcclxuXHRcdFx0Lm91dGVyUmFkaXVzKDUwIC0gMTApXHJcblx0XHRcdC5pbm5lclJhZGl1cyg1MCAtIDIwKTtcclxuXHJcblx0XHRwaWUgPSBkMy5sYXlvdXQucGllKClcclxuXHRcdFx0LnNvcnQobnVsbClcclxuXHRcdFx0LnZhbHVlKGQgPT4gZC52YWx1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIHRoZSB2aXN1YWxpemF0aW9uIC0gcGllIGNoYXJ0IGFuZCB0ZXh0IHZhbHVlcyAtIHBlcmNlbnRhZ2UgYW5kIGV4YWN0IHZhbHVlLiBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY3JlYXRlVmlzKGRhdGFzZXQpIHtcclxuXHRcdC8vIHVwZGF0ZSBkYXRhIGFjY29yZGluZyB0byBjaGFuZ2VcclxuXHRcdGRhdGEgPSB1cGRhdGVEYXRhKGRhdGFzZXQsIHBhcmFtKTtcdFx0XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHRoZSBjaGFydFxyXG5cdFx0cGF0aCA9IHN2Zy5zZWxlY3RBbGwoJy5hcmMtJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoZGF0YSlcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2FyYy0nK3BhcmFtKVx0XHRcdFxyXG5cdFx0XHRcdC5hdHRyKCdkJywgYXJjKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yVHlwZShpKSlcclxuXHRcdFx0XHQuZWFjaCggZnVuY3Rpb24gKGQpIHsgdGhpcy5fY3VycmVudCA9IGQgfSk7XHRcdFxyXG5cclxuXHRcdC8vIHVwZGF0ZVxyXG5cdFx0cGVyY2VudGFnZSA9IHN2Zy5zZWxlY3RBbGwoJy5wZXJjLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3BlcmMtJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIC0xNSApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCA1IClcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdFx0LnRleHQoIHBlcmNlbnQgKTtcclxuXHJcblx0XHRleGFjdFZhbHVlID0gc3ZnLnNlbGVjdEFsbCgnLmV4dmFsLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2V4dmFsLScrcGFyYW0pXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAtMTUgKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgNjUgKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignZm9udC1zaXplJywgMTgpXHJcblx0XHRcdFx0LnRleHQoIHJvdW5kVmFsdWUgKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgdGhlIGNoYXJ0IGFuZCBhbGwgdGV4dCB2YWx1ZXMgYWNjb3JkaW5nIHRvIG5ldyBnaXZlbiBkYXRhLiBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVDaGFydChkYXRhc2V0KSB7XHJcblxyXG5cdFx0dmFyIGRhdGEgPSB1cGRhdGVEYXRhKGRhdGFzZXQpO1xyXG5cclxuXHRcdC8vIGNvbXB1dGUgdGhlIG5ldyBhbmdsZXNcclxuXHRcdHBhdGggPSBwYXRoLmRhdGEoIGRhdGEgKTtcclxuXHRcdC8vIHJlZHJhdyBhbGwgYXJjc1xyXG5cdFx0cGF0aC50cmFuc2l0aW9uKCkuYXR0clR3ZWVuKCdkJywgYXJjVHdlZW4pO1xyXG5cclxuXHRcdC8vIHVwZGF0ZSB0ZXh0IC0gcGVyY2VudGFnZSBudW1iZXJcclxuXHRcdHBlcmNlbnRhZ2UuZGF0YShbZGF0YVswXV0pXHJcblx0XHRcdC50ZXh0KCBwZXJjZW50ICk7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHRleHQgLSBleGFjdCB2YWx1ZSBudW1iZXJcclxuXHRcdGV4YWN0VmFsdWUuZGF0YShbZGF0YVswXV0pXHJcblx0XHRcdC50ZXh0KCByb3VuZFZhbHVlICk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdG9yZSB0aGUgZGlzcGxheWVkIGFuZ2xlcyBpbiBfY3VycmVudC5cclxuXHRcdCAqIFRoZW4sIGludGVycG9sYXRlIGZyb20gX2N1cnJlbnQgdG8gdGhlIG5ldyBhbmdsZXMuXHJcblx0XHQgKiBEdXJpbmcgdGhlIHRyYW5zaXRpb24sIF9jdXJyZW50IGlzIHVwZGF0ZWQgaW4tcGxhY2UgYnkgZDMuaW50ZXJwb2xhdGUuXHJcblx0XHQgKlxyXG5cdFx0ICogY29kZSB0YWtlbiBmcm9tOiBodHRwczovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzEzNDY0MTBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYXJjVHdlZW4oYSkge1xyXG5cdFx0XHR2YXIgaSA9IGQzLmludGVycG9sYXRlKHRoaXMuX2N1cnJlbnQsIGEpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5fY3VycmVudCA9IGkoMCk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odCkge1xyXG5cdFx0XHRcdHJldHVybiBhcmMoaSh0KSk7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZGF0YXNldCBmcm9tIGdpdmVuIGRhdGEgZm9yIHRoZSB2aXN1YWxpemF0aW9uIGluIHRoZSBmb3JtIG9mIGFycmF5IG9mIHR3byBvYmplY3RzXHJcblx0ICogd2hlcmUgZmlyc3Qgb2JqZWN0IHJlcHJlc2VudHMgYSBwYXJ0IG9mIHRoZSB3aG9sZSBhbmQgdGhlIHNlY29uZCBvYmplY3RzIHJlcHJlc2VudHMgdGhlIHJlc3Qgb2YgdGhlIHdob2xlLlxyXG5cdCAqIFRoZSB3aG9sZSBpcyBjYWxjdWxhdGVkIGFjY29yZGluZyB0byBhIHBhcmFtZXRlciwgZS5nLiB0aGUgd2hvbGUgY2FuIGJlIG51bWJlciBvZiB0aWNrZXRzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YSBcclxuXHQgKiBAcmV0dXJuIHthcnJheX0gcGllZERhdGEgYXJyYXkgb2Ygb2JqZWN0cyBhcyByZXR1cm5lZCBmcm9tIGQzLnBpZSBmdW5jdGlvblxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZURhdGEoZGF0YSkge1xyXG5cdFx0dmFyIGRhdGFzZXQ7XHJcblxyXG5cdFx0aWYgKHZpcy5wYXJhbSA9PT0gJ2ZhcmUnKSB7XHJcblxyXG5cdFx0XHRpZiAoIWluaXRpbGl6ZWQpIHtcclxuXHRcdFx0XHRhbGxJdGVtcyA9IGF2Z1ByaWNlKGRhdGEpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJ0SXRlbXMgPSBhdmdQcmljZShkYXRhKTtcdFx0XHRcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCFpbml0aWxpemVkKSB7XHJcblx0XHRcdFx0YWxsSXRlbXMgPSBkYXRhW3BhcmFtXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cGFydEl0ZW1zID0gZGF0YVtwYXJhbV07XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChhbGxJdGVtcyA9PT0gcGFydEl0ZW1zKSB7XHJcblx0XHRcdGRhdGFzZXQgPSBbeyB2YWx1ZTogYWxsSXRlbXMgfSwgeyB2YWx1ZTogMCB9XTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRhdGFzZXQgPSBbeyB2YWx1ZTogcGFydEl0ZW1zIH0sIHsgdmFsdWU6IGFsbEl0ZW1zIC0gcGFydEl0ZW1zIH1dO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBwaWUoZGF0YXNldCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGb3JtYXRzIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0IC0gZWl0aGVyIGFzIGEgbnVtYmVyIHdpdGggY3VycmVuY3kgb3IganVzdCBhIG51bWJlci4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZCBkYXRhIG9iamVjdFxyXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gcm91bmRWYWx1ZSBmb3JtYXR0ZWQgdmFsdWVcclxuXHQgKi9cclxuXHRmdW5jdGlvbiByb3VuZFZhbHVlKGQpIHtcclxuXHRcdGlmICh2aXMucGFyYW0gPT09ICdmYXJlJykge1xyXG5cdFx0XHRyZXR1cm4gbnVtZXJhbChkLnZhbHVlKS5mb3JtYXQoJyQwLDAnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBudW1lcmFsKGQudmFsdWUpLmZvcm1hdCgnMCwwJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGb3JtYXRzIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0IGludG8gYSByb3VuZGVkIHBlcmNlbnRhZ2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZCBkYXRhIG9iamVjdFxyXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gcGVyY2VudCBmb3JtYXR0ZWQgc3RyaW5nXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gcGVyY2VudChkKSB7XHJcblx0XHR2YXIgcGVyY2VudCA9IGQudmFsdWUvYWxsSXRlbXMqMTAwO1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQocGVyY2VudCkrJyUnO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGF2ZXJhZ2UgcHJpY2Ugb2YgdGlja2V0cyBmcm9tIGdpdmVuIGRhdGEgLSBzdW0gb2YgYWxsIGZhcmVzIG92ZXIgbnVtYmVyIG9mIGFsbCB0aWNrZXRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqIEByZXR1cm4ge251bWJlcn0gYXZnUHJpY2VcclxuICovXHJcbmZ1bmN0aW9uIGF2Z1ByaWNlKGRhdGEpIHtcclxuXHRcclxuXHR2YXIgcHJpY2VTdW0gPSBkYXRhLnJlZHVjZSggKGEsIGIpID0+IGEgKyBiLmZhcmUsIDAgKTtcclxuXHRcclxuXHR2YXIgdGlja2V0TnVtID0gZGF0YS5sZW5ndGg7XHJcblxyXG5cdHJldHVybiBwcmljZVN1bSAvIHRpY2tldE51bTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIHRvcCBzcGVuZGluZyBmb3IgZ2l2ZW4gZWxlbWVudC5cclxuICogQ3JlYXRlcyBmaXZlIGJhciBjaGFydHMgc3RhdGluZyB0aGUgdG9wIGVsZW1lbnRzIHdoaWNoIHNwZW5kIHRoZSBtb3N0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXMsIGNhbGNTcGVuZGluZ30gZnJvbSAnLi92aXMtdXRpbCc7XHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBhbmQgY3JlYXRlcyB0aGUgdmlzdWFsaXphdGlvbi5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIHZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aXNJZCBpZCBvZiB0aGUgdmlzdWFsaXphdGlvbiBwYW5lbFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZmlsbCBjb2xvciB1c2VkIGZvciBhbGwgcmVjdGFuZ2xlc1xyXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4TnVtYmVyIG51bWJlciBvZiBwYXJhbSBkaXNwbGF5ZWRcclxuICogQHBhcmFtIHtudW1iZXJ9IHBhbmVsSGVpZ2h0IGhlaWdodCBvZiB0aGUgU1ZHIHBhbmVsXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9wU3BlbmRpbmcoZGF0YSwgdmlzSWQsIHBhcmFtLCBjb2xvciwgbWF4TnVtYmVyLCBwYW5lbEhlaWdodCkge1xyXG5cclxuXHR2YXIgdmlzID0ge307XHJcblx0dmlzLnVwZGF0ZSA9IHVwZGF0ZVRvcFNwZW5kaW5nO1x0XHJcblxyXG5cdHZhciB4U2NhbGU7XHJcblx0dmFyIHlTY2FsZTtcclxuXHR2YXIgc3ZnO1xyXG5cclxuXHQvLyBjYWxjdWxhdGUgZGF0YSwgaW5pdGlhbGl6ZSBhbmQgZHJhdyBjaGFydFxyXG5cdHZhciB0b3BEYXRhID0gY2FsY1RvcChkYXRhKTtcclxuXHJcblx0aW5pdCh0b3BEYXRhKTtcclxuXHJcblx0Y3JlYXRlQmFyQ2hhcnQodG9wRGF0YSk7XHJcblxyXG5cdHJldHVybiB2aXM7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpcnN0bHksIGNhbGN1bGF0ZXMgdGhlIG5ldyB0b3AgZGF0YSBhbmQgdGhlbiB1cGRhdGVzIHRoZSBiYXIgY2hhcnQgYW5kIHRleHQgdmFsdWVzIGFjY29yZGluZyB0byBuZXcgZGF0YS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVUb3BTcGVuZGluZyhkYXRhKSB7XHRcclxuXHRcdHVwZGF0ZShjYWxjVG9wKGRhdGEpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdG9wIGZpdmUgaXRlbXMgZnJvbSBkYXRhIGFjY29yZGluZyB0byBzcGVuZGluZyAoZmFyZSkgdmFsdWVzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBkYXRhc2V0IHVwZGF0ZWQgXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY2FsY1RvcChkYXRhKSB7XHJcblx0XHRyZXR1cm4gY2FsY1NwZW5kaW5nKGRhdGEsIHBhcmFtKS5zb3J0KCAoYSwgYikgPT4gYi5mYXJlIC0gYS5mYXJlICkuc2xpY2UoMCxtYXhOdW1iZXIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZXMgYWxsIG5lZWRlZCB2YXJpYWJsZXMgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBTVkcgcGFuZWwuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdFx0bWFyZ2luID0ge3RvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogNX07XHJcblx0XHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdFx0aGVpZ2h0ID0gcGFuZWxIZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcblx0XHR5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdFx0LmRvbWFpbihkYXRhLm1hcChkID0+IGRbcGFyYW1dKSlcclxuXHRcdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgaGVpZ2h0XSwgLjEpO1xyXG5cclxuXHRcdHhTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXHJcblx0XHRcdC5kb21haW4oWyAwLCBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQuZmFyZSkpIF0pXHJcblx0XHRcdC5yYW5nZShbIDAsIHdpZHRoIF0pO1xyXG5cclxuXHRcdHN2ZyA9IGQzLnNlbGVjdCgnIycrdmlzSWQpXHJcblx0XHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGJhciBjaGFydCBhbmQgYSB0b29sdGlwLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGNyZWF0ZUJhckNoYXJ0KGRhdGEpIHtcdFx0XHJcblxyXG5cdFx0Ly8gY3JlYXRlIHRvb2x0aXAgYW5kIGNhbGwgaXRcclxuXHRcdHRpcCA9IGQzLnRpcCgpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxyXG5cdFx0XHQuaHRtbCggZCA9PiB7XHJcblx0XHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cInZhbHVlXCI+JytudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCckMCwwJykgKyAnPC9zcGFuPlxcXHJcblx0XHRcdFx0XHQ8YnIvPjxzcGFuIGNsYXNzPVwibnVtYmVyXCI+JytudW1lcmFsKGQudmFsdWVzLmxlbmd0aCkuZm9ybWF0KCcwLDAnKSsnIHRpY2tldHM8L3NwYW4+JzsgXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdHN2Zy5jYWxsKHRpcCk7XHJcblxyXG5cdFx0Ly8gY3JlYXRlIGJhciBjaGFydHNcclxuXHRcdHVwZGF0ZShkYXRhKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGVzIHRoZSBiYXIgY2hhcnQgdmlzdWFsaXphdGlvbiB3aXRoIGFsbCBuYW1lcyBhbmQgZmFyZSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHM7IGUuZy4gWyB7IGZhcmU6IHgsIG90aGVyUGFyYW06IGEgfSwgeyBmYXJlOiB5LCBvdGhlclBhcmFtOiBiIH0sIC4uLiBdXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlKGRhdGEpIHtcclxuXHRcdC8vIHVwZGF0ZSBzY2FsZSBzbyByZWxhdGl2ZSBkaWZmZXJlbmNpZXMgY2FuIGJlIHNlZW5cclxuXHRcdHhTY2FsZS5kb21haW4oWyAwLCBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQuZmFyZSkpIF0pO1xyXG5cclxuXHRcdC8vIGRyYXcgcmVjdGFuZ2xlIHJlcHJlc2VudGluZyBzcGVuZGluZ1xyXG5cdFx0dmFyIGJhcnMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKGRhdGEpO1xyXG5cclxuXHRcdGJhcnMudHJhbnNpdGlvbigpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlKGQuZmFyZSkpO1xyXG5cclxuXHRcdGJhcnMuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyLScrcGFyYW0pXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCBkID0+IDApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkW3BhcmFtXSkpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIGQgPT4geVNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlKGQuZmFyZSkpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCBjb2xvcilcclxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHRcdC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XHJcblxyXG5cdFx0YmFycy5leGl0KCkucmVtb3ZlKCk7XHJcblxyXG5cdFx0Ly8gZHJhdyB0ZXh0IHRvIHRoZSBsZWZ0IG9mIGVhY2ggYmFyIHJlcHJlc2VudGluZyB0aGUgbmFtZVxyXG5cdFx0dmFyIG5hbWVzID0gc3ZnLnNlbGVjdEFsbCgnLmJhci0nK3BhcmFtKyctbmFtZScpXHJcblx0XHRcdC5kYXRhKGRhdGEpO1xyXG5cclxuXHRcdG5hbWVzLnRyYW5zaXRpb24oKVxyXG5cdFx0XHQudGV4dChkID0+IGRbcGFyYW1dKTtcclxuXHJcblx0XHRuYW1lcy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSsnLW5hbWUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgMClcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGRbcGFyYW1dKSlcclxuXHRcdFx0XHQuYXR0cignZHknLCAoeVNjYWxlLnJhbmdlQmFuZCgpLzQpKjMpXHJcblx0XHRcdFx0LmF0dHIoJ2R4JywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdFx0LnRleHQoZCA9PiBkW3BhcmFtXSlcclxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHRcdC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XHJcblxyXG5cdFx0bmFtZXMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cclxuXHRcdC8vIGRyYXcgdGV4dCB0byB0aGUgcmlnaHQgb2YgZWFjaCBiYXIgcmVwcmVzZW50aW5nIHRoZSByb3VuZGVkIHNwZW5kaW5nXHJcblx0XHR2YXIgZmFyZXMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0rJy1mYXJlJylcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0ZmFyZXMudHJhbnNpdGlvbigpXHJcblx0XHRcdC50ZXh0KGQgPT4gbnVtZXJhbChkLmZhcmUpLmZvcm1hdCgnMGEnKSk7XHJcblxyXG5cdFx0ZmFyZXMuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyLScrcGFyYW0rJy1mYXJlJylcclxuXHRcdFx0XHQuYXR0cigneCcsIHdpZHRoLTM1KVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZFtwYXJhbV0pKVxyXG5cdFx0XHRcdC5hdHRyKCdkeScsICh5U2NhbGUucmFuZ2VCYW5kKCkvNCkqMylcclxuXHRcdFx0XHQuYXR0cignZHgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcdFx0XHRcdFxyXG5cdFx0XHRcdC50ZXh0KGQgPT4gbnVtZXJhbChkLmZhcmUpLmZvcm1hdCgnMGEnKSk7XHJcblxyXG5cdFx0ZmFyZXMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH1cclxufSIsIi8qKlxyXG4gKiBGaW5kcyBvdXQgdGhlIHVuaXF1ZSB2YWx1ZXMgb2YgZ2l2ZW4gZGF0YSBmb3IgZ2l2ZW4gcGFyYW1ldGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGFsbCB5ZWFyIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbSBwYXJhbWV0ZXIgd2hpY2ggc2hvdWxkIGJlIGxvb2tlZCB1cFxyXG4gKiBAcmV0dXJuIHthcnJheX0gdW5pcXVlVmFsdWVzIGFycmF5IG9mIGFsbCB1bmlxdWUgdmFsdWVzIGZvciBnaXZlbiBwYXJhbWV0ZXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bmlxVmFsdWVzKGRhdGEsIHBhcmFtKSB7XHJcblx0cmV0dXJuIFsgLi4ubmV3IFNldChkYXRhLm1hcChkID0+IGRbcGFyYW1dKSldO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgd2hvbGUgeWVhcidzIHNwZW5kaW5nIGZvciBhIGdpdmVuIHBhcmFtIChlLmcuIHN1cHBsaWVyLCBkaXJlY3RvcmF0ZSkgYW5kIHJldHVybnMgaXQgaW4gdXBkYXRlZCBhcnJheSBvZiBvYmplY3RzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbVxyXG4gKiBAcmV0dXJuIHthcnJheX0gYWxsU3BlbmRpbmcgYXJyYXkgb2YgdXBkYXRlZCBvYmplY3RzLCBlLmcuIFsge2ZhcmU6IHgsIHBhcmFtOiBhfSwge2ZhcmU6IHksIHBhcmFtOiBifSwgLi4uXVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNTcGVuZGluZyhkYXRhLCBwYXJhbSkge1xyXG5cdHZhciB1bmlxSXRlbXMgPSB1bmlxVmFsdWVzKGRhdGEsIHBhcmFtKTtcclxuXHRcclxuXHR2YXIgYWxsUGFyYW1zID0gdW5pcUl0ZW1zLm1hcCggaXRlbSA9PiBkYXRhLmZpbHRlciggZCA9PiBkW3BhcmFtXSA9PT0gaXRlbSApKTtcclxuXHJcblx0dmFyIGFsbFNwZW5kaW5nID0gW107XHJcblxyXG5cdGFsbFBhcmFtcy5mb3JFYWNoKCBpdGVtQXJyYXkgPT4ge1xyXG5cdFx0dmFyIG9iaiA9IHt9O1xyXG5cclxuXHRcdG9ialsnZmFyZSddID0gaXRlbUFycmF5LnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCk7XHJcblx0XHRvYmpbcGFyYW1dID0gaXRlbUFycmF5WzBdW3BhcmFtXTtcclxuXHRcdG9ialsndmFsdWVzJ10gPSBpdGVtQXJyYXk7XHJcblxyXG5cdFx0YWxsU3BlbmRpbmcucHVzaChvYmopO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gYWxsU3BlbmRpbmc7XHJcbn0iLCIvKipcclxuICogTWFpbiB2aXN1YWxpemF0aW9uIG1vZHVsZSBmb3IgY3JlYXRpbmcgY2hhcnRzIGFuZCB2aXMgZm9yIHBhc3NlZCBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3NwZW5kaW5nfSBmcm9tICcuL3NwZW5kaW5nJztcclxuaW1wb3J0IHtkaXN0cmlidXRpb259IGZyb20gJy4vZGlzdHJpYnV0aW9uJztcclxuaW1wb3J0IHt0b3BTcGVuZGluZ30gZnJvbSAnLi90b3BTcGVuZGluZyc7XHJcbmltcG9ydCB7dGlja2V0fSBmcm9tICcuL3RpY2tldCc7XHJcbmltcG9ydCB7ZGVzdGluYXRpb25zfSBmcm9tICcuL2Rlc3RpbmF0aW9ucyc7XHJcblxyXG4vLyBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBzcGVuZGluZ1xyXG52YXIgZGF0YTtcclxuXHJcbi8vIHBhbmVscyBmb3IgdmlzdWFsaXphdGlvbnMsIGluY2x1ZGluZyBjYWxsYWJsZSBmdW5jdGlvbiBhbmQgcGFyYW1ldGVycyB0byBzZXQgdGhlbSB1cFxyXG52YXIgcGFuZWxzID0gW1xyXG5cdHsgaWQ6ICd2aXMtc3BlbmRpbmcnLCBmbjogc3BlbmRpbmcsIGFyZ3M6IFtdIH0sXHJcblx0eyBpZDogJ3Zpcy1kaXN0cmlidXRpb24nLCBmbjogZGlzdHJpYnV0aW9uLCBhcmdzOiBbXSB9LFxyXG5cdHsgaWQ6ICd2aXMtdGlja2V0LW51bScsIGZuOiB0aWNrZXQsIGFyZ3M6IFsnbGVuZ3RoJywgJyNkMDcyNWQnXSB9LFxyXG5cdHsgaWQ6ICd2aXMtdGlja2V0LWF2ZycsIGZuOiB0aWNrZXQsIGFyZ3M6IFsnZmFyZScsICcjZDJhMjRjJ10gfSxcclxuXHR7IGlkOiAndmlzLXRvcC1zdXAnLCBmbjogdG9wU3BlbmRpbmcsIGFyZ3M6IFsnc3VwcGxpZXInLCAnIzRiOTIyNicsIDUsIDEzMF0gfSxcclxuXHR7IGlkOiAndmlzLXRvcC1kaXInLCBmbjogdG9wU3BlbmRpbmcsIGFyZ3M6IFsnZGlyZWN0b3JhdGUnLCAnI2FmNGM3ZScsIDUsIDEzMF0gfSxcclxuXHR7IGlkOiAndmlzLWRlc3RpbmF0aW9ucycsIGZuOiBkZXN0aW5hdGlvbnMsIGFyZ3M6IFtdIH0sXHJcblx0eyBpZDogJ3Zpcy10b3AxMC1zdXAnLCBmbjogdG9wU3BlbmRpbmcsIGFyZ3M6IFsnc3VwcGxpZXInLCAnIzRiOTIyNicsIDEwLCAzMjBdIH1cdFxyXG5cdF07XHJcblxyXG4vKipcclxuICogU3RvcmVzIHRoZSBnaXZlbiBkYXRhIGludG8gbW9kdWxlJ3MgZ2xvYmFsIHZhcmlhYmxlLlxyXG4gKiBUaGVuIGRldGVjdHMgd2hhdCB2aXN1YWxpemF0aW9ucyBhcmUgcG9zc2libGUgdG8gY3JlYXRlIGFuZCBzZXRzIHRoZW0gdXAgd2l0aCBkZWZpbmVkIHBhcmFtZXRlcnMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2Ygb2JqZWN0c1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhc2V0KXtcdFxyXG5cclxuXHRkYXRhID0gZGF0YXNldDtcclxuXHJcblx0cGFuZWxzLmZvckVhY2goIHBhbmVsID0+IHtcclxuXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5lbC5pZCkpIHtcclxuXHRcdFx0Ly8gc29tZSB2aXN1YWxpemF0aW9ucyByZXR1cm4gb2JqZWN0LCBzdG9yZSBpdCwgc28gaXQgaXMgY2FsbGFibGUgbGF0ZXJcclxuXHRcdFx0cGFuZWwudmlzID0gcGFuZWwuZm4oIGRhdGEsIHBhbmVsLmlkLCAuLi5wYW5lbC5hcmdzKTtcclxuXHRcdH1cclxuXHR9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGEgaXMgZmlyc3RseSBmaWx0ZXJlZCBhY2NvcmRpbmcgdG8gbW9udGggYW5kIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdGhlbiByZWRyYXduIHdpdGggdXBkYXRlZCBkYXRhLlxyXG4gKiBJZiBub3RoaW5nIGlzIHBhc3NlZCwgdGhlbiB0aGUgZGVmYXVsdCBkYXRhIHdpdGggYWxsIG1vbnRocyBhcmUgdmlzdWFsaXplZC5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG1vbnRoIHNlbGVjdGVkIG1vbnRoIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgZmlsdGVyaW5nIGRhdGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVkU3BlbmRpbmcobW9udGgpIHtcclxuXHQvLyBkYXRhIHRvIGJlIHZpc3VhbGl6ZWQgLSBlaXRoZXIgZmlsdGVyZWQgb3IgZGVmYXVsdCBkYXRhIHdpdGggYWxsIG1vbnRoc1xyXG5cdHZhciBkYXRhc2V0O1xyXG5cdFxyXG5cdGlmIChtb250aCkge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBvbmx5IGdpdmVuIG1vbnRoIGRhdGFcclxuXHRcdGRhdGFzZXQgPSBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyByZWRyYXcgYWxsIHBhbmVscyB3aXRoIGFsbCBtb250aHMgZGF0YVxyXG5cdFx0ZGF0YXNldCA9IGRhdGE7XHJcblx0fVxyXG5cclxuXHRwYW5lbHMuZm9yRWFjaCggcGFuZWwgPT4ge1xyXG5cdFx0Ly8gaWYgdGhlIHZpc3VhbGl6YXRpb24gaGFzIGFuIG9iamVjdCByZXR1cm5lZCwgY2FsbCB1cGRhdGUgb24gaXQgd2l0aCB0aGUgbmV3IGRhdGFzZXRcclxuXHRcdGlmIChwYW5lbC52aXMpIHtcclxuXHRcdFx0cGFuZWwudmlzLnVwZGF0ZShkYXRhc2V0KTtcclxuXHRcdH1cclxuXHR9KTtcclxufSJdfQ==
