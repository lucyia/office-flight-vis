(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./visualize":7}],3:[function(require,module,exports){
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
		return '<span class="type type-' + index + '">' + d.ticket + '</span><br/><span class="value">' + numeral(d.y).format('$0,0') + '</span>';
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

},{"./vis-util":6,"./visualize":7}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
			return '<span class="value">' + numeral(d.fare).format('$0,0') + '</span>';
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

},{"./vis-util":6}],6:[function(require,module,exports){
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

    allSpending.push(obj);
  });

  return allSpending;
}

},{}],7:[function(require,module,exports){
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

/**
 * Main visualization module for creating charts and vis for passed data.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

var data;
var panels = ['vis-spending', 'vis-distribution', 'vis-ticket-num', 'vis-ticket-avg', 'vis-top-sup', 'vis-top-dir'];

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
					num = (0, _ticket.ticket)(data, 'length', panels[2], '#ff2255');
					break;

				case panels[3]:
					price = (0, _ticket.ticket)(data, 'fare', panels[3], '#ff5722');
					break;

				case panels[4]:
					sup = (0, _topSpending.topSpending)(data, 'supplier', panels[4], '#4b9226');
					break;

				case panels[5]:
					dir = (0, _topSpending.topSpending)(data, 'directorate', panels[5], '#af4c7e');
					break;
			}
		}
	});
}

},{"./distribution":1,"./spending":3,"./ticket":4,"./topSpending":5}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGlzdHJpYnV0aW9uLmpzIiwianNcXGluaXQuanMiLCJqc1xcc3BlbmRpbmcuanMiLCJqc1xcdGlja2V0LmpzIiwianNcXHRvcFNwZW5kaW5nLmpzIiwianNcXHZpcy11dGlsLmpzIiwianNcXHZpc3VhbGl6ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O1FDcUJnQixZLEdBQUEsWTs7Ozs7Ozs7OztBQVpoQixJQUFJLE1BQUo7QUFDQSxJQUFJLEtBQUo7QUFDQSxJQUFJLE1BQUo7OztBQUdBLElBQUksR0FBSjs7QUFFQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7O0FBRUEsSUFBSSxLQUFKOztBQUVPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0Qjs7QUFFbEMsT0FBSyxJQUFMO0FBRUE7O0FBRUQsU0FBUyxJQUFULENBQWMsSUFBZCxFQUFvQjtBQUNuQixXQUFTLEVBQUMsS0FBSyxFQUFOLEVBQVUsT0FBTyxFQUFqQixFQUFxQixRQUFRLEVBQTdCLEVBQWlDLE1BQU0sRUFBdkMsRUFBVDtBQUNBLFVBQVEsTUFBTSxPQUFPLElBQWIsR0FBb0IsT0FBTyxLQUFuQztBQUNBLFdBQVMsTUFBTSxPQUFPLEdBQWIsR0FBbUIsT0FBTyxNQUFuQztBQUVBOzs7OztBQ3pCRDs7QUFFQSxDQUFDLFNBQVMsS0FBVCxDQUFlLEVBQWYsRUFBbUI7QUFDbkIsS0FBSSxTQUFTLFVBQVQsS0FBd0IsU0FBNUIsRUFBc0M7QUFDckM7QUFDQSxFQUZELE1BRU87QUFDTixXQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxFQUE5QztBQUNBO0FBQ0QsQ0FORCxFQU1HLElBTkg7Ozs7Ozs7Ozs7OztBQVdBLFNBQVMsSUFBVCxHQUFlOzs7QUFHZCxTQUFRLFFBQVIsQ0FBaUIsT0FBakI7OztBQUdBLElBQUcsR0FBSCxDQUFPLHNDQUFQLEVBQ0UsR0FERixDQUNPLGFBQUs7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UjtBQUNDLFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyw2QkFBUyxJQUFUO0FBQ0E7O0FBRUQsU0FBSyxPQUFPLENBQVAsQ0FBTDtBQUNDLHFDQUFhLElBQWI7QUFDQTs7QUFFRCxTQUFLLE9BQU8sQ0FBUCxDQUFMO0FBQ0MsV0FBTSxvQkFBTyxJQUFQLEVBQWEsUUFBYixFQUF1QixPQUFPLENBQVAsQ0FBdkIsRUFBa0MsU0FBbEMsQ0FBTjtBQUNBOztBQUVELFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyxhQUFRLG9CQUFPLElBQVAsRUFBYSxNQUFiLEVBQXFCLE9BQU8sQ0FBUCxDQUFyQixFQUFnQyxTQUFoQyxDQUFSO0FBQ0E7O0FBRUQsU0FBSyxPQUFPLENBQVAsQ0FBTDtBQUNDLFdBQU0sOEJBQVksSUFBWixFQUFrQixVQUFsQixFQUE4QixPQUFPLENBQVAsQ0FBOUIsRUFBeUMsU0FBekMsQ0FBTjtBQUNBOztBQUVELFNBQUssT0FBTyxDQUFQLENBQUw7QUFDQyxXQUFNLDhCQUFZLElBQVosRUFBa0IsYUFBbEIsRUFBaUMsT0FBTyxDQUFQLENBQWpDLEVBQTRDLFNBQTVDLENBQU47QUFDQTtBQXZCRjtBQXlCQTtBQUNELEVBNUJEO0FBNkJBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIGRhdGEgZGlzdHJpYnV0aW9uLlxyXG4gKiBDcmVhdGVzIGEgYm94LWFuZC13aGlza2V5IHBsb3QgZnJvbSBnaXZlbiBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG52YXIgbWluO1xyXG52YXIgbWF4O1xyXG5cclxudmFyIGNoYXJ0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RyaWJ1dGlvbihkYXRhKSB7XHJcblx0XHJcblx0aW5pdChkYXRhKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxufSIsIi8qKlxyXG4gKiBJbml0aWFsaXphdGlvbiBvZiBhbGwgbW9kdWxlcyBcclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt2aXN1YWxpemV9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbihmdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn0pKGluaXQpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHJlYWRpbmcgb2YgZmlsZSBhbmQgdGhlbiB2aXN1YWxpemF0aW9uIHByb2Nlc3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KCl7XHJcblxyXG5cdC8vIHNldHVwIG51bWVyYWwgZm9yIGNvcnJlY3QgbnVtYmVyIGZvcm1hdHRpbmdcclxuXHRudW1lcmFsLmxhbmd1YWdlKCdlbi1nYicpO1xyXG5cclxuXHQvLyBwYXJzZSBmaWxlXHJcblx0ZDMuY3N2KCdIb21lX09mZmljZV9BaXJfVHJhdmVsX0RhdGFfMjAxMS5jc3YnKVxyXG5cdFx0LnJvdyggZCA9PiB7IFxyXG5cdFx0XHRyZXR1cm4geyBcclxuXHRcdFx0XHRkZXBhcnR1cmU6IGQuRGVwYXJ0dXJlLCBcclxuXHRcdFx0XHRkZXN0aW5hdGlvbjogZC5EZXN0aW5hdGlvbiwgXHJcblx0XHRcdFx0ZGlyZWN0b3JhdGU6IGQuRGlyZWN0b3JhdGUsIFxyXG5cdFx0XHRcdG1vbnRoOiBkLkRlcGFydHVyZV8yMDExLCBcclxuXHRcdFx0XHRmYXJlOiBwYXJzZUZsb2F0KGQuUGFpZF9mYXJlKSwgXHJcblx0XHRcdFx0dGlja2V0OiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiwgXHJcblx0XHRcdFx0c3VwcGxpZXI6IGQuU3VwcGxpZXJfbmFtZSBcclxuXHRcdFx0fTtcclxuXHRcdH0pXHJcblx0XHQuZ2V0KCAoZXJyb3IsIGRhdGEpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSBjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHJcblx0XHRcdHZpc3VhbGl6ZShkYXRhKTtcclxuXHRcdH0pO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgbW9udGhseSBzcGVuZGluZy5cclxuICogQ3JlYXRlcyBhIGJhciBjaGFydCBmcm9tIGdpdmVuIGRhdGEgYW5kIGFkZHMgbGlzdGVuZXJzIGZvciBmaWx0ZXJpbmcgb25lIG1vbnRoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXN9IGZyb20gJy4vdmlzLXV0aWwnO1xyXG5pbXBvcnQge3VwZGF0ZWRTcGVuZGluZ30gZnJvbSAnLi92aXN1YWxpemUnO1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG4vLyBub2RlIGZvciBjcmVhdGVkIGZpbHRlclxyXG52YXIgZmlsdGVyO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIHBvc2l0aW9uaW5nIGVsZW1lbnRzIGluIHggZGlyZWN0aW9uXHJcbnZhciB4U2NhbGU7XHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB5IGRpcmVjdGlvblxyXG52YXIgeVNjYWxlO1xyXG5cclxuLy8gbW9udGggYXhpc1xyXG52YXIgeEF4aXM7XHJcbi8vIG51bWJlciBheGlzXHJcbnZhciB5QXhpcztcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBiaW5kaW5nIGEgY29sb3IgdG8gYSB0aWNrZXQgdHlwZVxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLy8gc2NhbGUgZm9yIHN0YWNraW5nIHJlY3RhbmdsZXNcclxudmFyIHN0YWNrO1xyXG5cclxuLy8gdHJhbnNmb3JtZWQgZGF0YVxyXG52YXIgZGF0YXNldDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIGRhdGFzZXQgZnJvbSBnaXZlbiBkYXRhIHRoYXQgaXMgbW9yZSBzdWl0YWJsZSBmb3Igd29ya2luZyB3aXRoaW4gdmlzdWFsaXphdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcGVuZGluZyhkYXRhKSB7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGRhdGFzZXQgPSBzcGVuZGluZ0RhdGFzZXQoZGF0YSk7XHJcblx0XHJcblx0Y3JlYXRlQmFyQ2hhcnQoZGF0YXNldCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGFsbCBzY2FsZXMgYW5kIGF0dHJpYnV0ZXMgYWNjLiB0byBnaXZlbiBkYXRhIGFuZCBjcmVhdGVzIGEgc3ZnIHBhbmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGVhY2ggc3BlbmRpbmdcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMzUsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbihbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSlcclxuXHRcdC5yYW5nZVJvdW5kQmFuZHMoWzAsIHdpZHRoXSwgLjA1KTtcclxuXHJcblx0Ly8gcm91bmQgdGhlIG1heGltdW0gdmFsdWUgZnJvbSBkYXRhIHRvIHRob3VzYW5kc1xyXG5cdHZhciByb3VuZGVkTWF4ID0gTWF0aC5yb3VuZCggTWF0aC5tYXgoLi4ubW9udGhGYXJlcyhkYXRhKSkgLyAxMDAwICkgKiAxMDAwO1xyXG5cdHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXHJcblx0XHQuZG9tYWluKFsgMCwgcm91bmRlZE1heCBdKVxyXG5cdFx0LnJhbmdlKFsgaGVpZ2h0LCAwIF0pO1xyXG5cclxuXHR4QXhpcyA9IGQzLnN2Zy5heGlzKClcclxuXHRcdC5zY2FsZSh4U2NhbGUpXHJcblx0XHQub3JpZW50KCdib3R0b20nKTtcclxuXHJcblx0eUF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeVNjYWxlKVxyXG5cdFx0Lm9yaWVudCgncmlnaHQnKVxyXG5cdFx0LnRpY2tGb3JtYXQoIGQgPT4gbnVtZXJhbChkKS5mb3JtYXQoJzBhJykpO1xyXG5cdFxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpKVx0XHRcclxuXHRcdC5yYW5nZShbXCIjMDBiY2Q0XCIsIFwiIzFkNmRkMFwiLCBcIiNlZGNkMDJcIl0pO1xyXG5cclxuXHRzdGFjayA9IGQzLmxheW91dC5zdGFjaygpO1xyXG5cclxuXHRzdmcgPSBkMy5zZWxlY3QoJyN2aXMtc3BlbmRpbmcnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG1vbnRobHkgc3BlbmRpbmcgZm9yIGFsbCB0aWNrZXQgdHlwZXMgYW5kIHJldHVybnMgdGhlIGNyZWF0ZWQgYXJyYXkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW5kaW5nIGFsbCB5ZWFyIHNwZWRuaW5nXHJcblx0ICogQHJldHVybiB7YXJyYXl9IHN1bU1vbnRobHlGYXJlcyBhcnJheSBvZiBudW1iZXJzIHJlcHJlc2VudGluZyBlYWNoIG1vbnRocyBzcGVuZGluZyBvbiBhbGwgdGlja2V0c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vbnRoRmFyZXMoZGF0YSkge1x0XHJcblx0XHQvLyBnZXQgYWxsIGZhcmVzIGZvciBlYWNoIG1vbnRoXHJcblx0XHR2YXIgZmFyZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0XHQvLyBzdW0gdXAgYWxsIGZhcmVzIGluIGVhY2ggbW9udGhcclxuXHRcdHZhciBzdW1Nb250aGx5RmFyZXMgPSBmYXJlcy5tYXAoIGZhcmUgPT4gZmFyZS5yZWR1Y2UoIChhLGIpID0+IGEgKyBiLmZhcmUsIDApKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHN1bU1vbnRobHlGYXJlcztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgc3RhY2tlZCBiYXIgY2hhcnQgYWNjb3JkaW5nIHRvIGdpdmVuIGRhdGEuIFRoZSBjaGFydCBoYXMgbGF5ZXJzIGZvciBlYWNoIHRpY2tldCB0eXBlLlxyXG4gKiBUaGVyZSBhcmUgbGlzdGVuZXJzIGZvciBjcmVhdGluZyBhIHRvb2x0aXAgYW5kIGZpbHRlciBmb3Igc2VsZWN0aW5nIG9ubHkgb25lIG1vbnRoLlxyXG4gKiBcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIGluIHRoZSBmb3JtIG9mIFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1xyXG5cdC8vIGNyZWF0ZSBzdGFja2VkIGRhdGEgZm9yIHRoZSB2aXN1YWxpemF0aW9uXHJcblx0c3RhY2soZGF0YSk7XHJcblxyXG5cdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0dGlwID0gZDMudGlwKClcclxuXHRcdC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxyXG5cdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHR2YXIgaW5kZXggPSBjb2xvci5yYW5nZSgpLmluZGV4T2YoY29sb3IoZC50aWNrZXQpKTtcclxuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cInR5cGUgdHlwZS0nK2luZGV4KydcIj4nKyBkLnRpY2tldCArJzwvc3Bhbj48YnIvPjxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC55KS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+JzsgXHJcblx0XHR9KTtcclxuXHJcblx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0Ly8gY3JlYXRlIGEgcmVjdGFuZ2xlIGFzIGEgYmFja2dyb3VuZFxyXG5cdHZhciBiYWNrZ3JvdW5kID0gc3ZnLmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnc3ZnLWJhY2tncm91bmQnKVxyXG5cdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0LmF0dHIoJ3knLCAwKVxyXG5cdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGgpXHJcblx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxyXG5cdFx0LmF0dHIoJ2ZpbGwnLCAndHJhbnNwYXJlbnQnKVxyXG5cdFx0Lm9uKCdjbGljaycsIGRlc2VsZWN0KTtcclxuXHJcblx0Ly8gY3JlYXRlIGdyb3VwIGZvciBlYWNoIHRpY2tldCB0eXBlXHJcblx0dmFyIGdyb3VwcyA9IHN2Zy5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAoZCxpKSA9PiAndGlja2V0LScraSApO1xyXG5cclxuXHQvLyBjcmVhdGUgYmFycyBmb3IgZWFjaCB0aWNrZXQgZ3JvdXBcclxuXHRncm91cHMuc2VsZWN0QWxsKCcuYmFyJylcclxuXHRcdC5kYXRhKCBkID0+IGQgKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyJylcclxuXHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGQgPT4geVNjYWxlKGQueTApIC0geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIG1vdXNlb3ZlcilcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsIG1vdXNlb3V0KVxyXG5cdFx0XHQub24oJ2NsaWNrJywgbW91c2VjbGljayk7XHJcblxyXG5cdHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy14JylcclxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIDAgKycsJysgaGVpZ2h0ICsnKScpXHJcblx0XHQuY2FsbCh4QXhpcyk7XHJcblxyXG5cdHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy15JylcclxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIHdpZHRoICsnLCcrIDAgKycpJylcclxuXHRcdC5jYWxsKHlBeGlzKTtcclxuXHJcblx0ZmlsdGVyID0gc3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZmlsdGVyJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZXMgdGhlIGZpbHRlciBjb250YWluaW5nIHNlbGVjdGVkIG1vbnRoIGFuZCB1cGRhdGVzIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucy5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBkZXNlbGVjdCgpIHtcclxuXHJcblx0XHR2YXIgZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZmlsdGVyJylbMF07XHJcblxyXG5cdFx0aWYgKGZpbHRlci5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Ly8gZGVsZXRlIHNlbGVjdGVkIG1vbnRoXHJcblx0XHRcdGZpbHRlci5yZW1vdmVDaGlsZChmaWx0ZXIuY2hpbGROb2Rlc1swXSk7XHJcblxyXG5cdFx0XHQvLyB1cGRhdGUgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zXHJcblx0XHRcdHVwZGF0ZWRTcGVuZGluZygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGZpbHRlciBmb3IgYSB3aG9sZSBtb250aCBhZnRlciB0aGUgdXNlciBjbGlja3Mgb24gYW55IHRpY2tldCB0aWNrZXQgdHlwZS4gVGhlIGZpbHRlciBpcyByZXByZXNlbnRlZCB3aXRoIGEgd2hpdGUtYm9yZGVyZWQgcmVjdGFuZ2xlLlxyXG5cdCAqIEFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdXBkYXRlZCBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgbW9udGguXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlY2xpY2soZGF0YSkge1xyXG5cdFx0Ly8gdXBkYXRlIG90aGVyIHZpc3VhbGl6YXRpb25zIGFjY29yZGluZyB0byBzZWxlY3RlZCBtb250aFxyXG5cdFx0dXBkYXRlZFNwZW5kaW5nKGRhdGEueCk7XHJcblxyXG5cdFx0Ly8gZ2V0IGFsbCB0aWNrZXQgdHlwZXMgZm9yIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR2YXIgdGlja2V0c01vbnRoID0gZGF0YXNldC5tYXAoIHRpY2tldHMgPT4gdGlja2V0cy5maWx0ZXIoIGQgPT4gZC54ID09PSBkYXRhLnggKSk7XHJcblxyXG5cdFx0Ly8gZmxhdHRlbiB0aGUgYXJyYXlcclxuXHRcdHRpY2tldHNNb250aCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGlja2V0c01vbnRoKTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGhlIGhlaWdodCBhbmQgc3RhcnRpbmcgcG9pbnQgb2YgbW9udGhzIGJhclxyXG5cdFx0dmFyIHkwID0gdGlja2V0c01vbnRoWzBdLnkwO1xyXG5cdFx0dmFyIGJhckhlaWdodCA9IHRpY2tldHNNb250aC5yZWR1Y2UoIChhLCBiKSA9PiBhICsgYi55LCAwKTtcclxuXHRcdFxyXG5cdFx0Ly8gY3JlYXRlIGFuZCB1cGRhdGUgcmVjdGFuZ2xlIGZvciBoaWdobGlnaHRpbmcgdGhlIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR2YXIgc2VsZWN0ZWQgPSBmaWx0ZXIuc2VsZWN0QWxsKCcuc2VsZWN0ZWQnKVxyXG5cdFx0XHQuZGF0YShbZGF0YV0pO1xyXG5cclxuXHRcdHNlbGVjdGVkLmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGJhckhlaWdodCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3NlbGVjdGVkJylcdFxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCAzKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGJhckhlaWdodCkpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIHlTY2FsZSh5MCkgLSB5U2NhbGUoYmFySGVpZ2h0KSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGloZ2xpZ2h0IHRoZSBob3ZlcmVkIGVsZW1lbnQgYW5kIHNob3dzIHRvb2x0aXAuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3ZlcihkKSB7XHJcblx0XHRkMy5zZWxlY3QodGhpcylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGQzLnJnYihjb2xvcihkLnRpY2tldCkpLmJyaWdodGVyKC41KSk7XHJcblxyXG5cdFx0dGlwLnNob3coZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldHMgdGhlIGNvbG9yIG9mIHRoZSBlbGVtZW50IGFuZCBoaWRlcyB0aGUgdG9vbHRpcC5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZW91dCgpIHtcdFx0XHJcblx0XHRkMy5zZWxlY3QodGhpcylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSk7XHJcblxyXG5cdFx0dGlwLmhpZGUoKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm0gZGF0YSBpbnRvIGEgbmV3IGRhdGFzZXQgd2hpY2ggaGFzIHJlYXJyYW5nZWQgdmFsdWVzXHJcbiAqIHNvIHRoYXQgaXQgaXMgYW4gYXJyYXkgb2YgdGlja2V0IHR5cGUgYXJyYXlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2YgZGF0YSBvYmplY3RzIGV4dHJhY3RlZCBmcm9tIGZpbGVcclxuICogQHJldHVybiB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2YgZGF0YSBvYmplY3RzIGdyb3VwZWQgYnkgdGlja2V0IHR5cGVzIGFuZCBtb250aHNcclxuICovXHJcbmZ1bmN0aW9uIHNwZW5kaW5nRGF0YXNldChkYXRhKSB7XHJcblx0dmFyIGRhdGFzZXQgPSBbXTtcclxuXHJcblx0dmFyIHRpY2tldHMgPSB1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKTtcclxuXHJcblx0dmFyIG1vbnRocyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJyk7XHJcblxyXG5cdHZhciBtb250aGx5RGF0YSA9IG1vbnRocy5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cclxuXHR0aWNrZXRzLmZvckVhY2goIHRpY2tldCA9PiB7XHJcblx0XHR2YXIgdGlja2V0QXJyYXkgPSBbXTtcclxuXHJcblx0XHRtb250aGx5RGF0YS5mb3JFYWNoKCAobW9udGhEYXRhLCBpKSA9PiB7XHJcblx0XHRcdHZhciBkYXRhT2JqID0ge307XHJcblx0XHRcclxuXHRcdFx0ZGF0YU9iai50aWNrZXQgPSB0aWNrZXQ7XHRcdFx0XHJcblx0XHRcdGRhdGFPYmoudmFsdWVzID0gbW9udGhEYXRhLmZpbHRlciggZCA9PiBkLnRpY2tldCA9PT0gdGlja2V0KTtcclxuXHRcdFx0ZGF0YU9iai54ID0gbW9udGhzW2ldO1xyXG5cclxuXHRcdFx0ZGF0YU9iai55ID0gZGF0YU9iai52YWx1ZXMucmVkdWNlKCAoYSxiKSA9PiB7XHJcblx0XHRcdFx0aWYgKCBiLnRpY2tldCA9PT0gdGlja2V0ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGEgKyBiLmZhcmU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgMCk7XHJcblxyXG5cdFx0XHR0aWNrZXRBcnJheS5wdXNoKGRhdGFPYmopO1x0XHRcdFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKHRpY2tldEFycmF5KTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBmb3IgdGlja2V0cyBudW1iZXIgYW5kIGF2ZXJhZ2UgcHJpY2UuXHJcbiAqIENyZWF0ZXMgYSBkb251dCBjaGFydCByZXByZXNlbnRpbmcgdGhlIHBhcnRpYWwgcmVsYXRpb25zaGlwIGFuZCB0ZXh0IGVsZW1lbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgYW5kIGNyZWF0ZXMgdGhlIHZpc3VhbGl6YXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2YgZGF0YSBvYmplY3RzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciB2aXN1YWxpemF0aW9uIG9mIHRvcCBzcGVuZGluZ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmlzSWQgaWQgb2YgdGhlIHZpc3VhbGl6YXRpb24gcGFuZWxcclxuICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIGZpbGwgY29sb3IgdXNlZCBmb3IgYXJjc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tldChkYXRhLCBwYXJhbSwgdmlzSWQsIGNvbG9yKSB7XHJcblx0dmFyIHZpcyA9IHt9O1xyXG5cdHZpcy51cGRhdGUgPSB1cGRhdGVDaGFydDtcclxuXHR2aXMucGFyYW0gPSBwYXJhbTtcclxuXHJcblx0dmFyIGNvbG9yVHlwZTtcclxuXHRcclxuXHR2YXIgc3ZnO1xyXG5cclxuXHR2YXIgcGllO1xyXG5cdHZhciBhcmM7XHJcblx0dmFyIHBhdGg7XHJcblxyXG5cdHZhciBwZXJjZW50YWdlO1xyXG5cdHZhciBleGFjdFZhbHVlO1xyXG5cclxuXHR2YXIgYWxsSXRlbXM7XHJcblx0dmFyIHBhcnRJdGVtcztcclxuXHJcblx0dmFyIGluaXRpbGl6ZWQgPSBmYWxzZTtcclxuXHJcblx0aW5pdChkYXRhKTtcclxuXHJcblx0Y3JlYXRlVmlzKGRhdGEpO1xyXG5cclxuXHRpbml0aWxpemVkID0gdHJ1ZTtcclxuXHJcblx0cmV0dXJuIHZpcztcclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZXMgYWxsIG5lZWRlZCB2YXJpYWJsZXMgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBTVkcgcGFuZWwuIFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdFx0bWFyZ2luID0ge3RvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMTAsIGxlZnQ6IDV9O1xyXG5cdFx0d2lkdGggPSAyNjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRcdGhlaWdodCA9IDEzMCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuXHRcdGNvbG9yVHlwZSA9IGQzLnNjYWxlLm9yZGluYWwoKVx0XHRcdFxyXG5cdFx0XHQucmFuZ2UoW2NvbG9yLCAncmdiYSgwLDAsMCwuMyknXSlcclxuXHJcblx0XHRzdmcgPSBkMy5zZWxlY3QoJyMnK3Zpc0lkKVxyXG5cdFx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyB3aWR0aC8yICsnLCcrIChoZWlnaHQvMi1tYXJnaW4uYm90dG9tKSArJyknKTtcclxuXHJcblx0XHRhcmMgPSBkMy5zdmcuYXJjKClcclxuXHRcdFx0Lm91dGVyUmFkaXVzKDUwIC0gMTApXHJcblx0XHRcdC5pbm5lclJhZGl1cyg1MCAtIDIwKTtcclxuXHJcblx0XHRwaWUgPSBkMy5sYXlvdXQucGllKClcclxuXHRcdFx0LnNvcnQobnVsbClcclxuXHRcdFx0LnZhbHVlKGQgPT4gZC52YWx1ZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIHRoZSB2aXN1YWxpemF0aW9uIC0gcGllIGNoYXJ0IGFuZCB0ZXh0IHZhbHVlcyAtIHBlcmNlbnRhZ2UgYW5kIGV4YWN0IHZhbHVlLiBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY3JlYXRlVmlzKGRhdGFzZXQpIHtcclxuXHRcdC8vIHVwZGF0ZSBkYXRhIGFjY29yZGluZyB0byBjaGFuZ2VcclxuXHRcdGRhdGEgPSB1cGRhdGVEYXRhKGRhdGFzZXQsIHBhcmFtKTtcdFx0XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHRoZSBjaGFydFxyXG5cdFx0cGF0aCA9IHN2Zy5zZWxlY3RBbGwoJy5hcmMtJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoZGF0YSlcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2FyYy0nK3BhcmFtKVx0XHRcdFxyXG5cdFx0XHRcdC5hdHRyKCdkJywgYXJjKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgKGQsIGkpID0+IGNvbG9yVHlwZShpKSlcclxuXHRcdFx0XHQuZWFjaCggZnVuY3Rpb24gKGQpIHsgdGhpcy5fY3VycmVudCA9IGQgfSk7XHRcdFxyXG5cclxuXHRcdC8vIHVwZGF0ZVxyXG5cdFx0cGVyY2VudGFnZSA9IHN2Zy5zZWxlY3RBbGwoJy5wZXJjLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3BlcmMtJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIC0xNSApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCA1IClcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdFx0LnRleHQoIHBlcmNlbnQgKTtcclxuXHJcblx0XHRleGFjdFZhbHVlID0gc3ZnLnNlbGVjdEFsbCgnLmV4dmFsLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKFtkYXRhWzBdXSlcclxuXHRcdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2V4dmFsLScrcGFyYW0pXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAtMTUgKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgNjUgKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignZm9udC1zaXplJywgMTgpXHJcblx0XHRcdFx0LnRleHQoIHJvdW5kVmFsdWUgKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgdGhlIGNoYXJ0IGFuZCBhbGwgdGV4dCB2YWx1ZXMgYWNjb3JkaW5nIHRvIG5ldyBnaXZlbiBkYXRhLiBcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVDaGFydChkYXRhc2V0KSB7XHJcblxyXG5cdFx0dmFyIGRhdGEgPSB1cGRhdGVEYXRhKGRhdGFzZXQpO1xyXG5cclxuXHRcdC8vIGNvbXB1dGUgdGhlIG5ldyBhbmdsZXNcclxuXHRcdHBhdGggPSBwYXRoLmRhdGEoIGRhdGEgKTtcclxuXHRcdC8vIHJlZHJhdyBhbGwgYXJjc1xyXG5cdFx0cGF0aC50cmFuc2l0aW9uKCkuYXR0clR3ZWVuKCdkJywgYXJjVHdlZW4pO1xyXG5cclxuXHRcdC8vIHVwZGF0ZSB0ZXh0IC0gcGVyY2VudGFnZSBudW1iZXJcclxuXHRcdHBlcmNlbnRhZ2UuZGF0YShbZGF0YVswXV0pXHJcblx0XHRcdC50ZXh0KCBwZXJjZW50ICk7XHJcblxyXG5cdFx0Ly8gdXBkYXRlIHRleHQgLSBleGFjdCB2YWx1ZSBudW1iZXJcclxuXHRcdGV4YWN0VmFsdWUuZGF0YShbZGF0YVswXV0pXHJcblx0XHRcdC50ZXh0KCByb3VuZFZhbHVlICk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdG9yZSB0aGUgZGlzcGxheWVkIGFuZ2xlcyBpbiBfY3VycmVudC5cclxuXHRcdCAqIFRoZW4sIGludGVycG9sYXRlIGZyb20gX2N1cnJlbnQgdG8gdGhlIG5ldyBhbmdsZXMuXHJcblx0XHQgKiBEdXJpbmcgdGhlIHRyYW5zaXRpb24sIF9jdXJyZW50IGlzIHVwZGF0ZWQgaW4tcGxhY2UgYnkgZDMuaW50ZXJwb2xhdGUuXHJcblx0XHQgKlxyXG5cdFx0ICogY29kZSB0YWtlbiBmcm9tOiBodHRwczovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzEzNDY0MTBcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gYXJjVHdlZW4oYSkge1xyXG5cdFx0XHR2YXIgaSA9IGQzLmludGVycG9sYXRlKHRoaXMuX2N1cnJlbnQsIGEpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5fY3VycmVudCA9IGkoMCk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24odCkge1xyXG5cdFx0XHRcdHJldHVybiBhcmMoaSh0KSk7XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZGF0YXNldCBmcm9tIGdpdmVuIGRhdGEgZm9yIHRoZSB2aXN1YWxpemF0aW9uIGluIHRoZSBmb3JtIG9mIGFycmF5IG9mIHR3byBvYmplY3RzXHJcblx0ICogd2hlcmUgZmlyc3Qgb2JqZWN0IHJlcHJlc2VudHMgYSBwYXJ0IG9mIHRoZSB3aG9sZSBhbmQgdGhlIHNlY29uZCBvYmplY3RzIHJlcHJlc2VudHMgdGhlIHJlc3Qgb2YgdGhlIHdob2xlLlxyXG5cdCAqIFRoZSB3aG9sZSBpcyBjYWxjdWxhdGVkIGFjY29yZGluZyB0byBhIHBhcmFtZXRlciwgZS5nLiB0aGUgd2hvbGUgY2FuIGJlIG51bWJlciBvZiB0aWNrZXRzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YSBcclxuXHQgKiBAcmV0dXJuIHthcnJheX0gcGllZERhdGEgYXJyYXkgb2Ygb2JqZWN0cyBhcyByZXR1cm5lZCBmcm9tIGQzLnBpZSBmdW5jdGlvblxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZURhdGEoZGF0YSkge1xyXG5cdFx0dmFyIGRhdGFzZXQ7XHJcblxyXG5cdFx0aWYgKHZpcy5wYXJhbSA9PT0gJ2ZhcmUnKSB7XHJcblxyXG5cdFx0XHRpZiAoIWluaXRpbGl6ZWQpIHtcclxuXHRcdFx0XHRhbGxJdGVtcyA9IGF2Z1ByaWNlKGRhdGEpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRwYXJ0SXRlbXMgPSBhdmdQcmljZShkYXRhKTtcdFx0XHRcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcclxuXHRcdFx0aWYgKCFpbml0aWxpemVkKSB7XHJcblx0XHRcdFx0YWxsSXRlbXMgPSBkYXRhW3BhcmFtXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cGFydEl0ZW1zID0gZGF0YVtwYXJhbV07XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChhbGxJdGVtcyA9PT0gcGFydEl0ZW1zKSB7XHJcblx0XHRcdGRhdGFzZXQgPSBbeyB2YWx1ZTogYWxsSXRlbXMgfSwgeyB2YWx1ZTogMCB9XTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGRhdGFzZXQgPSBbeyB2YWx1ZTogcGFydEl0ZW1zIH0sIHsgdmFsdWU6IGFsbEl0ZW1zIC0gcGFydEl0ZW1zIH1dO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBwaWUoZGF0YXNldCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGb3JtYXRzIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0IC0gZWl0aGVyIGFzIGEgbnVtYmVyIHdpdGggY3VycmVuY3kgb3IganVzdCBhIG51bWJlci4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZCBkYXRhIG9iamVjdFxyXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gcm91bmRWYWx1ZSBmb3JtYXR0ZWQgdmFsdWVcclxuXHQgKi9cclxuXHRmdW5jdGlvbiByb3VuZFZhbHVlKGQpIHtcclxuXHRcdGlmICh2aXMucGFyYW0gPT09ICdmYXJlJykge1xyXG5cdFx0XHRyZXR1cm4gbnVtZXJhbChkLnZhbHVlKS5mb3JtYXQoJyQwLDAnKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHJldHVybiBudW1lcmFsKGQudmFsdWUpLmZvcm1hdCgnMCwwJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGb3JtYXRzIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gb2JqZWN0IGludG8gYSByb3VuZGVkIHBlcmNlbnRhZ2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZCBkYXRhIG9iamVjdFxyXG5cdCAqIEByZXR1cm4ge3N0cmluZ30gcGVyY2VudCBmb3JtYXR0ZWQgc3RyaW5nXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gcGVyY2VudChkKSB7XHJcblx0XHR2YXIgcGVyY2VudCA9IGQudmFsdWUvYWxsSXRlbXMqMTAwO1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQocGVyY2VudCkrJyUnO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGF2ZXJhZ2UgcHJpY2Ugb2YgdGlja2V0cyBmcm9tIGdpdmVuIGRhdGEgLSBzdW0gb2YgYWxsIGZhcmVzIG92ZXIgbnVtYmVyIG9mIGFsbCB0aWNrZXRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqIEByZXR1cm4ge251bWJlcn0gYXZnUHJpY2VcclxuICovXHJcbmZ1bmN0aW9uIGF2Z1ByaWNlKGRhdGEpIHtcclxuXHRcclxuXHR2YXIgcHJpY2VTdW0gPSBkYXRhLnJlZHVjZSggKGEsIGIpID0+IGEgKyBiLmZhcmUsIDAgKTtcclxuXHRcclxuXHR2YXIgdGlja2V0TnVtID0gZGF0YS5sZW5ndGg7XHJcblxyXG5cdHJldHVybiBwcmljZVN1bSAvIHRpY2tldE51bTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIHRvcCBzcGVuZGluZyBmb3IgZ2l2ZW4gZWxlbWVudC5cclxuICogQ3JlYXRlcyBmaXZlIGJhciBjaGFydHMgc3RhdGluZyB0aGUgdG9wIGVsZW1lbnRzIHdoaWNoIHNwZW5kIHRoZSBtb3N0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXMsIGNhbGNTcGVuZGluZ30gZnJvbSAnLi92aXMtdXRpbCc7XHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBhbmQgY3JlYXRlcyB0aGUgdmlzdWFsaXphdGlvbi5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHNcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIG5hbWUgb2YgdGhlIHBhcmFtZXRlciB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIHZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB2aXNJZCBpZCBvZiB0aGUgdmlzdWFsaXphdGlvbiBwYW5lbFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgZmlsbCBjb2xvciB1c2VkIGZvciBhbGwgcmVjdGFuZ2xlc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvcFNwZW5kaW5nKGRhdGEsIHBhcmFtLCB2aXNJZCwgY29sb3IpIHtcclxuXHJcblx0dmFyIHZpcyA9IHt9O1xyXG5cdHZpcy51cGRhdGUgPSB1cGRhdGVUb3BTcGVuZGluZztcdFxyXG5cclxuXHR2YXIgeFNjYWxlO1xyXG5cdHZhciB5U2NhbGU7XHJcblx0dmFyIHN2ZztcclxuXHJcblx0Ly8gY2FsY3VsYXRlIGRhdGEsIGluaXRpYWxpemUgYW5kIGRyYXcgY2hhcnRcclxuXHR2YXIgdG9wRGF0YSA9IGNhbGNUb3AoZGF0YSk7XHJcblxyXG5cdGluaXQodG9wRGF0YSk7XHJcblxyXG5cdGNyZWF0ZUJhckNoYXJ0KHRvcERhdGEpO1xyXG5cclxuXHRyZXR1cm4gdmlzO1xyXG5cclxuXHQvKipcclxuXHQgKiBGaXJzdGx5LCBjYWxjdWxhdGVzIHRoZSBuZXcgdG9wIGRhdGEgYW5kIHRoZW4gdXBkYXRlcyB0aGUgYmFyIGNoYXJ0IGFuZCB0ZXh0IHZhbHVlcyBhY2NvcmRpbmcgdG8gbmV3IGRhdGEuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlVG9wU3BlbmRpbmcoZGF0YSkge1x0XHJcblx0XHR1cGRhdGUoY2FsY1RvcChkYXRhKSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRvcCBmaXZlIGl0ZW1zIGZyb20gZGF0YSBhY2NvcmRpbmcgdG8gc3BlbmRpbmcgKGZhcmUpIHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuXHQgKiBAcmV0dXJuIHthcnJheX0gZGF0YXNldCB1cGRhdGVkIFxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGNhbGNUb3AoZGF0YSkge1xyXG5cdFx0cmV0dXJuIGNhbGNTcGVuZGluZyhkYXRhLCBwYXJhbSkuc29ydCggKGEsIGIpID0+IGIuZmFyZSAtIGEuZmFyZSApLnNsaWNlKDAsNSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplcyBhbGwgbmVlZGVkIHZhcmlhYmxlcyBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC4gXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5pdChkYXRhKSB7XHJcblx0XHRtYXJnaW4gPSB7dG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiA1fTtcclxuXHRcdHdpZHRoID0gMjYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0XHRoZWlnaHQgPSAxMzAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcblx0XHR5U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdFx0LmRvbWFpbihkYXRhLm1hcChkID0+IGRbcGFyYW1dKSlcclxuXHRcdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgaGVpZ2h0XSwgLjEpO1xyXG5cclxuXHRcdHhTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXHJcblx0XHRcdC5kb21haW4oWyAwLCBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQuZmFyZSkpIF0pXHJcblx0XHRcdC5yYW5nZShbIDAsIHdpZHRoIF0pO1xyXG5cclxuXHRcdHN2ZyA9IGQzLnNlbGVjdCgnIycrdmlzSWQpXHJcblx0XHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGJhciBjaGFydCBhbmQgYSB0b29sdGlwLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGNyZWF0ZUJhckNoYXJ0KGRhdGEpIHtcclxuXHJcblx0XHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdFx0dGlwID0gZDMudGlwKClcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gJzxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC5mYXJlKS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+JzsgXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdHN2Zy5jYWxsKHRpcCk7XHJcblxyXG5cdFx0Ly8gY3JlYXRlIGJhciBjaGFydHNcclxuXHRcdHVwZGF0ZShkYXRhKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGVzIHRoZSBiYXIgY2hhcnQgdmlzdWFsaXphdGlvbiB3aXRoIGFsbCBuYW1lcyBhbmQgZmFyZSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHM7IGUuZy4gWyB7IGZhcmU6IHgsIG90aGVyUGFyYW06IGEgfSwgeyBmYXJlOiB5LCBvdGhlclBhcmFtOiBiIH0sIC4uLiBdXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlKGRhdGEpIHtcclxuXHRcdC8vIHVwZGF0ZSBzY2FsZSBzbyByZWxhdGl2ZSBkaWZmZXJlbmNpZXMgY2FuIGJlIHNlZW5cclxuXHRcdHhTY2FsZS5kb21haW4oWyAwLCBNYXRoLm1heCguLi5kYXRhLm1hcChkID0+IGQuZmFyZSkpIF0pO1xyXG5cclxuXHRcdC8vIGRyYXcgcmVjdGFuZ2xlIHJlcHJlc2VudGluZyBzcGVuZGluZ1xyXG5cdFx0dmFyIGJhcnMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0pXHJcblx0XHRcdC5kYXRhKGRhdGEpO1xyXG5cclxuXHRcdGJhcnMudHJhbnNpdGlvbigpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlKGQuZmFyZSkpO1xyXG5cclxuXHRcdGJhcnMuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyLScrcGFyYW0pXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCBkID0+IDApXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkW3BhcmFtXSkpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIGQgPT4geVNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlKGQuZmFyZSkpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCBjb2xvcilcclxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHRcdC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XHJcblxyXG5cdFx0YmFycy5leGl0KCkucmVtb3ZlKCk7XHJcblxyXG5cdFx0Ly8gZHJhdyB0ZXh0IHRvIHRoZSBsZWZ0IG9mIGVhY2ggYmFyIHJlcHJlc2VudGluZyB0aGUgbmFtZVxyXG5cdFx0dmFyIG5hbWVzID0gc3ZnLnNlbGVjdEFsbCgnLmJhci0nK3BhcmFtKyctbmFtZScpXHJcblx0XHRcdC5kYXRhKGRhdGEpO1xyXG5cclxuXHRcdG5hbWVzLnRyYW5zaXRpb24oKVxyXG5cdFx0XHQudGV4dChkID0+IGRbcGFyYW1dKTtcclxuXHJcblx0XHRuYW1lcy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSsnLW5hbWUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgMClcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGRbcGFyYW1dKSlcclxuXHRcdFx0XHQuYXR0cignZHknLCAxNylcclxuXHRcdFx0XHQuYXR0cignZHgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQudGV4dChkID0+IGRbcGFyYW1dKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW91dCcsIHRpcC5oaWRlKTtcclxuXHJcblx0XHRuYW1lcy5leGl0KCkucmVtb3ZlKCk7XHJcblxyXG5cdFx0Ly8gZHJhdyB0ZXh0IHRvIHRoZSByaWdodCBvZiBlYWNoIGJhciByZXByZXNlbnRpbmcgdGhlIHJvdW5kZWQgc3BlbmRpbmdcclxuXHRcdHZhciBmYXJlcyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSsnLWZhcmUnKVxyXG5cdFx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0XHRmYXJlcy50cmFuc2l0aW9uKClcclxuXHRcdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0XHRmYXJlcy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSsnLWZhcmUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4Jywgd2lkdGgtMzUpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkW3BhcmFtXSkpXHJcblx0XHRcdFx0LmF0dHIoJ2R5JywgMTcpXHJcblx0XHRcdFx0LmF0dHIoJ2R4JywgNSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICd3aGl0ZScpXHJcblx0XHRcdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0XHRmYXJlcy5leGl0KCkucmVtb3ZlKCk7XHJcblx0fVxyXG59IiwiLyoqXHJcbiAqIEZpbmRzIG91dCB0aGUgdW5pcXVlIHZhbHVlcyBvZiBnaXZlbiBkYXRhIGZvciBnaXZlbiBwYXJhbWV0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgYWxsIHllYXIgc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIHBhcmFtZXRlciB3aGljaCBzaG91bGQgYmUgbG9va2VkIHVwXHJcbiAqIEByZXR1cm4ge2FycmF5fSB1bmlxdWVWYWx1ZXMgYXJyYXkgb2YgYWxsIHVuaXF1ZSB2YWx1ZXMgZm9yIGdpdmVuIHBhcmFtZXRlclxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pIHtcclxuXHRyZXR1cm4gWyAuLi5uZXcgU2V0KGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSB3aG9sZSB5ZWFyJ3Mgc3BlbmRpbmcgZm9yIGEgZ2l2ZW4gcGFyYW0gKGUuZy4gc3VwcGxpZXIsIGRpcmVjdG9yYXRlKSBhbmQgcmV0dXJucyBpdCBpbiB1cGRhdGVkIGFycmF5IG9mIG9iamVjdHMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtXHJcbiAqIEByZXR1cm4ge2FycmF5fSBhbGxTcGVuZGluZyBhcnJheSBvZiB1cGRhdGVkIG9iamVjdHMsIGUuZy4gWyB7ZmFyZTogeCwgcGFyYW06IGF9LCB7ZmFyZTogeSwgcGFyYW06IGJ9LCAuLi5dXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2FsY1NwZW5kaW5nKGRhdGEsIHBhcmFtKSB7XHJcblx0dmFyIHVuaXFJdGVtcyA9IHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pO1xyXG5cdFxyXG5cdHZhciBhbGxQYXJhbXMgPSB1bmlxSXRlbXMubWFwKCBpdGVtID0+IGRhdGEuZmlsdGVyKCBkID0+IGRbcGFyYW1dID09PSBpdGVtICkpO1xyXG5cclxuXHR2YXIgYWxsU3BlbmRpbmcgPSBbXTtcclxuXHJcblx0YWxsUGFyYW1zLmZvckVhY2goIGl0ZW1BcnJheSA9PiB7XHJcblx0XHR2YXIgb2JqID0ge307XHJcblxyXG5cdFx0b2JqWydmYXJlJ10gPSBpdGVtQXJyYXkucmVkdWNlKCAoYSxiKSA9PiBhICsgYi5mYXJlLCAwKTtcclxuXHRcdG9ialtwYXJhbV0gPSBpdGVtQXJyYXlbMF1bcGFyYW1dO1xyXG5cclxuXHRcdGFsbFNwZW5kaW5nLnB1c2gob2JqKTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGFsbFNwZW5kaW5nO1xyXG59IiwiLyoqXHJcbiAqIE1haW4gdmlzdWFsaXphdGlvbiBtb2R1bGUgZm9yIGNyZWF0aW5nIGNoYXJ0cyBhbmQgdmlzIGZvciBwYXNzZWQgZGF0YS5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtzcGVuZGluZ30gZnJvbSAnLi9zcGVuZGluZyc7XHJcbmltcG9ydCB7ZGlzdHJpYnV0aW9ufSBmcm9tICcuL2Rpc3RyaWJ1dGlvbic7XHJcbmltcG9ydCB7dG9wU3BlbmRpbmd9IGZyb20gJy4vdG9wU3BlbmRpbmcnO1xyXG5pbXBvcnQge3RpY2tldH0gZnJvbSAnLi90aWNrZXQnO1xyXG5cclxudmFyIGRhdGE7XHJcbnZhciBwYW5lbHMgPSBbXHJcblx0J3Zpcy1zcGVuZGluZycsIFxyXG5cdCd2aXMtZGlzdHJpYnV0aW9uJywgXHJcblx0J3Zpcy10aWNrZXQtbnVtJywgXHJcblx0J3Zpcy10aWNrZXQtYXZnJywgXHJcblx0J3Zpcy10b3Atc3VwJywgXHJcblx0J3Zpcy10b3AtZGlyJ1xyXG5cdF07XHJcblxyXG52YXIgc3VwO1xyXG52YXIgZGlyO1xyXG5cclxudmFyIHByaWNlO1xyXG52YXIgbnVtO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2Ygb2JqZWN0cyBmb3IgdmlzdWFsaXphdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhc2V0KXtcdFxyXG5cdGRhdGEgPSBkYXRhc2V0O1xyXG5cclxuXHRkZXRlY3RQYW5lbHMoZGF0YSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRhIGlzIGZpcnN0bHkgZmlsdGVyZWQgYWNjb3JkaW5nIHRvIG1vbnRoIGFuZCBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMgYXJlIHRoZW4gcmVkcmF3biB3aXRoIHVwZGF0ZWQgZGF0YS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG1vbnRoIHNlbGVjdGVkIG1vbnRoIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgZmlsdGVyaW5nIGRhdGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVkU3BlbmRpbmcobW9udGgpIHtcclxuXHR2YXIgZGF0YXNldDtcclxuXHRcclxuXHRpZiAobW9udGgpIHtcclxuXHRcdC8vIHJlZHJhdyBhbGwgcGFuZWxzIHdpdGggb25seSBnaXZlbiBtb250aCBkYXRhXHJcblx0XHRkYXRhc2V0ID0gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBhbGwgbW9udGhzIGRhdGFcclxuXHRcdGRhdGFzZXQgPSBkYXRhO1xyXG5cdH1cclxuXHJcblx0c3VwLnVwZGF0ZShkYXRhc2V0KTtcclxuXHRkaXIudXBkYXRlKGRhdGFzZXQpO1xyXG5cdG51bS51cGRhdGUoZGF0YXNldCk7XHJcblx0cHJpY2UudXBkYXRlKGRhdGFzZXQpO1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiBkZXRlY3RQYW5lbHMoZGF0YSkge1xyXG5cdHBhbmVscy5mb3JFYWNoKCBwYW5lbCA9PiB7XHJcblx0XHRpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFuZWwpKSB7XHJcblx0XHRcdHN3aXRjaCAocGFuZWwpIHtcclxuXHRcdFx0XHRjYXNlIHBhbmVsc1swXTpcclxuXHRcdFx0XHRcdHNwZW5kaW5nKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzFdOlxyXG5cdFx0XHRcdFx0ZGlzdHJpYnV0aW9uKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdGNhc2UgcGFuZWxzWzJdOlxyXG5cdFx0XHRcdFx0bnVtID0gdGlja2V0KGRhdGEsICdsZW5ndGgnLCBwYW5lbHNbMl0sICcjZmYyMjU1Jyk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbM106XHJcblx0XHRcdFx0XHRwcmljZSA9IHRpY2tldChkYXRhLCAnZmFyZScsIHBhbmVsc1szXSwgJyNmZjU3MjInKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRjYXNlIHBhbmVsc1s0XTpcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRzdXAgPSB0b3BTcGVuZGluZyhkYXRhLCAnc3VwcGxpZXInLCBwYW5lbHNbNF0sICcjNGI5MjI2Jyk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0Y2FzZSBwYW5lbHNbNV06XHJcblx0XHRcdFx0XHRkaXIgPSB0b3BTcGVuZGluZyhkYXRhLCAnZGlyZWN0b3JhdGUnLCBwYW5lbHNbNV0sICcjYWY0YzdlJyk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVx0XHRcclxuXHR9KTtcclxufSJdfQ==
