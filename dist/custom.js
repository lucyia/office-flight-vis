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

	// create tooltip and call it
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
	svg.append('defs').append('marker').attr('id', 'markerArrow').attr('markerWidth', 8).attr('markerHeight', 6).attr('refX', 3).attr('refY', 3).attr('orient', 'auto').append('path').attr('d', 'M0,0 L0,6 L4,3 L0,0').attr('fill', 'white');

	// line function
	var line = d3.svg.line().interpolate('basis').x(function (d) {
		console.log(d, d.x);
		return d.x;
	}).y(function (d) {
		return d.y;
	});

	// UK -> UK
	var centerX_UK = data[0].coord.x;
	var centerY_UK = data[0].coord.y - r / 3;

	var shiftX = r / 2;
	var shiftY = r / 2;

	console.log(centerY_UK, centerX_UK, shiftY, shiftX);

	var flights_UK2UK_nodes = [{ x: centerX_UK + shiftX, y: centerY_UK - shiftY }, { x: centerX_UK + shiftX * 1.5, y: centerY_UK - shiftY * 2 }, { x: centerX_UK, y: centerY_UK - shiftY * 3 }, { x: centerX_UK - shiftX * 1.5, y: centerY_UK - shiftY * 2 }, { x: centerX_UK - shiftX, y: centerY_UK - shiftY }];

	var flights_UK2UK = svg.append('path').attr('d', line(flights_UK2UK_nodes)).attr('stroke', 'white').attr('stroke-width', 5).attr('fill', 'none').attr('marker-end', 'url(#markerArrow)');
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

	margin = { top: 10, right: 35, bottom: 30, left: 10 };
	width = 810 - margin.left - margin.right;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGVzdGluYXRpb25zLmpzIiwianNcXGRpc3RyaWJ1dGlvbi5qcyIsImpzXFxpbml0LmpzIiwianNcXHNwZW5kaW5nLmpzIiwianNcXHRpY2tldC5qcyIsImpzXFx0b3BTcGVuZGluZy5qcyIsImpzXFx2aXMtdXRpbC5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQzJCZ0IsWSxHQUFBLFk7O0FBbkJoQjs7O0FBR0EsSUFBSSxNQUFKLEM7Ozs7Ozs7O0FBQ0EsSUFBSSxLQUFKO0FBQ0EsSUFBSSxNQUFKOzs7QUFHQSxJQUFJLEdBQUo7OztBQUdBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxHQUFKOzs7OztBQUtPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0Qjs7QUFFbEMsTUFBSyxJQUFMOztBQUVBLFNBQVEsV0FBVyxJQUFYLENBQVI7QUFFQTs7Ozs7OztBQU9ELFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0I7O0FBRW5CLFVBQVMsRUFBQyxLQUFLLEVBQU4sRUFBVSxPQUFPLEVBQWpCLEVBQXFCLFFBQVEsRUFBN0IsRUFBaUMsTUFBTSxFQUF2QyxFQUFUO0FBQ0EsU0FBUSxNQUFNLE9BQU8sSUFBYixHQUFvQixPQUFPLEtBQW5DO0FBQ0EsVUFBUyxNQUFNLE9BQU8sR0FBYixHQUFtQixPQUFPLE1BQW5DOztBQUVBLFNBQVEsR0FBRyxLQUFILENBQVMsT0FBVDs7QUFBQSxFQUVOLEtBRk0sQ0FFQSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLENBRkEsQ0FBUjs7QUFJQSxPQUFNLEdBQUcsTUFBSCxDQUFVLG1CQUFWLEVBQ0osTUFESSxDQUNHLEtBREgsRUFFSCxJQUZHLENBRUUsT0FGRixFQUVXLFFBQVEsT0FBTyxJQUFmLEdBQXNCLE9BQU8sS0FGeEMsRUFHSCxJQUhHLENBR0UsUUFIRixFQUdZLFNBQVMs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YixFQUF1QixPQUFPLENBQVAsQ0FBdkIsRUFBa0MsU0FBbEMsQ0FBTjtBQUNBOztBQUVELFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyxhQUFRLG9CQUFPLElBQVAsRUFBYSxNQUFiLEVBQXFCLE9BQU8sQ0FBUCxDQUFyQixFQUFnQyxTQUFoQyxDQUFSO0FBQ0E7O0FBRUQsU0FBSyxPQUFPLENBQVAsQ0FBTDtBQUNDLFdBQU0sOEJBQVksSUFBWixFQUFrQixVQUFsQixFQUE4QixPQUFPLENBQVAsQ0FBOUIsRUFBeUMsU0FBekMsRUFBb0QsQ0FBcEQsRUFBdUQsR0FBdkQsQ0FBTjtBQUNBOztBQUVELFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyxXQUFNLDhCQUFZLElBQVosRUFBa0IsYUFBbEIsRUFBaUMsT0FBTyxDQUFQLENBQWpDLEVBQTRDLFNBQTVDLEVBQXVELENBQXZELEVBQTBELEdBQTFELENBQU47QUFDQTs7QUFFRCxTQUFLLE9BQU8sQ0FBUCxDQUFMO0FBQ0MscUNBQWEsSUFBYjtBQUNBOztBQUVELFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyxXQUFNLDhCQUFZLElBQVosRUFBa0IsVUFBbEIsRUFBOEIsT0FBTyxDQUFQLENBQTlCLEVBQXlDLFNBQXpDLEVBQW9ELEVBQXBELEVBQXdELEdBQXhELENBQU47QUFDQTs7QUEvQkY7QUFrQ0E7QUFDRCxFQXJDRDtBQXNDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiBkZXBhcnR1cmVzIGFuZCBkZXN0aW5hdGlvbnMuXHJcbiAqIENyZWF0ZXMgYSBjdXN0b20gdmlzdWFsaXphdGlvbiBkZXBpY3RpbmcgY291bnRyaWVzIG9mIGRlc3RpbmF0aW9ucyBhbmQgZGVwYXJ0dXJlcy5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt1bmlxVmFsdWVzfSBmcm9tICcuL3Zpcy11dGlsJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBzdmcgcGFuZWxcclxudmFyIHN2ZztcclxuXHJcbi8vIGNvbG9yIGZ1bmN0aW9uIGFzc2lnbmluZyBlYWNoIHBsYWNlIHVuaXF1ZSBjb2xvclxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGZvciB2aXN1YWxpemF0aW9uIGFuZCBjcmVhdGVzIGEgZGF0YXNldCBmcm9tIGdpdmVuIGRhdGEgdGhhdCBpcyBtb3JlIHN1aXRhYmxlIGZvciB3b3JraW5nIHdpdGhpbiB2aXN1YWxpemF0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGRlc3RpbmF0aW9ucyhkYXRhKSB7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGRyYXdWaXModXBkYXRlRGF0YShkYXRhKSk7XHJcblxyXG59XHJcblxyXG4vKipcclxuICogU2V0cyB1cCBhbGwgc2NhbGVzIGFuZCBhdHRyaWJ1dGVzIGFjYy4gdG8gZ2l2ZW4gZGF0YSBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBlYWNoIHNwZW5kaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KGRhdGEpIHtcdFxyXG5cclxuXHRtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDEwLCBsZWZ0OiAxMH07XHJcblx0d2lkdGggPSA4MTAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSA1MDAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcblx0Y29sb3IgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdC8vLnJhbmdlKFsnIzIxOTZmMycsICcjY2RkYzM5JywgJyNmZjgxMDAnXSk7XHJcblx0XHQucmFuZ2UoWycjMGE2NWFkJywgJyM5OWE3MTcnLCAnI2QyN2QwMCddKVxyXG5cclxuXHRzdmcgPSBkMy5zZWxlY3QoJyN2aXMtZGVzdGluYXRpb25zJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyB0aGUgdmlzdWFsaXphdGlvbiB3aXRoIG5vZGVzLCBlZGdlcyBhbmQgdGV4dCBsYWJlbHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGRyYXdWaXMoZGF0YSkge1xyXG5cclxuXHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdHRpcCA9IGQzLnRpcCgpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cIm51bWJlclwiPkZsaWdodHMgb3V0OiA8c3BhbiBjbGFzcz1cInB1bGwtcmlnaHRcIj4nK251bWVyYWwoZC5kZXBhcnR1cmUubGVuZ3RoKS5mb3JtYXQoJzAsMCcpKyc8L3NwYW4+PC9zcGFuPlxcXHJcblx0XHRcdFx0PGJyLz48c3BhbiBjbGFzcz1cIm51bWJlclwiPkZsaWdodHMgaW46IDxzcGFuIGNsYXNzPVwicHVsbC1yaWdodFwiPicrbnVtZXJhbChkLmRlc3RpbmF0aW9uLmxlbmd0aCkuZm9ybWF0KCcwLDAnKSsnPC9zcGFuPjwvc3Bhbj4nO1xyXG5cdFx0fSk7XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblx0XHJcblx0dmFyIHIgPSA2MDtcclxuXHJcblx0Ly8gY3JlYXRlIGEgY2lyY2xlIGZvciBlYWNoIHBsYWNlXHJcblx0dmFyIGNpcmNsZXMgPSBzdmcuc2VsZWN0QWxsKCcucGxhY2VzJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdFx0LmF0dHIoJ2N4JywgZCA9PiBkLmNvb3JkLngpXHJcblx0XHRcdC5hdHRyKCdjeScsIGQgPT4gZC5jb29yZC55KVxyXG5cdFx0XHQuYXR0cigncicsIHIpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yKGkpKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgdGlwLmhpZGUpO1xyXG5cclxuXHQvLyBjcmVhdGUgYSBsYWJlbCBmb3IgZWFjaCBwbGFjZSBhbmQgcGxhY2UgaXQgaW5zaWRlIHRoZSBwbGFjZSdzIGNpcmNsZVxyXG5cdHZhciBsYWJlbHMgPSBzdmcuc2VsZWN0QWxsKCcucGxhY2VzLWxhYmVsJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiBkLmNvb3JkLnggLSBkLnBsYWNlLmxlbmd0aCo0KVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4gZC5jb29yZC55ICsgNSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHQuc3R5bGUoJ2ZvbnQtd2VpZ2h0JywgJzYwMCcpXHJcblx0XHRcdC50ZXh0KCBkID0+IGQucGxhY2UgKTtcclxuXHJcblx0Ly8gYXJyb3cgbWFya2VyIGZvciB0aGUgbGluZXNcclxuXHRzdmcuYXBwZW5kKCdkZWZzJylcclxuXHRcdC5hcHBlbmQoJ21hcmtlcicpXHJcblx0XHRcdC5hdHRyKCdpZCcsICdtYXJrZXJBcnJvdycpXHJcblx0XHRcdC5hdHRyKCdtYXJrZXJXaWR0aCcsIDgpXHJcblx0XHRcdC5hdHRyKCdtYXJrZXJIZWlnaHQnLCA2KVxyXG5cdFx0XHQuYXR0cigncmVmWCcsIDMpXHJcblx0XHRcdC5hdHRyKCdyZWZZJywgMylcclxuXHRcdFx0LmF0dHIoJ29yaWVudCcsICdhdXRvJylcclxuXHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHQuYXR0cignZCcsICdNMCwwIEwwLDYgTDQsMyBMMCwwJylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKTtcclxuXHJcblx0Ly8gbGluZSBmdW5jdGlvblxyXG5cdHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKVxyXG5cdFx0LmludGVycG9sYXRlKCdiYXNpcycpXHJcblx0XHQueCggZCA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKGQsIGQueClcclxuXHRcdFx0cmV0dXJuIGQueFxyXG5cdFx0fSlcclxuXHRcdC55KCBkID0+IGQueSk7XHJcblxyXG5cdC8vIFVLIC0+IFVLXHJcblx0dmFyIGNlbnRlclhfVUsgPSBkYXRhWzBdLmNvb3JkLng7XHJcblx0dmFyIGNlbnRlcllfVUsgPSBkYXRhWzBdLmNvb3JkLnktci8zO1xyXG5cclxuXHR2YXIgc2hpZnRYID0gci8yO1xyXG5cdHZhciBzaGlmdFkgPSByLzI7XHJcblxyXG5cdGNvbnNvbGUubG9nKGNlbnRlcllfVUssIGNlbnRlclhfVUssIHNoaWZ0WSwgc2hpZnRYKVxyXG5cclxuXHR2YXIgZmxpZ2h0c19VSzJVS19ub2RlcyA9IFsgXHJcblx0XHR7IHg6IGNlbnRlclhfVUsrc2hpZnRYLCB5OiBjZW50ZXJZX1VLLXNoaWZ0WSB9LFxyXG5cdFx0eyB4OiBjZW50ZXJYX1VLK3NoaWZ0WCoxLjUsIHk6IGNlbnRlcllfVUstc2hpZnRZKjIgfSxcclxuXHRcdHsgeDogY2VudGVyWF9VSywgeTogY2VudGVyWV9VSy1zaGlmdFkqMyB9LFxyXG5cdFx0eyB4OiBjZW50ZXJYX1VLLXNoaWZ0WCoxLjUsIHk6IGNlbnRlcllfVUstc2hpZnRZKjIgfSxcclxuXHRcdHsgeDogY2VudGVyWF9VSy1zaGlmdFgsIHk6IGNlbnRlcllfVUstc2hpZnRZIH1cclxuXHRdO1xyXG5cclxuXHR2YXIgZmxpZ2h0c19VSzJVSyA9IHN2Zy5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0LmF0dHIoJ2QnLCBsaW5lKGZsaWdodHNfVUsyVUtfbm9kZXMpKVxyXG5cdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcclxuXHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0LmF0dHIoJ21hcmtlci1lbmQnLCAndXJsKCNtYXJrZXJBcnJvdyknKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkYXRhc2V0IG1vcmUgc3VpdGFibGUgZm9yIHZpc3V6YWxpemF0aW9uLlxyXG4gKiBUaGUgZGF0YXNldCBpcyBhbiBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBzcGVuZGluZyBmb3IgZWFjaCBwbGFjZSwgZGVzdGluYXRpb25zL2RlcGFydHVyZXMsIGV0Yy5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlRGF0YShkYXRhKSB7XHJcblxyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdC8vIGdldCBhbGwgcGxhY2VzIChkZXN0aW5hdGlvbnMgYW5kIGRlcGFydHVyZXMgYXJlIHRoZSBzYW1lIGluIHRoZSBkYXRhKVxyXG5cdC8vIFtcIlVLXCIsIFwiTm9uIEVFQVwiLCBcIkVFQVwiXVxyXG5cdHZhciBwbGFjZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdkZXN0aW5hdGlvbicpO1x0XHJcblxyXG5cdC8vIGNvb3JkaW5hdGlvbnMgb2YgY2lyY2xlcyBmb3IgZWFjaCBwbGFjZVxyXG5cdHZhciBwbGFjZXNDb29yZCA9IFsgXHJcblx0XHR7IHg6IHdpZHRoLzIsIHk6IGhlaWdodC80IH0sIFxyXG5cdFx0eyB4OiB3aWR0aC8zLCB5OiBoZWlnaHQvMyoyIH0sIFxyXG5cdFx0eyB4OiB3aWR0aC8zKjIsIHk6IGhlaWdodC8zKjIgfVxyXG5cdF07XHJcblxyXG5cdC8vIGNyZWF0ZSBuZXcgb2JqZWN0cyBhbmQgYWRkIHRoZW0gaW4gdGhlIGRhdGFzZXRcclxuXHRwbGFjZXMuZm9yRWFjaCggKHBsYWNlLCBpKSA9PiB7XHJcblx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cclxuXHRcdGRhdGFPYmoucGxhY2UgPSBwbGFjZTtcclxuXHRcdGRhdGFPYmouZGVzdGluYXRpb24gPSBkYXRhLmZpbHRlciggZCA9PiBkLmRlc3RpbmF0aW9uID09PSBwbGFjZSApO1xyXG5cdFx0ZGF0YU9iai5kZXBhcnR1cmUgPSBkYXRhLmZpbHRlciggZCA9PiBkLmRlcGFydHVyZSA9PT0gcGxhY2UgKTtcclxuXHRcdGRhdGFPYmouY29vcmQgPSB7eDogcGxhY2VzQ29vcmRbaV0ueCwgeTogcGxhY2VzQ29vcmRbaV0ueSB9XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKGRhdGFPYmopO1x0XHRcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiBkYXRhIGRpc3RyaWJ1dGlvbi5cclxuICogQ3JlYXRlcyBhIGJveC1hbmQtd2hpc2tleSBwbG90IGZyb20gZ2l2ZW4gZGF0YS5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG5cclxudmFyIG1pbjtcclxudmFyIG1heDtcclxuXHJcbnZhciBjaGFydDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0cmlidXRpb24oZGF0YSkge1xyXG5cdFxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0KGRhdGEpIHtcclxuXHRtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiAxMH07XHJcblx0d2lkdGggPSAyNjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSAzNDUgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcbn0iLCIvKipcclxuICogSW5pdGlhbGl6YXRpb24gb2YgYWxsIG1vZHVsZXMgXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dmlzdWFsaXplfSBmcm9tICcuL3Zpc3VhbGl6ZSc7XHJcblxyXG4oZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuXHRpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuXHRcdGZuKCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcblx0fVxyXG59KShpbml0KTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyByZWFkaW5nIG9mIGZpbGUgYW5kIHRoZW4gdmlzdWFsaXphdGlvbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5pdCgpe1xyXG5cclxuXHQvLyBzZXR1cCBudW1lcmFsIGZvciBjb3JyZWN0IG51bWJlciBmb3JtYXR0aW5nXHJcblx0bnVtZXJhbC5sYW5ndWFnZSgnZW4tZ2InKTtcclxuXHJcblx0Ly8gcGFyc2UgZmlsZVxyXG5cdGQzLmNzdignSG9tZV9PZmZpY2VfQWlyX1RyYXZlbF9EYXRhXzIwMTEuY3N2JylcclxuXHRcdC5yb3coIGQgPT4geyBcclxuXHRcdFx0cmV0dXJuIHsgXHJcblx0XHRcdFx0ZGVwYXJ0dXJlOiBkLkRlcGFydHVyZSwgXHJcblx0XHRcdFx0ZGVzdGluYXRpb246IGQuRGVzdGluYXRpb24sIFxyXG5cdFx0XHRcdGRpcmVjdG9yYXRlOiBkLkRpcmVjdG9yYXRlLCBcclxuXHRcdFx0XHRtb250aDogZC5EZXBhcnR1cmVfMjAxMSwgXHJcblx0XHRcdFx0ZmFyZTogcGFyc2VGbG9hdChkLlBhaWRfZmFyZSksIFxyXG5cdFx0XHRcdHRpY2tldDogZC5UaWNrZXRfY2xhc3NfZGVzY3JpcHRpb24sIFxyXG5cdFx0XHRcdHN1cHBsaWVyOiBkLlN1cHBsaWVyX25hbWUgXHJcblx0XHRcdH07XHJcblx0XHR9KVxyXG5cdFx0LmdldCggKGVycm9yLCBkYXRhKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikgY29uc29sZS5sb2coZXJyb3IpXHJcblx0XHRcdFxyXG5cdFx0XHR2aXN1YWxpemUoZGF0YSk7XHJcblx0XHR9KTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIG1vbnRobHkgc3BlbmRpbmcuXHJcbiAqIENyZWF0ZXMgYSBiYXIgY2hhcnQgZnJvbSBnaXZlbiBkYXRhIGFuZCBhZGRzIGxpc3RlbmVycyBmb3IgZmlsdGVyaW5nIG9uZSBtb250aC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt1bmlxVmFsdWVzfSBmcm9tICcuL3Zpcy11dGlsJztcclxuaW1wb3J0IHt1cGRhdGVkU3BlbmRpbmd9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBzdmcgcGFuZWxcclxudmFyIHN2ZztcclxuLy8gbm9kZSBmb3IgY3JlYXRlZCBmaWx0ZXJcclxudmFyIGZpbHRlcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB4IGRpcmVjdGlvblxyXG52YXIgeFNjYWxlO1xyXG4vLyBmdW5jdGlvbiBmb3IgcG9zaXRpb25pbmcgZWxlbWVudHMgaW4geSBkaXJlY3Rpb25cclxudmFyIHlTY2FsZTtcclxuXHJcbi8vIG1vbnRoIGF4aXNcclxudmFyIHhBeGlzO1xyXG4vLyBudW1iZXIgYXhpc1xyXG52YXIgeUF4aXM7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYmluZGluZyBhIGNvbG9yIHRvIGEgdGlja2V0IHR5cGVcclxudmFyIGNvbG9yO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8vIHNjYWxlIGZvciBzdGFja2luZyByZWN0YW5nbGVzXHJcbnZhciBzdGFjaztcclxuXHJcbi8vIHRyYW5zZm9ybWVkIGRhdGFcclxudmFyIGRhdGFzZXQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSB0aGF0IGlzIG1vcmUgc3VpdGFibGUgZm9yIHdvcmtpbmcgd2l0aGluIHZpc3VhbGl6YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3BlbmRpbmcoZGF0YSkge1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkYXRhc2V0ID0gc3BlbmRpbmdEYXRhc2V0KGRhdGEpO1xyXG5cdFxyXG5cdGNyZWF0ZUJhckNoYXJ0KGRhdGFzZXQpO1xyXG5cclxuXHRjcmVhdGVMZWdlbmQoZGF0YXNldCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGFsbCBzY2FsZXMgYW5kIGF0dHJpYnV0ZXMgYWNjLiB0byBnaXZlbiBkYXRhIGFuZCBjcmVhdGVzIGEgc3ZnIHBhbmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGVhY2ggc3BlbmRpbmdcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMzUsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbihbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSlcclxuXHRcdC5yYW5nZVJvdW5kQmFuZHMoWzAsIHdpZHRoXSwgLjA1KTtcclxuXHJcblx0Ly8gcm91bmQgdGhlIG1heGltdW0gdmFsdWUgZnJvbSBkYXRhIHRvIHRob3VzYW5kc1xyXG5cdHZhciByb3VuZGVkTWF4ID0gTWF0aC5yb3VuZCggTWF0aC5tYXgoLi4ubW9udGhGYXJlcyhkYXRhKSkgLyAxMDAwICkgKiAxMDAwO1xyXG5cdHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXHJcblx0XHQuZG9tYWluKFsgMCwgcm91bmRlZE1heCBdKVxyXG5cdFx0LnJhbmdlKFsgaGVpZ2h0LCAwIF0pO1xyXG5cclxuXHR4QXhpcyA9IGQzLnN2Zy5heGlzKClcclxuXHRcdC5zY2FsZSh4U2NhbGUpXHJcblx0XHQub3JpZW50KCdib3R0b20nKTtcclxuXHJcblx0eUF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeVNjYWxlKVxyXG5cdFx0Lm9yaWVudCgncmlnaHQnKVxyXG5cdFx0LnRpY2tGb3JtYXQoIGQgPT4gbnVtZXJhbChkKS5mb3JtYXQoJzBhJykpO1xyXG5cdFxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpKVx0XHRcclxuXHRcdC5yYW5nZShbXCIjMDBiY2Q0XCIsIFwiIzFkNmRkMFwiLCBcIiNlZGNkMDJcIl0pO1xyXG5cclxuXHRzdGFjayA9IGQzLmxheW91dC5zdGFjaygpO1xyXG5cclxuXHRzdmcgPSBkMy5zZWxlY3QoJyN2aXMtc3BlbmRpbmcnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG1vbnRobHkgc3BlbmRpbmcgZm9yIGFsbCB0aWNrZXQgdHlwZXMgYW5kIHJldHVybnMgdGhlIGNyZWF0ZWQgYXJyYXkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW5kaW5nIGFsbCB5ZWFyIHNwZWRuaW5nXHJcblx0ICogQHJldHVybiB7YXJyYXl9IHN1bU1vbnRobHlGYXJlcyBhcnJheSBvZiBudW1iZXJzIHJlcHJlc2VudGluZyBlYWNoIG1vbnRocyBzcGVuZGluZyBvbiBhbGwgdGlja2V0c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vbnRoRmFyZXMoZGF0YSkge1x0XHJcblx0XHQvLyBnZXQgYWxsIGZhcmVzIGZvciBlYWNoIG1vbnRoXHJcblx0XHR2YXIgZmFyZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0XHQvLyBzdW0gdXAgYWxsIGZhcmVzIGluIGVhY2ggbW9udGhcclxuXHRcdHZhciBzdW1Nb250aGx5RmFyZXMgPSBmYXJlcy5tYXAoIGZhcmUgPT4gZmFyZS5yZWR1Y2UoIChhLGIpID0+IGEgKyBiLmZhcmUsIDApKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHN1bU1vbnRobHlGYXJlcztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgc3RhY2tlZCBiYXIgY2hhcnQgYWNjb3JkaW5nIHRvIGdpdmVuIGRhdGEuIFRoZSBjaGFydCBoYXMgbGF5ZXJzIGZvciBlYWNoIHRpY2tldCB0eXBlLlxyXG4gKiBUaGVyZSBhcmUgbGlzdGVuZXJzIGZvciBjcmVhdGluZyBhIHRvb2x0aXAgYW5kIGZpbHRlciBmb3Igc2VsZWN0aW5nIG9ubHkgb25lIG1vbnRoLlxyXG4gKiBcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIGluIHRoZSBmb3JtIG9mIFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1xyXG5cdC8vIGNyZWF0ZSBzdGFja2VkIGRhdGEgZm9yIHRoZSB2aXN1YWxpemF0aW9uXHJcblx0c3RhY2soZGF0YSk7XHJcblxyXG5cdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0dGlwID0gZDMudGlwKClcclxuXHRcdC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxyXG5cdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHR2YXIgaW5kZXggPSBjb2xvci5yYW5nZSgpLmluZGV4T2YoY29sb3IoZC50aWNrZXQpKTtcclxuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cInR5cGUgdHlwZS0nK2luZGV4KydcIj4nKyBkLnRpY2tldCArJzwvc3Bhbj5cXFxyXG5cdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPicrbnVtZXJhbChkLnkpLmZvcm1hdCgnJDAsMCcpICsgJzwvc3Bhbj5cXFxyXG5cdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJudW1iZXJcIj4nK251bWVyYWwoZC52YWx1ZXMubGVuZ3RoKS5mb3JtYXQoJzAsMCcpKycgdGlja2V0czwvc3Bhbj4nOyBcclxuXHRcdH0pO1xyXG5cclxuXHRzdmcuY2FsbCh0aXApO1xyXG5cclxuXHQvLyBjcmVhdGUgYSByZWN0YW5nbGUgYXMgYSBiYWNrZ3JvdW5kXHJcblx0dmFyIGJhY2tncm91bmQgPSBzdmcuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdzdmctYmFja2dyb3VuZCcpXHJcblx0XHQuYXR0cigneCcsIDApXHJcblx0XHQuYXR0cigneScsIDApXHJcblx0XHQuYXR0cignd2lkdGgnLCB3aWR0aClcclxuXHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXHJcblx0XHQuYXR0cignZmlsbCcsICd0cmFuc3BhcmVudCcpXHJcblx0XHQub24oJ2NsaWNrJywgZGVzZWxlY3QpO1xyXG5cclxuXHQvLyBjcmVhdGUgZ3JvdXAgZm9yIGVhY2ggdGlja2V0IHR5cGVcclxuXHR2YXIgZ3JvdXBzID0gc3ZnLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsIChkLGkpID0+ICd0aWNrZXQtJytpICk7XHJcblxyXG5cdC8vIGNyZWF0ZSBiYXJzIGZvciBlYWNoIHRpY2tldCBncm91cFxyXG5cdGdyb3Vwcy5zZWxlY3RBbGwoJy5iYXInKVxyXG5cdFx0LmRhdGEoIGQgPT4gZCApXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXInKVxyXG5cdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUoZC55MCkgLSB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgbW91c2VvdmVyKVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgbW91c2VvdXQpXHJcblx0XHRcdC5vbignY2xpY2snLCBtb3VzZWNsaWNrKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXgnKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgMCArJywnKyBoZWlnaHQgKycpJylcclxuXHRcdC5jYWxsKHhBeGlzKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgd2lkdGggKycsJysgMCArJyknKVxyXG5cdFx0LmNhbGwoeUF4aXMpO1xyXG5cclxuXHRmaWx0ZXIgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdmaWx0ZXInKTtcclxuXHJcblx0LyoqXHJcblx0ICogRGVsZXRlcyB0aGUgZmlsdGVyIGNvbnRhaW5pbmcgc2VsZWN0ZWQgbW9udGggYW5kIHVwZGF0ZXMgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGRlc2VsZWN0KCkge1xyXG5cclxuXHRcdHZhciBmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaWx0ZXInKVswXTtcclxuXHJcblx0XHRpZiAoZmlsdGVyLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHQvLyBkZWxldGUgc2VsZWN0ZWQgbW9udGhcclxuXHRcdFx0ZmlsdGVyLnJlbW92ZUNoaWxkKGZpbHRlci5jaGlsZE5vZGVzWzBdKTtcclxuXHJcblx0XHRcdC8vIHVwZGF0ZSBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnNcclxuXHRcdFx0dXBkYXRlZFNwZW5kaW5nKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZmlsdGVyIGZvciBhIHdob2xlIG1vbnRoIGFmdGVyIHRoZSB1c2VyIGNsaWNrcyBvbiBhbnkgdGlja2V0IHRpY2tldCB0eXBlLiBUaGUgZmlsdGVyIGlzIHJlcHJlc2VudGVkIHdpdGggYSB3aGl0ZS1ib3JkZXJlZCByZWN0YW5nbGUuXHJcblx0ICogQWxsIG90aGVyIHZpc3VhbGl6YXRpb25zIGFyZSB1cGRhdGVkIGFjY29yZGluZyB0byBzZWxlY3RlZCBtb250aC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VjbGljayhkYXRhKSB7XHJcblx0XHQvLyB1cGRhdGUgb3RoZXIgdmlzdWFsaXphdGlvbnMgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR1cGRhdGVkU3BlbmRpbmcoZGF0YS54KTtcclxuXHJcblx0XHQvLyBnZXQgYWxsIHRpY2tldCB0eXBlcyBmb3Igc2VsZWN0ZWQgbW9udGhcclxuXHRcdHZhciB0aWNrZXRzTW9udGggPSBkYXRhc2V0Lm1hcCggdGlja2V0cyA9PiB0aWNrZXRzLmZpbHRlciggZCA9PiBkLnggPT09IGRhdGEueCApKTtcclxuXHJcblx0XHQvLyBmbGF0dGVuIHRoZSBhcnJheVxyXG5cdFx0dGlja2V0c01vbnRoID0gW10uY29uY2F0LmFwcGx5KFtdLCB0aWNrZXRzTW9udGgpO1xyXG5cclxuXHRcdC8vIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0IGFuZCBzdGFydGluZyBwb2ludCBvZiBtb250aHMgYmFyXHJcblx0XHR2YXIgeTAgPSB0aWNrZXRzTW9udGhbMF0ueTA7XHJcblx0XHR2YXIgYmFySGVpZ2h0ID0gdGlja2V0c01vbnRoLnJlZHVjZSggKGEsIGIpID0+IGEgKyBiLnksIDApO1xyXG5cdFx0XHJcblx0XHQvLyBjcmVhdGUgYW5kIHVwZGF0ZSByZWN0YW5nbGUgZm9yIGhpZ2hsaWdodGluZyB0aGUgc2VsZWN0ZWQgbW9udGhcclxuXHRcdHZhciBzZWxlY3RlZCA9IGZpbHRlci5zZWxlY3RBbGwoJy5zZWxlY3RlZCcpXHJcblx0XHRcdC5kYXRhKFtkYXRhXSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoYmFySGVpZ2h0KSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIHlTY2FsZSh5MCkgLSB5U2NhbGUoYmFySGVpZ2h0KSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnc2VsZWN0ZWQnKVx0XHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDMpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoYmFySGVpZ2h0KSlcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIaWhnbGlnaHQgdGhlIGhvdmVyZWQgZWxlbWVudCBhbmQgc2hvd3MgdG9vbHRpcC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdmVyKGQpIHtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gZDMucmdiKGNvbG9yKGQudGlja2V0KSkuYnJpZ2h0ZXIoLjUpKTtcclxuXHJcblx0XHR0aXAuc2hvdyhkKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyB0aGUgY29sb3Igb2YgdGhlIGVsZW1lbnQgYW5kIGhpZGVzIHRoZSB0b29sdGlwLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3V0KCkge1x0XHRcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKTtcclxuXHJcblx0XHR0aXAuaGlkZSgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBsZWdlbmQgZm9yIHRoZSBzcGVuZGluZyB2aXN1YWxpemF0aW9uLlxyXG4gKiBGb3IgZWFjaCB0aWNrZXQgdHlwZSBhIHJlY3RhbmdsZSBhbmQgYSB0ZXh0IGxhYmVsIGlzIGNyZWF0ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUxlZ2VuZChkYXRhKSB7XHJcblxyXG5cdC8vIHJlY3RhbmdsZSBzaXplXHJcblx0dmFyIHNpemUgPSAxMDtcclxuXHJcblx0Ly8gc3ZnIHBhbmVsIGZvciB0aGUgbGVnZW5kXHJcblx0dmFyIHN2Z0xlZ2VuZCA9IGQzLnNlbGVjdCgnI3NwZW5kaW5nLWxlZ2VuZCcpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCAyMDApXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCA5MClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgyMCwyMCknKTtcclxuXHJcblx0Ly8gY3JlYXRlIHJlY3RhbmdsZXMgZm9yIGVhY2ggZWxlbWVudFxyXG5cdHN2Z0xlZ2VuZC5zZWxlY3RBbGwoJy5zLWxlZ2VuZCcpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAncy1sZWdlbmQgbGVnZW5kJylcclxuXHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHQuYXR0cigneScsIChkLCBpKSA9PiBpKnNpemUqMilcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIHNpemUpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHNpemUpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkWzBdLnRpY2tldCkpO1xyXG5cclxuXHQvLyBjcmVhdGUgdGV4dCBsYWJlbFxyXG5cdHN2Z0xlZ2VuZC5zZWxlY3RBbGwoJy5zLWxlZ2VuZC1sYWJlbCcpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAncy1sZWdlbmQtbGFiZWwgbGVnZW5kJylcclxuXHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHQuYXR0cigneScsIChkLCBpKSA9PiBpKnNpemUqMilcclxuXHRcdFx0LmF0dHIoJ2R4Jywgc2l6ZSs1KVxyXG5cdFx0XHQuYXR0cignZHknLCBzaXplKVx0XHRcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHQudGV4dChkID0+IGRbMF0udGlja2V0KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBkYXRhIGludG8gYSBuZXcgZGF0YXNldCB3aGljaCBoYXMgcmVhcnJhbmdlZCB2YWx1ZXNcclxuICogc28gdGhhdCBpdCBpcyBhbiBhcnJheSBvZiB0aWNrZXQgdHlwZSBhcnJheXNcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHMgZXh0cmFjdGVkIGZyb20gZmlsZVxyXG4gKiBAcmV0dXJuIHthcnJheX0gZGF0YXNldCBhcnJheSBvZiBkYXRhIG9iamVjdHMgZ3JvdXBlZCBieSB0aWNrZXQgdHlwZXMgYW5kIG1vbnRoc1xyXG4gKi9cclxuZnVuY3Rpb24gc3BlbmRpbmdEYXRhc2V0KGRhdGEpIHtcclxuXHR2YXIgZGF0YXNldCA9IFtdO1xyXG5cclxuXHR2YXIgdGlja2V0cyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpO1xyXG5cclxuXHR2YXIgbW9udGhzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKTtcclxuXHJcblx0dmFyIG1vbnRobHlEYXRhID0gbW9udGhzLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblxyXG5cdHRpY2tldHMuZm9yRWFjaCggdGlja2V0ID0+IHtcclxuXHRcdHZhciB0aWNrZXRBcnJheSA9IFtdO1xyXG5cclxuXHRcdG1vbnRobHlEYXRhLmZvckVhY2goIChtb250aERhdGEsIGkpID0+IHtcclxuXHRcdFx0dmFyIGRhdGFPYmogPSB7fTtcclxuXHRcdFxyXG5cdFx0XHRkYXRhT2JqLnRpY2tldCA9IHRpY2tldDtcdFx0XHRcclxuXHRcdFx0ZGF0YU9iai52YWx1ZXMgPSBtb250aERhdGEuZmlsdGVyKCBkID0+IGQudGlja2V0ID09PSB0aWNrZXQpO1xyXG5cdFx0XHRkYXRhT2JqLnggPSBtb250aHNbaV07XHJcblxyXG5cdFx0XHRkYXRhT2JqLnkgPSBkYXRhT2JqLnZhbHVlcy5yZWR1Y2UoIChhLGIpID0+IHtcclxuXHRcdFx0XHRpZiAoIGIudGlja2V0ID09PSB0aWNrZXQgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYSArIGIuZmFyZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCAwKTtcclxuXHJcblx0XHRcdHRpY2tldEFycmF5LnB1c2goZGF0YU9iaik7XHRcdFx0XHJcblx0XHR9KTtcclxuXHJcblx0XHRkYXRhc2V0LnB1c2godGlja2V0QXJyYXkpO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gZGF0YXNldDtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIGZvciB0aWNrZXRzIG51bWJlciBhbmQgYXZlcmFnZSBwcmljZS5cclxuICogQ3JlYXRlcyBhIGRvbnV0IGNoYXJ0IHJlcHJlc2VudGluZyB0aGUgcGFydGlhbCByZWxhdGlvbnNoaXAgYW5kIHRleHQgZWxlbWVudC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBhbmQgY3JlYXRlcyB0aGUgdmlzdWFsaXphdGlvbi5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIHZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aXNJZCBpZCBvZiB0aGUgdmlzdWFsaXphdGlvbiBwYW5lbFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZmlsbCBjb2xvciB1c2VkIGZvciBhcmNzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdGlja2V0KGRhdGEsIHBhcmFtLCB2aXNJZCwgY29sb3IpIHtcclxuXHR2YXIgdmlzID0ge307XHJcblx0dmlzLnVwZGF0ZSA9IHVwZGF0ZUNoYXJ0O1xyXG5cdHZpcy5wYXJhbSA9IHBhcmFtO1xyXG5cclxuXHR2YXIgY29sb3JUeXBlO1xyXG5cdFxyXG5cdHZhciBzdmc7XHJcblxyXG5cdHZhciBwaWU7XHJcblx0dmFyIGFyYztcclxuXHR2YXIgcGF0aDtcclxuXHJcblx0dmFyIHBlcmNlbnRhZ2U7XHJcblx0dmFyIGV4YWN0VmFsdWU7XHJcblxyXG5cdHZhciBhbGxJdGVtcztcclxuXHR2YXIgcGFydEl0ZW1zO1xyXG5cclxuXHR2YXIgaW5pdGlsaXplZCA9IGZhbHNlO1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRjcmVhdGVWaXMoZGF0YSk7XHJcblxyXG5cdGluaXRpbGl6ZWQgPSB0cnVlO1xyXG5cclxuXHRyZXR1cm4gdmlzO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplcyBhbGwgbmVlZGVkIHZhcmlhYmxlcyBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5pdChkYXRhKSB7XHJcblx0XHRtYXJnaW4gPSB7dG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAxMCwgbGVmdDogNX07XHJcblx0XHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdFx0aGVpZ2h0ID0gMTMwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG5cdFx0Y29sb3JUeXBlID0gZDMuc2NhbGUub3JkaW5hbCgpXHRcdFx0XHJcblx0XHRcdC5yYW5nZShbY29sb3IsICdyZ2JhKDAsMCwwLC4zKSddKVxyXG5cclxuXHRcdHN2ZyA9IGQzLnNlbGVjdCgnIycrdmlzSWQpXHJcblx0XHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIHdpZHRoLzIgKycsJysgKGhlaWdodC8yLW1hcmdpbi5ib3R0b20pICsnKScpO1xyXG5cclxuXHRcdGFyYyA9IGQzLnN2Zy5hcmMoKVxyXG5cdFx0XHQub3V0ZXJSYWRpdXMoNTAgLSAxMClcclxuXHRcdFx0LmlubmVyUmFkaXVzKDUwIC0gMjApO1xyXG5cclxuXHRcdHBpZSA9IGQzLmxheW91dC5waWUoKVxyXG5cdFx0XHQuc29ydChudWxsKVxyXG5cdFx0XHQudmFsdWUoZCA9PiBkLnZhbHVlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgdGhlIHZpc3VhbGl6YXRpb24gLSBwaWUgY2hhcnQgYW5kIHRleHQgdmFsdWVzIC0gcGVyY2VudGFnZSBhbmQgZXhhY3QgdmFsdWUuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YXNldCBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjcmVhdGVWaXMoZGF0YXNldCkge1xyXG5cdFx0Ly8gdXBkYXRlIGRhdGEgYWNjb3JkaW5nIHRvIGNoYW5nZVxyXG5cdFx0ZGF0YSA9IHVwZGF0ZURhdGEoZGF0YXNldCwgcGFyYW0pO1x0XHRcclxuXHJcblx0XHQvLyB1cGRhdGUgdGhlIGNoYXJ0XHJcblx0XHRwYXRoID0gc3ZnLnNlbGVjdEFsbCgnLmFyYy0nK3BhcmFtKVxyXG5cdFx0XHQuZGF0YShkYXRhKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdwYXRoJylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYXJjLScrcGFyYW0pXHRcdFx0XHJcblx0XHRcdFx0LmF0dHIoJ2QnLCBhcmMpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAoZCwgaSkgPT4gY29sb3JUeXBlKGkpKVxyXG5cdFx0XHRcdC5lYWNoKCBmdW5jdGlvbiAoZCkgeyB0aGlzLl9jdXJyZW50ID0gZCB9KTtcdFx0XHJcblxyXG5cdFx0Ly8gdXBkYXRlXHJcblx0XHRwZXJjZW50YWdlID0gc3ZnLnNlbGVjdEFsbCgnLnBlcmMtJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoW2RhdGFbMF1dKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAncGVyYy0nK3BhcmFtKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgLTE1IClcclxuXHRcdFx0XHQuYXR0cigneScsIDUgKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQudGV4dCggcGVyY2VudCApO1xyXG5cclxuXHRcdGV4YWN0VmFsdWUgPSBzdmcuc2VsZWN0QWxsKCcuZXh2YWwtJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoW2RhdGFbMF1dKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnZXh2YWwtJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIC0xNSApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCA2NSApXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdmb250LXNpemUnLCAxOClcclxuXHRcdFx0XHQudGV4dCggcm91bmRWYWx1ZSApO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgY2hhcnQgYW5kIGFsbCB0ZXh0IHZhbHVlcyBhY2NvcmRpbmcgdG8gbmV3IGdpdmVuIGRhdGEuIFxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZUNoYXJ0KGRhdGFzZXQpIHtcclxuXHJcblx0XHR2YXIgZGF0YSA9IHVwZGF0ZURhdGEoZGF0YXNldCk7XHJcblxyXG5cdFx0Ly8gY29tcHV0ZSB0aGUgbmV3IGFuZ2xlc1xyXG5cdFx0cGF0aCA9IHBhdGguZGF0YSggZGF0YSApO1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBhcmNzXHJcblx0XHRwYXRoLnRyYW5zaXRpb24oKS5hdHRyVHdlZW4oJ2QnLCBhcmNUd2Vlbik7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHRleHQgLSBwZXJjZW50YWdlIG51bWJlclxyXG5cdFx0cGVyY2VudGFnZS5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LnRleHQoIHBlcmNlbnQgKTtcclxuXHJcblx0XHQvLyB1cGRhdGUgdGV4dCAtIGV4YWN0IHZhbHVlIG51bWJlclxyXG5cdFx0ZXhhY3RWYWx1ZS5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LnRleHQoIHJvdW5kVmFsdWUgKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN0b3JlIHRoZSBkaXNwbGF5ZWQgYW5nbGVzIGluIF9jdXJyZW50LlxyXG5cdFx0ICogVGhlbiwgaW50ZXJwb2xhdGUgZnJvbSBfY3VycmVudCB0byB0aGUgbmV3IGFuZ2xlcy5cclxuXHRcdCAqIER1cmluZyB0aGUgdHJhbnNpdGlvbiwgX2N1cnJlbnQgaXMgdXBkYXRlZCBpbi1wbGFjZSBieSBkMy5pbnRlcnBvbGF0ZS5cclxuXHRcdCAqXHJcblx0XHQgKiBjb2RlIHRha2VuIGZyb206IGh0dHBzOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMTM0NjQxMFxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBhcmNUd2VlbihhKSB7XHJcblx0XHRcdHZhciBpID0gZDMuaW50ZXJwb2xhdGUodGhpcy5fY3VycmVudCwgYSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLl9jdXJyZW50ID0gaSgwKTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbih0KSB7XHJcblx0XHRcdFx0cmV0dXJuIGFyYyhpKHQpKTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSBmb3IgdGhlIHZpc3VhbGl6YXRpb24gaW4gdGhlIGZvcm0gb2YgYXJyYXkgb2YgdHdvIG9iamVjdHNcclxuXHQgKiB3aGVyZSBmaXJzdCBvYmplY3QgcmVwcmVzZW50cyBhIHBhcnQgb2YgdGhlIHdob2xlIGFuZCB0aGUgc2Vjb25kIG9iamVjdHMgcmVwcmVzZW50cyB0aGUgcmVzdCBvZiB0aGUgd2hvbGUuXHJcblx0ICogVGhlIHdob2xlIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIGEgcGFyYW1ldGVyLCBlLmcuIHRoZSB3aG9sZSBjYW4gYmUgbnVtYmVyIG9mIHRpY2tldHMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIFxyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBwaWVkRGF0YSBhcnJheSBvZiBvYmplY3RzIGFzIHJldHVybmVkIGZyb20gZDMucGllIGZ1bmN0aW9uXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlRGF0YShkYXRhKSB7XHJcblx0XHR2YXIgZGF0YXNldDtcclxuXHJcblx0XHRpZiAodmlzLnBhcmFtID09PSAnZmFyZScpIHtcclxuXHJcblx0XHRcdGlmICghaW5pdGlsaXplZCkge1xyXG5cdFx0XHRcdGFsbEl0ZW1zID0gYXZnUHJpY2UoZGF0YSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHBhcnRJdGVtcyA9IGF2Z1ByaWNlKGRhdGEpO1x0XHRcdFxyXG5cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZiAoIWluaXRpbGl6ZWQpIHtcclxuXHRcdFx0XHRhbGxJdGVtcyA9IGRhdGFbcGFyYW1dO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJ0SXRlbXMgPSBkYXRhW3BhcmFtXTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGFsbEl0ZW1zID09PSBwYXJ0SXRlbXMpIHtcclxuXHRcdFx0ZGF0YXNldCA9IFt7IHZhbHVlOiBhbGxJdGVtcyB9LCB7IHZhbHVlOiAwIH1dO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZGF0YXNldCA9IFt7IHZhbHVlOiBwYXJ0SXRlbXMgfSwgeyB2YWx1ZTogYWxsSXRlbXMgLSBwYXJ0SXRlbXMgfV07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHBpZShkYXRhc2V0KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZvcm1hdHMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBvYmplY3QgLSBlaXRoZXIgYXMgYSBudW1iZXIgd2l0aCBjdXJyZW5jeSBvciBqdXN0IGEgbnVtYmVyLiBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkIGRhdGEgb2JqZWN0XHJcblx0ICogQHJldHVybiB7c3RyaW5nfSByb3VuZFZhbHVlIGZvcm1hdHRlZCB2YWx1ZVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHJvdW5kVmFsdWUoZCkge1xyXG5cdFx0aWYgKHZpcy5wYXJhbSA9PT0gJ2ZhcmUnKSB7XHJcblx0XHRcdHJldHVybiBudW1lcmFsKGQudmFsdWUpLmZvcm1hdCgnJDAsMCcpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIG51bWVyYWwoZC52YWx1ZSkuZm9ybWF0KCcwLDAnKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZvcm1hdHMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBvYmplY3QgaW50byBhIHJvdW5kZWQgcGVyY2VudGFnZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkIGRhdGEgb2JqZWN0XHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBwZXJjZW50IGZvcm1hdHRlZCBzdHJpbmdcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBwZXJjZW50KGQpIHtcclxuXHRcdHZhciBwZXJjZW50ID0gZC52YWx1ZS9hbGxJdGVtcyoxMDA7XHJcblx0XHRyZXR1cm4gTWF0aC5yb3VuZChwZXJjZW50KSsnJSc7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgYXZlcmFnZSBwcmljZSBvZiB0aWNrZXRzIGZyb20gZ2l2ZW4gZGF0YSAtIHN1bSBvZiBhbGwgZmFyZXMgb3ZlciBudW1iZXIgb2YgYWxsIHRpY2tldHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICogQHJldHVybiB7bnVtYmVyfSBhdmdQcmljZVxyXG4gKi9cclxuZnVuY3Rpb24gYXZnUHJpY2UoZGF0YSkge1xyXG5cdFxyXG5cdHZhciBwcmljZVN1bSA9IGRhdGEucmVkdWNlKCAoYSwgYikgPT4gYSArIGIuZmFyZSwgMCApO1xyXG5cdFxyXG5cdHZhciB0aWNrZXROdW0gPSBkYXRhLmxlbmd0aDtcclxuXHJcblx0cmV0dXJuIHByaWNlU3VtIC8gdGlja2V0TnVtO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nIGZvciBnaXZlbiBlbGVtZW50LlxyXG4gKiBDcmVhdGVzIGZpdmUgYmFyIGNoYXJ0cyBzdGF0aW5nIHRoZSB0b3AgZWxlbWVudHMgd2hpY2ggc3BlbmQgdGhlIG1vc3QuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dW5pcVZhbHVlcywgY2FsY1NwZW5kaW5nfSBmcm9tICcuL3Zpcy11dGlsJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGFuZCBjcmVhdGVzIHRoZSB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgdmlzdWFsaXphdGlvbiBvZiB0b3Agc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHZpc0lkIGlkIG9mIHRoZSB2aXN1YWxpemF0aW9uIHBhbmVsXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBmaWxsIGNvbG9yIHVzZWQgZm9yIGFsbCByZWN0YW5nbGVzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXhOdW1iZXIgbnVtYmVyIG9mIHBhcmFtIGRpc3BsYXllZFxyXG4gKiBAcGFyYW0ge251bWJlcn0gcGFuZWxIZWlnaHQgaGVpZ2h0IG9mIHRoZSBTVkcgcGFuZWxcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b3BTcGVuZGluZyhkYXRhLCBwYXJhbSwgdmlzSWQsIGNvbG9yLCBtYXhOdW1iZXIsIHBhbmVsSGVpZ2h0KSB7XHJcblxyXG5cdHZhciB2aXMgPSB7fTtcclxuXHR2aXMudXBkYXRlID0gdXBkYXRlVG9wU3BlbmRpbmc7XHRcclxuXHJcblx0dmFyIHhTY2FsZTtcclxuXHR2YXIgeVNjYWxlO1xyXG5cdHZhciBzdmc7XHJcblxyXG5cdC8vIGNhbGN1bGF0ZSBkYXRhLCBpbml0aWFsaXplIGFuZCBkcmF3IGNoYXJ0XHJcblx0dmFyIHRvcERhdGEgPSBjYWxjVG9wKGRhdGEpO1xyXG5cclxuXHRpbml0KHRvcERhdGEpO1xyXG5cclxuXHRjcmVhdGVCYXJDaGFydCh0b3BEYXRhKTtcclxuXHJcblx0cmV0dXJuIHZpcztcclxuXHJcblx0LyoqXHJcblx0ICogRmlyc3RseSwgY2FsY3VsYXRlcyB0aGUgbmV3IHRvcCBkYXRhIGFuZCB0aGVuIHVwZGF0ZXMgdGhlIGJhciBjaGFydCBhbmQgdGV4dCB2YWx1ZXMgYWNjb3JkaW5nIHRvIG5ldyBkYXRhLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZVRvcFNwZW5kaW5nKGRhdGEpIHtcdFxyXG5cdFx0dXBkYXRlKGNhbGNUb3AoZGF0YSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0b3AgZml2ZSBpdGVtcyBmcm9tIGRhdGEgYWNjb3JkaW5nIHRvIHNwZW5kaW5nIChmYXJlKSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICogQHJldHVybiB7YXJyYXl9IGRhdGFzZXQgdXBkYXRlZCBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjYWxjVG9wKGRhdGEpIHtcclxuXHRcdHJldHVybiBjYWxjU3BlbmRpbmcoZGF0YSwgcGFyYW0pLnNvcnQoIChhLCBiKSA9PiBiLmZhcmUgLSBhLmZhcmUgKS5zbGljZSgwLG1heE51bWJlcik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplcyBhbGwgbmVlZGVkIHZhcmlhYmxlcyBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5pdChkYXRhKSB7XHJcblx0XHRtYXJnaW4gPSB7dG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiA1fTtcclxuXHRcdHdpZHRoID0gMjYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0XHRoZWlnaHQgPSBwYW5lbEhlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuXHRcdHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0XHQuZG9tYWluKGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKVxyXG5cdFx0XHQucmFuZ2VSb3VuZEJhbmRzKFswLCBoZWlnaHRdLCAuMSk7XHJcblxyXG5cdFx0eFNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcclxuXHRcdFx0LmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSlcclxuXHRcdFx0LnJhbmdlKFsgMCwgd2lkdGggXSk7XHJcblxyXG5cdFx0c3ZnID0gZDMuc2VsZWN0KCcjJyt2aXNJZClcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgbWFyZ2luLmxlZnQgKycsJysgbWFyZ2luLnRvcCArJyknKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYmFyIGNoYXJ0IGFuZCBhIHRvb2x0aXAuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1x0XHRcclxuXHJcblx0XHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdFx0dGlwID0gZDMudGlwKClcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gJzxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC5mYXJlKS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+XFxcclxuXHRcdFx0XHRcdDxici8+PHNwYW4gY2xhc3M9XCJudW1iZXJcIj4nK251bWVyYWwoZC52YWx1ZXMubGVuZ3RoKS5mb3JtYXQoJzAsMCcpKycgdGlja2V0czwvc3Bhbj4nOyBcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0XHQvLyBjcmVhdGUgYmFyIGNoYXJ0c1xyXG5cdFx0dXBkYXRlKGRhdGEpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgdGhlIGJhciBjaGFydCB2aXN1YWxpemF0aW9uIHdpdGggYWxsIG5hbWVzIGFuZCBmYXJlIHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0czsgZS5nLiBbIHsgZmFyZTogeCwgb3RoZXJQYXJhbTogYSB9LCB7IGZhcmU6IHksIG90aGVyUGFyYW06IGIgfSwgLi4uIF1cclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGUoZGF0YSkge1xyXG5cdFx0Ly8gdXBkYXRlIHNjYWxlIHNvIHJlbGF0aXZlIGRpZmZlcmVuY2llcyBjYW4gYmUgc2VlblxyXG5cdFx0eFNjYWxlLmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSk7XHJcblxyXG5cdFx0Ly8gZHJhdyByZWN0YW5nbGUgcmVwcmVzZW50aW5nIHNwZW5kaW5nXHJcblx0XHR2YXIgYmFycyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0YmFycy50cmFuc2l0aW9uKClcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUoZC5mYXJlKSk7XHJcblxyXG5cdFx0YmFycy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4gMClcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGRbcGFyYW1dKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUoZC5mYXJlKSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsIGNvbG9yKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW91dCcsIHRpcC5oaWRlKTtcclxuXHJcblx0XHRiYXJzLmV4aXQoKS5yZW1vdmUoKTtcclxuXHJcblx0XHQvLyBkcmF3IHRleHQgdG8gdGhlIGxlZnQgb2YgZWFjaCBiYXIgcmVwcmVzZW50aW5nIHRoZSBuYW1lXHJcblx0XHR2YXIgbmFtZXMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0rJy1uYW1lJylcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0bmFtZXMudHJhbnNpdGlvbigpXHJcblx0XHRcdC50ZXh0KGQgPT4gZFtwYXJhbV0pO1xyXG5cclxuXHRcdG5hbWVzLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2Jhci0nK3BhcmFtKyctbmFtZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZFtwYXJhbV0pKVxyXG5cdFx0XHRcdC5hdHRyKCdkeScsICh5U2NhbGUucmFuZ2VCYW5kKCkvNCkqMylcclxuXHRcdFx0XHQuYXR0cignZHgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQudGV4dChkID0+IGRbcGFyYW1dKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW91dCcsIHRpcC5oaWRlKTtcclxuXHJcblx0XHRuYW1lcy5leGl0KCkucmVtb3ZlKCk7XHJcblxyXG5cdFx0Ly8gZHJhdyB0ZXh0IHRvIHRoZSByaWdodCBvZiBlYWNoIGJhciByZXByZXNlbnRpbmcgdGhlIHJvdW5kZWQgc3BlbmRpbmdcclxuXHRcdHZhciBmYXJlcyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSsnLWZhcmUnKVxyXG5cdFx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0XHRmYXJlcy50cmFuc2l0aW9uKClcclxuXHRcdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0XHRmYXJlcy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSsnLWZhcmUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4Jywgd2lkdGgtMzUpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkW3BhcmFtXSkpXHJcblx0XHRcdFx0LmF0dHIoJ2R5JywgKHlTY2FsZS5yYW5nZUJhbmQoKS80KSozKVxyXG5cdFx0XHRcdC5hdHRyKCdkeCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVx0XHRcdFx0XHJcblx0XHRcdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0XHRmYXJlcy5leGl0KCkucmVtb3ZlKCk7XHJcblx0fVxyXG59IiwiLyoqXHJcbiAqIEZpbmRzIG91dCB0aGUgdW5pcXVlIHZhbHVlcyBvZiBnaXZlbiBkYXRhIGZvciBnaXZlbiBwYXJhbWV0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgYWxsIHllYXIgc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIHBhcmFtZXRlciB3aGljaCBzaG91bGQgYmUgbG9va2VkIHVwXHJcbiAqIEByZXR1cm4ge2FycmF5fSB1bmlxdWVWYWx1ZXMgYXJyYXkgb2YgYWxsIHVuaXF1ZSB2YWx1ZXMgZm9yIGdpdmVuIHBhcmFtZXRlclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pIHtcclxuXHRyZXR1cm4gWyAuLi5uZXcgU2V0KGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSB3aG9sZSB5ZWFyJ3Mgc3BlbmRpbmcgZm9yIGEgZ2l2ZW4gcGFyYW0gKGUuZy4gc3VwcGxpZXIsIGRpcmVjdG9yYXRlKSBhbmQgcmV0dXJucyBpdCBpbiB1cGRhdGVkIGFycmF5IG9mIG9iamVjdHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtXHJcbiAqIEByZXR1cm4ge2FycmF5fSBhbGxTcGVuZGluZyBhcnJheSBvZiB1cGRhdGVkIG9iamVjdHMsIGUuZy4gWyB7ZmFyZTogeCwgcGFyYW06IGF9LCB7ZmFyZTogeSwgcGFyYW06IGJ9LCAuLi5dXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2FsY1NwZW5kaW5nKGRhdGEsIHBhcmFtKSB7XHJcblx0dmFyIHVuaXFJdGVtcyA9IHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pO1xyXG5cdFxyXG5cdHZhciBhbGxQYXJhbXMgPSB1bmlxSXRlbXMubWFwKCBpdGVtID0+IGRhdGEuZmlsdGVyKCBkID0+IGRbcGFyYW1dID09PSBpdGVtICkpO1xyXG5cclxuXHR2YXIgYWxsU3BlbmRpbmcgPSBbXTtcclxuXHJcblx0YWxsUGFyYW1zLmZvckVhY2goIGl0ZW1BcnJheSA9PiB7XHJcblx0XHR2YXIgb2JqID0ge307XHJcblxyXG5cdFx0b2JqWydmYXJlJ10gPSBpdGVtQXJyYXkucmVkdWNlKCAoYSxiKSA9PiBhICsgYi5mYXJlLCAwKTtcclxuXHRcdG9ialtwYXJhbV0gPSBpdGVtQXJyYXlbMF1bcGFyYW1dO1xyXG5cdFx0b2JqWyd2YWx1ZXMnXSA9IGl0ZW1BcnJheTtcclxuXHJcblx0XHRhbGxTcGVuZGluZy5wdXNoKG9iaik7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBhbGxTcGVuZGluZztcclxufSIsIi8qKlxyXG4gKiBNYWluIHZpc3VhbGl6YXRpb24gbW9kdWxlIGZvciBjcmVhdGluZyBjaGFydHMgYW5kIHZpcyBmb3IgcGFzc2VkIGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7c3BlbmRpbmd9IGZyb20gJy4vc3BlbmRpbmcnO1xyXG5pbXBvcnQge2Rpc3RyaWJ1dGlvbn0gZnJvbSAnLi9kaXN0cmlidXRpb24nO1xyXG5pbXBvcnQge3RvcFNwZW5kaW5nfSBmcm9tICcuL3RvcFNwZW5kaW5nJztcclxuaW1wb3J0IHt0aWNrZXR9IGZyb20gJy4vdGlja2V0JztcclxuaW1wb3J0IHtkZXN0aW5hdGlvbnN9IGZyb20gJy4vZGVzdGluYXRpb25zJztcclxuXHJcbnZhciBkYXRhO1xyXG5cclxuLypcclxudmFyIHBhbmVscyA9IFtcclxuXHR7aWQ6ICd2aXMtc3BlbmRpbmcnLCBmbjogc3BlbmRpbmcsIGFyZ3M6IFtkYXRhXX1cclxuXHRdO1xyXG4qL1xyXG52YXIgcGFuZWxzID0gW1xyXG5cdCd2aXMtc3BlbmRpbmcnLFxyXG5cdCd2aXMtZGlzdHJpYnV0aW9uJywgXHJcblx0J3Zpcy10aWNrZXQtbnVtJywgXHJcblx0J3Zpcy10aWNrZXQtYXZnJywgXHJcblx0J3Zpcy10b3Atc3VwJyxcclxuXHQndmlzLXRvcC1kaXInLCBcclxuXHQndmlzLWRlc3RpbmF0aW9ucycsXHJcblx0J3Zpcy10b3AxMC1zdXAnXHJcblx0XTtcclxuXHJcbnZhciBzdXA7XHJcbnZhciBkaXI7XHJcblxyXG52YXIgcHJpY2U7XHJcbnZhciBudW07XHJcblxyXG4vKipcclxuICpcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YXNldCBhcnJheSBvZiBvYmplY3RzIGZvciB2aXN1YWxpemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlzdWFsaXplKGRhdGFzZXQpe1x0XHJcblx0ZGF0YSA9IGRhdGFzZXQ7XHJcblxyXG5cdGRldGVjdFBhbmVscyhkYXRhKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGEgaXMgZmlyc3RseSBmaWx0ZXJlZCBhY2NvcmRpbmcgdG8gbW9udGggYW5kIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdGhlbiByZWRyYXduIHdpdGggdXBkYXRlZCBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbW9udGggc2VsZWN0ZWQgbW9udGggd2hpY2ggd2lsbCBiZSB1c2VkIGZvciBmaWx0ZXJpbmcgZGF0YVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZWRTcGVuZGluZyhtb250aCkge1xyXG5cdHZhciBkYXRhc2V0O1xyXG5cdFxyXG5cdGlmIChtb250aCkge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBvbmx5IGdpdmVuIG1vbnRoIGRhdGFcclxuXHRcdGRhdGFzZXQgPSBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyByZWRyYXcgYWxsIHBhbmVscyB3aXRoIGFsbCBtb250aHMgZGF0YVxyXG5cdFx0ZGF0YXNldCA9IGRhdGE7XHJcblx0fVxyXG5cclxuXHRzdXAudXBkYXRlKGRhdGFzZXQpO1xyXG5cdGRpci51cGRhdGUoZGF0YXNldCk7XHJcblx0bnVtLnVwZGF0ZShkYXRhc2V0KTtcclxuXHRwcmljZS51cGRhdGUoZGF0YXNldCk7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGRldGVjdFBhbmVscyhkYXRhKSB7XHJcblx0cGFuZWxzLmZvckVhY2goIHBhbmVsID0+IHtcclxuXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5lbCkpIHtcclxuXHRcdFx0c3dpdGNoIChwYW5lbCkge1xyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzBdOlxyXG5cdFx0XHRcdFx0c3BlbmRpbmcoZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbMV06XHJcblx0XHRcdFx0XHRkaXN0cmlidXRpb24oZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbMl06XHJcblx0XHRcdFx0XHRudW0gPSB0aWNrZXQoZGF0YSwgJ2xlbmd0aCcsIHBhbmVsc1syXSwgJyNkMDcyNWQnKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1szXTpcclxuXHRcdFx0XHRcdHByaWNlID0gdGlja2V0KGRhdGEsICdmYXJlJywgcGFuZWxzWzNdLCAnI2QyYTI0YycpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzRdOlxyXG5cdFx0XHRcdFx0c3VwID0gdG9wU3BlbmRpbmcoZGF0YSwgJ3N1cHBsaWVyJywgcGFuZWxzWzRdLCAnIzRiOTIyNicsIDUsIDEzMCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbNV06XHJcblx0XHRcdFx0XHRkaXIgPSB0b3BTcGVuZGluZyhkYXRhLCAnZGlyZWN0b3JhdGUnLCBwYW5lbHNbNV0sICcjYWY0YzdlJywgNSwgMTMwKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1s2XTpcclxuXHRcdFx0XHRcdGRlc3RpbmF0aW9ucyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1s3XTpcclxuXHRcdFx0XHRcdHN1cCA9IHRvcFNwZW5kaW5nKGRhdGEsICdzdXBwbGllcicsIHBhbmVsc1s3XSwgJyM0YjkyMjYnLCAxMCwgMzIwKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0fVxyXG5cdFx0fVx0XHRcclxuXHR9KTtcclxufSJdfQ==
