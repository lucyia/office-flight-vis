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

	var months = uniqValues(data, 'month');

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyIsImpzXFxzcGVuZGluZy5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ09BOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7OztBQUdkLFNBQVEsUUFBUixDQUFpQixPQUFqQjs7O0FBR0EsSUFBRyxHQUFILENBQU8sc0NBQVAsRUFDRSxHQURGLENBQ08sYUFBSztBQUNWLFNBQU87QUFDTixjQUFXLEVBQUUsU0FEUDtBQUVOLGdCQUFhLEVBQUUsV0FGVDtBQUdOLGdCQUFhLEVBQUUsV0FIVDtBQUlOLFVBQU8sRUFBRSxjQUpIO0FBS04sU0FBTSxXQUFXLEVBQUUsU0FBYixDQUxBO0FBTU4sV0FBUSxFQUFFLHdCQU5KO0FBT04sYUFBVSxFQUFFO0FBUE4sR0FBUDtBQVNBLEVBWEYsRUFZRSxHQVpGLENBWU8sVUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN0QixNQUFJLEtBQUosRUFBVyxRQUFRLEdBQVIsQ0FBWSxLQUFaOztBQUVYLDRCQUFVLElBQVY7QUFDQSxFQWhCRjtBQWlCQTs7Ozs7Ozs7UUNFZSxRLEdBQUEsUTs7QUFyQ2hCOzs7Ozs7Ozs7OztBQUdBLElBQUksTUFBSjtBQUNBLElBQUksS0FBSjtBQUNBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxHQUFKOztBQUVBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxNQUFKOztBQUVBLElBQUksTUFBSjs7O0FBR0EsSUFBSSxLQUFKOztBQUVBLElBQUksS0FBSjs7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QUFTLENBQUMsY0FBRCxFQUFpQixrQkFBakIsQ0FBYjs7Ozs7OztBQU9PLFNBQVMsU0FBVCxDQUFtQixPQUFuQixFQUEyQjtBQUNqQyxRQUFPLE9BQVA7O0FBRUEsY0FBYSxJQUFiO0FBQ0E7Ozs7Ozs7QUFPTSxTQUFTLGVBQVQsQ0FBeUIsS0FBekIsRUFBZ0M7QUFDdEMsS0FBSSxLQUFKLEVBQVc7O0FBRVYsRUFGRCxNQUVPOztBQUVOO0FBQ0Q7Ozs7O0FBTUQsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCO0FBQzNCLFFBQU8sT0FBUCxDQUFnQixpQkFBUztBQUN4QixNQUFJLFNBQVMsY0FBVCxDQUF3QixLQUF4QixDQUFKLEVBQW9DO0FBQ25DLFdBQVEsS0FBUjtBQUNDLFNBQUssY0FBTDtBQUNDLDZCQUFTLElBQVQ7QUFDQTtBQUhGO0FBS0E7QUFDRCxFQVJEO0FBU0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIEluaXRpYWxpemF0aW9uIG9mIGFsbCBtb2R1bGVzIFxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3Zpc3VhbGl6ZX0gZnJvbSAnLi92aXN1YWxpemUnO1xyXG5cclxuKGZ1bmN0aW9uIHJlYWR5KGZuKSB7XHJcblx0aWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJyl7XHJcblx0XHRmbigpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xyXG5cdH1cclxufSkoaW5pdCk7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgcmVhZGluZyBvZiBmaWxlIGFuZCB0aGVuIHZpc3VhbGl6YXRpb24gcHJvY2Vzcy5cclxuICovXHJcbmZ1bmN0aW9uIGluaXQoKXtcclxuXHJcblx0Ly8gc2V0dXAgbnVtZXJhbCBmb3IgY29ycmVjdCBudW1iZXIgZm9ybWF0dGluZ1xyXG5cdG51bWVyYWwubGFuZ3VhZ2UoJ2VuLWdiJyk7XHJcblxyXG5cdC8vIHBhcnNlIGZpbGVcclxuXHRkMy5jc3YoJ0hvbWVfT2ZmaWNlX0Fpcl9UcmF2ZWxfRGF0YV8yMDExLmNzdicpXHJcblx0XHQucm93KCBkID0+IHsgXHJcblx0XHRcdHJldHVybiB7IFxyXG5cdFx0XHRcdGRlcGFydHVyZTogZC5EZXBhcnR1cmUsIFxyXG5cdFx0XHRcdGRlc3RpbmF0aW9uOiBkLkRlc3RpbmF0aW9uLCBcclxuXHRcdFx0XHRkaXJlY3RvcmF0ZTogZC5EaXJlY3RvcmF0ZSwgXHJcblx0XHRcdFx0bW9udGg6IGQuRGVwYXJ0dXJlXzIwMTEsIFxyXG5cdFx0XHRcdGZhcmU6IHBhcnNlRmxvYXQoZC5QYWlkX2ZhcmUpLCBcclxuXHRcdFx0XHR0aWNrZXQ6IGQuVGlja2V0X2NsYXNzX2Rlc2NyaXB0aW9uLCBcclxuXHRcdFx0XHRzdXBwbGllcjogZC5TdXBwbGllcl9uYW1lIFxyXG5cdFx0XHR9O1xyXG5cdFx0fSlcclxuXHRcdC5nZXQoIChlcnJvciwgZGF0YSkgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIGNvbnNvbGUubG9nKGVycm9yKVxyXG5cdFx0XHRcclxuXHRcdFx0dmlzdWFsaXplKGRhdGEpO1xyXG5cdFx0fSk7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiBtb250aGx5IHNwZW5kaW5nLlxyXG4gKiBDcmVhdGVzIGEgYmFyIGNoYXJ0IGZyb20gZ2l2ZW4gZGF0YSBhbmQgYWRkcyBsaXN0ZW5lcnMgZm9yIGZpbHRlcmluZyBvbmUgbW9udGguXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dXBkYXRlZFNwZW5kaW5nfSBmcm9tICcuL3Zpc3VhbGl6ZSc7XHJcblxyXG4vLyBnZW5lcmFsIGF0dHJpYnR1ZXNcclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxuLy8gc3ZnIHBhbmVsXHJcbnZhciBzdmc7XHJcbi8vIG5vZGUgZm9yIGNyZWF0ZWQgZmlsdGVyXHJcbnZhciBmaWx0ZXI7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgcG9zaXRpb25pbmcgZWxlbWVudHMgaW4geCBkaXJlY3Rpb25cclxudmFyIHhTY2FsZTtcclxuLy8gZnVuY3Rpb24gZm9yIHBvc2l0aW9uaW5nIGVsZW1lbnRzIGluIHkgZGlyZWN0aW9uXHJcbnZhciB5U2NhbGU7XHJcblxyXG4vLyBtb250aCBheGlzXHJcbnZhciB4QXhpcztcclxuLy8gbnVtYmVyIGF4aXNcclxudmFyIHlBeGlzO1xyXG5cclxuLy8gZnVuY3Rpb24gZm9yIGJpbmRpbmcgYSBjb2xvciB0byBhIHRpY2tldCB0eXBlXHJcbnZhciBjb2xvcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBhZHZhbmNlZCB0b29sdGlwXHJcbnZhciB0aXA7XHJcblxyXG4vLyBzY2FsZSBmb3Igc3RhY2tpbmcgcmVjdGFuZ2xlc1xyXG52YXIgc3RhY2s7XHJcblxyXG4vLyB0cmFuc2Zvcm1lZCBkYXRhXHJcbnZhciBkYXRhc2V0O1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIGFsbCB2YXJpYWJsZXMgbmVlZGVkIGZvciB2aXN1YWxpemF0aW9uIGFuZCBjcmVhdGVzIGEgZGF0YXNldCBmcm9tIGdpdmVuIGRhdGEgdGhhdCBpcyBtb3JlIHN1aXRhYmxlIGZvciB3b3JraW5nIHdpdGhpbiB2aXN1YWxpemF0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNwZW5kaW5nKGRhdGEpIHtcclxuXHJcblx0aW5pdChkYXRhKTtcclxuXHJcblx0ZGF0YXNldCA9IHNwZW5kaW5nRGF0YXNldChkYXRhKTtcclxuXHRcclxuXHRjcmVhdGVCYXJDaGFydChkYXRhc2V0KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNldHMgdXAgYWxsIHNjYWxlcyBhbmQgYXR0cmlidXRlcyBhY2MuIHRvIGdpdmVuIGRhdGEgYW5kIGNyZWF0ZXMgYSBzdmcgcGFuZWwuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgZWFjaCBzcGVuZGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gaW5pdChkYXRhKSB7XHRcclxuXHJcblx0bWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAzNSwgYm90dG9tOiAzMCwgbGVmdDogMTB9O1xyXG5cdHdpZHRoID0gODEwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XHJcblx0aGVpZ2h0ID0gMzQ1IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XHJcblx0XHJcblx0eFNjYWxlID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddKVxyXG5cdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgd2lkdGhdLCAuMDUpO1xyXG5cclxuXHQvLyByb3VuZCB0aGUgbWF4aW11bSB2YWx1ZSBmcm9tIGRhdGEgdG8gdGhvdXNhbmRzXHJcblx0dmFyIHJvdW5kZWRNYXggPSBNYXRoLnJvdW5kKCBNYXRoLm1heCguLi5tb250aEZhcmVzKGRhdGEpKSAvIDEwMDAgKSAqIDEwMDA7XHJcblx0eVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcclxuXHRcdC5kb21haW4oWyAwLCByb3VuZGVkTWF4IF0pXHJcblx0XHQucmFuZ2UoWyBoZWlnaHQsIDAgXSk7XHJcblxyXG5cdHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxyXG5cdFx0LnNjYWxlKHhTY2FsZSlcclxuXHRcdC5vcmllbnQoJ2JvdHRvbScpO1xyXG5cclxuXHR5QXhpcyA9IGQzLnN2Zy5heGlzKClcclxuXHRcdC5zY2FsZSh5U2NhbGUpXHJcblx0XHQub3JpZW50KCdyaWdodCcpXHJcblx0XHQudGlja0Zvcm1hdCggZCA9PiBudW1lcmFsKGQpLmZvcm1hdCgnMGEnKSk7XHJcblx0XHJcblx0Y29sb3IgPSBkMy5zY2FsZS5vcmRpbmFsKClcclxuXHRcdC5kb21haW4odW5pcVZhbHVlcyhkYXRhLCAndGlja2V0JykpXHRcdFxyXG5cdFx0LnJhbmdlKFtcIiMwMGJjZDRcIiwgXCIjMWQ2ZGQwXCIsIFwiI2VkY2QwMlwiXSk7XHJcblxyXG5cdHN0YWNrID0gZDMubGF5b3V0LnN0YWNrKCk7XHJcblxyXG5cdHN2ZyA9IGQzLnNlbGVjdCgnI3Zpcy1zcGVuZGluZycpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgbWFyZ2luLmxlZnQgKycsJysgbWFyZ2luLnRvcCArJyknKTtcclxuXHJcblx0LyoqXHJcblx0ICogQ2FsY3VsYXRlcyB0aGUgbW9udGhseSBzcGVuZGluZyBmb3IgYWxsIHRpY2tldCB0eXBlcyBhbmQgcmV0dXJucyB0aGUgY3JlYXRlZCBhcnJheS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbmRpbmcgYWxsIHllYXIgc3BlZG5pbmdcclxuXHQgKiBAcmV0dXJuIHthcnJheX0gc3VtTW9udGhseUZhcmVzIGFycmF5IG9mIG51bWJlcnMgcmVwcmVzZW50aW5nIGVhY2ggbW9udGhzIHNwZW5kaW5nIG9uIGFsbCB0aWNrZXRzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW9udGhGYXJlcyhkYXRhKSB7XHRcclxuXHRcdC8vIGdldCBhbGwgZmFyZXMgZm9yIGVhY2ggbW9udGhcclxuXHRcdHZhciBmYXJlcyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJykubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHRcdC8vIHN1bSB1cCBhbGwgZmFyZXMgaW4gZWFjaCBtb250aFxyXG5cdFx0dmFyIHN1bU1vbnRobHlGYXJlcyA9IGZhcmVzLm1hcCggZmFyZSA9PiBmYXJlLnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCkpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gc3VtTW9udGhseUZhcmVzO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBzdGFja2VkIGJhciBjaGFydCBhY2NvcmRpbmcgdG8gZ2l2ZW4gZGF0YS4gVGhlIGNoYXJ0IGhhcyBsYXllcnMgZm9yIGVhY2ggdGlja2V0IHR5cGUuXHJcbiAqIFRoZXJlIGFyZSBsaXN0ZW5lcnMgZm9yIGNyZWF0aW5nIGEgdG9vbHRpcCBhbmQgZmlsdGVyIGZvciBzZWxlY3Rpbmcgb25seSBvbmUgbW9udGguXHJcbiAqIFxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhIGFycmF5IG9mIG9iamVjdHMgaW4gdGhlIGZvcm0gb2YgXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVCYXJDaGFydChkYXRhKSB7XHJcblx0Ly8gY3JlYXRlIHN0YWNrZWQgZGF0YSBmb3IgdGhlIHZpc3VhbGl6YXRpb25cclxuXHRzdGFjayhkYXRhKTtcclxuXHJcblx0Ly8gY3JlYXRlIHRvb2x0aXAgYW5kIGNhbGwgaXRcclxuXHR0aXAgPSBkMy50aXAoKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHQuaHRtbCggZCA9PiB7XHJcblx0XHRcdHZhciBpbmRleCA9IGNvbG9yLnJhbmdlKCkuaW5kZXhPZihjb2xvcihkLnRpY2tldCkpO1xyXG5cdFx0XHRyZXR1cm4gJzxzcGFuIGNsYXNzPVwidHlwZSB0eXBlLScraW5kZXgrJ1wiPicrIGQudGlja2V0ICsnPC9zcGFuPjxici8+PHNwYW4gY2xhc3M9XCJ2YWx1ZVwiPicrbnVtZXJhbChkLnkpLmZvcm1hdCgnJDAsMCcpICsgJzwvc3Bhbj4nOyBcclxuXHRcdH0pO1xyXG5cclxuXHRzdmcuY2FsbCh0aXApO1xyXG5cclxuXHQvLyBjcmVhdGUgYSByZWN0YW5nbGUgYXMgYSBiYWNrZ3JvdW5kXHJcblx0dmFyIGJhY2tncm91bmQgPSBzdmcuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdzdmctYmFja2dyb3VuZCcpXHJcblx0XHQuYXR0cigneCcsIDApXHJcblx0XHQuYXR0cigneScsIDApXHJcblx0XHQuYXR0cignd2lkdGgnLCB3aWR0aClcclxuXHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXHJcblx0XHQuYXR0cignZmlsbCcsICd0cmFuc3BhcmVudCcpXHJcblx0XHQub24oJ2NsaWNrJywgZGVzZWxlY3QpO1xyXG5cclxuXHQvLyBjcmVhdGUgZ3JvdXAgZm9yIGVhY2ggdGlja2V0IHR5cGVcclxuXHR2YXIgZ3JvdXBzID0gc3ZnLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkYXRhKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdFx0LmFwcGVuZCgnZycpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsIChkLGkpID0+ICd0aWNrZXQtJytpICk7XHJcblxyXG5cdC8vIGNyZWF0ZSBiYXJzIGZvciBlYWNoIHRpY2tldCBncm91cFxyXG5cdGdyb3Vwcy5zZWxlY3RBbGwoJy5iYXInKVxyXG5cdFx0LmRhdGEoIGQgPT4gZCApXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdC5hdHRyKCdjbGFzcycsICdiYXInKVxyXG5cdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUoZC55MCkgLSB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgbW91c2VvdmVyKVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgbW91c2VvdXQpXHJcblx0XHRcdC5vbignY2xpY2snLCBtb3VzZWNsaWNrKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXgnKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgMCArJywnKyBoZWlnaHQgKycpJylcclxuXHRcdC5jYWxsKHhBeGlzKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgd2lkdGggKycsJysgMCArJyknKVxyXG5cdFx0LmNhbGwoeUF4aXMpO1xyXG5cclxuXHRmaWx0ZXIgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdmaWx0ZXInKTtcclxuXHJcblx0LyoqXHJcblx0ICogRGVsZXRlcyB0aGUgZmlsdGVyIGNvbnRhaW5pbmcgc2VsZWN0ZWQgbW9udGggYW5kIHVwZGF0ZXMgYWxsIG90aGVyIHZpc3VhbGl6YXRpb25zLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGRlc2VsZWN0KCkge1xyXG5cclxuXHRcdHZhciBmaWx0ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdmaWx0ZXInKVswXTtcclxuXHJcblx0XHRpZiAoZmlsdGVyLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHQvLyBkZWxldGUgc2VsZWN0ZWQgbW9udGhcclxuXHRcdFx0ZmlsdGVyLnJlbW92ZUNoaWxkKGZpbHRlci5jaGlsZE5vZGVzWzBdKTtcclxuXHJcblx0XHRcdC8vIHVwZGF0ZSBhbGwgb3RoZXIgdmlzdWFsaXphdGlvbnNcclxuXHRcdFx0dXBkYXRlZFNwZW5kaW5nKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGEgZmlsdGVyIGZvciBhIHdob2xlIG1vbnRoIGFmdGVyIHRoZSB1c2VyIGNsaWNrcyBvbiBhbnkgdGlja2V0IHRpY2tldCB0eXBlLiBUaGUgZmlsdGVyIGlzIHJlcHJlc2VudGVkIHdpdGggYSB3aGl0ZS1ib3JkZXJlZCByZWN0YW5nbGUuXHJcblx0ICogQWxsIG90aGVyIHZpc3VhbGl6YXRpb25zIGFyZSB1cGRhdGVkIGFjY29yZGluZyB0byBzZWxlY3RlZCBtb250aC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VjbGljayhkYXRhKSB7XHJcblx0XHQvLyB1cGRhdGUgb3RoZXIgdmlzdWFsaXphdGlvbnMgYWNjb3JkaW5nIHRvIHNlbGVjdGVkIG1vbnRoXHJcblx0XHR1cGRhdGVkU3BlbmRpbmcoZGF0YS54KTtcclxuXHJcblx0XHQvLyBnZXQgYWxsIHRpY2tldCB0eXBlcyBmb3Igc2VsZWN0ZWQgbW9udGhcclxuXHRcdHZhciB0aWNrZXRzTW9udGggPSBkYXRhc2V0Lm1hcCggdGlja2V0cyA9PiB0aWNrZXRzLmZpbHRlciggZCA9PiBkLnggPT09IGRhdGEueCApKTtcclxuXHJcblx0XHQvLyBmbGF0dGVuIHRoZSBhcnJheVxyXG5cdFx0dGlja2V0c01vbnRoID0gW10uY29uY2F0LmFwcGx5KFtdLCB0aWNrZXRzTW9udGgpO1xyXG5cclxuXHRcdC8vIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0IGFuZCBzdGFydGluZyBwb2ludCBvZiBtb250aHMgYmFyXHJcblx0XHR2YXIgeTAgPSB0aWNrZXRzTW9udGhbMF0ueTA7XHJcblx0XHR2YXIgYmFySGVpZ2h0ID0gdGlja2V0c01vbnRoLnJlZHVjZSggKGEsIGIpID0+IGEgKyBiLnksIDApO1xyXG5cdFx0XHJcblx0XHQvLyBjcmVhdGUgYW5kIHVwZGF0ZSByZWN0YW5nbGUgZm9yIGhpZ2hsaWdodGluZyB0aGUgc2VsZWN0ZWQgbW9udGhcclxuXHRcdHZhciBzZWxlY3RlZCA9IGZpbHRlci5zZWxlY3RBbGwoJy5zZWxlY3RlZCcpXHJcblx0XHRcdC5kYXRhKFtkYXRhXSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoYmFySGVpZ2h0KSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIHlTY2FsZSh5MCkgLSB5U2NhbGUoYmFySGVpZ2h0KSk7XHJcblxyXG5cdFx0c2VsZWN0ZWQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0XHQuYXR0cignY2xhc3MnLCAnc2VsZWN0ZWQnKVx0XHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZS13aWR0aCcsIDMpXHJcblx0XHRcdFx0LmF0dHIoJ3N0cm9rZScsICd3aGl0ZScpXHJcblx0XHRcdFx0LmF0dHIoJ2ZpbGwnLCAnbm9uZScpXHJcblx0XHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoYmFySGVpZ2h0KSlcclxuXHRcdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIaWhnbGlnaHQgdGhlIGhvdmVyZWQgZWxlbWVudCBhbmQgc2hvd3MgdG9vbHRpcC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdmVyKGQpIHtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gZDMucmdiKGNvbG9yKGQudGlja2V0KSkuYnJpZ2h0ZXIoLjUpKTtcclxuXHJcblx0XHR0aXAuc2hvdyhkKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyB0aGUgY29sb3Igb2YgdGhlIGVsZW1lbnQgYW5kIGhpZGVzIHRoZSB0b29sdGlwLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3V0KCkge1x0XHRcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKTtcclxuXHJcblx0XHR0aXAuaGlkZSgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBkYXRhIGludG8gYSBuZXcgZGF0YXNldCB3aGljaCBoYXMgcmVhcnJhbmdlZCB2YWx1ZXNcclxuICogc28gdGhhdCBpdCBpcyBhbiBhcnJheSBvZiB0aWNrZXQgdHlwZSBhcnJheXNcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHMgZXh0cmFjdGVkIGZyb20gZmlsZVxyXG4gKiBAcmV0dXJuIHthcnJheX0gZGF0YXNldCBhcnJheSBvZiBkYXRhIG9iamVjdHMgZ3JvdXBlZCBieSB0aWNrZXQgdHlwZXMgYW5kIG1vbnRoc1xyXG4gKi9cclxuZnVuY3Rpb24gc3BlbmRpbmdEYXRhc2V0KGRhdGEpIHtcclxuXHR2YXIgZGF0YXNldCA9IFtdO1xyXG5cclxuXHR2YXIgdGlja2V0cyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpO1xyXG5cclxuXHR2YXIgbW9udGhzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKTtcclxuXHJcblx0dmFyIG1vbnRobHlEYXRhID0gbW9udGhzLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblxyXG5cdHRpY2tldHMuZm9yRWFjaCggdGlja2V0ID0+IHtcclxuXHRcdHZhciB0aWNrZXRBcnJheSA9IFtdO1xyXG5cclxuXHRcdG1vbnRobHlEYXRhLmZvckVhY2goIChtb250aERhdGEsIGkpID0+IHtcclxuXHRcdFx0dmFyIGRhdGFPYmogPSB7fTtcclxuXHRcdFxyXG5cdFx0XHRkYXRhT2JqLnRpY2tldCA9IHRpY2tldDtcdFx0XHRcclxuXHRcdFx0ZGF0YU9iai52YWx1ZXMgPSBtb250aERhdGEuZmlsdGVyKCBkID0+IGQudGlja2V0ID09PSB0aWNrZXQpO1xyXG5cdFx0XHRkYXRhT2JqLnggPSBtb250aHNbaV07XHJcblxyXG5cdFx0XHRkYXRhT2JqLnkgPSBkYXRhT2JqLnZhbHVlcy5yZWR1Y2UoIChhLGIpID0+IHtcclxuXHRcdFx0XHRpZiAoIGIudGlja2V0ID09PSB0aWNrZXQgKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYSArIGIuZmFyZTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCAwKTtcclxuXHJcblx0XHRcdHRpY2tldEFycmF5LnB1c2goZGF0YU9iaik7XHRcdFx0XHJcblx0XHR9KTtcclxuXHJcblx0XHRkYXRhc2V0LnB1c2godGlja2V0QXJyYXkpO1xyXG5cdH0pO1xyXG5cclxuXHRyZXR1cm4gZGF0YXNldDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpbmRzIG91dCB0aGUgdW5pcXVlIHZhbHVlcyBvZiBnaXZlbiBkYXRhIGZvciBnaXZlbiBwYXJhbWV0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGEgYXJyYXkgb2Ygb2JqZWN0cyByZXByZXNlbnRpbmcgYWxsIHllYXIgc3BlbmRpbmdcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtIHBhcmFtZXRlciB3aGljaCBzaG91bGQgYmUgbG9va2VkIHVwXHJcbiAqIEByZXR1cm4ge2FycmF5fSB1bmlxdWVWYWx1ZXMgYXJyYXkgb2YgYWxsIHVuaXF1ZSB2YWx1ZXMgZm9yIGdpdmVuIHBhcmFtZXRlclxyXG4gKi9cclxuZnVuY3Rpb24gdW5pcVZhbHVlcyhkYXRhLCBwYXJhbSkge1xyXG5cdHJldHVybiBbIC4uLm5ldyBTZXQoZGF0YS5tYXAoZCA9PiBkW3BhcmFtXSkpXTtcclxufSIsIi8qKlxyXG4gKiBNYWluIHZpc3VhbGl6YXRpb24gbW9kdWxlIGZvciBjcmVhdGluZyBjaGFydHMgYW5kIHZpcyBmb3IgcGFzc2VkIGRhdGEuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7c3BlbmRpbmd9IGZyb20gJy4vc3BlbmRpbmcnO1xyXG5cclxudmFyIGRhdGE7XHJcbnZhciBwYW5lbHMgPSBbJ3Zpcy1zcGVuZGluZycsICd2aXMtZGlzdHJpYnV0aW9uJ107XHJcblxyXG4vKipcclxuICpcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YXNldCBhcnJheSBvZiBvYmplY3RzIGZvciB2aXN1YWxpemF0aW9uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmlzdWFsaXplKGRhdGFzZXQpe1x0XHJcblx0ZGF0YSA9IGRhdGFzZXQ7XHJcblxyXG5cdGRldGVjdFBhbmVscyhkYXRhKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGEgaXMgZmlyc3RseSBmaWx0ZXJlZCBhY2NvcmRpbmcgdG8gbW9udGggYW5kIGFsbCBvdGhlciB2aXN1YWxpemF0aW9ucyBhcmUgdGhlbiByZWRyYXduIHdpdGggdXBkYXRlZCBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbW9udGggc2VsZWN0ZWQgbW9udGggd2hpY2ggd2lsbCBiZSB1c2VkIGZvciBmaWx0ZXJpbmcgZGF0YVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZWRTcGVuZGluZyhtb250aCkge1xyXG5cdGlmIChtb250aCkge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBvbmx5IGdpdmVuIG1vbnRoIGRhdGFcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gcmVkcmF3IGFsbCBwYW5lbHMgd2l0aCBhbGwgbW9udGhzIGRhdGFcclxuXHR9XHJcbn1cclxuXHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGRldGVjdFBhbmVscyhkYXRhKSB7XHJcblx0cGFuZWxzLmZvckVhY2goIHBhbmVsID0+IHtcclxuXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5lbCkpIHtcclxuXHRcdFx0c3dpdGNoIChwYW5lbCkge1xyXG5cdFx0XHRcdGNhc2UgJ3Zpcy1zcGVuZGluZyc6XHJcblx0XHRcdFx0XHRzcGVuZGluZyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHRcdFxyXG5cdH0pO1xyXG59Il19
