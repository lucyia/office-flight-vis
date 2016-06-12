(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.destinations = destinations;
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
function destinations(data) {

  init(data);
}

/**
 * Sets up all scales and attributes acc. to given data and creates a svg panel.
 *
 * @param {array} data array of objects representing each spending
 */
function init(data) {

  margin = { top: 10, right: 35, bottom: 30, left: 10 };
  width = 810 - margin.left - margin.right;
  height = 500 - margin.top - margin.bottom;
}

},{}],2:[function(require,module,exports){
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
 */
function topSpending(data, param, visId, color) {

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
		}).slice(0, 5);
	}

	/**
  * Initializes all needed variables for visualization and creates a SVG panel. 
  *
  * @param {array} data
  */
	function init(data) {
		margin = { top: 0, right: 0, bottom: 0, left: 5 };
		width = 260 - margin.left - margin.right;
		height = 130 - margin.top - margin.bottom;

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
		}).attr('dy', 17).attr('dx', 5).attr('fill', 'white').text(function (d) {
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
		}).attr('dy', 17).attr('dx', 5).attr('fill', 'white').text(function (d) {
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

var data; /**
           * Main visualization module for creating charts and vis for passed data.
           *
           * @author lucyia <ping@lucyia.com>
           * @version 0.1
           */

var panels = ['vis-spending', 'vis-distribution', 'vis-ticket-num', 'vis-ticket-avg', 'vis-top-sup', 'vis-top-dir', 'vis-destinations'];

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
					sup = (0, _topSpending.topSpending)(data, 'supplier', panels[4], '#4b9226');
					break;

				case panels[5]:
					dir = (0, _topSpending.topSpending)(data, 'directorate', panels[5], '#af4c7e');
					break;

				case panels[6]:
					(0, _destinations.destinations)(data);
					break;
			}
		}
	});
}

},{"./destinations":1,"./distribution":2,"./spending":4,"./ticket":5,"./topSpending":6}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGVzdGluYXRpb25zLmpzIiwianNcXGRpc3RyaWJ1dGlvbi5qcyIsImpzXFxpbml0LmpzIiwianNcXHNwZW5kaW5nLmpzIiwianNcXHRpY2tldC5qcyIsImpzXFx0b3BTcGVuZGluZy5qcyIsImpzXFx2aXMtdXRpbC5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ21CZ0IsWSxHQUFBLFk7Ozs7Ozs7Ozs7QUFWaEIsSUFBSSxNQUFKO0FBQ0EsSUFBSSxLQUFKO0FBQ0EsSUFBSSxNQUFKOzs7QUFHQSxJQUFJLEdBQUo7Ozs7O0FBS08sU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCOztBQUVsQyxPQUFLLElBQUw7QUFFQTs7Ozs7OztBQU9ELFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0I7O0FBRW5CLFdBQVMsRUFBQyxLQUFLLEVBQU4sRUFBVSxPQUFPLEVBQWpCLEVBQXFCLFFBQVEsRUFBN0IsRUFBaUMsTUFBTSxFQUF2QyxFQUFUO0FBQ0EsVUFBUSxNQUFNLE9BQU8sSUFBYixHQUFvQixPQUFPLEtBQW5DO0FBQ0EsV0FBUyxNQUFNLE9BQU8sR0FBYixHQUFtQixPQUFPLE1BQW5DO0FBRUE7Ozs7Ozs7O1FDZmUsWSxHQUFBLFk7Ozs7Ozs7Ozs7QUFaaEIsSUFBSSxNQUFKO0FBQ0EsSUFBSSxLQUFKO0FBQ0EsSUFBSSxNQUFKOzs7QUFHQSxJQUFJLEdBQUo7O0FBRUEsSUFBSSxHQUFKO0FBQ0EsSUFBSSxHQUFKOztBQUVBLElBQUksS0FBSjs7QUFFTyxTQUFTLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEI7O0FBRWxDLE9BQUssSUFBTDtBQUVBOztBQUVELFNBQVMsSUFBVCxDQUFjLElBQWQsRUFBb0I7QUFDbkIsV0FBUyxFQUFDLEtBQUssRUFBTixFQUFVLE9BQU8sRUFBakIsRUFBcUIsUUFBUSxFQUE3QixFQUFpQyxNQUFN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Q0FBUCxDQUFMO0FBQ0MsYUFBUSxvQkFBTyxJQUFQLEVBQWEsTUFBYixFQUFxQixPQUFPLENBQVAsQ0FBckIsRUFBZ0MsU0FBaEMsQ0FBUjtBQUNBOztBQUVELFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyxXQUFNLDhCQUFZLElBQVosRUFBa0IsVUFBbEIsRUFBOEIsT0FBTyxDQUFQLENBQTlCLEVBQXlDLFNBQXpDLENBQU47QUFDQTs7QUFFRCxTQUFLLE9BQU8sQ0FBUCxDQUFMO0FBQ0MsV0FBTSw4QkFBWSxJQUFaLEVBQWtCLGFBQWxCLEVBQWlDLE9BQU8sQ0FBUCxDQUFqQyxFQUE0QyxTQUE1QyxDQUFOO0FBQ0E7O0FBRUQsU0FBSyxPQUFPLENBQVAsQ0FBTDtBQUNDLHFDQUFhLElBQWI7QUFDQTtBQTNCRjtBQTZCQTtBQUNELEVBaENEO0FBaUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIGRlcGFydHVyZXMgYW5kIGRlc3RpbmF0aW9ucy5cclxuICogQ3JlYXRlcyBhIGN1c3RvbSB2aXN1YWxpemF0aW9uIGRlcGljdGluZyBjb3VudHJpZXMgb2YgZGVzdGluYXRpb25zIGFuZCBkZXBhcnR1cmVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSB0aGF0IGlzIG1vcmUgc3VpdGFibGUgZm9yIHdvcmtpbmcgd2l0aGluIHZpc3VhbGl6YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVzdGluYXRpb25zKGRhdGEpIHtcclxuXHJcblx0aW5pdChkYXRhKTtcclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGFsbCBzY2FsZXMgYW5kIGF0dHJpYnV0ZXMgYWNjLiB0byBnaXZlbiBkYXRhIGFuZCBjcmVhdGVzIGEgc3ZnIHBhbmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGVhY2ggc3BlbmRpbmdcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMzUsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDUwMCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIGRhdGEgZGlzdHJpYnV0aW9uLlxyXG4gKiBDcmVhdGVzIGEgYm94LWFuZC13aGlza2V5IHBsb3QgZnJvbSBnaXZlbiBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG52YXIgbWluO1xyXG52YXIgbWF4O1xyXG5cclxudmFyIGNoYXJ0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RyaWJ1dGlvbihkYXRhKSB7XHJcblx0XHJcblx0aW5pdChkYXRhKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxufSIsIi8qKlxyXG4gKiBJbml0aWFsaXphdGlvbiBvZiBhbGwgbW9kdWxlcyBcclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt2aXN1YWxpemV9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbihmdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn0pKGluaXQpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHJlYWRpbmcgb2YgZmlsZSBhbmQgdGhlbiB2aXN1YWxpemF0aW9uIHByb2Nlc3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KCl7XHJcblxyXG5cdC8vIHNldHVwIG51bWVyYWwgZm9yIGNvcnJlY3QgbnVtYmVyIGZvcm1hdHRpbmdcclxuXHRudW1lcmFsLmxhbmd1YWdlKCdlbi1nYicpO1xyXG5cclxuXHQvLyBwYXJzZSBmaWxlXHJcblx0ZDMuY3N2KCdIb21lX09mZmljZV9BaXJfVHJhdmVsX0RhdGFfMjAxMS5jc3YnKVxyXG5cdFx0LnJvdyggZCA9PiB7IFxyXG5cdFx0XHRyZXR1cm4geyBcclxuXHRcdFx0XHRkZXBhcnR1cmU6IGQuRGVwYXJ0dXJlLCBcclxuXHRcdFx0XHRkZXN0aW5hdGlvbjogZC5EZXN0aW5hdGlvbiwgXHJcblx0XHRcdFx0ZGlyZWN0b3JhdGU6IGQuRGlyZWN0b3JhdGUsIFxyXG5cdFx0XHRcdG1vbnRoOiBkLkRlcGFydHVyZV8yMDExLCBcclxuXHRcdFx0XHRmYXJlOiBwYXJzZUZsb2F0KGQuUGFpZF9mYXJlKSwgXHJcblx0XHRcdFx0dGlja2V0OiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiwgXHJcblx0XHRcdFx0c3VwcGxpZXI6IGQuU3VwcGxpZXJfbmFtZSBcclxuXHRcdFx0fTtcclxuXHRcdH0pXHJcblx0XHQuZ2V0KCAoZXJyb3IsIGRhdGEpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSBjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHJcblx0XHRcdHZpc3VhbGl6ZShkYXRhKTtcclxuXHRcdH0pO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgbW9udGhseSBzcGVuZGluZy5cclxuICogQ3JlYXRlcyBhIGJhciBjaGFydCBmcm9tIGdpdmVuIGRhdGEgYW5kIGFkZHMgbGlzdGVuZXJzIGZvciBmaWx0ZXJpbmcgb25lIG1vbnRoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXN9IGZyb20gJy4vdmlzLXV0aWwnO1xyXG5pbXBvcnQge3VwZGF0ZWRTcGVuZGluZ30gZnJvbSAnLi92aXN1YWxpemUnO1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG4vLyBub2RlIGZvciBjcmVhdGVkIGZpbHRlclxyXG52YXIgZmlsdGVyO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIHBvc2l0aW9uaW5nIGVsZW1lbnRzIGluIHggZGlyZWN0aW9uXHJcbnZhciB4U2NhbGU7XHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB5IGRpcmVjdGlvblxyXG52YXIgeVNjYWxlO1xyXG5cclxuLy8gbW9udGggYXhpc1xyXG52YXIgeEF4aXM7XHJcbi8vIG51bWJlciBheGlzXHJcbnZhciB5QXhpcztcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBiaW5kaW5nIGEgY29sb3IgdG8gYSB0aWNrZXQgdHlwZVxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLy8gc2NhbGUgZm9yIHN0YWNraW5nIHJlY3RhbmdsZXNcclxudmFyIHN0YWNrO1xyXG5cclxuLy8gdHJhbnNmb3JtZWQgZGF0YVxyXG52YXIgZGF0YXNldDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIGRhdGFzZXQgZnJvbSBnaXZlbiBkYXRhIHRoYXQgaXMgbW9yZSBzdWl0YWJsZSBmb3Igd29ya2luZyB3aXRoaW4gdmlzdWFsaXphdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcGVuZGluZyhkYXRhKSB7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGRhdGFzZXQgPSBzcGVuZGluZ0RhdGFzZXQoZGF0YSk7XHJcblx0XHJcblx0Y3JlYXRlQmFyQ2hhcnQoZGF0YXNldCk7XHJcblxyXG5cdGNyZWF0ZUxlZ2VuZChkYXRhc2V0KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldHMgdXAgYWxsIHNjYWxlcyBhbmQgYXR0cmlidXRlcyBhY2MuIHRvIGdpdmVuIGRhdGEgYW5kIGNyZWF0ZXMgYSBzdmcgcGFuZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgZWFjaCBzcGVuZGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaW5pdChkYXRhKSB7XHRcclxuXHJcblx0bWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAzNSwgYm90dG9tOiAzMCwgbGVmdDogMTB9O1xyXG5cdHdpZHRoID0gODEwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0aGVpZ2h0ID0gMzQ1IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblx0XHJcblx0eFNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddKVxyXG5cdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgd2lkdGhdLCAuMDUpO1xyXG5cclxuXHQvLyByb3VuZCB0aGUgbWF4aW11bSB2YWx1ZSBmcm9tIGRhdGEgdG8gdGhvdXNhbmRzXHJcblx0dmFyIHJvdW5kZWRNYXggPSBNYXRoLnJvdW5kKCBNYXRoLm1heCguLi5tb250aEZhcmVzKGRhdGEpKSAvIDEwMDAgKSAqIDEwMDA7XHJcblx0eVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcclxuXHRcdC5kb21haW4oWyAwLCByb3VuZGVkTWF4IF0pXHJcblx0XHQucmFuZ2UoWyBoZWlnaHQsIDAgXSk7XHJcblxyXG5cdHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxyXG5cdFx0LnNjYWxlKHhTY2FsZSlcclxuXHRcdC5vcmllbnQoJ2JvdHRvbScpO1xyXG5cclxuXHR5QXhpcyA9IGQzLnN2Zy5heGlzKClcclxuXHRcdC5zY2FsZSh5U2NhbGUpXHJcblx0XHQub3JpZW50KCdyaWdodCcpXHJcblx0XHQudGlja0Zvcm1hdCggZCA9PiBudW1lcmFsKGQpLmZvcm1hdCgnMGEnKSk7XHJcblx0XHJcblx0Y29sb3IgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdC5kb21haW4odW5pcVZhbHVlcyhkYXRhLCAndGlja2V0JykpXHRcdFxyXG5cdFx0LnJhbmdlKFtcIiMwMGJjZDRcIiwgXCIjMWQ2ZGQwXCIsIFwiI2VkY2QwMlwiXSk7XHJcblxyXG5cdHN0YWNrID0gZDMubGF5b3V0LnN0YWNrKCk7XHJcblxyXG5cdHN2ZyA9IGQzLnNlbGVjdCgnI3Zpcy1zcGVuZGluZycpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgbWFyZ2luLmxlZnQgKycsJysgbWFyZ2luLnRvcCArJyknKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbW9udGhseSBzcGVuZGluZyBmb3IgYWxsIHRpY2tldCB0eXBlcyBhbmQgcmV0dXJucyB0aGUgY3JlYXRlZCBhcnJheS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbmRpbmcgYWxsIHllYXIgc3BlZG5pbmdcclxuXHQgKiBAcmV0dXJuIHthcnJheX0gc3VtTW9udGhseUZhcmVzIGFycmF5IG9mIG51bWJlcnMgcmVwcmVzZW50aW5nIGVhY2ggbW9udGhzIHNwZW5kaW5nIG9uIGFsbCB0aWNrZXRzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW9udGhGYXJlcyhkYXRhKSB7XHRcclxuXHRcdC8vIGdldCBhbGwgZmFyZXMgZm9yIGVhY2ggbW9udGhcclxuXHRcdHZhciBmYXJlcyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJykubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHRcdC8vIHN1bSB1cCBhbGwgZmFyZXMgaW4gZWFjaCBtb250aFxyXG5cdFx0dmFyIHN1bU1vbnRobHlGYXJlcyA9IGZhcmVzLm1hcCggZmFyZSA9PiBmYXJlLnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCkpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gc3VtTW9udGhseUZhcmVzO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBzdGFja2VkIGJhciBjaGFydCBhY2NvcmRpbmcgdG8gZ2l2ZW4gZGF0YS4gVGhlIGNoYXJ0IGhhcyBsYXllcnMgZm9yIGVhY2ggdGlja2V0IHR5cGUuXHJcbiAqIFRoZXJlIGFyZSBsaXN0ZW5lcnMgZm9yIGNyZWF0aW5nIGEgdG9vbHRpcCBhbmQgZmlsdGVyIGZvciBzZWxlY3Rpbmcgb25seSBvbmUgbW9udGguXHJcbiAqIFxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgaW4gdGhlIGZvcm0gb2YgXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVCYXJDaGFydChkYXRhKSB7XHJcblx0Ly8gY3JlYXRlIHN0YWNrZWQgZGF0YSBmb3IgdGhlIHZpc3VhbGl6YXRpb25cclxuXHRzdGFjayhkYXRhKTtcclxuXHJcblx0Ly8gY3JlYXRlIHRvb2x0aXAgYW5kIGNhbGwgaXRcclxuXHR0aXAgPSBkMy50aXAoKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHQuaHRtbCggZCA9PiB7XHJcblx0XHRcdHZhciBpbmRleCA9IGNvbG9yLnJhbmdlKCkuaW5kZXhPZihjb2xvcihkLnRpY2tldCkpO1xyXG5cdFx0XHRyZXR1cm4gJzxzcGFuIGNsYXNzPVwidHlwZSB0eXBlLScraW5kZXgrJ1wiPicrIGQudGlja2V0ICsnPC9zcGFuPlxcXHJcblx0XHRcdFx0PGJyLz48c3BhbiBjbGFzcz1cInZhbHVlXCI+JytudW1lcmFsKGQueSkuZm9ybWF0KCckMCwwJykgKyAnPC9zcGFuPlxcXHJcblx0XHRcdFx0PGJyLz48c3BhbiBjbGFzcz1cIm51bWJlclwiPicrbnVtZXJhbChkLnZhbHVlcy5sZW5ndGgpLmZvcm1hdCgnMCwwJykrJyB0aWNrZXRzPC9zcGFuPic7IFxyXG5cdFx0fSk7XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblxyXG5cdC8vIGNyZWF0ZSBhIHJlY3RhbmdsZSBhcyBhIGJhY2tncm91bmRcclxuXHR2YXIgYmFja2dyb3VuZCA9IHN2Zy5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ3N2Zy1iYWNrZ3JvdW5kJylcclxuXHRcdC5hdHRyKCd4JywgMClcclxuXHRcdC5hdHRyKCd5JywgMClcclxuXHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxyXG5cdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodClcclxuXHRcdC5hdHRyKCdmaWxsJywgJ3RyYW5zcGFyZW50JylcclxuXHRcdC5vbignY2xpY2snLCBkZXNlbGVjdCk7XHJcblxyXG5cdC8vIGNyZWF0ZSBncm91cCBmb3IgZWFjaCB0aWNrZXQgdHlwZVxyXG5cdHZhciBncm91cHMgPSBzdmcuc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgKGQsaSkgPT4gJ3RpY2tldC0nK2kgKTtcclxuXHJcblx0Ly8gY3JlYXRlIGJhcnMgZm9yIGVhY2ggdGlja2V0IGdyb3VwXHJcblx0Z3JvdXBzLnNlbGVjdEFsbCgnLmJhcicpXHJcblx0XHQuZGF0YSggZCA9PiBkIClcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2JhcicpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHlTY2FsZShkLnkwKSAtIHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSlcclxuXHRcdFx0Lm9uKCdtb3VzZW92ZXInLCBtb3VzZW92ZXIpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCBtb3VzZW91dClcclxuXHRcdFx0Lm9uKCdjbGljaycsIG1vdXNlY2xpY2spO1xyXG5cclxuXHRzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteCcpXHJcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyAwICsnLCcrIGhlaWdodCArJyknKVxyXG5cdFx0LmNhbGwoeEF4aXMpO1xyXG5cclxuXHRzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteScpXHJcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyB3aWR0aCArJywnKyAwICsnKScpXHJcblx0XHQuY2FsbCh5QXhpcyk7XHJcblxyXG5cdGZpbHRlciA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2ZpbHRlcicpO1xyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBmaWx0ZXIgY29udGFpbmluZyBzZWxlY3RlZCBtb250aCBhbmQgdXBkYXRlcyBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZGVzZWxlY3QoKSB7XHJcblxyXG5cdFx0dmFyIGZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ZpbHRlcicpWzBdO1xyXG5cclxuXHRcdGlmIChmaWx0ZXIuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdC8vIGRlbGV0ZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0XHRmaWx0ZXIucmVtb3ZlQ2hpbGQoZmlsdGVyLmNoaWxkTm9kZXNbMF0pO1xyXG5cclxuXHRcdFx0Ly8gdXBkYXRlIGFsbCBvdGhlciB2aXN1YWxpemF0aW9uc1xyXG5cdFx0XHR1cGRhdGVkU3BlbmRpbmcoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBmaWx0ZXIgZm9yIGEgd2hvbGUgbW9udGggYWZ0ZXIgdGhlIHVzZXIgY2xpY2tzIG9uIGFueSB0aWNrZXQgdGlja2V0IHR5cGUuIFRoZSBmaWx0ZXIgaXMgcmVwcmVzZW50ZWQgd2l0aCBhIHdoaXRlLWJvcmRlcmVkIHJlY3RhbmdsZS5cclxuXHQgKiBBbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMgYXJlIHVwZGF0ZWQgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIG1vbnRoLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZWNsaWNrKGRhdGEpIHtcclxuXHRcdC8vIHVwZGF0ZSBvdGhlciB2aXN1YWxpemF0aW9ucyBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgbW9udGhcclxuXHRcdHVwZGF0ZWRTcGVuZGluZyhkYXRhLngpO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgdGlja2V0IHR5cGVzIGZvciBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHRpY2tldHNNb250aCA9IGRhdGFzZXQubWFwKCB0aWNrZXRzID0+IHRpY2tldHMuZmlsdGVyKCBkID0+IGQueCA9PT0gZGF0YS54ICkpO1xyXG5cclxuXHRcdC8vIGZsYXR0ZW4gdGhlIGFycmF5XHJcblx0XHR0aWNrZXRzTW9udGggPSBbXS5jb25jYXQuYXBwbHkoW10sIHRpY2tldHNNb250aCk7XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRoZSBoZWlnaHQgYW5kIHN0YXJ0aW5nIHBvaW50IG9mIG1vbnRocyBiYXJcclxuXHRcdHZhciB5MCA9IHRpY2tldHNNb250aFswXS55MDtcclxuXHRcdHZhciBiYXJIZWlnaHQgPSB0aWNrZXRzTW9udGgucmVkdWNlKCAoYSwgYikgPT4gYSArIGIueSwgMCk7XHJcblx0XHRcclxuXHRcdC8vIGNyZWF0ZSBhbmQgdXBkYXRlIHJlY3RhbmdsZSBmb3IgaGlnaGxpZ2h0aW5nIHRoZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHNlbGVjdGVkID0gZmlsdGVyLnNlbGVjdEFsbCgnLnNlbGVjdGVkJylcclxuXHRcdFx0LmRhdGEoW2RhdGFdKTtcclxuXHJcblx0XHRzZWxlY3RlZC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdzZWxlY3RlZCcpXHRcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgMylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpaGdsaWdodCB0aGUgaG92ZXJlZCBlbGVtZW50IGFuZCBzaG93cyB0b29sdGlwLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZW92ZXIoZCkge1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBkMy5yZ2IoY29sb3IoZC50aWNrZXQpKS5icmlnaHRlciguNSkpO1xyXG5cclxuXHRcdHRpcC5zaG93KGQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIHRoZSBjb2xvciBvZiB0aGUgZWxlbWVudCBhbmQgaGlkZXMgdGhlIHRvb2x0aXAuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdXQoKSB7XHRcdFxyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpO1xyXG5cclxuXHRcdHRpcC5oaWRlKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGxlZ2VuZCBmb3IgdGhlIHNwZW5kaW5nIHZpc3VhbGl6YXRpb24uXHJcbiAqIEZvciBlYWNoIHRpY2tldCB0eXBlIGEgcmVjdGFuZ2xlIGFuZCBhIHRleHQgbGFiZWwgaXMgY3JlYXRlZC5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlTGVnZW5kKGRhdGEpIHtcclxuXHJcblx0Ly8gcmVjdGFuZ2xlIHNpemVcclxuXHR2YXIgc2l6ZSA9IDEwO1xyXG5cclxuXHQvLyBzdmcgcGFuZWwgZm9yIHRoZSBsZWdlbmRcclxuXHR2YXIgc3ZnTGVnZW5kID0gZDMuc2VsZWN0KCcjc3BlbmRpbmctbGVnZW5kJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIDIwMClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIDkwKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDIwLDIwKScpO1xyXG5cclxuXHQvLyBjcmVhdGUgcmVjdGFuZ2xlcyBmb3IgZWFjaCBlbGVtZW50XHJcblx0c3ZnTGVnZW5kLnNlbGVjdEFsbCgnLnMtbGVnZW5kJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdzLWxlZ2VuZCBsZWdlbmQnKVxyXG5cdFx0XHQuYXR0cigneCcsIDApXHJcblx0XHRcdC5hdHRyKCd5JywgKGQsIGkpID0+IGkqc2l6ZSoyKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0Jywgc2l6ZSlcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgc2l6ZSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGRbMF0udGlja2V0KSk7XHJcblxyXG5cdC8vIGNyZWF0ZSB0ZXh0IGxhYmVsXHJcblx0c3ZnTGVnZW5kLnNlbGVjdEFsbCgnLnMtbGVnZW5kLWxhYmVsJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdzLWxlZ2VuZC1sYWJlbCBsZWdlbmQnKVxyXG5cdFx0XHQuYXR0cigneCcsIDApXHJcblx0XHRcdC5hdHRyKCd5JywgKGQsIGkpID0+IGkqc2l6ZSoyKVxyXG5cdFx0XHQuYXR0cignZHgnLCBzaXplKzUpXHJcblx0XHRcdC5hdHRyKCdkeScsIHNpemUpXHRcdFxyXG5cdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdC50ZXh0KGQgPT4gZFswXS50aWNrZXQpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtIGRhdGEgaW50byBhIG5ldyBkYXRhc2V0IHdoaWNoIGhhcyByZWFycmFuZ2VkIHZhbHVlc1xyXG4gKiBzbyB0aGF0IGl0IGlzIGFuIGFycmF5IG9mIHRpY2tldCB0eXBlIGFycmF5c1xyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0cyBleHRyYWN0ZWQgZnJvbSBmaWxlXHJcbiAqIEByZXR1cm4ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIGRhdGEgb2JqZWN0cyBncm91cGVkIGJ5IHRpY2tldCB0eXBlcyBhbmQgbW9udGhzXHJcbiAqL1xyXG5mdW5jdGlvbiBzcGVuZGluZ0RhdGFzZXQoZGF0YSkge1xyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdHZhciB0aWNrZXRzID0gdW5pcVZhbHVlcyhkYXRhLCAndGlja2V0Jyk7XHJcblxyXG5cdHZhciBtb250aHMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpO1xyXG5cclxuXHR2YXIgbW9udGhseURhdGEgPSBtb250aHMubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHJcblx0dGlja2V0cy5mb3JFYWNoKCB0aWNrZXQgPT4ge1xyXG5cdFx0dmFyIHRpY2tldEFycmF5ID0gW107XHJcblxyXG5cdFx0bW9udGhseURhdGEuZm9yRWFjaCggKG1vbnRoRGF0YSwgaSkgPT4ge1xyXG5cdFx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cdFx0XHJcblx0XHRcdGRhdGFPYmoudGlja2V0ID0gdGlja2V0O1x0XHRcdFxyXG5cdFx0XHRkYXRhT2JqLnZhbHVlcyA9IG1vbnRoRGF0YS5maWx0ZXIoIGQgPT4gZC50aWNrZXQgPT09IHRpY2tldCk7XHJcblx0XHRcdGRhdGFPYmoueCA9IG1vbnRoc1tpXTtcclxuXHJcblx0XHRcdGRhdGFPYmoueSA9IGRhdGFPYmoudmFsdWVzLnJlZHVjZSggKGEsYikgPT4ge1xyXG5cdFx0XHRcdGlmICggYi50aWNrZXQgPT09IHRpY2tldCApIHtcclxuXHRcdFx0XHRcdHJldHVybiBhICsgYi5mYXJlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIDApO1xyXG5cclxuXHRcdFx0dGlja2V0QXJyYXkucHVzaChkYXRhT2JqKTtcdFx0XHRcclxuXHRcdH0pO1xyXG5cclxuXHRcdGRhdGFzZXQucHVzaCh0aWNrZXRBcnJheSk7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBkYXRhc2V0O1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gZm9yIHRpY2tldHMgbnVtYmVyIGFuZCBhdmVyYWdlIHByaWNlLlxyXG4gKiBDcmVhdGVzIGEgZG9udXQgY2hhcnQgcmVwcmVzZW50aW5nIHRoZSBwYXJ0aWFsIHJlbGF0aW9uc2hpcCBhbmQgdGV4dCBlbGVtZW50LlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGFuZCBjcmVhdGVzIHRoZSB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgdmlzdWFsaXphdGlvbiBvZiB0b3Agc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHZpc0lkIGlkIG9mIHRoZSB2aXN1YWxpemF0aW9uIHBhbmVsXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBmaWxsIGNvbG9yIHVzZWQgZm9yIGFyY3NcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0aWNrZXQoZGF0YSwgcGFyYW0sIHZpc0lkLCBjb2xvcikge1xyXG5cdHZhciB2aXMgPSB7fTtcclxuXHR2aXMudXBkYXRlID0gdXBkYXRlQ2hhcnQ7XHJcblx0dmlzLnBhcmFtID0gcGFyYW07XHJcblxyXG5cdHZhciBjb2xvclR5cGU7XHJcblx0XHJcblx0dmFyIHN2ZztcclxuXHJcblx0dmFyIHBpZTtcclxuXHR2YXIgYXJjO1xyXG5cdHZhciBwYXRoO1xyXG5cclxuXHR2YXIgcGVyY2VudGFnZTtcclxuXHR2YXIgZXhhY3RWYWx1ZTtcclxuXHJcblx0dmFyIGFsbEl0ZW1zO1xyXG5cdHZhciBwYXJ0SXRlbXM7XHJcblxyXG5cdHZhciBpbml0aWxpemVkID0gZmFsc2U7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGNyZWF0ZVZpcyhkYXRhKTtcclxuXHJcblx0aW5pdGlsaXplZCA9IHRydWU7XHJcblxyXG5cdHJldHVybiB2aXM7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemVzIGFsbCBuZWVkZWQgdmFyaWFibGVzIGZvciB2aXN1YWxpemF0aW9uIGFuZCBjcmVhdGVzIGEgU1ZHIHBhbmVsLiBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0KGRhdGEpIHtcclxuXHRcdG1hcmdpbiA9IHt0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDEwLCBsZWZ0OiA1fTtcclxuXHRcdHdpZHRoID0gMjYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0XHRoZWlnaHQgPSAxMzAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcblx0XHRjb2xvclR5cGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcdFx0XHRcclxuXHRcdFx0LnJhbmdlKFtjb2xvciwgJ3JnYmEoMCwwLDAsLjMpJ10pXHJcblxyXG5cdFx0c3ZnID0gZDMuc2VsZWN0KCcjJyt2aXNJZClcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgd2lkdGgvMiArJywnKyAoaGVpZ2h0LzItbWFyZ2luLmJvdHRvbSkgKycpJyk7XHJcblxyXG5cdFx0YXJjID0gZDMuc3ZnLmFyYygpXHJcblx0XHRcdC5vdXRlclJhZGl1cyg1MCAtIDEwKVxyXG5cdFx0XHQuaW5uZXJSYWRpdXMoNTAgLSAyMCk7XHJcblxyXG5cdFx0cGllID0gZDMubGF5b3V0LnBpZSgpXHJcblx0XHRcdC5zb3J0KG51bGwpXHJcblx0XHRcdC52YWx1ZShkID0+IGQudmFsdWUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgdmlzdWFsaXphdGlvbiAtIHBpZSBjaGFydCBhbmQgdGV4dCB2YWx1ZXMgLSBwZXJjZW50YWdlIGFuZCBleGFjdCB2YWx1ZS4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhc2V0IFxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGNyZWF0ZVZpcyhkYXRhc2V0KSB7XHJcblx0XHQvLyB1cGRhdGUgZGF0YSBhY2NvcmRpbmcgdG8gY2hhbmdlXHJcblx0XHRkYXRhID0gdXBkYXRlRGF0YShkYXRhc2V0LCBwYXJhbSk7XHRcdFxyXG5cclxuXHRcdC8vIHVwZGF0ZSB0aGUgY2hhcnRcclxuXHRcdHBhdGggPSBzdmcuc2VsZWN0QWxsKCcuYXJjLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKGRhdGEpXHJcblx0XHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdhcmMtJytwYXJhbSlcdFx0XHRcclxuXHRcdFx0XHQuYXR0cignZCcsIGFyYylcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsIChkLCBpKSA9PiBjb2xvclR5cGUoaSkpXHJcblx0XHRcdFx0LmVhY2goIGZ1bmN0aW9uIChkKSB7IHRoaXMuX2N1cnJlbnQgPSBkIH0pO1x0XHRcclxuXHJcblx0XHQvLyB1cGRhdGVcclxuXHRcdHBlcmNlbnRhZ2UgPSBzdmcuc2VsZWN0QWxsKCcucGVyYy0nK3BhcmFtKVxyXG5cdFx0XHQuZGF0YShbZGF0YVswXV0pXHJcblx0XHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdwZXJjLScrcGFyYW0pXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAtMTUgKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgNSApXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC50ZXh0KCBwZXJjZW50ICk7XHJcblxyXG5cdFx0ZXhhY3RWYWx1ZSA9IHN2Zy5zZWxlY3RBbGwoJy5leHZhbC0nK3BhcmFtKVxyXG5cdFx0XHQuZGF0YShbZGF0YVswXV0pXHJcblx0XHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdleHZhbC0nK3BhcmFtKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgLTE1IClcclxuXHRcdFx0XHQuYXR0cigneScsIDY1IClcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ2ZvbnQtc2l6ZScsIDE4KVxyXG5cdFx0XHRcdC50ZXh0KCByb3VuZFZhbHVlICk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGVzIHRoZSBjaGFydCBhbmQgYWxsIHRleHQgdmFsdWVzIGFjY29yZGluZyB0byBuZXcgZ2l2ZW4gZGF0YS4gXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlQ2hhcnQoZGF0YXNldCkge1xyXG5cclxuXHRcdHZhciBkYXRhID0gdXBkYXRlRGF0YShkYXRhc2V0KTtcclxuXHJcblx0XHQvLyBjb21wdXRlIHRoZSBuZXcgYW5nbGVzXHJcblx0XHRwYXRoID0gcGF0aC5kYXRhKCBkYXRhICk7XHJcblx0XHQvLyByZWRyYXcgYWxsIGFyY3NcclxuXHRcdHBhdGgudHJhbnNpdGlvbigpLmF0dHJUd2VlbignZCcsIGFyY1R3ZWVuKTtcclxuXHJcblx0XHQvLyB1cGRhdGUgdGV4dCAtIHBlcmNlbnRhZ2UgbnVtYmVyXHJcblx0XHRwZXJjZW50YWdlLmRhdGEoW2RhdGFbMF1dKVxyXG5cdFx0XHQudGV4dCggcGVyY2VudCApO1xyXG5cclxuXHRcdC8vIHVwZGF0ZSB0ZXh0IC0gZXhhY3QgdmFsdWUgbnVtYmVyXHJcblx0XHRleGFjdFZhbHVlLmRhdGEoW2RhdGFbMF1dKVxyXG5cdFx0XHQudGV4dCggcm91bmRWYWx1ZSApO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3RvcmUgdGhlIGRpc3BsYXllZCBhbmdsZXMgaW4gX2N1cnJlbnQuXHJcblx0XHQgKiBUaGVuLCBpbnRlcnBvbGF0ZSBmcm9tIF9jdXJyZW50IHRvIHRoZSBuZXcgYW5nbGVzLlxyXG5cdFx0ICogRHVyaW5nIHRoZSB0cmFuc2l0aW9uLCBfY3VycmVudCBpcyB1cGRhdGVkIGluLXBsYWNlIGJ5IGQzLmludGVycG9sYXRlLlxyXG5cdFx0ICpcclxuXHRcdCAqIGNvZGUgdGFrZW4gZnJvbTogaHR0cHM6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xMzQ2NDEwXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIGFyY1R3ZWVuKGEpIHtcclxuXHRcdFx0dmFyIGkgPSBkMy5pbnRlcnBvbGF0ZSh0aGlzLl9jdXJyZW50LCBhKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuX2N1cnJlbnQgPSBpKDApO1xyXG5cdFx0XHRcclxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKHQpIHtcclxuXHRcdFx0XHRyZXR1cm4gYXJjKGkodCkpO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGRhdGFzZXQgZnJvbSBnaXZlbiBkYXRhIGZvciB0aGUgdmlzdWFsaXphdGlvbiBpbiB0aGUgZm9ybSBvZiBhcnJheSBvZiB0d28gb2JqZWN0c1xyXG5cdCAqIHdoZXJlIGZpcnN0IG9iamVjdCByZXByZXNlbnRzIGEgcGFydCBvZiB0aGUgd2hvbGUgYW5kIHRoZSBzZWNvbmQgb2JqZWN0cyByZXByZXNlbnRzIHRoZSByZXN0IG9mIHRoZSB3aG9sZS5cclxuXHQgKiBUaGUgd2hvbGUgaXMgY2FsY3VsYXRlZCBhY2NvcmRpbmcgdG8gYSBwYXJhbWV0ZXIsIGUuZy4gdGhlIHdob2xlIGNhbiBiZSBudW1iZXIgb2YgdGlja2V0cy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgXHJcblx0ICogQHJldHVybiB7YXJyYXl9IHBpZWREYXRhIGFycmF5IG9mIG9iamVjdHMgYXMgcmV0dXJuZWQgZnJvbSBkMy5waWUgZnVuY3Rpb25cclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVEYXRhKGRhdGEpIHtcclxuXHRcdHZhciBkYXRhc2V0O1xyXG5cclxuXHRcdGlmICh2aXMucGFyYW0gPT09ICdmYXJlJykge1xyXG5cclxuXHRcdFx0aWYgKCFpbml0aWxpemVkKSB7XHJcblx0XHRcdFx0YWxsSXRlbXMgPSBhdmdQcmljZShkYXRhKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cGFydEl0ZW1zID0gYXZnUHJpY2UoZGF0YSk7XHRcdFx0XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmICghaW5pdGlsaXplZCkge1xyXG5cdFx0XHRcdGFsbEl0ZW1zID0gZGF0YVtwYXJhbV07XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHBhcnRJdGVtcyA9IGRhdGFbcGFyYW1dO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoYWxsSXRlbXMgPT09IHBhcnRJdGVtcykge1xyXG5cdFx0XHRkYXRhc2V0ID0gW3sgdmFsdWU6IGFsbEl0ZW1zIH0sIHsgdmFsdWU6IDAgfV07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkYXRhc2V0ID0gW3sgdmFsdWU6IHBhcnRJdGVtcyB9LCB7IHZhbHVlOiBhbGxJdGVtcyAtIHBhcnRJdGVtcyB9XTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcGllKGRhdGFzZXQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRm9ybWF0cyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIG9iamVjdCAtIGVpdGhlciBhcyBhIG51bWJlciB3aXRoIGN1cnJlbmN5IG9yIGp1c3QgYSBudW1iZXIuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGQgZGF0YSBvYmplY3RcclxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9IHJvdW5kVmFsdWUgZm9ybWF0dGVkIHZhbHVlXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gcm91bmRWYWx1ZShkKSB7XHJcblx0XHRpZiAodmlzLnBhcmFtID09PSAnZmFyZScpIHtcclxuXHRcdFx0cmV0dXJuIG51bWVyYWwoZC52YWx1ZSkuZm9ybWF0KCckMCwwJyk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gbnVtZXJhbChkLnZhbHVlKS5mb3JtYXQoJzAsMCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRm9ybWF0cyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIG9iamVjdCBpbnRvIGEgcm91bmRlZCBwZXJjZW50YWdlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGQgZGF0YSBvYmplY3RcclxuXHQgKiBAcmV0dXJuIHtzdHJpbmd9IHBlcmNlbnQgZm9ybWF0dGVkIHN0cmluZ1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHBlcmNlbnQoZCkge1xyXG5cdFx0dmFyIHBlcmNlbnQgPSBkLnZhbHVlL2FsbEl0ZW1zKjEwMDtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKHBlcmNlbnQpKyclJztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBhdmVyYWdlIHByaWNlIG9mIHRpY2tldHMgZnJvbSBnaXZlbiBkYXRhIC0gc3VtIG9mIGFsbCBmYXJlcyBvdmVyIG51bWJlciBvZiBhbGwgdGlja2V0cy5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IGF2Z1ByaWNlXHJcbiAqL1xyXG5mdW5jdGlvbiBhdmdQcmljZShkYXRhKSB7XHJcblx0XHJcblx0dmFyIHByaWNlU3VtID0gZGF0YS5yZWR1Y2UoIChhLCBiKSA9PiBhICsgYi5mYXJlLCAwICk7XHJcblx0XHJcblx0dmFyIHRpY2tldE51bSA9IGRhdGEubGVuZ3RoO1xyXG5cclxuXHRyZXR1cm4gcHJpY2VTdW0gLyB0aWNrZXROdW07XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiB0b3Agc3BlbmRpbmcgZm9yIGdpdmVuIGVsZW1lbnQuXHJcbiAqIENyZWF0ZXMgZml2ZSBiYXIgY2hhcnRzIHN0YXRpbmcgdGhlIHRvcCBlbGVtZW50cyB3aGljaCBzcGVuZCB0aGUgbW9zdC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt1bmlxVmFsdWVzLCBjYWxjU3BlbmRpbmd9IGZyb20gJy4vdmlzLXV0aWwnO1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBhZHZhbmNlZCB0b29sdGlwXHJcbnZhciB0aXA7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgYW5kIGNyZWF0ZXMgdGhlIHZpc3VhbGl6YXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2YgZGF0YSBvYmplY3RzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciB2aXN1YWxpemF0aW9uIG9mIHRvcCBzcGVuZGluZ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmlzSWQgaWQgb2YgdGhlIHZpc3VhbGl6YXRpb24gcGFuZWxcclxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGZpbGwgY29sb3IgdXNlZCBmb3IgYWxsIHJlY3RhbmdsZXNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b3BTcGVuZGluZyhkYXRhLCBwYXJhbSwgdmlzSWQsIGNvbG9yKSB7XHJcblxyXG5cdHZhciB2aXMgPSB7fTtcclxuXHR2aXMudXBkYXRlID0gdXBkYXRlVG9wU3BlbmRpbmc7XHRcclxuXHJcblx0dmFyIHhTY2FsZTtcclxuXHR2YXIgeVNjYWxlO1xyXG5cdHZhciBzdmc7XHJcblxyXG5cdC8vIGNhbGN1bGF0ZSBkYXRhLCBpbml0aWFsaXplIGFuZCBkcmF3IGNoYXJ0XHJcblx0dmFyIHRvcERhdGEgPSBjYWxjVG9wKGRhdGEpO1xyXG5cclxuXHRpbml0KHRvcERhdGEpO1xyXG5cclxuXHRjcmVhdGVCYXJDaGFydCh0b3BEYXRhKTtcclxuXHJcblx0cmV0dXJuIHZpcztcclxuXHJcblx0LyoqXHJcblx0ICogRmlyc3RseSwgY2FsY3VsYXRlcyB0aGUgbmV3IHRvcCBkYXRhIGFuZCB0aGVuIHVwZGF0ZXMgdGhlIGJhciBjaGFydCBhbmQgdGV4dCB2YWx1ZXMgYWNjb3JkaW5nIHRvIG5ldyBkYXRhLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZVRvcFNwZW5kaW5nKGRhdGEpIHtcdFxyXG5cdFx0dXBkYXRlKGNhbGNUb3AoZGF0YSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0b3AgZml2ZSBpdGVtcyBmcm9tIGRhdGEgYWNjb3JkaW5nIHRvIHNwZW5kaW5nIChmYXJlKSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICogQHJldHVybiB7YXJyYXl9IGRhdGFzZXQgdXBkYXRlZCBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjYWxjVG9wKGRhdGEpIHtcclxuXHRcdHJldHVybiBjYWxjU3BlbmRpbmcoZGF0YSwgcGFyYW0pLnNvcnQoIChhLCBiKSA9PiBiLmZhcmUgLSBhLmZhcmUgKS5zbGljZSgwLDUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZXMgYWxsIG5lZWRlZCB2YXJpYWJsZXMgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBTVkcgcGFuZWwuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdFx0bWFyZ2luID0ge3RvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogNX07XHJcblx0XHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdFx0aGVpZ2h0ID0gMTMwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG5cdFx0eVNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHRcdC5kb21haW4oZGF0YS5tYXAoZCA9PiBkW3BhcmFtXSkpXHJcblx0XHRcdC5yYW5nZVJvdW5kQmFuZHMoWzAsIGhlaWdodF0sIC4xKTtcclxuXHJcblx0XHR4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0XHQuZG9tYWluKFsgMCwgTWF0aC5tYXgoLi4uZGF0YS5tYXAoZCA9PiBkLmZhcmUpKSBdKVxyXG5cdFx0XHQucmFuZ2UoWyAwLCB3aWR0aCBdKTtcclxuXHJcblx0XHRzdmcgPSBkMy5zZWxlY3QoJyMnK3Zpc0lkKVxyXG5cdFx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBiYXIgY2hhcnQgYW5kIGEgdG9vbHRpcC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjcmVhdGVCYXJDaGFydChkYXRhKSB7XHRcdFxyXG5cclxuXHRcdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0XHR0aXAgPSBkMy50aXAoKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPicrbnVtZXJhbChkLmZhcmUpLmZvcm1hdCgnJDAsMCcpICsgJzwvc3Bhbj5cXFxyXG5cdFx0XHRcdFx0PGJyLz48c3BhbiBjbGFzcz1cIm51bWJlclwiPicrbnVtZXJhbChkLnZhbHVlcy5sZW5ndGgpLmZvcm1hdCgnMCwwJykrJyB0aWNrZXRzPC9zcGFuPic7IFxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRzdmcuY2FsbCh0aXApO1xyXG5cclxuXHRcdC8vIGNyZWF0ZSBiYXIgY2hhcnRzXHJcblx0XHR1cGRhdGUoZGF0YSk7XHJcblxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgYmFyIGNoYXJ0IHZpc3VhbGl6YXRpb24gd2l0aCBhbGwgbmFtZXMgYW5kIGZhcmUgdmFsdWVzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzOyBlLmcuIFsgeyBmYXJlOiB4LCBvdGhlclBhcmFtOiBhIH0sIHsgZmFyZTogeSwgb3RoZXJQYXJhbTogYiB9LCAuLi4gXVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZShkYXRhKSB7XHJcblx0XHQvLyB1cGRhdGUgc2NhbGUgc28gcmVsYXRpdmUgZGlmZmVyZW5jaWVzIGNhbiBiZSBzZWVuXHJcblx0XHR4U2NhbGUuZG9tYWluKFsgMCwgTWF0aC5tYXgoLi4uZGF0YS5tYXAoZCA9PiBkLmZhcmUpKSBdKTtcclxuXHJcblx0XHQvLyBkcmF3IHJlY3RhbmdsZSByZXByZXNlbnRpbmcgc3BlbmRpbmdcclxuXHRcdHZhciBiYXJzID0gc3ZnLnNlbGVjdEFsbCgnLmJhci0nK3BhcmFtKVxyXG5cdFx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0XHRiYXJzLnRyYW5zaXRpb24oKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZShkLmZhcmUpKTtcclxuXHJcblx0XHRiYXJzLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2Jhci0nK3BhcmFtKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgZCA9PiAwKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZFtwYXJhbV0pKVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHlTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZShkLmZhcmUpKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgY29sb3IpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW92ZXInLCB0aXAuc2hvdylcclxuXHRcdFx0XHQub24oJ21vdXNlb3V0JywgdGlwLmhpZGUpO1xyXG5cclxuXHRcdGJhcnMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cclxuXHRcdC8vIGRyYXcgdGV4dCB0byB0aGUgbGVmdCBvZiBlYWNoIGJhciByZXByZXNlbnRpbmcgdGhlIG5hbWVcclxuXHRcdHZhciBuYW1lcyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSsnLW5hbWUnKVxyXG5cdFx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0XHRuYW1lcy50cmFuc2l0aW9uKClcclxuXHRcdFx0LnRleHQoZCA9PiBkW3BhcmFtXSk7XHJcblxyXG5cdFx0bmFtZXMuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyLScrcGFyYW0rJy1uYW1lJylcclxuXHRcdFx0XHQuYXR0cigneCcsIDApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkW3BhcmFtXSkpXHJcblx0XHRcdFx0LmF0dHIoJ2R5JywgMTcpXHJcblx0XHRcdFx0LmF0dHIoJ2R4JywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdFx0LnRleHQoZCA9PiBkW3BhcmFtXSlcclxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHRcdC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XHJcblxyXG5cdFx0bmFtZXMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cclxuXHRcdC8vIGRyYXcgdGV4dCB0byB0aGUgcmlnaHQgb2YgZWFjaCBiYXIgcmVwcmVzZW50aW5nIHRoZSByb3VuZGVkIHNwZW5kaW5nXHJcblx0XHR2YXIgZmFyZXMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0rJy1mYXJlJylcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0ZmFyZXMudHJhbnNpdGlvbigpXHJcblx0XHRcdC50ZXh0KGQgPT4gbnVtZXJhbChkLmZhcmUpLmZvcm1hdCgnMGEnKSk7XHJcblxyXG5cdFx0ZmFyZXMuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyLScrcGFyYW0rJy1mYXJlJylcclxuXHRcdFx0XHQuYXR0cigneCcsIHdpZHRoLTM1KVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZFtwYXJhbV0pKVxyXG5cdFx0XHRcdC5hdHRyKCdkeScsIDE3KVxyXG5cdFx0XHRcdC5hdHRyKCdkeCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC50ZXh0KGQgPT4gbnVtZXJhbChkLmZhcmUpLmZvcm1hdCgnMGEnKSk7XHJcblxyXG5cdFx0ZmFyZXMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH1cclxufSIsIi8qKlxyXG4gKiBGaW5kcyBvdXQgdGhlIHVuaXF1ZSB2YWx1ZXMgb2YgZ2l2ZW4gZGF0YSBmb3IgZ2l2ZW4gcGFyYW1ldGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGFsbCB5ZWFyIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbSBwYXJhbWV0ZXIgd2hpY2ggc2hvdWxkIGJlIGxvb2tlZCB1cFxyXG4gKiBAcmV0dXJuIHthcnJheX0gdW5pcXVlVmFsdWVzIGFycmF5IG9mIGFsbCB1bmlxdWUgdmFsdWVzIGZvciBnaXZlbiBwYXJhbWV0ZXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bmlxVmFsdWVzKGRhdGEsIHBhcmFtKSB7XHJcblx0cmV0dXJuIFsgLi4ubmV3IFNldChkYXRhLm1hcChkID0+IGRbcGFyYW1dKSldO1xyXG59XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgd2hvbGUgeWVhcidzIHNwZW5kaW5nIGZvciBhIGdpdmVuIHBhcmFtIChlLmcuIHN1cHBsaWVyLCBkaXJlY3RvcmF0ZSkgYW5kIHJldHVybnMgaXQgaW4gdXBkYXRlZCBhcnJheSBvZiBvYmplY3RzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbVxyXG4gKiBAcmV0dXJuIHthcnJheX0gYWxsU3BlbmRpbmcgYXJyYXkgb2YgdXBkYXRlZCBvYmplY3RzLCBlLmcuIFsge2ZhcmU6IHgsIHBhcmFtOiBhfSwge2ZhcmU6IHksIHBhcmFtOiBifSwgLi4uXVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNTcGVuZGluZyhkYXRhLCBwYXJhbSkge1xyXG5cdHZhciB1bmlxSXRlbXMgPSB1bmlxVmFsdWVzKGRhdGEsIHBhcmFtKTtcclxuXHRcclxuXHR2YXIgYWxsUGFyYW1zID0gdW5pcUl0ZW1zLm1hcCggaXRlbSA9PiBkYXRhLmZpbHRlciggZCA9PiBkW3BhcmFtXSA9PT0gaXRlbSApKTtcclxuXHJcblx0dmFyIGFsbFNwZW5kaW5nID0gW107XHJcblxyXG5cdGFsbFBhcmFtcy5mb3JFYWNoKCBpdGVtQXJyYXkgPT4ge1xyXG5cdFx0dmFyIG9iaiA9IHt9O1xyXG5cclxuXHRcdG9ialsnZmFyZSddID0gaXRlbUFycmF5LnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCk7XHJcblx0XHRvYmpbcGFyYW1dID0gaXRlbUFycmF5WzBdW3BhcmFtXTtcclxuXHRcdG9ialsndmFsdWVzJ10gPSBpdGVtQXJyYXk7XHJcblxyXG5cdFx0YWxsU3BlbmRpbmcucHVzaChvYmopO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gYWxsU3BlbmRpbmc7XHJcbn0iLCIvKipcclxuICogTWFpbiB2aXN1YWxpemF0aW9uIG1vZHVsZSBmb3IgY3JlYXRpbmcgY2hhcnRzIGFuZCB2aXMgZm9yIHBhc3NlZCBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3NwZW5kaW5nfSBmcm9tICcuL3NwZW5kaW5nJztcclxuaW1wb3J0IHtkaXN0cmlidXRpb259IGZyb20gJy4vZGlzdHJpYnV0aW9uJztcclxuaW1wb3J0IHt0b3BTcGVuZGluZ30gZnJvbSAnLi90b3BTcGVuZGluZyc7XHJcbmltcG9ydCB7dGlja2V0fSBmcm9tICcuL3RpY2tldCc7XHJcbmltcG9ydCB7ZGVzdGluYXRpb25zfSBmcm9tICcuL2Rlc3RpbmF0aW9ucyc7XHJcblxyXG52YXIgZGF0YTtcclxudmFyIHBhbmVscyA9IFtcclxuXHQndmlzLXNwZW5kaW5nJywgXHJcblx0J3Zpcy1kaXN0cmlidXRpb24nLCBcclxuXHQndmlzLXRpY2tldC1udW0nLCBcclxuXHQndmlzLXRpY2tldC1hdmcnLCBcclxuXHQndmlzLXRvcC1zdXAnLCBcclxuXHQndmlzLXRvcC1kaXInLCBcclxuXHQndmlzLWRlc3RpbmF0aW9ucydcclxuXHRdO1xyXG5cclxudmFyIHN1cDtcclxudmFyIGRpcjtcclxuXHJcbnZhciBwcmljZTtcclxudmFyIG51bTtcclxuXHJcbi8qKlxyXG4gKlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIG9iamVjdHMgZm9yIHZpc3VhbGl6YXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxpemUoZGF0YXNldCl7XHRcclxuXHRkYXRhID0gZGF0YXNldDtcclxuXHJcblx0ZGV0ZWN0UGFuZWxzKGRhdGEpO1xyXG59XHJcblxyXG4vKipcclxuICogRGF0YSBpcyBmaXJzdGx5IGZpbHRlcmVkIGFjY29yZGluZyB0byBtb250aCBhbmQgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zIGFyZSB0aGVuIHJlZHJhd24gd2l0aCB1cGRhdGVkIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb250aCBzZWxlY3RlZCBtb250aCB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIGZpbHRlcmluZyBkYXRhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlZFNwZW5kaW5nKG1vbnRoKSB7XHJcblx0dmFyIGRhdGFzZXQ7XHJcblx0XHJcblx0aWYgKG1vbnRoKSB7XHJcblx0XHQvLyByZWRyYXcgYWxsIHBhbmVscyB3aXRoIG9ubHkgZ2l2ZW4gbW9udGggZGF0YVxyXG5cdFx0ZGF0YXNldCA9IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICk7XHJcblx0fSBlbHNlIHtcclxuXHRcdC8vIHJlZHJhdyBhbGwgcGFuZWxzIHdpdGggYWxsIG1vbnRocyBkYXRhXHJcblx0XHRkYXRhc2V0ID0gZGF0YTtcclxuXHR9XHJcblxyXG5cdHN1cC51cGRhdGUoZGF0YXNldCk7XHJcblx0ZGlyLnVwZGF0ZShkYXRhc2V0KTtcclxuXHRudW0udXBkYXRlKGRhdGFzZXQpO1xyXG5cdHByaWNlLnVwZGF0ZShkYXRhc2V0KTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gZGV0ZWN0UGFuZWxzKGRhdGEpIHtcclxuXHRwYW5lbHMuZm9yRWFjaCggcGFuZWwgPT4ge1xyXG5cdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhbmVsKSkge1xyXG5cdFx0XHRzd2l0Y2ggKHBhbmVsKSB7XHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbMF06XHJcblx0XHRcdFx0XHRzcGVuZGluZyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1sxXTpcclxuXHRcdFx0XHRcdGRpc3RyaWJ1dGlvbihkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1syXTpcclxuXHRcdFx0XHRcdG51bSA9IHRpY2tldChkYXRhLCAnbGVuZ3RoJywgcGFuZWxzWzJdLCAnI2QwNzI1ZCcpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzNdOlxyXG5cdFx0XHRcdFx0cHJpY2UgPSB0aWNrZXQoZGF0YSwgJ2ZhcmUnLCBwYW5lbHNbM10sICcjZDJhMjRjJyk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbNF06XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0c3VwID0gdG9wU3BlbmRpbmcoZGF0YSwgJ3N1cHBsaWVyJywgcGFuZWxzWzRdLCAnIzRiOTIyNicpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzVdOlxyXG5cdFx0XHRcdFx0ZGlyID0gdG9wU3BlbmRpbmcoZGF0YSwgJ2RpcmVjdG9yYXRlJywgcGFuZWxzWzVdLCAnI2FmNGM3ZScpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzZdOlxyXG5cdFx0XHRcdFx0ZGVzdGluYXRpb25zKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cdFx0XHJcblx0fSk7XHJcbn0iXX0=
