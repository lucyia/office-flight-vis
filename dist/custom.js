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
exports.topDirectorates = topDirectorates;
exports.updateTopDir = updateTopDir;

var _visUtil = require('./vis-util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Visualization of top directorates.
                                                                                                                                                                                                     * Creates five bar charts stating the top directorates which spend the most.
                                                                                                                                                                                                     *
                                                                                                                                                                                                     * @author lucyia <ping@lucyia.com>
                                                                                                                                                                                                     * @version 0.1
                                                                                                                                                                                                     */

// general attribtues
var visId = 'vis-top-dir';
var param = 'directorate';
var margin;
var width;
var height;

// function for positioning elements in x direction
var xScale;
// function for positioning elements in y direction
var yScale;

// svg panel
var svg;

// function for advanced tooltip
var tip;

/**
 * Initializes all variables needed for visualization.
 *
 * @param {array} data array of data objects
 */
function topDirectorates(data) {

	var topData = calcTop(data);

	init(topData);

	createBarChart(topData);
}

/**
 * Firstly, calculates the new top data and then updates the bar chart and text values according to new data.
 *
 * @param {array} data
 */
function updateTopDir(data) {
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
		return d.directorate;
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
	var bars = svg.selectAll('.bar-dir').data(data);

	bars.transition().attr('width', function (d) {
		return xScale(d.fare);
	});

	bars.enter().append('rect').attr('class', 'bar-dir').attr('x', function (d) {
		return 0;
	}).attr('y', function (d) {
		return yScale(d.directorate);
	}).attr('height', function (d) {
		return yScale.rangeBand();
	}).attr('width', function (d) {
		return xScale(d.fare);
	}).attr('fill', function (d) {
		return '#af4c7e';
	}).on('mouseover', tip.show).on('mouseout', tip.hide);

	bars.exit().remove();

	// draw text to the left of each bar representing the name
	var names = svg.selectAll('.bar-dir-name').data(data);

	names.transition().text(function (d) {
		return d.directorate;
	});

	names.enter().append('text').attr('class', 'bar-dir-name').attr('x', 0).attr('y', function (d) {
		return yScale(d.directorate);
	}).attr('dy', 17).attr('dx', 5).attr('fill', 'white').text(function (d) {
		return d.directorate;
	});

	names.exit().remove();

	// draw text to the right of each bar representing the rounded spending
	var fares = svg.selectAll('.bar-dir-fare').data(data);

	fares.transition().text(function (d) {
		return numeral(d.fare).format('0a');
	});

	fares.enter().append('text').attr('class', 'bar-dir-fare').attr('x', width - 35).attr('y', function (d) {
		return yScale(d.directorate);
	}).attr('dy', 17).attr('dx', 5).attr('fill', 'white').text(function (d) {
		return numeral(d.fare).format('0a');
	});

	fares.exit().remove();
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

var _topDirectorates = require('./topDirectorates');

var data; /**
           * Main visualization module for creating charts and vis for passed data.
           *
           * @author lucyia <ping@lucyia.com>
           * @version 0.1
           */

var panels = ['vis-spending', 'vis-distribution', 'vis-top-dir'];

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
		(0, _topDirectorates.updateTopDir)(dataset);
	} else {
		// redraw all panels with all months data
		(0, _topDirectorates.updateTopDir)(data);
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
					topSuppliers(data);
					break;
				case 'vis-top-dir':
					(0, _topDirectorates.topDirectorates)(data);
					break;
			}
		}
	});
}

},{"./distribution":1,"./spending":3,"./topDirectorates":4}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcZGlzdHJpYnV0aW9uLmpzIiwianNcXGluaXQuanMiLCJqc1xcc3BlbmRpbmcuanMiLCJqc1xcdG9wRGlyZWN0b3JhdGVzLmpzIiwianNcXHZpcy11dGlsLmpzIiwianNcXHZpc3VhbGl6ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O1FDcUJnQixZLEdBQUEsWTs7Ozs7Ozs7OztBQVpoQixJQUFJLE1BQUo7QUFDQSxJQUFJLEtBQUo7QUFDQSxJQUFJLE1BQUo7OztBQUdBLElBQUksR0FBSjs7QUFFQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7O0FBRUEsSUFBSSxLQUFKOztBQUVPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0Qjs7QUFFbEMsT0FBSyxJQUFMO0FBRUE7O0FBRUQsU0FBUyxJQUFULENBQWMsSUFBZCxFQUFvQjtBQUNuQixXQUFTLEVBQUMsS0FBSyxFQUFOLEVBQVUsT0FBTyxFQUFqQixFQUFxQixRQUFRLEVBQTdCLEVBQWlDLE1BQU0sRUFBdkMsRUFBVDtBQUNBLFVBQVEsTUFBTSxPQUFPLElBQWIsR0FBb0IsT0FBTyxLQUFuQztBQUNBLFdBQVMsTUFBTSxPQUFPLEdBQWIsR0FBbUIsT0FBTyxNQUFuQztBQUVBOzs7OztBQ3pCRDs7QUFFQSxDQUFDLFNBQVMsS0FBVCxDQUFlLEVBQWYsRUFBbUI7QUFDbkIsS0FBSSxTQUFTLFVBQVQsS0FBd0IsU0FBNUIsRUFBc0M7QUFDckM7QUFDQSxFQUZELE1BRU87QUFDTixXQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxFQUE5QztBQUNBO0FBQ0QsQ0FORCxFQU1HLElBTkg7Ozs7Ozs7Ozs7OztBQVdBLFNBQVMsSUFBVCxHQUFlOzs7QUFHZCxTQUFRLFFBQVIsQ0FBaUIsT0FBakI7OztBQUdBLElBQUcsR0FBSCxDQUFPLHNDQUFQLEVBQ0UsR0FERixDQUNPLGFBQUs7QUFDVixTQUFPO0FB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Q2pDLFFBQU8sT0FBUDs7QUFFQSxjQUFhLElBQWI7QUFDQTs7Ozs7OztBQU9NLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUFnQztBQUN0QyxLQUFJLEtBQUosRUFBVzs7QUFFVixNQUFJLFVBQVUsS0FBSyxNQUFMLENBQWE7QUFBQSxVQUFLLEVBQUUsS0FBRixLQUFZLEtBQWpCO0FBQUEsR0FBYixDQUFkO0FBQ0EscUNBQWEsT0FBYjtBQUNBLEVBSkQsTUFJTzs7QUFFTixxQ0FBYSxJQUFiO0FBQ0E7QUFDRDs7Ozs7QUFNRCxTQUFTLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEI7QUFDM0IsUUFBTyxPQUFQLENBQWdCLGlCQUFTO0FBQ3hCLE1BQUksU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQUosRUFBb0M7QUFDbkMsV0FBUSxLQUFSO0FBQ0MsU0FBSyxjQUFMO0FBQ0MsNkJBQVMsSUFBVDtBQUNBO0FBQ0QsU0FBSyxrQkFBTDtBQUNDLHFDQUFhLElBQWI7QUFDQTtBQUNELFNBQUssZUFBTDtBQUNDLGNBQVMsSUFBVDtBQUNBO0FBQ0QsU0FBSyxlQUFMO0FBQ0MsY0FBUyxJQUFUO0FBQ0E7QUFDRCxTQUFLLGFBQUw7QUFDQyxrQkFBYSxJQUFiO0FBQ0E7QUFDRCxTQUFLLGFBQUw7QUFDQywyQ0FBZ0IsSUFBaEI7QUFDQTtBQWxCRjtBQW9CQTtBQUNELEVBdkJEO0FBd0JBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIGRhdGEgZGlzdHJpYnV0aW9uLlxyXG4gKiBDcmVhdGVzIGEgYm94LWFuZC13aGlza2V5IHBsb3QgZnJvbSBnaXZlbiBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG52YXIgbWluO1xyXG52YXIgbWF4O1xyXG5cclxudmFyIGNoYXJ0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RyaWJ1dGlvbihkYXRhKSB7XHJcblx0XHJcblx0aW5pdChkYXRhKTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDI2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cclxufSIsIi8qKlxyXG4gKiBJbml0aWFsaXphdGlvbiBvZiBhbGwgbW9kdWxlcyBcclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt2aXN1YWxpemV9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbihmdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn0pKGluaXQpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHJlYWRpbmcgb2YgZmlsZSBhbmQgdGhlbiB2aXN1YWxpemF0aW9uIHByb2Nlc3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KCl7XHJcblxyXG5cdC8vIHNldHVwIG51bWVyYWwgZm9yIGNvcnJlY3QgbnVtYmVyIGZvcm1hdHRpbmdcclxuXHRudW1lcmFsLmxhbmd1YWdlKCdlbi1nYicpO1xyXG5cclxuXHQvLyBwYXJzZSBmaWxlXHJcblx0ZDMuY3N2KCdIb21lX09mZmljZV9BaXJfVHJhdmVsX0RhdGFfMjAxMS5jc3YnKVxyXG5cdFx0LnJvdyggZCA9PiB7IFxyXG5cdFx0XHRyZXR1cm4geyBcclxuXHRcdFx0XHRkZXBhcnR1cmU6IGQuRGVwYXJ0dXJlLCBcclxuXHRcdFx0XHRkZXN0aW5hdGlvbjogZC5EZXN0aW5hdGlvbiwgXHJcblx0XHRcdFx0ZGlyZWN0b3JhdGU6IGQuRGlyZWN0b3JhdGUsIFxyXG5cdFx0XHRcdG1vbnRoOiBkLkRlcGFydHVyZV8yMDExLCBcclxuXHRcdFx0XHRmYXJlOiBwYXJzZUZsb2F0KGQuUGFpZF9mYXJlKSwgXHJcblx0XHRcdFx0dGlja2V0OiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiwgXHJcblx0XHRcdFx0c3VwcGxpZXI6IGQuU3VwcGxpZXJfbmFtZSBcclxuXHRcdFx0fTtcclxuXHRcdH0pXHJcblx0XHQuZ2V0KCAoZXJyb3IsIGRhdGEpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSBjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHJcblx0XHRcdHZpc3VhbGl6ZShkYXRhKTtcclxuXHRcdH0pO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgbW9udGhseSBzcGVuZGluZy5cclxuICogQ3JlYXRlcyBhIGJhciBjaGFydCBmcm9tIGdpdmVuIGRhdGEgYW5kIGFkZHMgbGlzdGVuZXJzIGZvciBmaWx0ZXJpbmcgb25lIG1vbnRoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXN9IGZyb20gJy4vdmlzLXV0aWwnO1xyXG5pbXBvcnQge3VwZGF0ZWRTcGVuZGluZ30gZnJvbSAnLi92aXN1YWxpemUnO1xyXG5cclxuLy8gZ2VuZXJhbCBhdHRyaWJ0dWVzXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbi8vIHN2ZyBwYW5lbFxyXG52YXIgc3ZnO1xyXG4vLyBub2RlIGZvciBjcmVhdGVkIGZpbHRlclxyXG52YXIgZmlsdGVyO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIHBvc2l0aW9uaW5nIGVsZW1lbnRzIGluIHggZGlyZWN0aW9uXHJcbnZhciB4U2NhbGU7XHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB5IGRpcmVjdGlvblxyXG52YXIgeVNjYWxlO1xyXG5cclxuLy8gbW9udGggYXhpc1xyXG52YXIgeEF4aXM7XHJcbi8vIG51bWJlciBheGlzXHJcbnZhciB5QXhpcztcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBiaW5kaW5nIGEgY29sb3IgdG8gYSB0aWNrZXQgdHlwZVxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLy8gc2NhbGUgZm9yIHN0YWNraW5nIHJlY3RhbmdsZXNcclxudmFyIHN0YWNrO1xyXG5cclxuLy8gdHJhbnNmb3JtZWQgZGF0YVxyXG52YXIgZGF0YXNldDtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgdmFyaWFibGVzIG5lZWRlZCBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIGRhdGFzZXQgZnJvbSBnaXZlbiBkYXRhIHRoYXQgaXMgbW9yZSBzdWl0YWJsZSBmb3Igd29ya2luZyB3aXRoaW4gdmlzdWFsaXphdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcGVuZGluZyhkYXRhKSB7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGRhdGFzZXQgPSBzcGVuZGluZ0RhdGFzZXQoZGF0YSk7XHJcblx0XHJcblx0Y3JlYXRlQmFyQ2hhcnQoZGF0YXNldCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZXRzIHVwIGFsbCBzY2FsZXMgYW5kIGF0dHJpYnV0ZXMgYWNjLiB0byBnaXZlbiBkYXRhIGFuZCBjcmVhdGVzIGEgc3ZnIHBhbmVsLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGVhY2ggc3BlbmRpbmdcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMzUsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbihbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSlcclxuXHRcdC5yYW5nZVJvdW5kQmFuZHMoWzAsIHdpZHRoXSwgLjA1KTtcclxuXHJcblx0Ly8gcm91bmQgdGhlIG1heGltdW0gdmFsdWUgZnJvbSBkYXRhIHRvIHRob3VzYW5kc1xyXG5cdHZhciByb3VuZGVkTWF4ID0gTWF0aC5yb3VuZCggTWF0aC5tYXgoLi4ubW9udGhGYXJlcyhkYXRhKSkgLyAxMDAwICkgKiAxMDAwO1xyXG5cdHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXHJcblx0XHQuZG9tYWluKFsgMCwgcm91bmRlZE1heCBdKVxyXG5cdFx0LnJhbmdlKFsgaGVpZ2h0LCAwIF0pO1xyXG5cclxuXHR4QXhpcyA9IGQzLnN2Zy5heGlzKClcclxuXHRcdC5zY2FsZSh4U2NhbGUpXHJcblx0XHQub3JpZW50KCdib3R0b20nKTtcclxuXHJcblx0eUF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeVNjYWxlKVxyXG5cdFx0Lm9yaWVudCgncmlnaHQnKVxyXG5cdFx0LnRpY2tGb3JtYXQoIGQgPT4gbnVtZXJhbChkKS5mb3JtYXQoJzBhJykpO1xyXG5cdFxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpKVx0XHRcclxuXHRcdC5yYW5nZShbXCIjMDBiY2Q0XCIsIFwiIzFkNmRkMFwiLCBcIiNlZGNkMDJcIl0pO1xyXG5cclxuXHRzdGFjayA9IGQzLmxheW91dC5zdGFjaygpO1xyXG5cclxuXHRzdmcgPSBkMy5zZWxlY3QoJyN2aXMtc3BlbmRpbmcnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG1vbnRobHkgc3BlbmRpbmcgZm9yIGFsbCB0aWNrZXQgdHlwZXMgYW5kIHJldHVybnMgdGhlIGNyZWF0ZWQgYXJyYXkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW5kaW5nIGFsbCB5ZWFyIHNwZWRuaW5nXHJcblx0ICogQHJldHVybiB7YXJyYXl9IHN1bU1vbnRobHlGYXJlcyBhcnJheSBvZiBudW1iZXJzIHJlcHJlc2VudGluZyBlYWNoIG1vbnRocyBzcGVuZGluZyBvbiBhbGwgdGlja2V0c1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vbnRoRmFyZXMoZGF0YSkge1x0XHJcblx0XHQvLyBnZXQgYWxsIGZhcmVzIGZvciBlYWNoIG1vbnRoXHJcblx0XHR2YXIgZmFyZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0XHQvLyBzdW0gdXAgYWxsIGZhcmVzIGluIGVhY2ggbW9udGhcclxuXHRcdHZhciBzdW1Nb250aGx5RmFyZXMgPSBmYXJlcy5tYXAoIGZhcmUgPT4gZmFyZS5yZWR1Y2UoIChhLGIpID0+IGEgKyBiLmZhcmUsIDApKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHN1bU1vbnRobHlGYXJlcztcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgc3RhY2tlZCBiYXIgY2hhcnQgYWNjb3JkaW5nIHRvIGdpdmVuIGRhdGEuIFRoZSBjaGFydCBoYXMgbGF5ZXJzIGZvciBlYWNoIHRpY2tldCB0eXBlLlxyXG4gKiBUaGVyZSBhcmUgbGlzdGVuZXJzIGZvciBjcmVhdGluZyBhIHRvb2x0aXAgYW5kIGZpbHRlciBmb3Igc2VsZWN0aW5nIG9ubHkgb25lIG1vbnRoLlxyXG4gKiBcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIGluIHRoZSBmb3JtIG9mIFxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQmFyQ2hhcnQoZGF0YSkge1xyXG5cdC8vIGNyZWF0ZSBzdGFja2VkIGRhdGEgZm9yIHRoZSB2aXN1YWxpemF0aW9uXHJcblx0c3RhY2soZGF0YSk7XHJcblxyXG5cdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0dGlwID0gZDMudGlwKClcclxuXHRcdC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxyXG5cdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHR2YXIgaW5kZXggPSBjb2xvci5yYW5nZSgpLmluZGV4T2YoY29sb3IoZC50aWNrZXQpKTtcclxuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cInR5cGUgdHlwZS0nK2luZGV4KydcIj4nKyBkLnRpY2tldCArJzwvc3Bhbj48YnIvPjxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC55KS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+JzsgXHJcblx0XHR9KTtcclxuXHJcblx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0Ly8gY3JlYXRlIGEgcmVjdGFuZ2xlIGFzIGEgYmFja2dyb3VuZFxyXG5cdHZhciBiYWNrZ3JvdW5kID0gc3ZnLmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnc3ZnLWJhY2tncm91bmQnKVxyXG5cdFx0LmF0dHIoJ3gnLCAwKVxyXG5cdFx0LmF0dHIoJ3knLCAwKVxyXG5cdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGgpXHJcblx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxyXG5cdFx0LmF0dHIoJ2ZpbGwnLCAndHJhbnNwYXJlbnQnKVxyXG5cdFx0Lm9uKCdjbGljaycsIGRlc2VsZWN0KTtcclxuXHJcblx0Ly8gY3JlYXRlIGdyb3VwIGZvciBlYWNoIHRpY2tldCB0eXBlXHJcblx0dmFyIGdyb3VwcyA9IHN2Zy5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAoZCxpKSA9PiAndGlja2V0LScraSApO1xyXG5cclxuXHQvLyBjcmVhdGUgYmFycyBmb3IgZWFjaCB0aWNrZXQgZ3JvdXBcclxuXHRncm91cHMuc2VsZWN0QWxsKCcuYmFyJylcclxuXHRcdC5kYXRhKCBkID0+IGQgKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyJylcclxuXHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGQgPT4geVNjYWxlKGQueTApIC0geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIG1vdXNlb3ZlcilcclxuXHRcdFx0Lm9uKCdtb3VzZW91dCcsIG1vdXNlb3V0KVxyXG5cdFx0XHQub24oJ2NsaWNrJywgbW91c2VjbGljayk7XHJcblxyXG5cdHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy14JylcclxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIDAgKycsJysgaGVpZ2h0ICsnKScpXHJcblx0XHQuY2FsbCh4QXhpcyk7XHJcblxyXG5cdHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2F4aXMgYXhpcy15JylcclxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIHdpZHRoICsnLCcrIDAgKycpJylcclxuXHRcdC5jYWxsKHlBeGlzKTtcclxuXHJcblx0ZmlsdGVyID0gc3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZmlsdGVyJyk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZXMgdGhlIGZpbHRlciBjb250YWluaW5nIHNlbGVjdGVkIG1vbnRoIGFuZCB1cGRhdGVzIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucy5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBkZXNlbGVjdCgpIHtcclxuXHJcblx0XHR2YXIgZmlsdGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZmlsdGVyJylbMF07XHJcblxyXG5cdFx0aWYgKGZpbHRlci5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Ly8gZGVsZXRlIHNlbGVjdGVkIG1vbnRoXHJcblx0XHRcdGZpbHRlci5yZW1vdmVDaGlsZChmaWx0ZXIuY2hpbGROb2Rlc1swXSk7XHJcblxyXG5cdFx0XHQvLyB1cGRhdGUgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zXHJcblx0XHRcdHVwZGF0ZWRTcGVuZGluZygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIGZpbHRlciBmb3IgYSB3aG9sZSBtb250aCBhZnRlciB0aGUgdXNlciBjbGlja3Mgb24gYW55IHRpY2tldCB0aWNrZXQgdHlwZS4gVGhlIGZpbHRlciBpcyByZXByZXNlbnRlZCB3aXRoIGEgd2hpdGUtYm9yZGVyZWQgcmVjdGFuZ2xlLlxyXG5cdCAqIEFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdXBkYXRlZCBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgbW9udGguXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlY2xpY2soZGF0YSkge1xyXG5cdFx0Ly8gdXBkYXRlIG90aGVyIHZpc3VhbGl6YXRpb25zIGFjY29yZGluZyB0byBzZWxlY3RlZCBtb250aFxyXG5cdFx0dXBkYXRlZFNwZW5kaW5nKGRhdGEueCk7XHJcblxyXG5cdFx0Ly8gZ2V0IGFsbCB0aWNrZXQgdHlwZXMgZm9yIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR2YXIgdGlja2V0c01vbnRoID0gZGF0YXNldC5tYXAoIHRpY2tldHMgPT4gdGlja2V0cy5maWx0ZXIoIGQgPT4gZC54ID09PSBkYXRhLnggKSk7XHJcblxyXG5cdFx0Ly8gZmxhdHRlbiB0aGUgYXJyYXlcclxuXHRcdHRpY2tldHNNb250aCA9IFtdLmNvbmNhdC5hcHBseShbXSwgdGlja2V0c01vbnRoKTtcclxuXHJcblx0XHQvLyBjYWxjdWxhdGUgdGhlIGhlaWdodCBhbmQgc3RhcnRpbmcgcG9pbnQgb2YgbW9udGhzIGJhclxyXG5cdFx0dmFyIHkwID0gdGlja2V0c01vbnRoWzBdLnkwO1xyXG5cdFx0dmFyIGJhckhlaWdodCA9IHRpY2tldHNNb250aC5yZWR1Y2UoIChhLCBiKSA9PiBhICsgYi55LCAwKTtcclxuXHRcdFxyXG5cdFx0Ly8gY3JlYXRlIGFuZCB1cGRhdGUgcmVjdGFuZ2xlIGZvciBoaWdobGlnaHRpbmcgdGhlIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR2YXIgc2VsZWN0ZWQgPSBmaWx0ZXIuc2VsZWN0QWxsKCcuc2VsZWN0ZWQnKVxyXG5cdFx0XHQuZGF0YShbZGF0YV0pO1xyXG5cclxuXHRcdHNlbGVjdGVkLmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGJhckhlaWdodCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgJ3NlbGVjdGVkJylcdFxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2Utd2lkdGgnLCAzKVxyXG5cdFx0XHRcdC5hdHRyKCdzdHJva2UnLCAnd2hpdGUnKVxyXG5cdFx0XHRcdC5hdHRyKCdmaWxsJywgJ25vbmUnKVxyXG5cdFx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGJhckhlaWdodCkpXHJcblx0XHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdFx0LmF0dHIoJ2hlaWdodCcsIHlTY2FsZSh5MCkgLSB5U2NhbGUoYmFySGVpZ2h0KSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGloZ2xpZ2h0IHRoZSBob3ZlcmVkIGVsZW1lbnQgYW5kIHNob3dzIHRvb2x0aXAuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3ZlcihkKSB7XHJcblx0XHRkMy5zZWxlY3QodGhpcylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGQzLnJnYihjb2xvcihkLnRpY2tldCkpLmJyaWdodGVyKC41KSk7XHJcblxyXG5cdFx0dGlwLnNob3coZCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldHMgdGhlIGNvbG9yIG9mIHRoZSBlbGVtZW50IGFuZCBoaWRlcyB0aGUgdG9vbHRpcC5cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZW91dCgpIHtcdFx0XHJcblx0XHRkMy5zZWxlY3QodGhpcylcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSk7XHJcblxyXG5cdFx0dGlwLmhpZGUoKTtcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm0gZGF0YSBpbnRvIGEgbmV3IGRhdGFzZXQgd2hpY2ggaGFzIHJlYXJyYW5nZWQgdmFsdWVzXHJcbiAqIHNvIHRoYXQgaXQgaXMgYW4gYXJyYXkgb2YgdGlja2V0IHR5cGUgYXJyYXlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2YgZGF0YSBvYmplY3RzIGV4dHJhY3RlZCBmcm9tIGZpbGVcclxuICogQHJldHVybiB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2YgZGF0YSBvYmplY3RzIGdyb3VwZWQgYnkgdGlja2V0IHR5cGVzIGFuZCBtb250aHNcclxuICovXHJcbmZ1bmN0aW9uIHNwZW5kaW5nRGF0YXNldChkYXRhKSB7XHJcblx0dmFyIGRhdGFzZXQgPSBbXTtcclxuXHJcblx0dmFyIHRpY2tldHMgPSB1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKTtcclxuXHJcblx0dmFyIG1vbnRocyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJyk7XHJcblxyXG5cdHZhciBtb250aGx5RGF0YSA9IG1vbnRocy5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cclxuXHR0aWNrZXRzLmZvckVhY2goIHRpY2tldCA9PiB7XHJcblx0XHR2YXIgdGlja2V0QXJyYXkgPSBbXTtcclxuXHJcblx0XHRtb250aGx5RGF0YS5mb3JFYWNoKCAobW9udGhEYXRhLCBpKSA9PiB7XHJcblx0XHRcdHZhciBkYXRhT2JqID0ge307XHJcblx0XHRcclxuXHRcdFx0ZGF0YU9iai50aWNrZXQgPSB0aWNrZXQ7XHRcdFx0XHJcblx0XHRcdGRhdGFPYmoudmFsdWVzID0gbW9udGhEYXRhLmZpbHRlciggZCA9PiBkLnRpY2tldCA9PT0gdGlja2V0KTtcclxuXHRcdFx0ZGF0YU9iai54ID0gbW9udGhzW2ldO1xyXG5cclxuXHRcdFx0ZGF0YU9iai55ID0gZGF0YU9iai52YWx1ZXMucmVkdWNlKCAoYSxiKSA9PiB7XHJcblx0XHRcdFx0aWYgKCBiLnRpY2tldCA9PT0gdGlja2V0ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGEgKyBiLmZhcmU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgMCk7XHJcblxyXG5cdFx0XHR0aWNrZXRBcnJheS5wdXNoKGRhdGFPYmopO1x0XHRcdFxyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKHRpY2tldEFycmF5KTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiB0b3AgZGlyZWN0b3JhdGVzLlxyXG4gKiBDcmVhdGVzIGZpdmUgYmFyIGNoYXJ0cyBzdGF0aW5nIHRoZSB0b3AgZGlyZWN0b3JhdGVzIHdoaWNoIHNwZW5kIHRoZSBtb3N0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3VuaXFWYWx1ZXMsIGNhbGNTcGVuZGluZ30gZnJvbSAnLi92aXMtdXRpbCc7XHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIHZpc0lkID0gJ3Zpcy10b3AtZGlyJztcclxudmFyIHBhcmFtID0gJ2RpcmVjdG9yYXRlJztcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIHBvc2l0aW9uaW5nIGVsZW1lbnRzIGluIHggZGlyZWN0aW9uXHJcbnZhciB4U2NhbGU7XHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB5IGRpcmVjdGlvblxyXG52YXIgeVNjYWxlO1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGZvciB2aXN1YWxpemF0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0c1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvcERpcmVjdG9yYXRlcyhkYXRhKSB7XHRcclxuXHJcblx0dmFyIHRvcERhdGEgPSBjYWxjVG9wKGRhdGEpO1xyXG5cclxuXHRpbml0KHRvcERhdGEpO1xyXG5cclxuXHRjcmVhdGVCYXJDaGFydCh0b3BEYXRhKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpcnN0bHksIGNhbGN1bGF0ZXMgdGhlIG5ldyB0b3AgZGF0YSBhbmQgdGhlbiB1cGRhdGVzIHRoZSBiYXIgY2hhcnQgYW5kIHRleHQgdmFsdWVzIGFjY29yZGluZyB0byBuZXcgZGF0YS5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRvcERpcihkYXRhKSB7XHRcclxuXHR1cGRhdGUoY2FsY1RvcChkYXRhKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRvcCBmaXZlIGl0ZW1zIGZyb20gZGF0YSBhY2NvcmRpbmcgdG8gc3BlbmRpbmcgKGZhcmUpIHZhbHVlcy5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YVxyXG4gKiBAcmV0dXJuIHthcnJheX0gZGF0YXNldCB1cGRhdGVkIFxyXG4gKi9cclxuZnVuY3Rpb24gY2FsY1RvcChkYXRhKSB7XHJcblx0cmV0dXJuIGNhbGNTcGVuZGluZyhkYXRhLCBwYXJhbSkuc29ydCggKGEsIGIpID0+IGIuZmFyZSAtIGEuZmFyZSApLnNsaWNlKDAsNSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyBhbGwgbmVlZGVkIHZhcmlhYmxlcyBmb3IgdmlzdWFsaXphdGlvbiBhbmQgY3JlYXRlcyBhIFNWRyBwYW5lbC4gXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDV9O1xyXG5cdHdpZHRoID0gMjYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0aGVpZ2h0ID0gMTMwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblxyXG5cdHlTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbihkYXRhLm1hcChkID0+IGQuZGlyZWN0b3JhdGUpKVxyXG5cdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgaGVpZ2h0XSwgLjEpO1xyXG5cclxuXHR4U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0LmRvbWFpbihbIDAsIE1hdGgubWF4KC4uLmRhdGEubWFwKGQgPT4gZC5mYXJlKSkgXSlcclxuXHRcdC5yYW5nZShbIDAsIHdpZHRoIF0pO1xyXG5cclxuXHRzdmcgPSBkMy5zZWxlY3QoJyMnK3Zpc0lkKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcrIG1hcmdpbi5sZWZ0ICsnLCcrIG1hcmdpbi50b3AgKycpJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGJhciBjaGFydCBhbmQgYSB0b29sdGlwLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVCYXJDaGFydChkYXRhKSB7XHJcblxyXG5cdC8vIGNyZWF0ZSB0b29sdGlwIGFuZCBjYWxsIGl0XHJcblx0dGlwID0gZDMudGlwKClcclxuXHRcdC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxyXG5cdFx0Lmh0bWwoIGQgPT4ge1xyXG5cdFx0XHRyZXR1cm4gJzxzcGFuIGNsYXNzPVwidmFsdWVcIj4nK251bWVyYWwoZC5mYXJlKS5mb3JtYXQoJyQwLDAnKSArICc8L3NwYW4+JzsgXHJcblx0XHR9KTtcclxuXHJcblx0c3ZnLmNhbGwodGlwKTtcclxuXHJcblx0Ly8gY3JlYXRlIGJhciBjaGFydHNcclxuXHR1cGRhdGUoZGF0YSk7XHJcblxyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlcyB0aGUgYmFyIGNoYXJ0IHZpc3VhbGl6YXRpb24gd2l0aCBhbGwgbmFtZXMgYW5kIGZhcmUgdmFsdWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHM7IGUuZy4gWyB7IGZhcmU6IHgsIG90aGVyUGFyYW06IGEgfSwgeyBmYXJlOiB5LCBvdGhlclBhcmFtOiBiIH0sIC4uLiBdXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGUoZGF0YSkge1xyXG5cdC8vIHVwZGF0ZSBzY2FsZSBzbyByZWxhdGl2ZSBkaWZmZXJlbmNpZXMgY2FuIGJlIHNlZW5cclxuXHR4U2NhbGUuZG9tYWluKFsgMCwgTWF0aC5tYXgoLi4uZGF0YS5tYXAoZCA9PiBkLmZhcmUpKSBdKTtcclxuXHJcblx0Ly8gZHJhdyByZWN0YW5nbGUgcmVwcmVzZW50aW5nIHNwZW5kaW5nXHJcblx0dmFyIGJhcnMgPSBzdmcuc2VsZWN0QWxsKCcuYmFyLWRpcicpXHJcblx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0YmFycy50cmFuc2l0aW9uKClcclxuXHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlKGQuZmFyZSkpO1xyXG5cclxuXHRiYXJzLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAnYmFyLWRpcicpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiAwKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGQuZGlyZWN0b3JhdGUpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlKGQuZmFyZSkpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiAnI2FmNGM3ZScpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgdGlwLnNob3cpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XHJcblxyXG5cdGJhcnMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cclxuXHQvLyBkcmF3IHRleHQgdG8gdGhlIGxlZnQgb2YgZWFjaCBiYXIgcmVwcmVzZW50aW5nIHRoZSBuYW1lXHJcblx0dmFyIG5hbWVzID0gc3ZnLnNlbGVjdEFsbCgnLmJhci1kaXItbmFtZScpXHJcblx0XHQuZGF0YShkYXRhKTtcclxuXHJcblx0bmFtZXMudHJhbnNpdGlvbigpXHJcblx0XHQudGV4dChkID0+IGQuZGlyZWN0b3JhdGUpO1xyXG5cclxuXHRuYW1lcy5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2Jhci1kaXItbmFtZScpXHJcblx0XHRcdC5hdHRyKCd4JywgMClcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkLmRpcmVjdG9yYXRlKSlcclxuXHRcdFx0LmF0dHIoJ2R5JywgMTcpXHJcblx0XHRcdC5hdHRyKCdkeCcsIDUpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgJ3doaXRlJylcclxuXHRcdFx0LnRleHQoZCA9PiBkLmRpcmVjdG9yYXRlKTtcclxuXHJcblx0bmFtZXMuZXhpdCgpLnJlbW92ZSgpO1xyXG5cclxuXHQvLyBkcmF3IHRleHQgdG8gdGhlIHJpZ2h0IG9mIGVhY2ggYmFyIHJlcHJlc2VudGluZyB0aGUgcm91bmRlZCBzcGVuZGluZ1xyXG5cdHZhciBmYXJlcyA9IHN2Zy5zZWxlY3RBbGwoJy5iYXItZGlyLWZhcmUnKVxyXG5cdFx0LmRhdGEoZGF0YSk7XHJcblxyXG5cdGZhcmVzLnRyYW5zaXRpb24oKVxyXG5cdFx0LnRleHQoZCA9PiBudW1lcmFsKGQuZmFyZSkuZm9ybWF0KCcwYScpKTtcclxuXHJcblx0ZmFyZXMuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXItZGlyLWZhcmUnKVxyXG5cdFx0XHQuYXR0cigneCcsIHdpZHRoLTM1KVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGQuZGlyZWN0b3JhdGUpKVxyXG5cdFx0XHQuYXR0cignZHknLCAxNylcclxuXHRcdFx0LmF0dHIoJ2R4JywgNSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxyXG5cdFx0XHQudGV4dChkID0+IG51bWVyYWwoZC5mYXJlKS5mb3JtYXQoJzBhJykpO1xyXG5cclxuXHRmYXJlcy5leGl0KCkucmVtb3ZlKCk7XHJcbn0iLCIvKipcclxuICogRmluZHMgb3V0IHRoZSB1bmlxdWUgdmFsdWVzIG9mIGdpdmVuIGRhdGEgZm9yIGdpdmVuIHBhcmFtZXRlci5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBhbGwgeWVhciBzcGVuZGluZ1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW0gcGFyYW1ldGVyIHdoaWNoIHNob3VsZCBiZSBsb29rZWQgdXBcclxuICogQHJldHVybiB7YXJyYXl9IHVuaXF1ZVZhbHVlcyBhcnJheSBvZiBhbGwgdW5pcXVlIHZhbHVlcyBmb3IgZ2l2ZW4gcGFyYW1ldGVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5pcVZhbHVlcyhkYXRhLCBwYXJhbSkge1xyXG5cdHJldHVybiBbIC4uLm5ldyBTZXQoZGF0YS5tYXAoZCA9PiBkW3BhcmFtXSkpXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNTcGVuZGluZyhkYXRhLCBwYXJhbSkge1xyXG5cdHZhciB1bmlxSXRlbXMgPSB1bmlxVmFsdWVzKGRhdGEsIHBhcmFtKTtcclxuXHRcclxuXHR2YXIgYWxsUGFyYW1zID0gdW5pcUl0ZW1zLm1hcCggaXRlbSA9PiBkYXRhLmZpbHRlciggZCA9PiBkW3BhcmFtXSA9PT0gaXRlbSApKTtcclxuXHJcblx0dmFyIGFsbFNwZW5kaW5nID0gW107XHJcblxyXG5cdGFsbFBhcmFtcy5mb3JFYWNoKCBpdGVtQXJyYXkgPT4ge1xyXG5cdFx0dmFyIG9iaiA9IHt9O1xyXG5cclxuXHRcdG9ialsnZmFyZSddID0gaXRlbUFycmF5LnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCk7XHJcblx0XHRvYmpbcGFyYW1dID0gaXRlbUFycmF5WzBdW3BhcmFtXTtcclxuXHJcblx0XHRhbGxTcGVuZGluZy5wdXNoKG9iaik7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBhbGxTcGVuZGluZztcclxufSIsIi8qKlxyXG4gKiBNYWluIHZpc3VhbGl6YXRpb24gbW9kdWxlIGZvciBjcmVhdGluZyBjaGFydHMgYW5kIHZpcyBmb3IgcGFzc2VkIGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7c3BlbmRpbmd9IGZyb20gJy4vc3BlbmRpbmcnO1xyXG5pbXBvcnQge2Rpc3RyaWJ1dGlvbn0gZnJvbSAnLi9kaXN0cmlidXRpb24nO1xyXG5pbXBvcnQge3RvcERpcmVjdG9yYXRlcywgdXBkYXRlVG9wRGlyfSBmcm9tICcuL3RvcERpcmVjdG9yYXRlcyc7XHJcblxyXG52YXIgZGF0YTtcclxudmFyIHBhbmVscyA9IFsndmlzLXNwZW5kaW5nJywgJ3Zpcy1kaXN0cmlidXRpb24nLCAndmlzLXRvcC1kaXInXTtcclxuXHJcbi8qKlxyXG4gKlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIG9iamVjdHMgZm9yIHZpc3VhbGl6YXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxpemUoZGF0YXNldCl7XHRcclxuXHRkYXRhID0gZGF0YXNldDtcclxuXHJcblx0ZGV0ZWN0UGFuZWxzKGRhdGEpO1xyXG59XHJcblxyXG4vKipcclxuICogRGF0YSBpcyBmaXJzdGx5IGZpbHRlcmVkIGFjY29yZGluZyB0byBtb250aCBhbmQgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zIGFyZSB0aGVuIHJlZHJhd24gd2l0aCB1cGRhdGVkIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtb250aCBzZWxlY3RlZCBtb250aCB3aGljaCB3aWxsIGJlIHVzZWQgZm9yIGZpbHRlcmluZyBkYXRhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlZFNwZW5kaW5nKG1vbnRoKSB7XHJcblx0aWYgKG1vbnRoKSB7XHJcblx0XHQvLyByZWRyYXcgYWxsIHBhbmVscyB3aXRoIG9ubHkgZ2l2ZW4gbW9udGggZGF0YVxyXG5cdFx0dmFyIGRhdGFzZXQgPSBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApO1xyXG5cdFx0dXBkYXRlVG9wRGlyKGRhdGFzZXQpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyByZWRyYXcgYWxsIHBhbmVscyB3aXRoIGFsbCBtb250aHMgZGF0YVxyXG5cdFx0dXBkYXRlVG9wRGlyKGRhdGEpO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gZGV0ZWN0UGFuZWxzKGRhdGEpIHtcclxuXHRwYW5lbHMuZm9yRWFjaCggcGFuZWwgPT4ge1xyXG5cdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhbmVsKSkge1xyXG5cdFx0XHRzd2l0Y2ggKHBhbmVsKSB7XHJcblx0XHRcdFx0Y2FzZSAndmlzLXNwZW5kaW5nJzpcclxuXHRcdFx0XHRcdHNwZW5kaW5nKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAndmlzLWRpc3RyaWJ1dGlvbic6XHJcblx0XHRcdFx0XHRkaXN0cmlidXRpb24oZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlICd2aXMtYXZnLW1vbnRoJzpcclxuXHRcdFx0XHRcdGF2Z01vbnRoKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAndmlzLWF2Zy1wcmljZSc6XHJcblx0XHRcdFx0XHRhdmdQcmljZShkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ3Zpcy10b3Atc3VwJzpcclxuXHRcdFx0XHRcdHRvcFN1cHBsaWVycyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgJ3Zpcy10b3AtZGlyJzpcclxuXHRcdFx0XHRcdHRvcERpcmVjdG9yYXRlcyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHRcdFxyXG5cdH0pO1xyXG59Il19
