(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./visualize":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.spending = spending;

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

	color = d3.scale.ordinal().domain(uniqValues(data, 'ticket')).range(["#00bcd4", "#1d6dd0", "#edcd02"]);

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
		var fares = uniqValues(data, 'month').map(function (month) {
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

	var tickets = uniqValues(data, 'ticket');

	var monthlyData = uniqValues(data, 'month').map(function (month) {
		return data.filter(function (d) {
			return d.month === month;
		});
	});

	tickets.forEach(function (ticket) {
		var ticketArray = [];

		monthlyData.forEach(function (monthData) {
			var dataObj = {};

			dataObj.ticket = ticket;
			dataObj.values = monthData.filter(function (d) {
				return d.ticket === ticket;
			});
			dataObj.x = monthData[0].month;
			dataObj.y = monthData.reduce(function (a, b) {
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

},{"./visualize":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.visualize = visualize;
exports.updatedSpending = updatedSpending;

var _spending = require('./spending');

var data; /**
           * Main visualization module for creating charts and vis for passed data.
           *
           * @author lucyia <ping@lucyia.com>
           * @version 0.1
           */

var panels = ['vis-spending', 'vis-distribution'];

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
	} else {
			// redraw all panels with all months data
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
			}
		}
	});
}

},{"./spending":2}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyIsImpzXFxzcGVuZGluZy5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ09BOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7OztBQUdkLFNBQVEsUUFBUixDQUFpQixPQUFqQjs7O0FBR0EsSUFBRyxHQUFILENBQU8sc0NBQVAsRUFDRSxHQURGLENBQ08sYUFBSztBQUNWLFNBQU87QUFDTixjQUFXLEVBQUUsU0FEUDtBQUVOLGdCQUFhLEVBQUUsV0FGVDtBQUdOLGdCQUFhLEVBQUUsV0FIVDtBQUlOLFVBQU8sRUFBRSxjQUpIO0FBS04sU0FBTSxXQUFXLEVBQUUsU0FBYixDQUxBO0FBTU4sV0FBUSxFQUFFLHdCQU5KO0FBT04sYUFBVSxFQUFFO0FBUE4sR0FBUDtBQVNBLEVBWEYsRUFZRSxHQVpGLENBWU8sVUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN0QixNQUFJLEtBQUosRUFBVyxRQUFRLEdBQVIsQ0FBWSxLQUFaOztBQUVYLDRCQUFVLElBQVY7QUFDQSxFQWhCRjtBQWlCQTs7Ozs7Ozs7UUNFZSxRLEdBQUEsUTs7QUFyQ2hCOzs7Ozs7Ozs7OztBQUdBLElBQUksTUFBSjtBQUNBLElBQUksS0FBSjtBQUNBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxHQUFKOztBQUVBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxNQUFKOztBQUVBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxLQUFKOztBQUVBLElBQUksS0FBSjs7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U0FBUyxTQUFULENBQW1CLE9BQW5CLEVBQTJCO0FBQ2pDLFFBQU8sT0FBUDs7QUFFQSxjQUFhLElBQWI7QUFDQTs7Ozs7OztBQU9NLFNBQVMsZUFBVCxDQUF5QixLQUF6QixFQUFnQztBQUN0QyxLQUFJLEtBQUosRUFBVzs7QUFFVixFQUZELE1BRU87O0FBRU47QUFDRDs7Ozs7QUFNRCxTQUFTLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEI7QUFDM0IsUUFBTyxPQUFQLENBQWdCLGlCQUFTO0FBQ3hCLE1BQUksU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQUosRUFBb0M7QUFDbkMsV0FBUSxLQUFSO0FBQ0MsU0FBSyxjQUFMO0FBQ0MsNkJBQVMsSUFBVDtBQUNBO0FBSEY7QUFLQTtBQUNELEVBUkQ7QUFTQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogSW5pdGlhbGl6YXRpb24gb2YgYWxsIG1vZHVsZXMgXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dmlzdWFsaXplfSBmcm9tICcuL3Zpc3VhbGl6ZSc7XHJcblxyXG4oZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuXHRpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuXHRcdGZuKCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcblx0fVxyXG59KShpbml0KTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyByZWFkaW5nIG9mIGZpbGUgYW5kIHRoZW4gdmlzdWFsaXphdGlvbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5pdCgpe1xyXG5cclxuXHQvLyBzZXR1cCBudW1lcmFsIGZvciBjb3JyZWN0IG51bWJlciBmb3JtYXR0aW5nXHJcblx0bnVtZXJhbC5sYW5ndWFnZSgnZW4tZ2InKTtcclxuXHJcblx0Ly8gcGFyc2UgZmlsZVxyXG5cdGQzLmNzdignSG9tZV9PZmZpY2VfQWlyX1RyYXZlbF9EYXRhXzIwMTEuY3N2JylcclxuXHRcdC5yb3coIGQgPT4geyBcclxuXHRcdFx0cmV0dXJuIHsgXHJcblx0XHRcdFx0ZGVwYXJ0dXJlOiBkLkRlcGFydHVyZSwgXHJcblx0XHRcdFx0ZGVzdGluYXRpb246IGQuRGVzdGluYXRpb24sIFxyXG5cdFx0XHRcdGRpcmVjdG9yYXRlOiBkLkRpcmVjdG9yYXRlLCBcclxuXHRcdFx0XHRtb250aDogZC5EZXBhcnR1cmVfMjAxMSwgXHJcblx0XHRcdFx0ZmFyZTogcGFyc2VGbG9hdChkLlBhaWRfZmFyZSksIFxyXG5cdFx0XHRcdHRpY2tldDogZC5UaWNrZXRfY2xhc3NfZGVzY3JpcHRpb24sIFxyXG5cdFx0XHRcdHN1cHBsaWVyOiBkLlN1cHBsaWVyX25hbWUgXHJcblx0XHRcdH07XHJcblx0XHR9KVxyXG5cdFx0LmdldCggKGVycm9yLCBkYXRhKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikgY29uc29sZS5sb2coZXJyb3IpXHJcblx0XHRcdFxyXG5cdFx0XHR2aXN1YWxpemUoZGF0YSk7XHJcblx0XHR9KTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIG1vbnRobHkgc3BlbmRpbmcuXHJcbiAqIENyZWF0ZXMgYSBiYXIgY2hhcnQgZnJvbSBnaXZlbiBkYXRhIGFuZCBhZGRzIGxpc3RlbmVycyBmb3IgZmlsdGVyaW5nIG9uZSBtb250aC5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt1cGRhdGVkU3BlbmRpbmd9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbi8vIGdlbmVyYWwgYXR0cmlidHVlc1xyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG4vLyBzdmcgcGFuZWxcclxudmFyIHN2ZztcclxuLy8gbm9kZSBmb3IgY3JlYXRlZCBmaWx0ZXJcclxudmFyIGZpbHRlcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBwb3NpdGlvbmluZyBlbGVtZW50cyBpbiB4IGRpcmVjdGlvblxyXG52YXIgeFNjYWxlO1xyXG4vLyBmdW5jdGlvbiBmb3IgcG9zaXRpb25pbmcgZWxlbWVudHMgaW4geSBkaXJlY3Rpb25cclxudmFyIHlTY2FsZTtcclxuXHJcbi8vIG1vbnRoIGF4aXNcclxudmFyIHhBeGlzO1xyXG4vLyBudW1iZXIgYXhpc1xyXG52YXIgeUF4aXM7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYmluZGluZyBhIGNvbG9yIHRvIGEgdGlja2V0IHR5cGVcclxudmFyIGNvbG9yO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGFkdmFuY2VkIHRvb2x0aXBcclxudmFyIHRpcDtcclxuXHJcbi8vIHNjYWxlIGZvciBzdGFja2luZyByZWN0YW5nbGVzXHJcbnZhciBzdGFjaztcclxuXHJcbi8vIHRyYW5zZm9ybWVkIGRhdGFcclxudmFyIGRhdGFzZXQ7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgYWxsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIHZpc3VhbGl6YXRpb24gYW5kIGNyZWF0ZXMgYSBkYXRhc2V0IGZyb20gZ2l2ZW4gZGF0YSB0aGF0IGlzIG1vcmUgc3VpdGFibGUgZm9yIHdvcmtpbmcgd2l0aGluIHZpc3VhbGl6YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3BlbmRpbmcoZGF0YSkge1xyXG5cclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkYXRhc2V0ID0gc3BlbmRpbmdEYXRhc2V0KGRhdGEpO1xyXG5cdFxyXG5cdGNyZWF0ZUJhckNoYXJ0KGRhdGFzZXQpO1xyXG59XHJcblxyXG4vKipcclxuICogU2V0cyB1cCBhbGwgc2NhbGVzIGFuZCBhdHRyaWJ1dGVzIGFjYy4gdG8gZ2l2ZW4gZGF0YSBhbmQgY3JlYXRlcyBhIHN2ZyBwYW5lbC5cclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VudGluZyBlYWNoIHNwZW5kaW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KGRhdGEpIHtcdFxyXG5cclxuXHRtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDM1LCBib3R0b206IDMwLCBsZWZ0OiAxMH07XHJcblx0d2lkdGggPSA4MTAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcclxuXHRoZWlnaHQgPSAzNDUgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcclxuXHRcclxuXHR4U2NhbGUgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdC5kb21haW4oWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ10pXHJcblx0XHQucmFuZ2VSb3VuZEJhbmRzKFswLCB3aWR0aF0sIC4wNSk7XHJcblxyXG5cdC8vIHJvdW5kIHRoZSBtYXhpbXVtIHZhbHVlIGZyb20gZGF0YSB0byB0aG91c2FuZHNcclxuXHR2YXIgcm91bmRlZE1heCA9IE1hdGgucm91bmQoIE1hdGgubWF4KC4uLm1vbnRoRmFyZXMoZGF0YSkpIC8gMTAwMCApICogMTAwMDtcclxuXHR5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0LmRvbWFpbihbIDAsIHJvdW5kZWRNYXggXSlcclxuXHRcdC5yYW5nZShbIGhlaWdodCwgMCBdKTtcclxuXHJcblx0eEF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeFNjYWxlKVxyXG5cdFx0Lm9yaWVudCgnYm90dG9tJyk7XHJcblxyXG5cdHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxyXG5cdFx0LnNjYWxlKHlTY2FsZSlcclxuXHRcdC5vcmllbnQoJ3JpZ2h0JylcclxuXHRcdC50aWNrRm9ybWF0KCBkID0+IG51bWVyYWwoZCkuZm9ybWF0KCcwYScpKTtcclxuXHRcclxuXHRjb2xvciA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbih1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKSlcdFx0XHJcblx0XHQucmFuZ2UoW1wiIzAwYmNkNFwiLCBcIiMxZDZkZDBcIiwgXCIjZWRjZDAyXCJdKTtcclxuXHJcblx0c3RhY2sgPSBkMy5sYXlvdXQuc3RhY2soKTtcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLXNwZW5kaW5nJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG5cclxuXHQvKipcclxuXHQgKiBDYWxjdWxhdGVzIHRoZSBtb250aGx5IHNwZW5kaW5nIGZvciBhbGwgdGlja2V0IHR5cGVzIGFuZCByZXR1cm5zIHRoZSBjcmVhdGVkIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBvYmplY3RzIHJlcHJlc2VuZGluZyBhbGwgeWVhciBzcGVkbmluZ1xyXG5cdCAqIEByZXR1cm4ge2FycmF5fSBzdW1Nb250aGx5RmFyZXMgYXJyYXkgb2YgbnVtYmVycyByZXByZXNlbnRpbmcgZWFjaCBtb250aHMgc3BlbmRpbmcgb24gYWxsIHRpY2tldHNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb250aEZhcmVzKGRhdGEpIHtcdFxyXG5cdFx0Ly8gZ2V0IGFsbCBmYXJlcyBmb3IgZWFjaCBtb250aFxyXG5cdFx0dmFyIGZhcmVzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKS5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cdFx0Ly8gc3VtIHVwIGFsbCBmYXJlcyBpbiBlYWNoIG1vbnRoXHJcblx0XHR2YXIgc3VtTW9udGhseUZhcmVzID0gZmFyZXMubWFwKCBmYXJlID0+IGZhcmUucmVkdWNlKCAoYSxiKSA9PiBhICsgYi5mYXJlLCAwKSk7XHJcblx0XHRcclxuXHRcdHJldHVybiBzdW1Nb250aGx5RmFyZXM7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHN0YWNrZWQgYmFyIGNoYXJ0IGFjY29yZGluZyB0byBnaXZlbiBkYXRhLiBUaGUgY2hhcnQgaGFzIGxheWVycyBmb3IgZWFjaCB0aWNrZXQgdHlwZS5cclxuICogVGhlcmUgYXJlIGxpc3RlbmVycyBmb3IgY3JlYXRpbmcgYSB0b29sdGlwIGFuZCBmaWx0ZXIgZm9yIHNlbGVjdGluZyBvbmx5IG9uZSBtb250aC5cclxuICogXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyBpbiB0aGUgZm9ybSBvZiBcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUJhckNoYXJ0KGRhdGEpIHtcclxuXHQvLyBjcmVhdGUgc3RhY2tlZCBkYXRhIGZvciB0aGUgdmlzdWFsaXphdGlvblxyXG5cdHN0YWNrKGRhdGEpO1xyXG5cclxuXHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdHRpcCA9IGQzLnRpcCgpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0dmFyIGluZGV4ID0gY29sb3IucmFuZ2UoKS5pbmRleE9mKGNvbG9yKGQudGlja2V0KSk7XHJcblx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJ0eXBlIHR5cGUtJytpbmRleCsnXCI+JysgZC50aWNrZXQgKyc8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cInZhbHVlXCI+JytudW1lcmFsKGQueSkuZm9ybWF0KCckMCwwJykgKyAnPC9zcGFuPic7IFxyXG5cdFx0fSk7XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblxyXG5cdC8vIGNyZWF0ZSBhIHJlY3RhbmdsZSBhcyBhIGJhY2tncm91bmRcclxuXHR2YXIgYmFja2dyb3VuZCA9IHN2Zy5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ3N2Zy1iYWNrZ3JvdW5kJylcclxuXHRcdC5hdHRyKCd4JywgMClcclxuXHRcdC5hdHRyKCd5JywgMClcclxuXHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxyXG5cdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodClcclxuXHRcdC5hdHRyKCdmaWxsJywgJ3RyYW5zcGFyZW50JylcclxuXHRcdC5vbignY2xpY2snLCBkZXNlbGVjdCk7XHJcblxyXG5cdC8vIGNyZWF0ZSBncm91cCBmb3IgZWFjaCB0aWNrZXQgdHlwZVxyXG5cdHZhciBncm91cHMgPSBzdmcuc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgKGQsaSkgPT4gJ3RpY2tldC0nK2kgKTtcclxuXHJcblx0Ly8gY3JlYXRlIGJhcnMgZm9yIGVhY2ggdGlja2V0IGdyb3VwXHJcblx0Z3JvdXBzLnNlbGVjdEFsbCgnLmJhcicpXHJcblx0XHQuZGF0YSggZCA9PiBkIClcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0LmF0dHIoJ2NsYXNzJywgJ2JhcicpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHlTY2FsZShkLnkwKSAtIHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSlcclxuXHRcdFx0Lm9uKCdtb3VzZW92ZXInLCBtb3VzZW92ZXIpXHJcblx0XHRcdC5vbignbW91c2VvdXQnLCBtb3VzZW91dClcclxuXHRcdFx0Lm9uKCdjbGljaycsIG1vdXNlY2xpY2spO1xyXG5cclxuXHRzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteCcpXHJcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyAwICsnLCcrIGhlaWdodCArJyknKVxyXG5cdFx0LmNhbGwoeEF4aXMpO1xyXG5cclxuXHRzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdheGlzIGF4aXMteScpXHJcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyB3aWR0aCArJywnKyAwICsnKScpXHJcblx0XHQuY2FsbCh5QXhpcyk7XHJcblxyXG5cdGZpbHRlciA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2ZpbHRlcicpO1xyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBmaWx0ZXIgY29udGFpbmluZyBzZWxlY3RlZCBtb250aCBhbmQgdXBkYXRlcyBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZGVzZWxlY3QoKSB7XHJcblxyXG5cdFx0dmFyIGZpbHRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ZpbHRlcicpWzBdO1xyXG5cclxuXHRcdGlmIChmaWx0ZXIuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdC8vIGRlbGV0ZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0XHRmaWx0ZXIucmVtb3ZlQ2hpbGQoZmlsdGVyLmNoaWxkTm9kZXNbMF0pO1xyXG5cclxuXHRcdFx0Ly8gdXBkYXRlIGFsbCBvdGhlciB2aXN1YWxpemF0aW9uc1xyXG5cdFx0XHR1cGRhdGVkU3BlbmRpbmcoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYSBmaWx0ZXIgZm9yIGEgd2hvbGUgbW9udGggYWZ0ZXIgdGhlIHVzZXIgY2xpY2tzIG9uIGFueSB0aWNrZXQgdGlja2V0IHR5cGUuIFRoZSBmaWx0ZXIgaXMgcmVwcmVzZW50ZWQgd2l0aCBhIHdoaXRlLWJvcmRlcmVkIHJlY3RhbmdsZS5cclxuXHQgKiBBbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMgYXJlIHVwZGF0ZWQgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIG1vbnRoLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZWNsaWNrKGRhdGEpIHtcclxuXHRcdC8vIHVwZGF0ZSBvdGhlciB2aXN1YWxpemF0aW9ucyBhY2NvcmRpbmcgdG8gc2VsZWN0ZWQgbW9udGhcclxuXHRcdHVwZGF0ZWRTcGVuZGluZyhkYXRhLngpO1xyXG5cclxuXHRcdC8vIGdldCBhbGwgdGlja2V0IHR5cGVzIGZvciBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHRpY2tldHNNb250aCA9IGRhdGFzZXQubWFwKCB0aWNrZXRzID0+IHRpY2tldHMuZmlsdGVyKCBkID0+IGQueCA9PT0gZGF0YS54ICkpO1xyXG5cclxuXHRcdC8vIGZsYXR0ZW4gdGhlIGFycmF5XHJcblx0XHR0aWNrZXRzTW9udGggPSBbXS5jb25jYXQuYXBwbHkoW10sIHRpY2tldHNNb250aCk7XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRoZSBoZWlnaHQgYW5kIHN0YXJ0aW5nIHBvaW50IG9mIG1vbnRocyBiYXJcclxuXHRcdHZhciB5MCA9IHRpY2tldHNNb250aFswXS55MDtcclxuXHRcdHZhciBiYXJIZWlnaHQgPSB0aWNrZXRzTW9udGgucmVkdWNlKCAoYSwgYikgPT4gYSArIGIueSwgMCk7XHJcblx0XHRcclxuXHRcdC8vIGNyZWF0ZSBhbmQgdXBkYXRlIHJlY3RhbmdsZSBmb3IgaGlnaGxpZ2h0aW5nIHRoZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHNlbGVjdGVkID0gZmlsdGVyLnNlbGVjdEFsbCgnLnNlbGVjdGVkJylcclxuXHRcdFx0LmRhdGEoW2RhdGFdKTtcclxuXHJcblx0XHRzZWxlY3RlZC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdzZWxlY3RlZCcpXHRcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgMylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cignZmlsbCcsICdub25lJylcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpaGdsaWdodCB0aGUgaG92ZXJlZCBlbGVtZW50IGFuZCBzaG93cyB0b29sdGlwLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBtb3VzZW92ZXIoZCkge1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBkMy5yZ2IoY29sb3IoZC50aWNrZXQpKS5icmlnaHRlciguNSkpO1xyXG5cclxuXHRcdHRpcC5zaG93KGQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIHRoZSBjb2xvciBvZiB0aGUgZWxlbWVudCBhbmQgaGlkZXMgdGhlIHRvb2x0aXAuXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdXQoKSB7XHRcdFxyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpO1xyXG5cclxuXHRcdHRpcC5oaWRlKCk7XHJcblx0fVxyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtIGRhdGEgaW50byBhIG5ldyBkYXRhc2V0IHdoaWNoIGhhcyByZWFycmFuZ2VkIHZhbHVlc1xyXG4gKiBzbyB0aGF0IGl0IGlzIGFuIGFycmF5IG9mIHRpY2tldCB0eXBlIGFycmF5c1xyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIGRhdGEgb2JqZWN0cyBleHRyYWN0ZWQgZnJvbSBmaWxlXHJcbiAqIEByZXR1cm4ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIGRhdGEgb2JqZWN0cyBncm91cGVkIGJ5IHRpY2tldCB0eXBlcyBhbmQgbW9udGhzXHJcbiAqL1xyXG5mdW5jdGlvbiBzcGVuZGluZ0RhdGFzZXQoZGF0YSkge1xyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdHZhciB0aWNrZXRzID0gdW5pcVZhbHVlcyhkYXRhLCAndGlja2V0Jyk7XHJcblxyXG5cdHZhciBtb250aGx5RGF0YSA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJykubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHRcclxuXHR0aWNrZXRzLmZvckVhY2goIHRpY2tldCA9PiB7XHJcblx0XHR2YXIgdGlja2V0QXJyYXkgPSBbXTtcclxuXHJcblx0XHRtb250aGx5RGF0YS5mb3JFYWNoKCBtb250aERhdGEgPT4ge1xyXG5cdFx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cclxuXHRcdFx0ZGF0YU9iai50aWNrZXQgPSB0aWNrZXQ7XHRcdFx0XHJcblx0XHRcdGRhdGFPYmoudmFsdWVzID0gbW9udGhEYXRhLmZpbHRlciggZCA9PiBkLnRpY2tldCA9PT0gdGlja2V0KTtcclxuXHRcdFx0ZGF0YU9iai54ID0gbW9udGhEYXRhWzBdLm1vbnRoO1xyXG5cdFx0XHRkYXRhT2JqLnkgPSBtb250aERhdGEucmVkdWNlKCAoYSxiKSA9PiB7XHJcblx0XHRcdFx0aWYgKCBiLnRpY2tldCA9PT0gdGlja2V0ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGEgKyBiLmZhcmU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgMCk7XHJcblxyXG5cdFx0XHR0aWNrZXRBcnJheS5wdXNoKGRhdGFPYmopO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKHRpY2tldEFycmF5KTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaW5kcyBvdXQgdGhlIHVuaXF1ZSB2YWx1ZXMgb2YgZ2l2ZW4gZGF0YSBmb3IgZ2l2ZW4gcGFyYW1ldGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgcmVwcmVzZW50aW5nIGFsbCB5ZWFyIHNwZW5kaW5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbSBwYXJhbWV0ZXIgd2hpY2ggc2hvdWxkIGJlIGxvb2tlZCB1cFxyXG4gKiBAcmV0dXJuIHthcnJheX0gdW5pcXVlVmFsdWVzIGFycmF5IG9mIGFsbCB1bmlxdWUgdmFsdWVzIGZvciBnaXZlbiBwYXJhbWV0ZXJcclxuICovXHJcbmZ1bmN0aW9uIHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pIHtcclxuXHRyZXR1cm4gWyAuLi5uZXcgU2V0KGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKV07XHJcbn0iLCIvKipcclxuICogTWFpbiB2aXN1YWxpemF0aW9uIG1vZHVsZSBmb3IgY3JlYXRpbmcgY2hhcnRzIGFuZCB2aXMgZm9yIHBhc3NlZCBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3NwZW5kaW5nfSBmcm9tICcuL3NwZW5kaW5nJztcclxuXHJcbnZhciBkYXRhO1xyXG52YXIgcGFuZWxzID0gWyd2aXMtc3BlbmRpbmcnLCAndmlzLWRpc3RyaWJ1dGlvbiddO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2Ygb2JqZWN0cyBmb3IgdmlzdWFsaXphdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhc2V0KXtcdFxyXG5cdGRhdGEgPSBkYXRhc2V0O1xyXG5cclxuXHRkZXRlY3RQYW5lbHMoZGF0YSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRhIGlzIGZpcnN0bHkgZmlsdGVyZWQgYWNjb3JkaW5nIHRvIG1vbnRoIGFuZCBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnMgYXJlIHRoZW4gcmVkcmF3biB3aXRoIHVwZGF0ZWQgZGF0YS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IG1vbnRoIHNlbGVjdGVkIG1vbnRoIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgZmlsdGVyaW5nIGRhdGFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVkU3BlbmRpbmcobW9udGgpIHtcclxuXHRpZiAobW9udGgpIHtcclxuXHRcdC8vIHJlZHJhdyBhbGwgcGFuZWxzIHdpdGggb25seSBnaXZlbiBtb250aCBkYXRhXHJcblx0fSBlbHNlIHtcclxuXHRcdC8vIHJlZHJhdyBhbGwgcGFuZWxzIHdpdGggYWxsIG1vbnRocyBkYXRhXHJcblx0fVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiBkZXRlY3RQYW5lbHMoZGF0YSkge1xyXG5cdHBhbmVscy5mb3JFYWNoKCBwYW5lbCA9PiB7XHJcblx0XHRpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFuZWwpKSB7XHJcblx0XHRcdHN3aXRjaCAocGFuZWwpIHtcclxuXHRcdFx0XHRjYXNlICd2aXMtc3BlbmRpbmcnOlxyXG5cdFx0XHRcdFx0c3BlbmRpbmcoZGF0YSk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVx0XHRcclxuXHR9KTtcclxufSJdfQ==
