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

},{"./visualize":6}],3:[function(require,module,exports){
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

},{"./vis-util":5,"./visualize":6}],4:[function(require,module,exports){
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
 * Initializes all variables needed for visualization.
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

},{"./vis-util":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.visualize = visualize;
exports.updatedSpending = updatedSpending;

var _spending = require('./spending');

var _distribution = require('./distribution');

var _topSpending = require('./topSpending');

var data; /**
           * Main visualization module for creating charts and vis for passed data.
           *
           * @author lucyia <ping@lucyia.com>
           * @version 0.1
           */

var panels = ['vis-spending', 'vis-distribution', 'vis-top-dir', 'vis-top-sup'];

var sup;
var dir;

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
	if (month) {
		// redraw all panels with only given month data
		var dataset = data.filter(function (d) {
			return d.month === month;
		});
		sup.update(dataset);
		dir.update(dataset);
	} else {
		// redraw all panels with all months data
		sup.update(data);
		dir.update(data);
	}
}

/**
 *
 */
function detectPanels(data) {
	panels.forEach(function (panel) {
		if (document.getElementById(panel)) {
			switch (panel) {
				case 'vis-spending':
					(0, _spending.spending)(data);
					break;
				case 'vis-distribution':
					(0, _distribution.distribution)(data);
					break;
				case 'vis-avg-month':
					avgMonth(data);
					break;
				case 'vis-avg-price':
					avgPrice(data);
					break;
				case 'vis-top-sup':
					sup = (0, _topSpending.topSpending)(data, 'supplier', 'vis-top-sup', '#4b9226');
					break;
				case 'vis-top-dir':
					dir = (0, _topSpending.topSpending)(data, 'directorate', 'vis-top-dir', '#af4c7e');
					break;
			}
		}
	});
}

},{"./distribution":1,"./spending":3,"./topSpending":4}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGlzdHJpYnV0aW9uLmpzIiwianNcXGluaXQuanMiLCJqc1xcc3BlbmRpbmcuanMiLCJqc1xcdG9wU3BlbmRpbmcuanMiLCJqc1xcdmlzLXV0aWwuanMiLCJqc1xcdmlzdWFsaXplLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUNxQmdCLFksR0FBQSxZOzs7Ozs7Ozs7O0FBWmhCLElBQUksTUFBSjtBQUNBLElBQUksS0FBSjtBQUNBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxHQUFKOztBQUVBLElBQUksR0FBSjtBQUNBLElBQUksR0FBSjs7QUFFQSxJQUFJLEtBQUo7O0FBRU8sU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCOztBQUVsQyxPQUFLLElBQUw7QUFFQTs7QUFFRCxTQUFTLElBQVQsQ0FBYyxJQUFkLEVBQW9CO0FBQ25CLFdBQVMsRUFBQyxLQUFLLEVBQU4sRUFBVSxPQUFPLEVBQWpCLEVBQXFCLFFBQVEsRUFBN0IsRUFBaUMsTUFBTSxFQUF2QyxFQUFUO0FBQ0EsVUFBUSxNQUFNLE9BQU8sSUFBYixHQUFvQixPQUFPLEtBQW5DO0FBQ0EsV0FBUyxNQUFNLE9BQU8sR0FBYixHQUFtQixPQUFPLE1BQW5DO0FBRUE7Ozs7O0FDekJEOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7OztBQUdkLFNBQVEsUUFBUixDQUFpQixPQUFqQjs7O0FBR0EsSUFBRyxHQUFILENBQU8sc0NBQVAsRUFDRSxHQURGLENBQ08sYUFBSztBQUNWLFNBQU87QUFDTixjQUFXLEVBQUUsU0FEUDtBQUVOLGdCQUFhLEVBQUUsV0FGVDtBQUdOLGdCQUFhLEVBQUUsV0FIVDtBQUlOLFVBQU8sRUFBRSxjQUpIO0FBS04sU0FBTSxXQUFXLEVBQUUsU0FBYixDQUxBO0FBTU4sV0FBUSxFQUFFLHdCQU5KO0FBT04sYUFBVSxFQUFFO0FBUE4sR0FBUDtBQVNBLEVBWEYsRUFZRSxHQVpGLENBWU8sVUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN0QixNQUFJLEtBQUosRUFBVyxRQUFRLEdBQVIsQ0FBWSxLQUFaOztBQUVYLDRCQUFVLElBQVY7QUFDQSxFQWhCRjtBQWlCQTs7Ozs7Ozs7UUNHZSxRLEdBQUEsUTs7QUF0Q2hCOztBQUNBOzs7Ozs7Ozs7OztBQUdBLElBQUksTUFBSjtBQUNBLElBQUksS0FBSjtBQUNBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxHQUFKOztBQUVBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxNQUFKOztBQUVBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxLQUFKOztBQUVBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxLQUFKOzs7QUFHQSxJQUFJLEdBQUo7OztBQUdBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxPQUFKOzs7OztBQUtPLFNBQVMsUUFBVCxDQUFrQixJQUFsQixFQUF3Qjs7QUFFOUIsTUFBSyxJQUFMOztBQUVBLFdBQVUsZ0JBQWdCLElBQWhCLENBQVY7O0FBRUEsZ0JBQWUsT0FBZjtBQUNBOzs7Ozs7O0FBT0QsU0FBUyxJQUFULENBQWMsSUFBZCxFQUFvQjs7QUFFbkIsVUFBUyxFQUFDLEtBQUssRUFBTixFQUFVLE9BQU8sRUFBakIsRUFBcUIsUUFBUSxFQUE3QixFQUFpQyxNQUFNLEVBQXZDLEVBQVQ7QUFDQSxTQUFRLE1BQU0sT0FBTyxJQUFiLEdBQW9CLE9BQU8sS0FBbkM7QUFDQSxVQUFTLE1BQU0sT0FBTyxHQUFiLEdBQW1CLE9BQU8sTUFBbkM7O0FBRUEsVUFBUyxHQUFHLEtBQUgsQ0FBUyxPQUFULEdBQ1AsTUFETyxDQUNBLENBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsRUFBaUMsT0FBakMsRUFBMEMsS0FBMUMsRUFBaUQsTUFBakQsRUFBeUQsTUFBekQsRUFBaUUsUUFBakUsRUFBMkUsV0FBM0UsRUFBd0YsU0FBeEYsRUFBbUcsVUFBbkcsRUFBK0csVUFBL0csQ0FEQSxFQUVQLGVBRk8sQ0FFUyxDQUFDLENBQUQsRUFBSSxLQUFKLENBRlQsRUFFcUIsR0FGckIsQ0FBVDs7O0FBS0EsS0FBSSxhQUFhLEtBQUssS0FBTCxDQUFZLEtBQUssR0FBTCxnQ0FBWSxXQUFXLElBQVgsQ0FBWixLQUFnQyxJQUE1QyxJQUFxRCxJQUF0RTtBQUNBLFVBQVMsR0FBRyxLQUFILENBQVMsTUFBVCxHQUNQLE1BRE8sQ0FDQSxDQUFFLENBQUYsRUFBSyxVQUFMLENBREEsRUFFUCxLQUZPLENBRUQsQ0FBRSxNQUFGLEVBQVUsQ0FBVixDQUZDLENBQVQ7O0FBSUEsU0FBUSxHQUFHLEdBQUgsQ0FBTyxJQUFQLEdBQ04sS0FETSxDQUNBLE1BREEsRUFFTixNQUZNLENBRUMsUUFGRCxDQUFSOztBQUlBLFNBQVEsR0FBRyxHQUFILENBQU8sSUFBUCxHQUNOLEtBRE0sQ0FDQSxNQURBLEVBRU4sTUFGTSxDQUVDLE9BRkQsRUFHTixVQUhNLENBR007QUFBQSxTQUFLLFFBQVEsQ0FBUixFQUFXLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBTDtBQUFBLEVBSE4sQ0FBUjs7QUFLQSxTQUFRLEdBQUcsS0FBSCxDQUFTLE9BQVQsR0FDTixNQURNLENBQ0MseUJBQVcsSUFBWCxFQUFpQixRQUFqQixDQURELEVBRU4sS0FGTSxDQUVBLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsQ0FGQSxDQUFSOztBQUlBLFNBQVEsR0FBRyxNQUFILENBQVUsS0FBVixFQUFSOztBQUVBLE9BQU0sR0FBRyxNQUFILENBQVUsZUFBVixFQUNKLE1BREksQ0FDRyxLQURILEVBRUgsSUFGRyxDQUVFLE9BRkYsRUFFVyxRQUFRLE9BQU8sSUFBZixHQUFzQixPQUFPLEtBRnhDLEVBR0gsSUFIRyxDQUdFLFFBSEYsRUFHWSxTQUFTLE9BQU8sR0FBaEIsR0FBc0IsT0FBTyxNQUh6QyxFQUlKLE1BSkksQ0FJRyxHQUpILEVBS0gsSUFMRyxDQUtFLFdBTEYsRUFLZSxlQUFjLE9BQU8sSUFBckIsR0FBMkIsR0FBM0IsR0FBZ0MsT0FBTyxHQUF2QyxHQUE0QyxHQUwzRCxDQUFOOzs7Ozs7OztBQWFBLFVBQVMsVUFBVCxDQUFvQixJQUFwQixFQUEwQjs7QUFFekIsTUFBSSxRQUFRLHlCQUFXLElBQVgsRUFBaUIsT0FBakIsRUFBMEIsR0FBMUIsQ0FBK0I7QUFBQSxVQUFTLEtBQUssTUFBTCxDQUFhO0FBQUEsV0FBSyxFQUFFLEtBQUYsS0FBWSxLQUFqQjtBQUFBLElBQWIsQ0FBVDtBQUFBLEdBQS9CLENBQVo7O0FBRUEsTUFBSSxrQkFBa0IsTUFBTSxHQUFOLENBQVc7QUFBQSxVQUFRLEtBQUssTUFBTCxDQUFhLFVBQUMsQ0FBRCxFQUFHLENBQUg7QUFBQSxXQUFTLElBQUksRUFBRSxJQUFmO0FBQUEsSUFBYixFQUFrQyxDQUFsQyxDQUFSO0FBQUEsR0FBWCxDQUF0Qjs7QUFFQSxTQUFPLGVBQVA7QUFDQTtBQUNEOzs7Ozs7OztBQVFELFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4Qjs7QUFFN0IsT0FBTSxJQUFOOzs7QUFHQSxPQUFNLEdBQUcsR0FBSCxHQUNKLElBREksQ0FDQyxPQURELEVBQ1UsUUFEVixFQUVKLElBRkksQ0FFRSxhQUFLO0FBQ1gsTUFBSSxRQUFRLE1BQU0sS0FBTixHQUFjLE9BQWQsQ0FBc0IsTUFBTSxFQUFFLE1BQVIsQ0FBdEIsQ0FBWjtBQUNBLFNBQU8sNEJBQTBCLEtBQTFCLEdBQWdDLElBQWhDLEdBQXNDLEVBQUUsTUFBeEMsR0FBZ0Qsa0NBQWhELEdBQW1GLFFBQVEsRUFBRSxDQUFWLEVBQWEsTUFBYixDQUFvQixNQUFwQixDQUFuRixHQUFpSCxTQUF4SDtBQUNBLEVBTEksQ0FBTjs7QUFPQSxLQUFJLElBQUosQ0FBUyxHQUFUOzs7QUFHQSxLQUFJLGFBQWEsSUFBSSxNQUFKLENBQVcsTUFBWCxFQUNmLElBRGUsQ0FDVixPQURVLEVBQ0QsZ0JBREMsRUFFZixJQUZlLENBRVYsR0FGVSxFQUVMLENBRkssRUFHZixJQUhlLENBR1YsR0FIVSxFQUdMLENBSEssRUFJZixJQUplLENBSVYsT0FKVSxFQUlELEtBSkMsRUFLZixJQUxlLENBS1YsUUFMVSxFQUtBLE1BTEEsRUFNZixJQU5lLENBTVYsTUFOVSxFQU1GLGFBTkUsRUFPZixFQVBlLENBT1osT0FQWSxFQU9ILFFBUEcsQ0FBakI7OztBQVVBLEtBQUksU0FBUyxJQUFJLFNBQUosQ0FBYyxHQUFkLEVBQ1gsSUFEVyxDQUNOLElBRE0sRUFFWCxLQUZXLEdBR1YsTUFIVSxDQUdILEdBSEcsRUFJVixJQUpVLENBSUwsT0FKSyxFQUlJLFVBQUMsQ0FBRCxFQUFHLENBQUg7QUFBQSxTQUFTLFlBQVUsQ0FBbkI7QUFBQSxFQUpKLENBQWI7OztBQU9BLFFBQU8sU0FBUCxDQUFpQixNQUFqQixFQUNFLElBREYsQ0FDUTtBQUFBLFNBQUssQ0FBTDtBQUFBLEVBRFIsRUFFRSxLQUZGLEdBR0UsTUFIRixDQUdTLE1BSFQsRUFJRyxJQUpILENBSVEsT0FKUixFQUlpQixLQUpqQixFQUtHLElBTEgsQ0FLUSxHQUxSLEVBS2E7QUFBQSxTQUFLLE9BQU8sRUFBRSxDQUFULENBQUw7QUFBQSxFQUxiLEVBTUcsSUFOSCxDQU1RLEdBTlIsRUFNYTtBQUFBLFNBQUssT0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLEVBQWYsQ0FBTDtBQUFBLEVBTmIsRUFPRyxJQVBILENBT1EsT0FQUixFQU9pQjtBQUFBLFNBQUssT0FBTyxTQUFQLEVBQUw7QUFBQSxFQVBqQixFQVFHLElBUkgsQ0FRUSxRQVJSLEVBUWtCO0FBQUEsU0FBSyxPQUFPLEVBQUUsRUFBVCxJQUFlLE9BQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxFQUFmLENBQXBCO0FBQUEsRUFSbEIsRUFTRyxJQVRILENBU1EsTUFUUixFQVNnQjtBQUFBLFNBQUssTUFBTSxFQUFFLE1BQVIsQ0FBTDtBQUFBLEVBVGhCLEVBVUcsRUFWSCxDQVVNLFdBVk4sRUFVbUIsU0FWbkIsRUFXRyxFQVhILENBV00sVUFYTixFQVdrQixRQVhsQixFQVlHLEVBWkgsQ0FZTSxPQVpOLEVBWWUsVUFaZjs7QUFjQSxLQUFJLE1BQUosQ0FBVyxHQUFYLEVBQ0UsSUFERixDQUNPLE9BRFAsRUFDZ0IsYUFEaEIsRUFFRSxJQUZGLENBRU8sV0FGUCxFQUVvQixlQUFjLENBQWQsR0FBaUIsR0FBakIsR0FBc0IsTUFBdEIsR0FBOEIsR0FGbEQsRUFHRSxJQUhGLENBR08sS0FIUDs7QUFLQSxLQUFJLE1BQUosQ0FBVyxHQUFYLEVBQ0UsSUFERixDQUNPLE9BRFAsRUFDZ0IsYUFEaEIsRUFFRSxJQUZGLENBRU8sV0FGUCxFQUVvQixlQUFjLEtBQWQsR0FBcUIsR0FBckIsR0FBMEIsQ0FBMUIsR0FBNkIsR0FGakQsRUFHRSxJQUhGLENBR08sS0FIUDs7QUFLQSxVQUFTLElBQUksTUFBSixDQUFXLEdBQVgsRUFDUCxJQURPLENBQ0YsT0FERSxFQUNPLFFBRFAsQ0FBVDs7Ozs7QUFNQSxVQUFTLFFBQVQsR0FBb0I7O0FBRW5CLE1BQUksU0FBUyxTQUFTLHNCQUFULENBQWdDLFFBQWhDLEVBQTBDLENBQTFDLENBQWI7O0FBRUEsTUFBSSxPQUFPLFVBQVAsQ0FBa0IsTUFBbEIsR0FBMkIsQ0FBL0IsRUFBa0M7O0FBRWpDLFVBQU8sV0FBUCxDQUFtQixPQUFPLFVBQVAsQ0FBa0IsQ0FBbEIsQ0FBbkI7OztBQUdBO0FBQ0E7QUFDRDs7Ozs7Ozs7QUFRRCxVQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7O0FBRXpCLGtDQUFnQixLQUFLLENBQXJCOzs7QUFHQSxNQUFJLGVBQWUsUUFBUSxHQUFSLENBQWE7QUFBQSxVQUFXLFFBQVEsTUFBUixDQUFnQjtBQUFBLFdBQUssRUFBRSxDQUFGLEtBQVEsS0FBSyxDQUFsQjtBQUFBLElBQWhCLENBQVg7QUFBQSxHQUFiLENBQW5COzs7QUFHQSxpQkFBZSxHQUFHLE1BQUgsQ0FBVSxLQUFWLENBQWdCLEVBQWhCLEVBQW9CLFlBQXBCLENBQWY7OztBQUdBLE1BQUksS0FBSyxhQUFhLENBQWIsRUFBZ0IsRUFBekI7QUFDQSxNQUFJLFlBQVksYUFBYSxNQUFiLENBQXFCLFVBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxVQUFVLElBQUksRUFBRSxDQUFoQjtBQUFBLEdBQXJCLEVBQXdDLENBQXhDLENBQWhCOzs7QUFHQSxNQUFJLFdBQVcsT0FBTyxTQUFQLENBQWlCLFdBQWpCLEVBQ2IsSUFEYSxDQUNSLENBQUMsSUFBRCxDQURRLENBQWY7O0FBR0EsV0FBUyxJQUFULENBQWMsR0FBZCxFQUFtQjtBQUFBLFVBQUssT0FBTyxFQUFFLENBQVQsQ0FBTDtBQUFBLEdBQW5CLEVBQ0UsSUFERixDQUNPLEdBRFAsRUFDWTtBQUFBLFVBQUssT0FBTyxTQUFQLENBQUw7QUFBQSxHQURaLEVBRUUsSUFGRixDQUVPLFFBRlAsRUFFaUIsT0FBTyxFQUFQLElBQWEsT0FBTyxTQUFQLENBRjlCOztBQUlBLFdBQVMsS0FBVCxHQUNFLE1BREYsQ0FDUyxNQURULEVBRUcsSUFGSCxDQUVRLE9BRlIsRUFFaUIsVUFGakIsRUFHRyxJQUhILENBR1EsY0FIUixFQUd3QixDQUh4QixFQUlHLElBSkgsQ0FJUSxRQUpSLEVBSWtCLE9BSmxCLEVBS0csSUFMSCxDQUtRLE1BTFIsRUFLZ0IsTUFMaEIsRUFNRyxJQU5ILENBTVEsR0FOUixFQU1hO0FBQUEsVUFBSyxPQUFPLEVBQUUsQ0FBVCxDQUFMO0FBQUEsR0FOYixFQU9HLElBUEgsQ0FPUSxHQVBSLEVBT2E7QUFBQSxVQUFLLE9BQU8sU0FBUCxDQUFMO0FBQUEsR0FQYixFQVFHLElBUkgsQ0FRUSxPQVJSLEVBUWlCO0FBQUEsVUFBSyxPQUFPLFNBQVAsRUFBTDtBQUFBLEdBUmpCLEVBU0csSUFUSCxDQVNRLFFBVFIsRUFTa0IsT0FBTyxFQUFQLElBQWEsT0FBTyxTQUFQLENBVC9COztBQVdBLFdBQVMsSUFBVCxHQUFnQixNQUFoQjtBQUNBOzs7Ozs7O0FBT0QsVUFBUyxTQUFULENBQW1CLENBQW5CLEVBQXNCO0FBQ3JCLEtBQUcsTUFBSCxDQUFVLElBQVYsRUFDRSxJQURGLENBQ08sTUFEUCxFQUNlO0FBQUEsVUFBSyxHQUFHLEdBQUgsQ0FBTyxNQUFNLEVBQUUsTUFBUixDQUFQLEVBQXdCLFFBQXhCLENBQWlDLEVBQWpDLENBQUw7QUFBQSxHQURmOztBQUdBLE1BQUksSUFBSixDQUFTLENBQVQ7QUFDQTs7Ozs7QUFLRCxVQUFTLFFBQVQsR0FBb0I7QUFDbkIsS0FBRyxNQUFILENBQVUsSUFBVixFQUNFLElBREYsQ0FDTyxNQURQLEVBQ2U7QUFBQSxVQUFLLE1BQU0sRUFBRSxNQUFSLENBQUw7QUFBQSxHQURmOztBQUdBLE1BQUksSUFBSjtBQUNBO0FBQ0Q7Ozs7Ozs7OztBQVNELFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQjtBQUM5QixLQUFJLFVBQVUsRUFBZDs7QUFFQSxLQUFJLFVBQVUseUJBQVcsSUFBWCxFQUFpQixRQUFqQixDQUFkOztBQUVBLEtBQUksU0FBUyx5QkFBVyxJQUFYLEVBQWlCLE9BQWpCLENBQWI7O0FBRUEsS0FBSSxjQUFjLE9BQU8sR0FBUCxDQUFZO0FBQUEsU0FBUyxLQUFLLE1BQUwsQ0FBYTtBQUFBLFVBQUssRUFBRSxLQUFGLEtBQVksS0FBakI7QUFBQSxHQUFiLENBQVQ7QUFBQSxFQUFaLENBQWxCOztBQUVBLFNBQVEsT0FBUixDQUFpQixrQkFBVTtBQUMxQixNQUFJLGNBQWMsRUFBbEI7O0FBRUEsY0FBWSxPQUFaLENBQXFCLFVBQUMsU0FBRCxFQUFZLENBQVosRUFBa0I7QUFDdEMsT0FBSSxVQUFVLEVBQWQ7O0FBRUEsV0FBUSxNQUFSLEdBQWlCLE1BQWpCO0FBQ0EsV0FBUSxNQUFSLEdBQWlCLFVBQVUsTUFBVixDQUFrQjtBQUFBLFdBQUssRUFBRSxNQUFGLEtBQWEsTUFBbEI7QUFBQSxJQUFsQixDQUFqQjtBQUNBLFdBQVEsQ0FBUixHQUFZLE9BQU8sQ0FBUCxDQUFaOztBQUVBLFdBQVEsQ0FBUixHQUFZLFFBQVEsTUFBUixDQUFlLE1BQWYsQ0FBdUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQzNDLFFBQUssRUFBRSxNQUFGLEtBQWEsTUFBbEIsRUFBMkI7QUFDMUIsWUFBTyxJQUFJLEVBQUUsSUFBYjtBQUNBLEtBRkQsTUFFTztBQUNOLFlBQU8sQ0FBUDtBQUNBO0FBQ0QsSUFOVyxFQU1ULENBTlMsQ0FBWjs7QUFRQSxlQUFZLElBQVosQ0FBaUIsT0FBakI7QUFDQSxHQWhCRDs7QUFrQkEsVUFBUSxJQUFSLENBQWEsV0FBYjtBQUNBLEVBdEJEOztBQXdCQSxRQUFPLE9BQVA7QUFDQTs7Ozs7Ozs7UUNuUmUsVyxHQUFBLFc7O0FBbEJoQjs7Ozs7Ozs7Ozs7QUFHQSxJQUFJLE1BQUo7QUFDQSxJQUFJLEtBQUo7QUFDQSxJQUFJLE1BQUo7OztBQUdBLElBQUksR0FBSjs7Ozs7Ozs7OztBQVVPLFNBQVMsV0FBVCxDQUFxQixJQUFyQixFQUEyQixLQUEzQixFQUFrQyxLQUFsQyxFQUF5QyxLQUF6QyxFQUFnRDs7QUFFdEQsS0FBSSxNQUFNLEVBQVY7QUFDQSxLQUFJLE1BQUosR0FBYSxpQkFBYjs7QUFFQSxLQUFJLE1BQUo7QUFDQSxLQUFJLE1BQUo7QUFDQSxLQUFJLEdBQUo7OztBQUdBLEtBQUksVUFBVSxRQUFRLElBQVIsQ0FBZDs7QUFFQSxNQUFLLE9BQUw7O0FBRUEsZ0JBQWUsT0FBZjs7QUFFQSxRQUFPLEdBQVA7Ozs7Ozs7QUFPQSxVQUFTLGlCQUFULENBQTJCLElBQTNCLEVBQWlDO0FBQ2hDLFNBQU8sUUFBUSxJQUFSLENBQVA7QUFDQTs7Ozs7Ozs7QUFRRCxVQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUI7QUFDdEIsU0FBTywyQkFBYSxJQUFiLEVBQW1CLEtBQW5CLEVBQTBCLElBQTFCLENBQWdDLFVBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxVQUFVLEVBQUUsSUFBRixHQUFTLEVBQUUsSUFBckI7QUFBQSxHQUFoQyxFQUE0RCxLQUE1RCxDQUFrRSxDQUFsRSxFQUFvRSxDQUFwRSxDQUFQO0FBQ0E7Ozs7Ozs7QUFPRCxVQUFTLElBQVQsQ0FBYyxJQUFkLEVBQW9CO0FBQ25CLFdBQVMsRUFBQyxLQUFLLENBQU4sRUFBUyxPQUFPLENBQWhCLEVBQW1CLFFBQVEsQ0FBM0IsRUFBOEIsTUFBTSxDQUFwQyxFQUFUO0FBQ0EsVUFBUSxNQUFNLE9BQU8sSUFBYixHQUFvQixPQUFPLEtBQW5DO0FBQ0EsV0FBUyxNQUFNLE9BQU8sR0FBYixHQUFtQixPQUFPLE1BQW5DOztBQUVBLFdBQVMsR0FBRyxLQUFILENBQVMsT0FBVCxHQUNQLE1BRE8sQ0FDQSxLQUFLLEdBQUwsQ0FBUztBQUFBLFVBQUssRUFBRSxLQUFGLENBQUw7QUFBQSxHQUFULENBREEsRUFFUCxlQUZPLENBRVMsQ0FBQyxDQUFELEVBQUksTUFBSixDQUZULEVBRXNCLEVBRnRCLENBQVQ7O0FBSUEsV0FBUyxHQUFHLEtBQUgsQ0FBUyxNQUFULEdBQ1AsTUFETyxDQUNBLENBQUUsQ0FBRixFQUFLLEtBQUssR0FBTCxnQ0FBWSxLQUFLLEdBQUwsQ0FBUztBQUFBLFVBQUssRUFBRSxJQUFQO0FBQUEsR0FBVCxDQUFaLEVBQUwsQ0FEQSxFQUVQLEtBRk8sQ0FFRCxDQUFFLENBQUYsRUFBSyxLQUFMLENBRkMsQ0FBVDs7QUFJQSxRQUFNLEdBQUcsTUFBSCxDQUFVLE1BQUksS0FBZCxFQUNKLE1BREksQ0FDRyxLQURILEVBRUgsSUFGRyxDQUVFLE9BRkYsRUFFVyxRQUFRLE9BQU8sSUFBZixHQUFzQixPQUFPLEtBRnhDLEVBR0gsSUFIRyxDQUdFLFFBSEYsRUFHWSxTQUFTLE9BQU8sR0FBaEIsR0FBc0IsT0FBTyxNQUh6QyxFQUlKLE1BSkksQ0FJRyxHQUpILEVBS0gsSUFMRyxDQUtFLFdBTEYsRUFLZSxlQUFjLE9BQU8sSUFBckIsR0FBMkIsR0FBM0IsR0FBZ0MsT0FBTyxHQUF2QyxHQUE0QyxHQUwzRCxDQUFOO0FBTUE7Ozs7Ozs7QUFPRCxVQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEI7OztBQUc3QixRQUFNLEdBQUcsR0FBSCxHQUNKLElBREksQ0FDQyxPQURELEVBQ1UsUUFEVixFQUVKLElBRkksQ0FFRSxhQUFLO0FBQ1gsVUFBTyx5QkFBdUIsUUFBUSxFQUFFLElBQVYsRUFBZ0IsTUFBaEIsQ0FBdUIsTUFBdkIsQ0FBdkIsR0FBd0QsU0FBL0Q7QUFDQSxHQUpJLENBQU47O0FBTUEsTUFBSSxJQUFKLENBQVMsR0FBVDs7O0FBR0EsU0FBTyxJQUFQO0FBRUE7Ozs7Ozs7QUFPRCxVQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0I7O0FBRXJCLFNBQU8sTUFBUCxDQUFjLENBQUUsQ0FBRixFQUFLLEtBQUssR0FBTCxnQ0FBWSxLQUFLLEdBQUwsQ0FBUztBQUFBLFVBQUssRUFBRSxJQUFQO0FBQUEsR0FBVCxDQUFaLEVBQUwsQ0FBZDs7O0FBR0EsTUFBSSxPQUFPLElBQUksU0FBSixDQUFjLFVBQVEsS0FBdEIsRUFDVCxJQURTLENBQ0osSUFESSxDQUFYOztBQUdBLE9BQUssVUFBTCxHQUNFLElBREYsQ0FDTyxPQURQLEVBQ2dCO0FBQUEsVUFBSyxPQUFPLEVBQUUsSUFBVCxDQUFMO0FBQUEsR0FEaEI7O0FBR0EsT0FBSyxLQUFMLEdBQ0UsTUFERixDQUNTLE1BRFQsRUFFRyxJQUZILENBRVEsT0FGUixFQUVpQixTQUFPLEtBRnhCLEVBR0csSUFISCxDQUdRLEdBSFIsRUFHYTtBQUFBLFVBQUssQ0FBTDtBQUFBLEdBSGIsRUFJRyxJQUpILENBSVEsR0FKUixFQUlhO0FBQUEsVUFBSyxPQUFPLEVBQUUsS0FBRixDQUFQLENBQUw7QUFBQSxHQUpiLEVBS0csSUFMSCxDQUtRLFFBTFIsRUFLa0I7QUFBQSxVQUFLLE9BQU8sU0FBUCxFQUFMO0FBQUEsR0FMbEIsRUFNRyxJQU5ILENBTVEsT0FOUixFQU1pQjtBQUFBLFVBQUssT0FBTyxFQUFFLElBQVQsQ0FBTDtBQUFBLEdBTmpCLEVBT0csSUFQSCxDQU9RLE1BUFIsRUFPZ0IsS0FQaEIsRUFRRyxFQVJILENBUU0sV0FSTixFQVFtQixJQUFJLElBUnZCLEVBU0csRUFUSCxDQVNNLFVBVE4sRUFTa0IsSUFBSSxJQVR0Qjs7QUFXQSxPQUFLLElBQUwsR0FBWSxNQUFaOzs7QUFHQSxNQUFJLFFBQVEsSUFBSSxTQUFKLENBQWMsVUFBUSxLQUFSLEdBQWMsT0FBNUIsRUFDVixJQURVLENBQ0wsSUFESyxDQUFaOztBQUdBLFFBQU0sVUFBTixHQUNFLElBREYsQ0FDTztBQUFBLFVBQUssRUFBRSxLQUFGLENBQUw7QUFBQSxHQURQOztBQUdBLFFBQU0sS0FBTixHQUNFLE1BREYsQ0FDUyxNQURULEVBRUcsSUFGSCxDQUVRLE9BRlIsRUFFaUIsU0FBTyxLQUFQLEdBQWEsT0FGOUIsRUFHRyxJQUhILENBR1EsR0FIUixFQUdhLENBSGIsRUFJRyxJQUpILENBSVEsR0FKUixFQUlhO0FBQUEsVUFBSyxPQUFPLEVBQUUsS0FBRixDQUFQLENBQUw7QUFBQSxHQUpiLEVBS0csSUFMSCxDQUtRLElBTFIsRUFLYyxFQUxkLEVBTUcsSUFOSCxDQU1RLElBTlIsRUFNYyxDQU5kLEVBT0csSUFQSCxDQU9RLE1BUFIsRUFPZ0IsT0FQaEIsRUFRRyxJQVJILENBUVE7QUFBQSxVQUFLLEVBQUUsS0FBRixDQUFMO0FBQUEsR0FSUixFQVNHLEVBVEgsQ0FTTSxXQVROLEVBU21CLElBQUksSUFUdkIsRUFVRyxFQVZILENBVU0sVUFWTixFQVVrQixJQUFJLElBVnRCOztBQVlBLFFBQU0sSUFBTixHQUFhLE1BQWI7OztBQUdBLE1BQUksUUFBUSxJQUFJLFNBQUosQ0FBYyxVQUFRLEtBQVIsR0FBYyxPQUE1QixFQUNWLElBRFUsQ0FDTCxJQURLLENBQVo7O0FBR0EsUUFBTSxVQUFOLEdBQ0UsSUFERixDQUNPO0FBQUEsVUFBSyxRQUFRLEVBQUUsSUFBVixFQUFnQixNQUFoQixDQUF1QixJQUF2QixDQUFMO0FBQUEsR0FEUDs7QUFHQSxRQUFNLEtBQU4sR0FDRSxNQURGLENBQ1MsTUFEVCxFQUVHLElBRkgsQ0FFUSxPQUZSLEVBRWlCLFNBQU8sS0FBUCxHQUFhLE9BRjlCLEVBR0csSUFISCxDQUdRLEdBSFIsRUFHYSxRQUFNLEVBSG5CLEVBSUcsSUFKSCxDQUlRLEdBSlIsRUFJYTtBQUFBLFVBQUssT0FBTyxFQUFFLEtBQUYsQ0FBUCxDQUFMO0FBQUEsR0FKYixFQUtHLElBTEgsQ0FLUSxJQUxSLEVBS2MsRUFMZCxFQU1HLElBTkgsQ0FNUSxJQU5SLEVBTWMsQ0FOZCxFQU9HLElBUEgsQ0FPUSxNQVBSLEVBT2dCLE9BUGhCLEVBUUcsSUFSSCxDQVFRO0FBQUEsVUFBSyxRQUFRLEVBQUUsSUFBVixFQUFnQixNQUFoQixDQUF1QixJQUF2QixDQUFMO0FBQUEsR0FSUjs7QUFVQSxRQUFNLElBQU4sR0FBYSxNQUFiO0FBQ0E7QUFDRDs7Ozs7Ozs7UUM1S2UsVSxHQUFBLFU7UUFJQSxZLEdBQUEsWTs7Ozs7Ozs7Ozs7QUFKVCxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsS0FBMUIsRUFBaUM7QUFDdkMscUNBQVksSUFBSSxHQUFKLENBQVEsS0FBSyxHQUFMLENBQVM7QUFBQSxTQUFLLEVBQUUsS0FBRixDQUFMO0FBQUEsRUFBVCxDQUFSLENBQVo7QUFDQTs7QUFFTSxTQUFTLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsS0FBNUIsRUFBbUM7QUFDekMsS0FBSSxZQUFZLFdBQVcsSUFBWCxFQUFpQixLQUFqQixDQUFoQjs7QUFFQSxLQUFJLFlBQVksVUFBVSxHQUFWLENBQWU7QUFBQSxTQUFRLEtBQUssTUFBTCxDQUFhO0FBQUEsVUFBSyxFQUFFLEtBQUYsTUFBYSxJQUFsQjtBQUFBLEdBQWIsQ0FBUjtBQUFBLEVBQWYsQ0FBaEI7O0FBRUEsS0FBSSxjQUFjLEVBQWxCOztBQUVBLFdBQVUsT0FBVixDQUFtQixxQkFBYTtBQUMvQixNQUFJLE1BQU0sRUFBVjs7QUFFQSxNQUFJLE1BQUosSUFBYyxVQUFVLE1BQVYsQ0FBa0IsVUFBQyxDQUFELEVBQUcsQ0FBSDtBQUFBLFVBQVMsSUFBSSxFQUFFLElBQWY7QUFBQSxHQUFsQixFQUF1QyxDQUF2QyxDQUFkO0FBQ0EsTUFBSSxLQUFKLElBQWEsVUFBVSxDQUFWLEVBQWEsS0FBYixDQUFiOztBQUVBLGNBQVksSUFBWixDQUFpQixHQUFqQjtBQUNBLEVBUEQ7O0FBU0EsUUFBTyxXQUFQO0FBQ0E7Ozs7Ozs7O1FDTmUsUyxHQUFBLFM7UUFXQSxlLEdBQUEsZTs7QUExQmhCOztBQUNBOztBQUNBOztBQUVBLElBQUksSUFBSixDOzs7Ozs7O0FBQ0EsSUFBSSxTQUFTLENBQUMsY0FBRCxFQUFpQixrQkFBakIsRUFBcUMsYUFBckMsRUFBb0QsYUFBcEQsQ0FBYjs7QUFFQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7Ozs7Ozs7QUFPTyxTQUFTLFNBQVQsQ0FBbUIsT0FBbkIsRUFBMkI7QUFDakMsUUFBTyxPQUFQOztBQUVBLGNBQWEsSUFBYjtBQUNBOzs7Ozs7O0FBT00sU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQWdDO0FBQ3RDLEtBQUksS0FBSixFQUFXOztBQUVWLE1BQUksVUFBVSxLQUFLLE1BQUwsQ0FBYTtBQUFBLFVBQUssRUFBRSxLQUFGLEtBQVksS0FBakI7QUFBQSxHQUFiLENBQWQ7QUFDQSxNQUFJLE1BQUosQ0FBVyxPQUFYO0FBQ0EsTUFBSSxNQUFKLENBQVcsT0FBWDtBQUNBLEVBTEQsTUFLTzs7QUFFTixNQUFJLE1BQUosQ0FBVyxJQUFYO0FBQ0EsTUFBSSxNQUFKLENBQVcsSUFBWDtBQUNBO0FBQ0Q7Ozs7O0FBTUQsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCO0FBQzNCLFFBQU8sT0FBUCxDQUFnQixpQkFBUztBQUN4QixNQUFJLFNBQVMsY0FBVCxDQUF3QixLQUF4QixDQUFKLEVBQW9DO0FBQ25DLFdBQVEsS0FBUjtBQUNDLFNBQUssY0FBTDtBQUNDLDZCQUFTLElBQVQ7QUFDQTtBQUNELFNBQUssa0JBQUw7QUFDQyxxQ0FBYSxJQUFiO0FBQ0E7QUFDRCxTQUFLLGVBQUw7QUFDQyxjQUFTLElBQVQ7QUFDQTtBQUNELFNBQUssZUFBTDtBQUNDLGNBQVMsSUFBVDtBQUNBO0FBQ0QsU0FBSyxhQUFMO0FBQ0MsV0FBTSw4QkFBWSxJQUFaLEVBQWtCLFVBQWxCLEVBQThCLGFBQTlCLEVBQTZDLFNBQTdDLENBQU47QUFDQTtBQUNELFNBQUssYUFBTDtBQUNDLFdBQU0sOEJBQVksSUFBWixFQUFrQixhQUFsQixFQUFpQyxhQUFqQyxFQUFnRCxTQUFoRCxDQUFOO0FBQ0E7QUFsQkY7QUFvQkE7QUFDRCxFQXZCRDtBQXdCQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiBkYXRhIGRpc3RyaWJ1dGlvbi5cclxuICogQ3JlYXRlcyBhIGJveC1hbmQtd2hpc2tleSBwbG90IGZyb20gZ2l2ZW4gZGF0YS5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG5cclxudmFyIG1pbjtcclxudmFyIG1heDtcclxuXHJcbnZhciBjaGFydDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXN0cmlidXRpb24oZGF0YSkge1xyXG5cdFxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0KGRhdGEpIHtcclxuXHRtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiAxMH07XHJcblx0d2lkdGggPSAyNjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSAzNDUgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHJcbn0iLCIvKipcclxuICogSW5pdGlhbGl6YXRpb24gb2YgYWxsIG1vZHVsZXMgXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dmlzdWFsaXplfSBmcm9tICcuL3Zpc3VhbGl6ZSc7XHJcblxyXG4oZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuXHRpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuXHRcdGZuKCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcblx0fVxyXG59KShpbml0KTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyByZWFkaW5nIG9mIGZpbGUgYW5kIHRoZW4gdmlzdWFsaXphdGlvbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5pdCgpe1xyXG5cclxuXHQvLyBzZXR1cCBudW1lcmFsIGZvciBjb3JyZWN0IG51bWJlciBmb3JtYXR0aW5nXHJcblx0bnVtZXJhbC5sYW5ndWFnZSgnZW4tZ2InKTtcclxuXHJcblx0Ly8gcGFyc2UgZmlsZVxyXG5cdGQzLmNzdignSG9tZV9PZmZpY2VfQWlyX1RyYXZlbF9EYXRhXzIwMTEuY3N2JylcclxuXHRcdC5yb3coIGQgPT4geyBcclxuXHRcdFx0cmV0dXJuIHsgXHJcblx0XHRcdFx0ZGVwYXJ0dXJlOiBkLkRlcGFydHVyZSwgXHJcblx0XHRcdFx0ZGVzdGluYXRpb246IGQuRGVzdGluYXRpb24sIFxyXG5cdFx0XHRcdGRpcmVjdG9yYXRlOiBkLkRpcmVjdG9yYXRlLCBcclxuXHRcdFx0XHRtb250aDogZC5EZXBhcnR1cmVfMjAxMSwgXHJcblx0XHRcdFx0ZmFyZTogcGFyc2VGbG9hdChkLlBhaWRfZmFyZSksIFxyXG5cdFx0XHRcdHRpY2tldDogZC5UaWNrZXRfY2xhc3NfZGVzY3JpcHRpb24sIFxyXG5cdFx0XHRcdHN1cHBsaWVyOiBkLlN1cHBsaWVyX25hbWUgXHJcblx0XHRcdH07XHJcblx0XHR9KVxyXG5cdFx0LmdldCggKGVycm9yLCBkYXRhKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikgY29uc29sZS5sb2coZXJyb3IpXHJcblx0XHRcdFxyXG5cdFx0XHR2aXN1YWxpemUoZGF0YSk7XHJcblx0XHR9KTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIG1vbnRobHkgc3BlbmRpbmcuXHJcbiAqIENyZWF0ZXMgYSBiYXIgY2hhcnQgZnJvbSBnaXZlbiBkYXRhIGFuZCBhZGRzIGxpc3RlbmVycyBmb3IgZmlsdGVyaW5nIG9uZSBtb250aC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt1bmlxVmFsdWVzfSBmcm9tICcuL3Zpcy11dGlsJztcclxuaW1wb3J0IHt1cGRhdGVkU3BlbmRpbmd9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBzdmcgcGFuZWxcclxudmFyIHN2ZztcclxuLy8gbm9kZSBmb3IgY3JlYXRlZCBmaWx0ZXJcclxudmFyIGZpbHRlcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB4IGRpcmVjdGlvblxyXG52YXIgeFNjYWxlO1xyXG4vLyBmdW5jdGlvbiBmb3IgcG9zaXRpb25pbmcgZWxlbWVudHMgaW4geSBkaXJlY3Rpb25cclxudmFyIHlTY2FsZTtcclxuXHJcbi8vIG1vbnRoIGF4aXNcclxudmFyIHhBeGlzO1xyXG4vLyBudW1iZXIgYXhpc1xyXG52YXIgeUF4aXM7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYmluZGluZyBhIGNvbG9yIHRvIGEgdGlja2V0IHR5cGVcclxudmFyIGNvbG9yO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8vIHNjYWxlIGZvciBzdGFja2luZyByZWN0YW5nbGVzXHJcbnZhciBzdGFjaztcclxuXHJcbi8vIHRyYW5zZm9ybWVkIGRhdGFcclxudmFyIGRhdGFzZXQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSB0aGF0IGlzIG1vcmUgc3VpdGFibGUgZm9yIHdvcmtpbmcgd2l0aGluIHZpc3VhbGl6YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3BlbmRpbmcoZGF0YSkge1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkYXRhc2V0ID0gc3BlbmRpbmdEYXRhc2V0KGRhdGEpO1xyXG5cdFxyXG5cdGNyZWF0ZUJhckNoYXJ0KGRhdGFzZXQpO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0cyB1cCBhbGwgc2NhbGVzIGFuZCBhdHRyaWJ1dGVzIGFjYy4gdG8gZ2l2ZW4gZGF0YSBhbmQgY3JlYXRlcyBhIHN2ZyBwYW5lbC5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBlYWNoIHNwZW5kaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KGRhdGEpIHtcdFxyXG5cclxuXHRtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDM1LCBib3R0b206IDMwLCBsZWZ0OiAxMH07XHJcblx0d2lkdGggPSA4MTAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSAzNDUgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHRcclxuXHR4U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdC5kb21haW4oWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10pXHJcblx0XHQucmFuZ2VSb3VuZEJhbmRzKFswLCB3aWR0aF0sIC4wNSk7XHJcblxyXG5cdC8vIHJvdW5kIHRoZSBtYXhpbXVtIHZhbHVlIGZyb20gZGF0YSB0byB0aG91c2FuZHNcclxuXHR2YXIgcm91bmRlZE1heCA9IE1hdGgucm91bmQoIE1hdGgubWF4KC4uLm1vbnRoRmFyZXMoZGF0YSkpIC8gMTAwMCApICogMTAwMDtcclxuXHR5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0LmRvbWFpbihbIDAsIHJvdW5kZWRNYXggXSlcclxuXHRcdC5yYW5nZShbIGhlaWdodCwgMCBdKTtcclxuXHJcblx0eEF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeFNjYWxlKVxyXG5cdFx0Lm9yaWVudCgnYm90dG9tJyk7XHJcblxyXG5cdHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxyXG5cdFx0LnNjYWxlKHlTY2FsZSlcclxuXHRcdC5vcmllbnQoJ3JpZ2h0JylcclxuXHRcdC50aWNrRm9ybWF0KCBkID0+IG51bWVyYWwoZCkuZm9ybWF0KCcwYScpKTtcclxuXHRcclxuXHRjb2xvciA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbih1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKSlcdFx0XHJcblx0XHQucmFuZ2UoW1wiIzAwYmNkNFwiLCBcIiMxZDZkZDBcIiwgXCIjZWRjZDAyXCJdKTtcclxuXHJcblx0c3RhY2sgPSBkMy5sYXlvdXQuc3RhY2soKTtcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLXNwZW5kaW5nJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBtb250aGx5IHNwZW5kaW5nIGZvciBhbGwgdGlja2V0IHR5cGVzIGFuZCByZXR1cm5zIHRoZSBjcmVhdGVkIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VuZGluZyBhbGwgeWVhciBzcGVkbmluZ1xyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBzdW1Nb250aGx5RmFyZXMgYXJyYXkgb2YgbnVtYmVycyByZXByZXNlbnRpbmcgZWFjaCBtb250aHMgc3BlbmRpbmcgb24gYWxsIHRpY2tldHNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb250aEZhcmVzKGRhdGEpIHtcdFxyXG5cdFx0Ly8gZ2V0IGFsbCBmYXJlcyBmb3IgZWFjaCBtb250aFxyXG5cdFx0dmFyIGZhcmVzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKS5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cdFx0Ly8gc3VtIHVwIGFsbCBmYXJlcyBpbiBlYWNoIG1vbnRoXHJcblx0XHR2YXIgc3VtTW9udGhseUZhcmVzID0gZmFyZXMubWFwKCBmYXJlID0+IGZhcmUucmVkdWNlKCAoYSxiKSA9PiBhICsgYi5mYXJlLCAwKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiBzdW1Nb250aGx5RmFyZXM7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHN0YWNrZWQgYmFyIGNoYXJ0IGFjY29yZGluZyB0byBnaXZlbiBkYXRhLiBUaGUgY2hhcnQgaGFzIGxheWVycyBmb3IgZWFjaCB0aWNrZXQgdHlwZS5cclxuICogVGhlcmUgYXJlIGxpc3RlbmVycyBmb3IgY3JlYXRpbmcgYSB0b29sdGlwIGFuZCBmaWx0ZXIgZm9yIHNlbGVjdGluZyBvbmx5IG9uZSBtb250aC5cclxuICogXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyBpbiB0aGUgZm9ybSBvZiBcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUJhckNoYXJ0KGRhdGEpIHtcclxuXHQvLyBjcmVhdGUgc3RhY2tlZCBkYXRhIGZvciB0aGUgdmlzdWFsaXphdGlvblxyXG5cdHN0YWNrKGRhdGEpO1xyXG5cclxuXHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdHRpcCA9IGQzLnRpcCgpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0dmFyIGluZGV4ID0gY29sb3IucmFuZ2UoKS5pbmRleE9mKGNvbG9yKGQudGlja2V0KSk7XHJcblx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJ0eXBlIHR5cGUtJytpbmRleCsnXCI+JysgZC50aWNrZXQgKyc8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cInZhbHVlXCI+JytudW1lcmFsKGQueSkuZm9ybWF0KCckMCwwJykgKyAnPC9zcGFuPic7IFxyXG5cdFx0fSk7XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblxyXG5cdC8vIGNyZWF0ZSBhIHJlY3RhbmdsZSBhcyBhIGJhY2tncm91bmRcclxuXHR2YXIgYmFja2dyb3VuZCA9IHN2Zy5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ3N2Zy1iYWNrZ3JvdW5kJylcclxuXHRcdC5hdHRyKCd4JywgMClcclxuXHRcdC5hdHRyKCd5JywgMClcclxuXHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxyXG5cdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodClcclxuXHRcdC5hdHRyKCdmaWxsJywgJ3RyYW5zcGFyZW50JylcclxuXHRcdC5vbignY2xpY2snLCBkZXNlbGVjdCk7XHJcblxyXG5cdC8vIGNyZWF0ZSBncm91cCBmb3IgZWFjaCB0aWNrZXQgdHlwZVxyXG5cdHZhciBncm91cHMgPSBzdmcuc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgKGQsaSkgPT4gJ3RpY2tldC0nK2kgKTtcclxuXHJcblx0Ly8gY3JlYXRlIGJhcnMgZm9yIGVhY2ggdGlja2V0IGdyb3VwXHJcblx0Z3JvdXBzLnNlbGVjdEFsbCgnLmJhcicpXHJcblx0XHQuZGF0YSggZCA9PiBkIClcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2JhcicpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHlTY2FsZShkLnkwKSAtIHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSlcclxuXHRcdFx0Lm9uKCdtb3VzZW92ZXInLCBtb3VzZW92ZXIpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCBtb3VzZW91dClcclxuXHRcdFx0Lm9uKCdjbGljaycsIG1vdXNlY2xpY2spO1xyXG5cclxuXHRzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteCcpXHJcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyAwICsnLCcrIGhlaWdodCArJyknKVxyXG5cdFx0LmNhbGwoeEF4aXMpO1xyXG5cclxuXHRzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteScpXHJcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyB3aWR0aCArJywnKyAwICsnKScpXHJcblx0XHQuY2FsbCh5QXhpcyk7XHJcblxyXG5cdGZpbHRlciA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2ZpbHRlcicpO1xyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBmaWx0ZXIgY29udGFpbmluZyBzZWxlY3RlZCBtb250aCBhbmQgdXBkYXRlcyBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZGVzZWxlY3QoKSB7XHJcblxyXG5cdFx0dmFyIGZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ZpbHRlcicpWzBdO1xyXG5cclxuXHRcdGlmIChmaWx0ZXIuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdC8vIGRlbGV0ZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0XHRmaWx0ZXIucmVtb3ZlQ2hpbGQoZmlsdGVyLmNoaWxkTm9kZXNbMF0pO1xyXG5cclxuXHRcdFx0Ly8gdXBkYXRlIGFsbCBvdGhlciB2aXN1YWxpemF0aW9uc1xyXG5cdFx0XHR1cGRhdGVkU3BlbmRpbmcoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBmaWx0ZXIgZm9yIGEgd2hvbGUgbW9udGggYWZ0ZXIgdGhlIHVzZXIgY2xpY2tzIG9uIGFueSB0aWNrZXQgdGlja2V0IHR5cGUuIFRoZSBmaWx0ZXIgaXMgcmVwcmVzZW50ZWQgd2l0aCBhIHdoaXRlLWJvcmRlcmVkIHJlY3RhbmdsZS5cclxuXHQgKiBBbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMgYXJlIHVwZGF0ZWQgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIG1vbnRoLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZWNsaWNrKGRhdGEpIHtcclxuXHRcdC8vIHVwZGF0ZSBvdGhlciB2aXN1YWxpemF0aW9ucyBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgbW9udGhcclxuXHRcdHVwZGF0ZWRTcGVuZGluZyhkYXRhLngpO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgdGlja2V0IHR5cGVzIGZvciBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHRpY2tldHNNb250aCA9IGRhdGFzZXQubWFwKCB0aWNrZXRzID0+IHRpY2tldHMuZmlsdGVyKCBkID0+IGQueCA9PT0gZGF0YS54ICkpO1xyXG5cclxuXHRcdC8vIGZsYXR0ZW4gdGhlIGFycmF5XHJcblx0XHR0aWNrZXRzTW9udGggPSBbXS5jb25jYXQuYXBwbHkoW10sIHRpY2tldHNNb250aCk7XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRoZSBoZWlnaHQgYW5kIHN0YXJ0aW5nIHBvaW50IG9mIG1vbnRocyBiYXJcclxuXHRcdHZhciB5MCA9IHRpY2tldHNNb250aFswXS55MDtcclxuXHRcdHZhciBiYXJIZWlnaHQgPSB0aWNrZXRzTW9udGgucmVkdWNlKCAoYSwgYikgPT4gYSArIGIueSwgMCk7XHJcblx0XHRcclxuXHRcdC8vIGNyZWF0ZSBhbmQgdXBkYXRlIHJlY3RhbmdsZSBmb3IgaGlnaGxpZ2h0aW5nIHRoZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHNlbGVjdGVkID0gZmlsdGVyLnNlbGVjdEFsbCgnLnNlbGVjdGVkJylcclxuXHRcdFx0LmRhdGEoW2RhdGFdKTtcclxuXHJcblx0XHRzZWxlY3RlZC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdzZWxlY3RlZCcpXHRcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgMylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpaGdsaWdodCB0aGUgaG92ZXJlZCBlbGVtZW50IGFuZCBzaG93cyB0b29sdGlwLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZW92ZXIoZCkge1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBkMy5yZ2IoY29sb3IoZC50aWNrZXQpKS5icmlnaHRlciguNSkpO1xyXG5cclxuXHRcdHRpcC5zaG93KGQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIHRoZSBjb2xvciBvZiB0aGUgZWxlbWVudCBhbmQgaGlkZXMgdGhlIHRvb2x0aXAuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdXQoKSB7XHRcdFxyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpO1xyXG5cclxuXHRcdHRpcC5oaWRlKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtIGRhdGEgaW50byBhIG5ldyBkYXRhc2V0IHdoaWNoIGhhcyByZWFycmFuZ2VkIHZhbHVlc1xyXG4gKiBzbyB0aGF0IGl0IGlzIGFuIGFycmF5IG9mIHRpY2tldCB0eXBlIGFycmF5c1xyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0cyBleHRyYWN0ZWQgZnJvbSBmaWxlXHJcbiAqIEByZXR1cm4ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIGRhdGEgb2JqZWN0cyBncm91cGVkIGJ5IHRpY2tldCB0eXBlcyBhbmQgbW9udGhzXHJcbiAqL1xyXG5mdW5jdGlvbiBzcGVuZGluZ0RhdGFzZXQoZGF0YSkge1xyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdHZhciB0aWNrZXRzID0gdW5pcVZhbHVlcyhkYXRhLCAndGlja2V0Jyk7XHJcblxyXG5cdHZhciBtb250aHMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpO1xyXG5cclxuXHR2YXIgbW9udGhseURhdGEgPSBtb250aHMubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHJcblx0dGlja2V0cy5mb3JFYWNoKCB0aWNrZXQgPT4ge1xyXG5cdFx0dmFyIHRpY2tldEFycmF5ID0gW107XHJcblxyXG5cdFx0bW9udGhseURhdGEuZm9yRWFjaCggKG1vbnRoRGF0YSwgaSkgPT4ge1xyXG5cdFx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cdFx0XHJcblx0XHRcdGRhdGFPYmoudGlja2V0ID0gdGlja2V0O1x0XHRcdFxyXG5cdFx0XHRkYXRhT2JqLnZhbHVlcyA9IG1vbnRoRGF0YS5maWx0ZXIoIGQgPT4gZC50aWNrZXQgPT09IHRpY2tldCk7XHJcblx0XHRcdGRhdGFPYmoueCA9IG1vbnRoc1tpXTtcclxuXHJcblx0XHRcdGRhdGFPYmoueSA9IGRhdGFPYmoudmFsdWVzLnJlZHVjZSggKGEsYikgPT4ge1xyXG5cdFx0XHRcdGlmICggYi50aWNrZXQgPT09IHRpY2tldCApIHtcclxuXHRcdFx0XHRcdHJldHVybiBhICsgYi5mYXJlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIDApO1xyXG5cclxuXHRcdFx0dGlja2V0QXJyYXkucHVzaChkYXRhT2JqKTtcdFx0XHRcclxuXHRcdH0pO1xyXG5cclxuXHRcdGRhdGFzZXQucHVzaCh0aWNrZXRBcnJheSk7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBkYXRhc2V0O1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgdG9wIHNwZW5kaW5nIGZvciBnaXZlbiBlbGVtZW50LlxyXG4gKiBDcmVhdGVzIGZpdmUgYmFyIGNoYXJ0cyBzdGF0aW5nIHRoZSB0b3AgZWxlbWVudHMgd2hpY2ggc3BlbmQgdGhlIG1vc3QuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dW5pcVZhbHVlcywgY2FsY1NwZW5kaW5nfSBmcm9tICcuL3Zpcy11dGlsJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGZvciB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0c1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgdmlzdWFsaXphdGlvbiBvZiB0b3Agc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHZpc0lkIGlkIG9mIHRoZSB2aXN1YWxpemF0aW9uIHBhbmVsXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciBmaWxsIGNvbG9yIHVzZWQgZm9yIGFsbCByZWN0YW5nbGVzXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9wU3BlbmRpbmcoZGF0YSwgcGFyYW0sIHZpc0lkLCBjb2xvcikge1xyXG5cclxuXHR2YXIgdmlzID0ge307XHJcblx0dmlzLnVwZGF0ZSA9IHVwZGF0ZVRvcFNwZW5kaW5nO1x0XHJcblxyXG5cdHZhciB4U2NhbGU7XHJcblx0dmFyIHlTY2FsZTtcclxuXHR2YXIgc3ZnO1xyXG5cclxuXHQvLyBjYWxjdWxhdGUgZGF0YSwgaW5pdGlhbGl6ZSBhbmQgZHJhdyBjaGFydFxyXG5cdHZhciB0b3BEYXRhID0gY2FsY1RvcChkYXRhKTtcclxuXHJcblx0aW5pdCh0b3BEYXRhKTtcclxuXHJcblx0Y3JlYXRlQmFyQ2hhcnQodG9wRGF0YSk7XHJcblxyXG5cdHJldHVybiB2aXM7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZpcnN0bHksIGNhbGN1bGF0ZXMgdGhlIG5ldyB0b3AgZGF0YSBhbmQgdGhlbiB1cGRhdGVzIHRoZSBiYXIgY2hhcnQgYW5kIHRleHQgdmFsdWVzIGFjY29yZGluZyB0byBuZXcgZGF0YS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVUb3BTcGVuZGluZyhkYXRhKSB7XHRcclxuXHRcdHVwZGF0ZShjYWxjVG9wKGRhdGEpKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdG9wIGZpdmUgaXRlbXMgZnJvbSBkYXRhIGFjY29yZGluZyB0byBzcGVuZGluZyAoZmFyZSkgdmFsdWVzLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBkYXRhc2V0IHVwZGF0ZWQgXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY2FsY1RvcChkYXRhKSB7XHJcblx0XHRyZXR1cm4gY2FsY1NwZW5kaW5nKGRhdGEsIHBhcmFtKS5zb3J0KCAoYSwgYikgPT4gYi5mYXJlIC0gYS5mYXJlICkuc2xpY2UoMCw1KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemVzIGFsbCBuZWVkZWQgdmFyaWFibGVzIGZvciB2aXN1YWxpemF0aW9uIGFuZCBjcmVhdGVzIGEgU1ZHIHBhbmVsLiBcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0KGRhdGEpIHtcclxuXHRcdG1hcmdpbiA9IHt0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDV9O1xyXG5cdFx0d2lkdGggPSAyNjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRcdGhlaWdodCA9IDEzMCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxuXHRcdHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0XHQuZG9tYWluKGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKVxyXG5cdFx0XHQucmFuZ2VSb3VuZEJhbmRzKFswLCBoZWlnaHRdLCAuMSk7XHJcblxyXG5cdFx0eFNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcclxuXHRcdFx0LmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSlcclxuXHRcdFx0LnJhbmdlKFsgMCwgd2lkdGggXSk7XHJcblxyXG5cdFx0c3ZnID0gZDMuc2VsZWN0KCcjJyt2aXNJZClcclxuXHRcdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgbWFyZ2luLmxlZnQgKycsJysgbWFyZ2luLnRvcCArJyknKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYmFyIGNoYXJ0IGFuZCBhIHRvb2x0aXAuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1xyXG5cclxuXHRcdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0XHR0aXAgPSBkMy50aXAoKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPicrbnVtZXJhbChkLmZhcmUpLmZvcm1hdCgnJDAsMCcpICsgJzwvc3Bhbj4nOyBcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0XHQvLyBjcmVhdGUgYmFyIGNoYXJ0c1xyXG5cdFx0dXBkYXRlKGRhdGEpO1xyXG5cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgdGhlIGJhciBjaGFydCB2aXN1YWxpemF0aW9uIHdpdGggYWxsIG5hbWVzIGFuZCBmYXJlIHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0czsgZS5nLiBbIHsgZmFyZTogeCwgb3RoZXJQYXJhbTogYSB9LCB7IGZhcmU6IHksIG90aGVyUGFyYW06IGIgfSwgLi4uIF1cclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGUoZGF0YSkge1xyXG5cdFx0Ly8gdXBkYXRlIHNjYWxlIHNvIHJlbGF0aXZlIGRpZmZlcmVuY2llcyBjYW4gYmUgc2VlblxyXG5cdFx0eFNjYWxlLmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSk7XHJcblxyXG5cdFx0Ly8gZHJhdyByZWN0YW5nbGUgcmVwcmVzZW50aW5nIHNwZW5kaW5nXHJcblx0XHR2YXIgYmFycyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItJytwYXJhbSlcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0YmFycy50cmFuc2l0aW9uKClcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUoZC5mYXJlKSk7XHJcblxyXG5cdFx0YmFycy5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItJytwYXJhbSlcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4gMClcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGRbcGFyYW1dKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUoZC5mYXJlKSlcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsIGNvbG9yKVxyXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW91dCcsIHRpcC5oaWRlKTtcclxuXHJcblx0XHRiYXJzLmV4aXQoKS5yZW1vdmUoKTtcclxuXHJcblx0XHQvLyBkcmF3IHRleHQgdG8gdGhlIGxlZnQgb2YgZWFjaCBiYXIgcmVwcmVzZW50aW5nIHRoZSBuYW1lXHJcblx0XHR2YXIgbmFtZXMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLScrcGFyYW0rJy1uYW1lJylcclxuXHRcdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdFx0bmFtZXMudHJhbnNpdGlvbigpXHJcblx0XHRcdC50ZXh0KGQgPT4gZFtwYXJhbV0pO1xyXG5cclxuXHRcdG5hbWVzLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2Jhci0nK3BhcmFtKyctbmFtZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZFtwYXJhbV0pKVxyXG5cdFx0XHRcdC5hdHRyKCdkeScsIDE3KVxyXG5cdFx0XHRcdC5hdHRyKCdkeCcsIDUpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC50ZXh0KGQgPT4gZFtwYXJhbV0pXHJcblx0XHRcdFx0Lm9uKCdtb3VzZW92ZXInLCB0aXAuc2hvdylcclxuXHRcdFx0XHQub24oJ21vdXNlb3V0JywgdGlwLmhpZGUpO1xyXG5cclxuXHRcdG5hbWVzLmV4aXQoKS5yZW1vdmUoKTtcclxuXHJcblx0XHQvLyBkcmF3IHRleHQgdG8gdGhlIHJpZ2h0IG9mIGVhY2ggYmFyIHJlcHJlc2VudGluZyB0aGUgcm91bmRlZCBzcGVuZGluZ1xyXG5cdFx0dmFyIGZhcmVzID0gc3ZnLnNlbGVjdEFsbCgnLmJhci0nK3BhcmFtKyctZmFyZScpXHJcblx0XHRcdC5kYXRhKGRhdGEpO1xyXG5cclxuXHRcdGZhcmVzLnRyYW5zaXRpb24oKVxyXG5cdFx0XHQudGV4dChkID0+IG51bWVyYWwoZC5mYXJlKS5mb3JtYXQoJzBhJykpO1xyXG5cclxuXHRcdGZhcmVzLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2Jhci0nK3BhcmFtKyctZmFyZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCB3aWR0aC0zNSlcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGRbcGFyYW1dKSlcclxuXHRcdFx0XHQuYXR0cignZHknLCAxNylcclxuXHRcdFx0XHQuYXR0cignZHgnLCA1KVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0XHQudGV4dChkID0+IG51bWVyYWwoZC5mYXJlKS5mb3JtYXQoJzBhJykpO1xyXG5cclxuXHRcdGZhcmVzLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9XHJcbn0iLCIvKipcclxuICogRmluZHMgb3V0IHRoZSB1bmlxdWUgdmFsdWVzIG9mIGdpdmVuIGRhdGEgZm9yIGdpdmVuIHBhcmFtZXRlci5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBhbGwgeWVhciBzcGVuZGluZ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gcGFyYW1ldGVyIHdoaWNoIHNob3VsZCBiZSBsb29rZWQgdXBcclxuICogQHJldHVybiB7YXJyYXl9IHVuaXF1ZVZhbHVlcyBhcnJheSBvZiBhbGwgdW5pcXVlIHZhbHVlcyBmb3IgZ2l2ZW4gcGFyYW1ldGVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5pcVZhbHVlcyhkYXRhLCBwYXJhbSkge1xyXG5cdHJldHVybiBbIC4uLm5ldyBTZXQoZGF0YS5tYXAoZCA9PiBkW3BhcmFtXSkpXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNTcGVuZGluZyhkYXRhLCBwYXJhbSkge1xyXG5cdHZhciB1bmlxSXRlbXMgPSB1bmlxVmFsdWVzKGRhdGEsIHBhcmFtKTtcclxuXHRcclxuXHR2YXIgYWxsUGFyYW1zID0gdW5pcUl0ZW1zLm1hcCggaXRlbSA9PiBkYXRhLmZpbHRlciggZCA9PiBkW3BhcmFtXSA9PT0gaXRlbSApKTtcclxuXHJcblx0dmFyIGFsbFNwZW5kaW5nID0gW107XHJcblxyXG5cdGFsbFBhcmFtcy5mb3JFYWNoKCBpdGVtQXJyYXkgPT4ge1xyXG5cdFx0dmFyIG9iaiA9IHt9O1xyXG5cclxuXHRcdG9ialsnZmFyZSddID0gaXRlbUFycmF5LnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCk7XHJcblx0XHRvYmpbcGFyYW1dID0gaXRlbUFycmF5WzBdW3BhcmFtXTtcclxuXHJcblx0XHRhbGxTcGVuZGluZy5wdXNoKG9iaik7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBhbGxTcGVuZGluZztcclxufSIsIi8qKlxyXG4gKiBNYWluIHZpc3VhbGl6YXRpb24gbW9kdWxlIGZvciBjcmVhdGluZyBjaGFydHMgYW5kIHZpcyBmb3IgcGFzc2VkIGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7c3BlbmRpbmd9IGZyb20gJy4vc3BlbmRpbmcnO1xyXG5pbXBvcnQge2Rpc3RyaWJ1dGlvbn0gZnJvbSAnLi9kaXN0cmlidXRpb24nO1xyXG5pbXBvcnQge3RvcFNwZW5kaW5nLCB1cGRhdGVUb3BEaXJ9IGZyb20gJy4vdG9wU3BlbmRpbmcnO1xyXG5cclxudmFyIGRhdGE7XHJcbnZhciBwYW5lbHMgPSBbJ3Zpcy1zcGVuZGluZycsICd2aXMtZGlzdHJpYnV0aW9uJywgJ3Zpcy10b3AtZGlyJywgJ3Zpcy10b3Atc3VwJ107XHJcblxyXG52YXIgc3VwO1xyXG52YXIgZGlyO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2Ygb2JqZWN0cyBmb3IgdmlzdWFsaXphdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhc2V0KXtcdFxyXG5cdGRhdGEgPSBkYXRhc2V0O1xyXG5cclxuXHRkZXRlY3RQYW5lbHMoZGF0YSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRhIGlzIGZpcnN0bHkgZmlsdGVyZWQgYWNjb3JkaW5nIHRvIG1vbnRoIGFuZCBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMgYXJlIHRoZW4gcmVkcmF3biB3aXRoIHVwZGF0ZWQgZGF0YS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG1vbnRoIHNlbGVjdGVkIG1vbnRoIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgZmlsdGVyaW5nIGRhdGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVkU3BlbmRpbmcobW9udGgpIHtcclxuXHRpZiAobW9udGgpIHtcclxuXHRcdC8vIHJlZHJhdyBhbGwgcGFuZWxzIHdpdGggb25seSBnaXZlbiBtb250aCBkYXRhXHJcblx0XHR2YXIgZGF0YXNldCA9IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICk7XHJcblx0XHRzdXAudXBkYXRlKGRhdGFzZXQpO1xyXG5cdFx0ZGlyLnVwZGF0ZShkYXRhc2V0KTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBhbGwgbW9udGhzIGRhdGFcclxuXHRcdHN1cC51cGRhdGUoZGF0YSk7XHJcblx0XHRkaXIudXBkYXRlKGRhdGEpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gZGV0ZWN0UGFuZWxzKGRhdGEpIHtcclxuXHRwYW5lbHMuZm9yRWFjaCggcGFuZWwgPT4ge1xyXG5cdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhbmVsKSkge1xyXG5cdFx0XHRzd2l0Y2ggKHBhbmVsKSB7XHJcblx0XHRcdFx0Y2FzZSAndmlzLXNwZW5kaW5nJzpcclxuXHRcdFx0XHRcdHNwZW5kaW5nKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAndmlzLWRpc3RyaWJ1dGlvbic6XHJcblx0XHRcdFx0XHRkaXN0cmlidXRpb24oZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICd2aXMtYXZnLW1vbnRoJzpcclxuXHRcdFx0XHRcdGF2Z01vbnRoKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAndmlzLWF2Zy1wcmljZSc6XHJcblx0XHRcdFx0XHRhdmdQcmljZShkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ3Zpcy10b3Atc3VwJzpcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRzdXAgPSB0b3BTcGVuZGluZyhkYXRhLCAnc3VwcGxpZXInLCAndmlzLXRvcC1zdXAnLCAnIzRiOTIyNicpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAndmlzLXRvcC1kaXInOlxyXG5cdFx0XHRcdFx0ZGlyID0gdG9wU3BlbmRpbmcoZGF0YSwgJ2RpcmVjdG9yYXRlJywgJ3Zpcy10b3AtZGlyJywgJyNhZjRjN2UnKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHRcdFxyXG5cdH0pO1xyXG59Il19
