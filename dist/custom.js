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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Visualization of monthly spending.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

var margin;
var width;
var height;

var xScale;
var yScale;

var xAxis;
var yAxis;

var color;

// function for advanced tooltip
var tip;

// scale for stacking rectangles
var stack;

// transformed data
var dataset;

var svg;
var filter;

/**
 *
 */
function spending(data) {

	init(data);

	dataset = spendingDataset(data);

	update(dataset);
}

/**
 *
 */
function init(data) {

	margin = { top: 10, right: 35, bottom: 30, left: 10 };
	width = 810 - margin.left - margin.right;
	height = 345 - margin.top - margin.bottom;

	xScale = d3.scale.ordinal().domain(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']).rangeRoundBands([0, width], .05);

	yScale = d3.scale.linear().domain([0, round(Math.max.apply(Math, _toConsumableArray(monthFares(data))), 1000)]).range([height, 0]);

	xAxis = d3.svg.axis().scale(xScale).orient('bottom');

	yAxis = d3.svg.axis().scale(yScale).orient('right').tickFormat(function (d) {
		return numeral(d).format('0a');
	});

	color = d3.scale.ordinal().domain(uniqValues(data, 'ticket')).range(["#00bcd4", "#1d6dd0", "#edcd02"]);
	//.range(["#00bcd4", "#3f51b5", "#edcd02"]);
	//.range(["#34c7bd", "#3f51b5", "#edcd02"]);		

	stack = d3.layout.stack();

	svg = d3.select('#vis-spending').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	/**
  *
  */
	function round(number, roundValue) {
		return Math.round(number / roundValue) * roundValue;
	}
}

/**
 *
 */
function update(data) {

	// create stacked data for the visualization
	stack(data);

	// create tooltip and call it
	tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
		var index = color.range().indexOf(color(d.ticket));
		return '<span class="type type-' + index + '">' + d.ticket + '</span><br/><span class="value">' + numeral(d.y).format('$0,0') + '</span>';
	});

	svg.call(tip);

	// create group for each ticket type
	var groups = svg.selectAll('g').data(data).enter().append('g').attr('class', function (d, i) {
		return 'ticket-' + i;
	});

	// create bars for each ticket group
	groups.selectAll('rect').data(function (d) {
		return d;
	}).enter().append('rect').attr('x', function (d) {
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
  * 
  *
  * @param {object} data
  */
	function mouseclick(data) {

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

		// create a rectangle for highlighting the selected month
		var selected = filter.selectAll('.selected').data([data]);

		selected.attr('x', function (d) {
			return xScale(d.x);
		}).attr('y', function (d) {
			return yScale(barHeight);
		}).attr('height', yScale(y0) - yScale(barHeight));

		selected.enter().append('rect').attr('class', 'selected').attr('stroke-width', 3).attr('stroke', 'white').attr('x', function (d) {
			return xScale(d.x);
		}).attr('y', function (d) {
			return yScale(barHeight);
		}).attr('width', function (d) {
			return xScale.rangeBand();
		}).attr('height', yScale(y0) - yScale(barHeight));

		selected.attr('fill', 'none');

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
 * @param {array} dataset array of data objects grouped by ticket types and months
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
 *
 */
function uniqValues(data, param) {
	return [].concat(_toConsumableArray(new Set(data.map(function (d) {
		return d[param];
	}))));
}

/**
 *
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

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visualize = visualize;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyIsImpzXFxzcGVuZGluZy5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ09BOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7OztBQUdkLFNBQVEsUUFBUixDQUFpQixPQUFqQjs7O0FBR0EsSUFBRyxHQUFILENBQU8sc0NBQVAsRUFDRSxHQURGLENBQ08sYUFBSztBQUNWLFNBQU87QUFDTixjQUFXLEVBQUUsU0FEUDtBQUVOLGdCQUFhLEVBQUUsV0FGVDtBQUdOLGdCQUFhLEVBQUUsV0FIVDtBQUlOLFVBQU8sRUFBRSxjQUpIO0FBS04sU0FBTSxXQUFXLEVBQUUsU0FBYixDQUxBO0FBTU4sV0FBUSxFQUFFLHdCQU5KO0FBT04sYUFBVSxFQUFFO0FBUE4sR0FBUDtBQVNBLEVBWEYsRUFZRSxHQVpGLENBWU8sVUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN0QixNQUFJLEtBQUosRUFBVyxRQUFRLEdBQVIsQ0FBWSxLQUFaOztBQUVYLDRCQUFVLElBQVY7QUFDQSxFQWhCRjtBQWlCQTs7Ozs7Ozs7UUNUZSxRLEdBQUEsUTs7Ozs7Ozs7Ozs7QUEzQmhCLElBQUksTUFBSjtBQUNBLElBQUksS0FBSjtBQUNBLElBQUksTUFBSjs7QUFFQSxJQUFJLE1BQUo7QUFDQSxJQUFJLE1BQUo7O0FBRUEsSUFBSSxLQUFKO0FBQ0EsSUFBSSxLQUFKOztBQUVBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxHQUFKOzs7QUFHQSxJQUFJLEtBQUo7OztBQUdBLElBQUksT0FBSjs7QUFFQSxJQUFJLEdBQUo7QUFDQSxJQUFJLE1BQUo7Ozs7O0FBS08sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCOztBQUU5QixNQUFLLElBQUw7O0FBRUEsV0FBVSxnQkFBZ0IsSUFBaEIsQ0FBVjs7QUFFQSxRQUFPLE9BQVA7QUFDQTs7Ozs7QUFLRCxTQUFTLElBQVQsQ0FBYyxJQUFkLEVBQW9COztBQUVuQixVQUFTLEVBQUMsS0FBSyxFQUFOLEVBQVUsT0FBTyxFQUFqQixFQUFxQixRQUFRLEVBQTdCLEVBQWlDLE1BQU0sRUFBdkMsRUFBVDtBQUNBLFNBQVEsTUFBTSxPQUFPLElBQWIsR0FBb0IsT0FBTyxLQUFuQztBQUNBLFVBQVMsTUFBTSxPQUFPLEdBQWIsR0FBbUIsT0FBTyxNQUFuQzs7QUFFQSxVQUFTLEdBQUcsS0FBSCxDQUFTLE9BQVQsR0FDUCxNQURPLENBQ0EsQ0FBQyxTQUFELEVBQVksVUFBWixFQUF3QixPQUF4QixFQUFpQyxPQUFqQyxFQUEwQyxLQUExQyxFQUFpRCxNQUFqRCxFQUF5RCxNQUF6RCxFQUFpRSxRQUFqRSxFQUEyRSxXQUEzRSxFQUF3RixTQUF4RixFQUFtRyxVQUFuRyxFQUErRyxVQUEvRyxDQURBLEVBRVAsZUFGTyxDQUVTLENBQUMsQ0FBRCxFQUFJLEtBQUosQ0FGVCxFQUVxQixHQUZyQixDQUFUOztBQUlBLFVBQVMsR0FBRyxLQUFILENBQVMsTUFBVCxHQUNQLE1BRE8sQ0FDQSxDQUFFLENBQUYsRUFBSyxNQUFNLEtBQUssR0FBTCxnQ0FBWSxXQUFXLElBQVgsQ0FBWixFQUFOLEVBQXFDLElBQXJDLENBQUwsQ0FEQSxFQUVQLEtBRk8sQ0FFRCxDQUFFLE1BQUYsRUFBVSxDQUFWLENBRkMsQ0FBVDs7QUFJQSxTQUFRLEdBQUcsR0FBSCxDQUFPLElBQVAsR0FDTixLQURNLENBQ0EsTUFEQSxFQUVOLE1BRk0sQ0FFQyxRQUZELENBQVI7O0FBSUEsU0FBUSxHQUFHLEdBQUgsQ0FBTyxJQUFQLEdBQ04sS0FETSxDQUNBLE1BREEsRUFFTixNQUZNLENBRUMsT0FGRCxFQUdOLFVBSE0sQ0FHTTtBQUFBLFNBQUssUUFBUSxDQUFSLEVBQVcsTUFBWCxDQUFrQixJQUFsQixDQUFMO0FBQUEsRUFITixDQUFSOztBQUtBLFNBQVEsR0FBRyxLQUFILENBQVMsT0FBVCxHQUNOLE1BRE0sQ0FDQyxXQUFXLElBQVgsRUFBaUIsUUFBakIsQ0FERCxFQUVOLEtBRk0sQ0FFQSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLENBRkEsQ0FBUjs7OztBQU1BLFNBQVEsR0FBRyxNQUFILENBQVUsS0FBVixFQUFSOztBQUVBLE9BQU0sR0FBRyxNQUFILENBQVUsZUFBVixFQUNKLE1BREksQ0FDRyxLQURILEVBRUgsSUFGRyxDQUVFLE9BRkYsRUFFVyxRQUFRLE9BQU8sSUFBZixHQUFzQixPQUFPLEtBRnhDLEVBR0gsSUFIRyxDQUdFLFFBSEYsRUFHWSxTQUFTLE9BQU8sR0FBaEIsR0FBc0IsT0FBTyxNQUh6QyxFQUlKLE1BSkksQ0FJRyxHQUpILEVBS0gsSUFMRyxDQUtFLFdBTEYsRUFLZSxlQUFjLE9BQU8sSUFBckIsR0FBMkIsR0FBM0IsR0FBZ0MsT0FBTyxHQUF2QyxHQUE0QyxHQUwzRCxDQUFOOzs7OztBQVVBLFVBQVMsS0FBVCxDQUFlLE1BQWYsRUFBdUIsVUFBdkIsRUFBbUM7QUFDbEMsU0FBTyxLQUFLLEtBQUwsQ0FBWSxTQUFTLFVBQXJCLElBQW9DLFVBQTNDO0FBQ0E7QUFFRDs7Ozs7QUFLRCxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0I7OztBQUdyQixPQUFNLElBQU47OztBQUdBLE9BQU0sR0FBRyxHQUFILEdBQ0osSUFESSxDQUNDLE9BREQsRUFDVSxRQURWLEVBRUosSUFGSSxDQUVFLGFBQUs7QUFDWCxNQUFJLFFBQVEsTUFBTSxLQUFOLEdBQWMsT0FBZCxDQUFzQixNQUFNLEVBQUUsTUFBUixDQUF0QixDQUFaO0FBQ0EsU0FBTyw0QkFBMEIsS0FBMUIsR0FBZ0MsSUFBaEMsR0FBc0MsRUFBRSxNQUF4QyxHQUFnRCxrQ0FBaEQsR0FBbUYsUUFBUSxFQUFFLENBQVYsRUFBYSxNQUFiLENBQW9CLE1BQXBCLENBQW5GLEdBQWlILFNBQXhIO0FBQ0EsRUFMSSxDQUFOOztBQU9BLEtBQUksSUFBSixDQUFTLEdBQVQ7OztBQUdBLEtBQUksU0FBUyxJQUFJLFNBQUosQ0FBYyxHQUFkLEVBQ1gsSUFEVyxDQUNOLElBRE0sRUFFWCxLQUZXLEdBR1YsTUFIVSxDQUdILEdBSEcsRUFJVixJQUpVLENBSUwsT0FKSyxFQUlJLFVBQUMsQ0FBRCxFQUFHLENBQUg7QUFBQSxTQUFTLFlBQVUsQ0FBbkI7QUFBQSxFQUpKLENBQWI7OztBQU9BLFFBQU8sU0FBUCxDQUFpQixNQUFqQixFQUNFLElBREYsQ0FDUTtBQUFBLFNBQUssQ0FBTDtBQUFBLEVBRFIsRUFFRSxLQUZGLEdBR0UsTUFIRixDQUdTLE1BSFQsRUFJRyxJQUpILENBSVEsR0FKUixFQUlhO0FBQUEsU0FBSyxPQUFPLEVBQUUsQ0FBVCxDQUFMO0FBQUEsRUFKYixFQUtHLElBTEgsQ0FLUSxHQUxSLEVBS2E7QUFBQSxTQUFLLE9BQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxFQUFmLENBQUw7QUFBQSxFQUxiLEVBTUcsSUFOSCxDQU1RLE9BTlIsRUFNaUI7QUFBQSxTQUFLLE9BQU8sU0FBUCxFQUFMO0FBQUEsRUFOakIsRUFPRyxJQVBILENBT1EsUUFQUixFQU9rQjtBQUFBLFNBQUssT0FBTyxFQUFFLEVBQVQsSUFBZSxPQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsRUFBZixDQUFwQjtBQUFBLEVBUGxCLEVBUUcsSUFSSCxDQVFRLE1BUlIsRUFRZ0I7QUFBQSxTQUFLLE1BQU0sRUFBRSxNQUFSLENBQUw7QUFBQSxFQVJoQixFQVNHLEVBVEgsQ0FTTSxXQVROLEVBU21CLFNBVG5CLEVBVUcsRUFWSCxDQVVNLFVBVk4sRUFVa0IsUUFWbEIsRUFXRyxFQVhILENBV00sT0FYTixFQVdlLFVBWGY7O0FBYUEsS0FBSSxNQUFKLENBQVcsR0FBWCxFQUNFLElBREYsQ0FDTyxPQURQLEVBQ2dCLGFBRGhCLEVBRUUsSUFGRixDQUVPLFdBRlAsRUFFb0IsZUFBYyxDQUFkLEdBQWlCLEdBQWpCLEdBQXNCLE1BQXRCLEdBQThCLEdBRmxELEVBR0UsSUFIRixDQUdPLEtBSFA7O0FBS0EsS0FBSSxNQUFKLENBQVcsR0FBWCxFQUNFLElBREYsQ0FDTyxPQURQLEVBQ2dCLGFBRGhCLEVBRUUsSUFGRixDQUVPLFdBRlAsRUFFb0IsZUFBYyxLQUFkLEdBQXFCLEdBQXJCLEdBQTBCLENBQTFCLEdBQTZCLEdBRmpELEVBR0UsSUFIRixDQUdPLEtBSFA7O0FBS0EsVUFBUyxJQUFJLE1BQUosQ0FBVyxHQUFYLEVBQ1AsSUFETyxDQUNGLE9BREUsRUFDTyxRQURQLENBQVQ7Ozs7Ozs7QUFRQSxVQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7OztBQUd6QixNQUFJLGVBQWUsUUFBUSxHQUFSLENBQWE7QUFBQSxVQUFXLFFBQVEsTUFBUixDQUFnQjtBQUFBLFdBQUssRUFBRSxDQUFGLEtBQVEsS0FBSyxDQUFsQjtBQUFBLElBQWhCLENBQVg7QUFBQSxHQUFiLENBQW5COzs7QUFHQSxpQkFBZSxHQUFHLE1BQUgsQ0FBVSxLQUFWLENBQWdCLEVBQWhCLEVBQW9CLFlBQXBCLENBQWY7OztBQUdBLE1BQUksS0FBSyxhQUFhLENBQWIsRUFBZ0IsRUFBekI7QUFDQSxNQUFJLFlBQVksYUFBYSxNQUFiLENBQXFCLFVBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxVQUFVLElBQUksRUFBRSxDQUFoQjtBQUFBLEdBQXJCLEVBQXdDLENBQXhDLENBQWhCOzs7QUFHQSxNQUFJLFdBQVcsT0FBTyxTQUFQLENBQWlCLFdBQWpCLEVBQ2IsSUFEYSxDQUNSLENBQUMsSUFBRCxDQURRLENBQWY7O0FBR0EsV0FBUyxJQUFULENBQWMsR0FBZCxFQUFtQjtBQUFBLFVBQUssT0FBTyxFQUFFLENBQVQsQ0FBTDtBQUFBLEdBQW5CLEVBQ0UsSUFERixDQUNPLEdBRFAsRUFDWTtBQUFBLFVBQUssT0FBTyxTQUFQLENBQUw7QUFBQSxHQURaLEVBRUUsSUFGRixDQUVPLFFBRlAsRUFFaUIsT0FBTyxFQUFQLElBQWEsT0FBTyxTQUFQLENBRjlCOztBQUlBLFdBQVMsS0FBVCxHQUNFLE1BREYsQ0FDUyxNQURULEVBRUcsSUFGSCxDQUVRLE9BRlIsRUFFaUIsVUFGakIsRUFHRyxJQUhILENBR1EsY0FIUixFQUd3QixDQUh4QixFQUlHLElBSkgsQ0FJUSxRQUpSLEVBSWtCLE9BSmxCLEVBS0csSUFMSCxDQUtRLEdBTFIsRUFLYTtBQUFBLFVBQUssT0FBTyxFQUFFLENBQVQsQ0FBTDtBQUFBLEdBTGIsRUFNRyxJQU5ILENBTVEsR0FOUixFQU1hO0FBQUEsVUFBSyxPQUFPLFNBQVAsQ0FBTDtBQUFBLEdBTmIsRUFPRyxJQVBILENBT1EsT0FQUixFQU9pQjtBQUFBLFVBQUssT0FBTyxTQUFQLEVBQUw7QUFBQSxHQVBqQixFQVFHLElBUkgsQ0FRUSxRQVJSLEVBUWtCLE9BQU8sRUFBUCxJQUFhLE9BQU8sU0FBUCxDQVIvQjs7QUFVQSxXQUFTLElBQVQsQ0FBYyxNQUFkLEVBQXNCLE1BQXRCOztBQUVBLFdBQVMsSUFBVCxHQUFnQixNQUFoQjtBQUVBOzs7Ozs7O0FBT0QsVUFBUyxTQUFULENBQW1CLENBQW5CLEVBQXNCO0FBQ3JCLEtBQUcsTUFBSCxDQUFVLElBQVYsRUFDRSxJQURGLENBQ08sTUFEUCxFQUNlO0FBQUEsVUFBSyxHQUFHLEdBQUgsQ0FBTyxNQUFNLEVBQUUsTUFBUixDQUFQLEVBQXdCLFFBQXhCLENBQWlDLEVBQWpDLENBQUw7QUFBQSxHQURmOztBQUdBLE1BQUksSUFBSixDQUFTLENBQVQ7QUFDQTs7Ozs7QUFLRCxVQUFTLFFBQVQsR0FBb0I7QUFDbkIsS0FBRyxNQUFILENBQVUsSUFBVixFQUNFLElBREYsQ0FDTyxNQURQLEVBQ2U7QUFBQSxVQUFLLE1BQU0sRUFBRSxNQUFSLENBQUw7QUFBQSxHQURmOztBQUdBLE1BQUksSUFBSjtBQUNBO0FBQ0Q7Ozs7Ozs7OztBQVNELFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUErQjtBQUM5QixLQUFJLFVBQVUsRUFBZDs7QUFFQSxLQUFJLFVBQVUsV0FBVyxJQUFYLEVBQWlCLFFBQWpCLENBQWQ7O0FBRUEsS0FBSSxjQUFjLFdBQVcsSUFBWCxFQUFpQixPQUFqQixFQUEwQixHQUExQixDQUErQjtBQUFBLFNBQVMsS0FBSyxNQUFMLENBQWE7QUFBQSxVQUFLLEVBQUUsS0FBRixLQUFZLEtBQWpCO0FBQUEsR0FBYixDQUFUO0FBQUEsRUFBL0IsQ0FBbEI7O0FBRUEsU0FBUSxPQUFSLENBQWlCLGtCQUFVO0FBQzFCLE1BQUksY0FBYyxFQUFsQjs7QUFFQSxjQUFZLE9BQVosQ0FBcUIscUJBQWE7QUFDakMsT0FBSSxVQUFVLEVBQWQ7O0FBRUEsV0FBUSxNQUFSLEdBQWlCLE1BQWpCO0FBQ0EsV0FBUSxNQUFSLEdBQWlCLFVBQVUsTUFBVixDQUFrQjtBQUFBLFdBQUssRUFBRSxNQUFGLEtBQWEsTUFBbEI7QUFBQSxJQUFsQixDQUFqQjtBQUNBLFdBQVEsQ0FBUixHQUFZLFVBQVUsQ0FBVixFQUFhLEtBQXpCO0FBQ0EsV0FBUSxDQUFSLEdBQVksVUFBVSxNQUFWLENBQWtCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN0QyxRQUFLLEVBQUUsTUFBRixLQUFhLE1BQWxCLEVBQTJCO0FBQzFCLFlBQU8sSUFBSSxFQUFFLElBQWI7QUFDQSxLQUZELE1BRU87QUFDTixZQUFPLENBQVA7QUFDQTtBQUNELElBTlcsRUFNVCxDQU5TLENBQVo7O0FBUUEsZUFBWSxJQUFaLENBQWlCLE9BQWpCO0FBQ0EsR0FmRDs7QUFpQkEsVUFBUSxJQUFSLENBQWEsV0FBYjtBQUNBLEVBckJEOztBQXVCQSxRQUFPLE9BQVA7QUFDQTs7Ozs7QUFLRCxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsS0FBMUIsRUFBaUM7QUFDaEMscUNBQVksSUFBSSxHQUFKLENBQVEsS0FBSyxHQUFMLENBQVM7QUFBQSxTQUFLLEVBQUUsS0FBRixDQUFMO0FBQUEsRUFBVCxDQUFSLENBQVo7QUFDQTs7Ozs7QUFLRCxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEI7O0FBRXpCLEtBQUksUUFBUSxXQUFXLElBQVgsRUFBaUIsT0FBakIsRUFBMEIsR0FBMUIsQ0FBK0I7QUFBQSxTQUFTLEtBQUssTUFBTCxDQUFhO0FBQUEsVUFBSyxFQUFFLEtBQUYsS0FBWSxLQUFqQjtBQUFBLEdBQWIsQ0FBVDtBQUFBLEVBQS9CLENBQVo7O0FBRUEsS0FBSSxrQkFBa0IsTUFBTSxHQUFOLENBQVc7QUFBQSxTQUFRLEtBQUssTUFBTCxDQUFhLFVBQUMsQ0FBRCxFQUFHLENBQUg7QUFBQSxVQUFTLElBQUksRUFBRSxJQUFmO0FBQUEsR0FBYixFQUFrQyxDQUFsQyxDQUFSO0FBQUEsRUFBWCxDQUF0Qjs7QUFFQSxRQUFPLGVBQVA7QUFDQTs7Ozs7Ozs7UUN6UGUsUyxHQUFBLFM7O0FBVmhCOztBQUVBLElBQUksSUFBSixDOzs7Ozs7O0FBQ0EsSUFBSSxTQUFTLENBQUMsY0FBRCxFQUFpQixrQkFBakIsQ0FBYjs7Ozs7OztBQU9PLFNBQVMsU0FBVCxDQUFtQixPQUFuQixFQUEyQjtBQUNqQyxTQUFPLE9BQVA7O0FBRUEsZUFBYSxJQUFiO0FBQ0E7Ozs7O0FBS0QsU0FBUyxZQUFULENBQXNCLElBQXRCLEVBQTRCO0FBQzNCLFNBQU8sT0FBUCxDQUFnQixpQkFBUztBQUN4QixRQUFJLFNBQVMsY0FBVCxDQUF3QixLQUF4QixDQUFKLEVBQW9DO0FBQ25DLGNBQVEsS0FBUjtBQUNDLGFBQUssY0FBTDtBQUNDLGtDQUFTLElBQVQ7QUFDQTtBQUhGO0FBS0E7QUFDRCxHQVJEO0FBU0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIEluaXRpYWxpemF0aW9uIG9mIGFsbCBtb2R1bGVzIFxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3Zpc3VhbGl6ZX0gZnJvbSAnLi92aXN1YWxpemUnO1xyXG5cclxuKGZ1bmN0aW9uIHJlYWR5KGZuKSB7XHJcblx0aWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJyl7XHJcblx0XHRmbigpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xyXG5cdH1cclxufSkoaW5pdCk7XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZXMgcmVhZGluZyBvZiBmaWxlIGFuZCB0aGVuIHZpc3VhbGl6YXRpb24gcHJvY2Vzcy5cclxuICovXHJcbmZ1bmN0aW9uIGluaXQoKXtcclxuXHJcblx0Ly8gc2V0dXAgbnVtZXJhbCBmb3IgY29ycmVjdCBudW1iZXIgZm9ybWF0dGluZ1xyXG5cdG51bWVyYWwubGFuZ3VhZ2UoJ2VuLWdiJyk7XHJcblxyXG5cdC8vIHBhcnNlIGZpbGVcclxuXHRkMy5jc3YoJ0hvbWVfT2ZmaWNlX0Fpcl9UcmF2ZWxfRGF0YV8yMDExLmNzdicpXHJcblx0XHQucm93KCBkID0+IHsgXHJcblx0XHRcdHJldHVybiB7IFxyXG5cdFx0XHRcdGRlcGFydHVyZTogZC5EZXBhcnR1cmUsIFxyXG5cdFx0XHRcdGRlc3RpbmF0aW9uOiBkLkRlc3RpbmF0aW9uLCBcclxuXHRcdFx0XHRkaXJlY3RvcmF0ZTogZC5EaXJlY3RvcmF0ZSwgXHJcblx0XHRcdFx0bW9udGg6IGQuRGVwYXJ0dXJlXzIwMTEsIFxyXG5cdFx0XHRcdGZhcmU6IHBhcnNlRmxvYXQoZC5QYWlkX2ZhcmUpLCBcclxuXHRcdFx0XHR0aWNrZXQ6IGQuVGlja2V0X2NsYXNzX2Rlc2NyaXB0aW9uLCBcclxuXHRcdFx0XHRzdXBwbGllcjogZC5TdXBwbGllcl9uYW1lIFxyXG5cdFx0XHR9O1xyXG5cdFx0fSlcclxuXHRcdC5nZXQoIChlcnJvciwgZGF0YSkgPT4ge1xyXG5cdFx0XHRpZiAoZXJyb3IpIGNvbnNvbGUubG9nKGVycm9yKVxyXG5cdFx0XHRcclxuXHRcdFx0dmlzdWFsaXplKGRhdGEpO1xyXG5cdFx0fSk7XHJcbn0iLCIvKipcclxuICogVmlzdWFsaXphdGlvbiBvZiBtb250aGx5IHNwZW5kaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG52YXIgbWFyZ2luO1xyXG52YXIgd2lkdGg7XHJcbnZhciBoZWlnaHQ7XHJcblxyXG52YXIgeFNjYWxlO1xyXG52YXIgeVNjYWxlO1xyXG5cclxudmFyIHhBeGlzO1xyXG52YXIgeUF4aXM7XHJcblxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBmdW5jdGlvbiBmb3IgYWR2YW5jZWQgdG9vbHRpcFxyXG52YXIgdGlwO1xyXG5cclxuLy8gc2NhbGUgZm9yIHN0YWNraW5nIHJlY3RhbmdsZXNcclxudmFyIHN0YWNrO1xyXG5cclxuLy8gdHJhbnNmb3JtZWQgZGF0YVxyXG52YXIgZGF0YXNldDtcclxuXHJcbnZhciBzdmc7XHJcbnZhciBmaWx0ZXI7XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzcGVuZGluZyhkYXRhKSB7XHJcblxyXG5cdGluaXQoZGF0YSk7XHJcblxyXG5cdGRhdGFzZXQgPSBzcGVuZGluZ0RhdGFzZXQoZGF0YSk7XHJcblx0XHJcblx0dXBkYXRlKGRhdGFzZXQpO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1x0XHJcblxyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMzUsIGJvdHRvbTogMzAsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbihbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXSlcclxuXHRcdC5yYW5nZVJvdW5kQmFuZHMoWzAsIHdpZHRoXSwgLjA1KTtcclxuXHJcblx0eVNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcclxuXHRcdC5kb21haW4oWyAwLCByb3VuZChNYXRoLm1heCguLi5tb250aEZhcmVzKGRhdGEpKSwgMTAwMCkgXSlcclxuXHRcdC5yYW5nZShbIGhlaWdodCwgMCBdKTtcclxuXHJcblx0eEF4aXMgPSBkMy5zdmcuYXhpcygpXHJcblx0XHQuc2NhbGUoeFNjYWxlKVxyXG5cdFx0Lm9yaWVudCgnYm90dG9tJyk7XHJcblxyXG5cdHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxyXG5cdFx0LnNjYWxlKHlTY2FsZSlcclxuXHRcdC5vcmllbnQoJ3JpZ2h0JylcclxuXHRcdC50aWNrRm9ybWF0KCBkID0+IG51bWVyYWwoZCkuZm9ybWF0KCcwYScpKTtcclxuXHRcclxuXHRjb2xvciA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbih1bmlxVmFsdWVzKGRhdGEsICd0aWNrZXQnKSlcdFx0XHJcblx0XHQucmFuZ2UoW1wiIzAwYmNkNFwiLCBcIiMxZDZkZDBcIiwgXCIjZWRjZDAyXCJdKTtcclxuXHRcdC8vLnJhbmdlKFtcIiMwMGJjZDRcIiwgXCIjM2Y1MWI1XCIsIFwiI2VkY2QwMlwiXSk7XHJcblx0XHQvLy5yYW5nZShbXCIjMzRjN2JkXCIsIFwiIzNmNTFiNVwiLCBcIiNlZGNkMDJcIl0pO1x0XHRcclxuXHJcblx0c3RhY2sgPSBkMy5sYXlvdXQuc3RhY2soKTtcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLXNwZW5kaW5nJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG5cclxuXHQvKipcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHJvdW5kKG51bWJlciwgcm91bmRWYWx1ZSkge1xyXG5cdFx0cmV0dXJuIE1hdGgucm91bmQoIG51bWJlciAvIHJvdW5kVmFsdWUgKSAqIHJvdW5kVmFsdWU7XHJcblx0fVxyXG5cclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGUoZGF0YSkge1xyXG5cclxuXHQvLyBjcmVhdGUgc3RhY2tlZCBkYXRhIGZvciB0aGUgdmlzdWFsaXphdGlvblxyXG5cdHN0YWNrKGRhdGEpO1xyXG5cclxuXHQvLyBjcmVhdGUgdG9vbHRpcCBhbmQgY2FsbCBpdFxyXG5cdHRpcCA9IGQzLnRpcCgpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnZDMtdGlwJylcclxuXHRcdC5odG1sKCBkID0+IHtcclxuXHRcdFx0dmFyIGluZGV4ID0gY29sb3IucmFuZ2UoKS5pbmRleE9mKGNvbG9yKGQudGlja2V0KSk7XHJcblx0XHRcdHJldHVybiAnPHNwYW4gY2xhc3M9XCJ0eXBlIHR5cGUtJytpbmRleCsnXCI+JysgZC50aWNrZXQgKyc8L3NwYW4+PGJyLz48c3BhbiBjbGFzcz1cInZhbHVlXCI+JytudW1lcmFsKGQueSkuZm9ybWF0KCckMCwwJykgKyAnPC9zcGFuPic7IFxyXG5cdFx0fSk7XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblx0XHJcblx0Ly8gY3JlYXRlIGdyb3VwIGZvciBlYWNoIHRpY2tldCB0eXBlXHJcblx0dmFyIGdyb3VwcyA9IHN2Zy5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cignY2xhc3MnLCAoZCxpKSA9PiAndGlja2V0LScraSApO1xyXG5cclxuXHQvLyBjcmVhdGUgYmFycyBmb3IgZWFjaCB0aWNrZXQgZ3JvdXBcclxuXHRncm91cHMuc2VsZWN0QWxsKCdyZWN0JylcclxuXHRcdC5kYXRhKCBkID0+IGQgKVxyXG5cdFx0LmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdC5hdHRyKCd5JywgZCA9PiB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgZCA9PiB5U2NhbGUoZC55MCkgLSB5U2NhbGUoZC55ICsgZC55MCkpXHJcblx0XHRcdC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvcihkLnRpY2tldCkpXHJcblx0XHRcdC5vbignbW91c2VvdmVyJywgbW91c2VvdmVyKVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgbW91c2VvdXQpXHJcblx0XHRcdC5vbignY2xpY2snLCBtb3VzZWNsaWNrKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXgnKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgMCArJywnKyBoZWlnaHQgKycpJylcclxuXHRcdC5jYWxsKHhBeGlzKTtcclxuXHJcblx0c3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuYXR0cignY2xhc3MnLCAnYXhpcyBheGlzLXknKVxyXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJysgd2lkdGggKycsJysgMCArJyknKVxyXG5cdFx0LmNhbGwoeUF4aXMpO1xyXG5cclxuXHRmaWx0ZXIgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5hdHRyKCdjbGFzcycsICdmaWx0ZXInKTtcclxuXHJcblx0LyoqXHJcblx0ICogXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlY2xpY2soZGF0YSkge1xyXG5cclxuXHRcdC8vIGdldCBhbGwgdGlja2V0IHR5cGVzIGZvciBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHRpY2tldHNNb250aCA9IGRhdGFzZXQubWFwKCB0aWNrZXRzID0+IHRpY2tldHMuZmlsdGVyKCBkID0+IGQueCA9PT0gZGF0YS54ICkpO1xyXG5cclxuXHRcdC8vIGZsYXR0ZW4gdGhlIGFycmF5XHJcblx0XHR0aWNrZXRzTW9udGggPSBbXS5jb25jYXQuYXBwbHkoW10sIHRpY2tldHNNb250aCk7XHJcblxyXG5cdFx0Ly8gY2FsY3VsYXRlIHRoZSBoZWlnaHQgYW5kIHN0YXJ0aW5nIHBvaW50IG9mIG1vbnRocyBiYXJcclxuXHRcdHZhciB5MCA9IHRpY2tldHNNb250aFswXS55MDtcclxuXHRcdHZhciBiYXJIZWlnaHQgPSB0aWNrZXRzTW9udGgucmVkdWNlKCAoYSwgYikgPT4gYSArIGIueSwgMCk7XHJcblx0XHRcclxuXHRcdC8vIGNyZWF0ZSBhIHJlY3RhbmdsZSBmb3IgaGlnaGxpZ2h0aW5nIHRoZSBzZWxlY3RlZCBtb250aFxyXG5cdFx0dmFyIHNlbGVjdGVkID0gZmlsdGVyLnNlbGVjdEFsbCgnLnNlbGVjdGVkJylcclxuXHRcdFx0LmRhdGEoW2RhdGFdKTtcclxuXHJcblx0XHRzZWxlY3RlZC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHQuYXR0cignaGVpZ2h0JywgeVNjYWxlKHkwKSAtIHlTY2FsZShiYXJIZWlnaHQpKTtcclxuXHJcblx0XHRzZWxlY3RlZC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0XHRcdC5hdHRyKCdjbGFzcycsICdzZWxlY3RlZCcpXHRcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgMylcclxuXHRcdFx0XHQuYXR0cignc3Ryb2tlJywgJ3doaXRlJylcclxuXHRcdFx0XHQuYXR0cigneCcsIGQgPT4geFNjYWxlKGQueCkpXHJcblx0XHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShiYXJIZWlnaHQpKVxyXG5cdFx0XHRcdC5hdHRyKCd3aWR0aCcsIGQgPT4geFNjYWxlLnJhbmdlQmFuZCgpKVxyXG5cdFx0XHRcdC5hdHRyKCdoZWlnaHQnLCB5U2NhbGUoeTApIC0geVNjYWxlKGJhckhlaWdodCkpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmF0dHIoJ2ZpbGwnLCAnbm9uZScpO1xyXG5cclxuXHRcdHNlbGVjdGVkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIaWhnbGlnaHQgdGhlIGhvdmVyZWQgZWxlbWVudCBhbmQgc2hvd3MgdG9vbHRpcC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbW91c2VvdmVyKGQpIHtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gZDMucmdiKGNvbG9yKGQudGlja2V0KSkuYnJpZ2h0ZXIoLjUpKTtcclxuXHJcblx0XHR0aXAuc2hvdyhkKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc2V0cyB0aGUgY29sb3Igb2YgdGhlIGVsZW1lbnQgYW5kIGhpZGVzIHRoZSB0b29sdGlwLlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1vdXNlb3V0KCkge1x0XHRcclxuXHRcdGQzLnNlbGVjdCh0aGlzKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKTtcclxuXHJcblx0XHR0aXAuaGlkZSgpO1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRyYW5zZm9ybSBkYXRhIGludG8gYSBuZXcgZGF0YXNldCB3aGljaCBoYXMgcmVhcnJhbmdlZCB2YWx1ZXNcclxuICogc28gdGhhdCBpdCBpcyBhbiBhcnJheSBvZiB0aWNrZXQgdHlwZSBhcnJheXNcclxuICpcclxuICogQHBhcmFtIHthcnJheX0gZGF0YSBhcnJheSBvZiBkYXRhIG9iamVjdHMgZXh0cmFjdGVkIGZyb20gZmlsZVxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIGRhdGEgb2JqZWN0cyBncm91cGVkIGJ5IHRpY2tldCB0eXBlcyBhbmQgbW9udGhzXHJcbiAqL1xyXG5mdW5jdGlvbiBzcGVuZGluZ0RhdGFzZXQoZGF0YSkge1xyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdHZhciB0aWNrZXRzID0gdW5pcVZhbHVlcyhkYXRhLCAndGlja2V0Jyk7XHJcblxyXG5cdHZhciBtb250aGx5RGF0YSA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJykubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHRcclxuXHR0aWNrZXRzLmZvckVhY2goIHRpY2tldCA9PiB7XHJcblx0XHR2YXIgdGlja2V0QXJyYXkgPSBbXTtcclxuXHJcblx0XHRtb250aGx5RGF0YS5mb3JFYWNoKCBtb250aERhdGEgPT4ge1xyXG5cdFx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cclxuXHRcdFx0ZGF0YU9iai50aWNrZXQgPSB0aWNrZXQ7XHRcdFx0XHJcblx0XHRcdGRhdGFPYmoudmFsdWVzID0gbW9udGhEYXRhLmZpbHRlciggZCA9PiBkLnRpY2tldCA9PT0gdGlja2V0KTtcclxuXHRcdFx0ZGF0YU9iai54ID0gbW9udGhEYXRhWzBdLm1vbnRoO1xyXG5cdFx0XHRkYXRhT2JqLnkgPSBtb250aERhdGEucmVkdWNlKCAoYSxiKSA9PiB7XHJcblx0XHRcdFx0aWYgKCBiLnRpY2tldCA9PT0gdGlja2V0ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGEgKyBiLmZhcmU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgMCk7XHJcblxyXG5cdFx0XHR0aWNrZXRBcnJheS5wdXNoKGRhdGFPYmopO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKHRpY2tldEFycmF5KTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gdW5pcVZhbHVlcyhkYXRhLCBwYXJhbSkge1xyXG5cdHJldHVybiBbIC4uLm5ldyBTZXQoZGF0YS5tYXAoZCA9PiBkW3BhcmFtXSkpXTtcclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiBtb250aEZhcmVzKGRhdGEpIHtcdFxyXG5cdC8vIGdldCBhbGwgZmFyZXMgZm9yIGVhY2ggbW9udGhcclxuXHR2YXIgZmFyZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0Ly8gc3VtIHVwIGFsbCBmYXJlcyBpbiBlYWNoIG1vbnRoXHJcblx0dmFyIHN1bU1vbnRobHlGYXJlcyA9IGZhcmVzLm1hcCggZmFyZSA9PiBmYXJlLnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCkpO1xyXG5cdFxyXG5cdHJldHVybiBzdW1Nb250aGx5RmFyZXM7XHJcbn0iLCIvKipcclxuICogTWFpbiB2aXN1YWxpemF0aW9uIG1vZHVsZSBmb3IgY3JlYXRpbmcgY2hhcnRzIGFuZCB2aXMgZm9yIHBhc3NlZCBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3NwZW5kaW5nfSBmcm9tICcuL3NwZW5kaW5nJztcclxuXHJcbnZhciBkYXRhO1xyXG52YXIgcGFuZWxzID0gWyd2aXMtc3BlbmRpbmcnLCAndmlzLWRpc3RyaWJ1dGlvbiddO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2Ygb2JqZWN0cyBmb3IgdmlzdWFsaXphdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhc2V0KXtcdFxyXG5cdGRhdGEgPSBkYXRhc2V0O1xyXG5cclxuXHRkZXRlY3RQYW5lbHMoZGF0YSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gZGV0ZWN0UGFuZWxzKGRhdGEpIHtcclxuXHRwYW5lbHMuZm9yRWFjaCggcGFuZWwgPT4ge1xyXG5cdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhbmVsKSkge1xyXG5cdFx0XHRzd2l0Y2ggKHBhbmVsKSB7XHJcblx0XHRcdFx0Y2FzZSAndmlzLXNwZW5kaW5nJzpcclxuXHRcdFx0XHRcdHNwZW5kaW5nKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cdFx0XHJcblx0fSk7XHJcbn0iXX0=
