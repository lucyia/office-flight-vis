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

var color;

// function for advanced tooltip
var tip;

// scale for stacking rectangles
var stack;

// transformed data
var dataset;

var svg;

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
	margin = { top: 10, right: 10, bottom: 15, left: 10 };
	width = 810 - margin.left - margin.right;
	height = 345 - margin.top - margin.bottom;

	xScale = d3.scale.ordinal().domain(uniqValues(data, 'month')).rangeRoundBands([0, width], .05);

	yScale = d3.scale.linear().domain([0, round(Math.max.apply(Math, _toConsumableArray(monthFares(data))), 1000)]).range([height, 0]);

	color = d3.scale.ordinal().domain(uniqValues(data, 'ticket')).range(["#00bcd4", "#3f51b5", "#edcd02"]);
	//.range(["#34c7bd", "#3f51b5", "#edcd02"]);		

	stack = d3.layout.stack();

	svg = d3.select('#vis-spending').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}

/**
 *
 */
function update(data) {

	stack(data);

	tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
		return d.ticket + '<br/>' + numeral(d.y).format('$0,0');
	});

	svg.call(tip);

	var groups = svg.selectAll('g').data(data).enter().append('g');

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
	}).on('mouseover', tip.show).on('mouseout', tip.hide);
}

/**
 * Transform data into a new dataset which has rearranged values
 * so that it is an array of ticket type arrays
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

/**
 *
 */
function round(number, roundValue) {
	return Math.round(number / roundValue) * roundValue;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyIsImpzXFxzcGVuZGluZy5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ09BOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7OztBQUdkLFNBQVEsUUFBUixDQUFpQixPQUFqQjs7O0FBR0EsSUFBRyxHQUFILENBQU8sc0NBQVAsRUFDRSxHQURGLENBQ08sYUFBSztBQUNWLFNBQU87QUFDTixjQUFXLEVBQUUsU0FEUDtBQUVOLGdCQUFhLEVBQUUsV0FGVDtBQUdOLGdCQUFhLEVBQUUsV0FIVDtBQUlOLFVBQU8sRUFBRSxjQUpIO0FBS04sU0FBTSxXQUFXLEVBQUUsU0FBYixDQUxBO0FBTU4sV0FBUSxFQUFFLHdCQU5KO0FBT04sYUFBVSxFQUFFO0FBUE4sR0FBUDtBQVNBLEVBWEYsRUFZRSxHQVpGLENBWU8sVUFBQyxLQUFELEVBQVEsSUFBUixFQUFpQjtBQUN0QixNQUFJLEtBQUosRUFBVyxRQUFRLEdBQVIsQ0FBWSxLQUFaOztBQUVYLDRCQUFVLElBQVY7QUFDQSxFQWhCRjtBQWlCQTs7Ozs7Ozs7UUNiZSxRLEdBQUEsUTs7Ozs7Ozs7Ozs7QUF2QmhCLElBQUksTUFBSjtBQUNBLElBQUksS0FBSjtBQUNBLElBQUksTUFBSjs7QUFFQSxJQUFJLE1BQUo7QUFDQSxJQUFJLE1BQUo7O0FBRUEsSUFBSSxLQUFKOzs7QUFHQSxJQUFJLEdBQUo7OztBQUdBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxPQUFKOztBQUVBLElB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QUFRLEtBQVI7QUFDQyxhQUFLLGNBQUw7QUFDQyxrQ0FBUyxJQUFUO0FBQ0E7QUFIRjtBQUtBO0FBQ0QsR0FSRDtBQVNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBJbml0aWFsaXphdGlvbiBvZiBhbGwgbW9kdWxlcyBcclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt2aXN1YWxpemV9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbihmdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn0pKGluaXQpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHJlYWRpbmcgb2YgZmlsZSBhbmQgdGhlbiB2aXN1YWxpemF0aW9uIHByb2Nlc3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KCl7XHJcblxyXG5cdC8vIHNldHVwIG51bWVyYWwgZm9yIGNvcnJlY3QgbnVtYmVyIGZvcm1hdHRpbmdcclxuXHRudW1lcmFsLmxhbmd1YWdlKCdlbi1nYicpO1xyXG5cclxuXHQvLyBwYXJzZSBmaWxlXHJcblx0ZDMuY3N2KCdIb21lX09mZmljZV9BaXJfVHJhdmVsX0RhdGFfMjAxMS5jc3YnKVxyXG5cdFx0LnJvdyggZCA9PiB7IFxyXG5cdFx0XHRyZXR1cm4geyBcclxuXHRcdFx0XHRkZXBhcnR1cmU6IGQuRGVwYXJ0dXJlLCBcclxuXHRcdFx0XHRkZXN0aW5hdGlvbjogZC5EZXN0aW5hdGlvbiwgXHJcblx0XHRcdFx0ZGlyZWN0b3JhdGU6IGQuRGlyZWN0b3JhdGUsIFxyXG5cdFx0XHRcdG1vbnRoOiBkLkRlcGFydHVyZV8yMDExLCBcclxuXHRcdFx0XHRmYXJlOiBwYXJzZUZsb2F0KGQuUGFpZF9mYXJlKSwgXHJcblx0XHRcdFx0dGlja2V0OiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiwgXHJcblx0XHRcdFx0c3VwcGxpZXI6IGQuU3VwcGxpZXJfbmFtZSBcclxuXHRcdFx0fTtcclxuXHRcdH0pXHJcblx0XHQuZ2V0KCAoZXJyb3IsIGRhdGEpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSBjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHJcblx0XHRcdHZpc3VhbGl6ZShkYXRhKTtcclxuXHRcdH0pO1xyXG59IiwiLyoqXHJcbiAqIFZpc3VhbGl6YXRpb24gb2YgbW9udGhseSBzcGVuZGluZy5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxudmFyIG1hcmdpbjtcclxudmFyIHdpZHRoO1xyXG52YXIgaGVpZ2h0O1xyXG5cclxudmFyIHhTY2FsZTtcclxudmFyIHlTY2FsZTtcclxuXHJcbnZhciBjb2xvcjtcclxuXHJcbi8vIGZ1bmN0aW9uIGZvciBhZHZhbmNlZCB0b29sdGlwXHJcbnZhciB0aXA7XHJcblxyXG4vLyBzY2FsZSBmb3Igc3RhY2tpbmcgcmVjdGFuZ2xlc1xyXG52YXIgc3RhY2s7XHJcblxyXG4vLyB0cmFuc2Zvcm1lZCBkYXRhXHJcbnZhciBkYXRhc2V0O1xyXG5cclxudmFyIHN2ZztcclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNwZW5kaW5nKGRhdGEpIHtcclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkYXRhc2V0ID0gc3BlbmRpbmdEYXRhc2V0KGRhdGEpO1x0XHJcblx0XHJcblx0dXBkYXRlKGRhdGFzZXQpO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMTUsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbih1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpKVxyXG5cdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgd2lkdGhdLCAuMDUpO1xyXG5cclxuXHR5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0LmRvbWFpbihbIDAsIHJvdW5kKE1hdGgubWF4KC4uLm1vbnRoRmFyZXMoZGF0YSkpLCAxMDAwKSBdKVxyXG5cdFx0LnJhbmdlKFsgaGVpZ2h0LCAwIF0pO1xyXG5cdFxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpKVxyXG5cdFx0LnJhbmdlKFtcIiMwMGJjZDRcIiwgXCIjM2Y1MWI1XCIsIFwiI2VkY2QwMlwiXSk7XHJcblx0XHQvLy5yYW5nZShbXCIjMzRjN2JkXCIsIFwiIzNmNTFiNVwiLCBcIiNlZGNkMDJcIl0pO1x0XHRcclxuXHJcblx0c3RhY2sgPSBkMy5sYXlvdXQuc3RhY2soKTtcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLXNwZW5kaW5nJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZShkYXRhKSB7XHJcblxyXG5cdHN0YWNrKGRhdGEpO1xyXG5cclxuXHR0aXAgPSBkMy50aXAoKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXHJcblx0XHQuaHRtbCggZCA9PiBkLnRpY2tldCArJzxici8+JysgbnVtZXJhbChkLnkpLmZvcm1hdCgnJDAsMCcpICk7XHJcblxyXG5cdHN2Zy5jYWxsKHRpcCk7XHJcblx0XHJcblx0dmFyIGdyb3VwcyA9IHN2Zy5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZGF0YSlcclxuXHRcdC5lbnRlcigpXHJcblx0XHRcdC5hcHBlbmQoJ2cnKTtcclxuXHJcblx0Z3JvdXBzLnNlbGVjdEFsbCgncmVjdCcpXHJcblx0XHQuZGF0YSggZCA9PiBkIClcclxuXHRcdC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdFx0LmF0dHIoJ3gnLCBkID0+IHhTY2FsZShkLngpKVxyXG5cdFx0XHQuYXR0cigneScsIGQgPT4geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignd2lkdGgnLCBkID0+IHhTY2FsZS5yYW5nZUJhbmQoKSlcclxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGQgPT4geVNjYWxlKGQueTApIC0geVNjYWxlKGQueSArIGQueTApKVxyXG5cdFx0XHQuYXR0cignZmlsbCcsIGQgPT4gY29sb3IoZC50aWNrZXQpKVxyXG5cdFx0XHQub24oJ21vdXNlb3ZlcicsIHRpcC5zaG93KVxyXG5cdFx0XHQub24oJ21vdXNlb3V0JywgdGlwLmhpZGUpO1xyXG59XHJcblxyXG4vKipcclxuICogVHJhbnNmb3JtIGRhdGEgaW50byBhIG5ldyBkYXRhc2V0IHdoaWNoIGhhcyByZWFycmFuZ2VkIHZhbHVlc1xyXG4gKiBzbyB0aGF0IGl0IGlzIGFuIGFycmF5IG9mIHRpY2tldCB0eXBlIGFycmF5c1xyXG4gKi9cclxuZnVuY3Rpb24gc3BlbmRpbmdEYXRhc2V0KGRhdGEpIHtcclxuXHR2YXIgZGF0YXNldCA9IFtdO1xyXG5cclxuXHR2YXIgdGlja2V0cyA9IHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpO1xyXG5cclxuXHR2YXIgbW9udGhseURhdGEgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0XHJcblx0dGlja2V0cy5mb3JFYWNoKCB0aWNrZXQgPT4ge1xyXG5cdFx0dmFyIHRpY2tldEFycmF5ID0gW107XHJcblxyXG5cdFx0bW9udGhseURhdGEuZm9yRWFjaCggbW9udGhEYXRhID0+IHtcclxuXHRcdFx0dmFyIGRhdGFPYmogPSB7fTtcclxuXHJcblx0XHRcdGRhdGFPYmoudGlja2V0ID0gdGlja2V0O1x0XHRcdFxyXG5cdFx0XHRkYXRhT2JqLnZhbHVlcyA9IG1vbnRoRGF0YS5maWx0ZXIoIGQgPT4gZC50aWNrZXQgPT09IHRpY2tldCk7XHJcblx0XHRcdGRhdGFPYmoueCA9IG1vbnRoRGF0YVswXS5tb250aDtcclxuXHRcdFx0ZGF0YU9iai55ID0gbW9udGhEYXRhLnJlZHVjZSggKGEsYikgPT4ge1xyXG5cdFx0XHRcdGlmICggYi50aWNrZXQgPT09IHRpY2tldCApIHtcclxuXHRcdFx0XHRcdHJldHVybiBhICsgYi5mYXJlO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gYTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sIDApO1xyXG5cclxuXHRcdFx0dGlja2V0QXJyYXkucHVzaChkYXRhT2JqKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdGRhdGFzZXQucHVzaCh0aWNrZXRBcnJheSk7XHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBkYXRhc2V0O1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIHVuaXFWYWx1ZXMoZGF0YSwgcGFyYW0pIHtcclxuXHRyZXR1cm4gWyAuLi5uZXcgU2V0KGRhdGEubWFwKGQgPT4gZFtwYXJhbV0pKV07XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gbW9udGhGYXJlcyhkYXRhKSB7XHRcclxuXHQvLyBnZXQgYWxsIGZhcmVzIGZvciBlYWNoIG1vbnRoXHJcblx0dmFyIGZhcmVzID0gdW5pcVZhbHVlcyhkYXRhLCAnbW9udGgnKS5tYXAoIG1vbnRoID0+IGRhdGEuZmlsdGVyKCBkID0+IGQubW9udGggPT09IG1vbnRoICkpO1xyXG5cdC8vIHN1bSB1cCBhbGwgZmFyZXMgaW4gZWFjaCBtb250aFxyXG5cdHZhciBzdW1Nb250aGx5RmFyZXMgPSBmYXJlcy5tYXAoIGZhcmUgPT4gZmFyZS5yZWR1Y2UoIChhLGIpID0+IGEgKyBiLmZhcmUsIDApKTtcclxuXHRcclxuXHRyZXR1cm4gc3VtTW9udGhseUZhcmVzO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIHJvdW5kKG51bWJlciwgcm91bmRWYWx1ZSkge1xyXG5cdHJldHVybiBNYXRoLnJvdW5kKCBudW1iZXIgLyByb3VuZFZhbHVlICkgKiByb3VuZFZhbHVlO1xyXG59IiwiLyoqXHJcbiAqIE1haW4gdmlzdWFsaXphdGlvbiBtb2R1bGUgZm9yIGNyZWF0aW5nIGNoYXJ0cyBhbmQgdmlzIGZvciBwYXNzZWQgZGF0YS5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtzcGVuZGluZ30gZnJvbSAnLi9zcGVuZGluZyc7XHJcblxyXG52YXIgZGF0YTtcclxudmFyIHBhbmVscyA9IFsndmlzLXNwZW5kaW5nJywgJ3Zpcy1kaXN0cmlidXRpb24nXTtcclxuXHJcbi8qKlxyXG4gKlxyXG4gKlxyXG4gKiBAcGFyYW0ge2FycmF5fSBkYXRhc2V0IGFycmF5IG9mIG9iamVjdHMgZm9yIHZpc3VhbGl6YXRpb25cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxpemUoZGF0YXNldCl7XHRcclxuXHRkYXRhID0gZGF0YXNldDtcclxuXHJcblx0ZGV0ZWN0UGFuZWxzKGRhdGEpO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGRldGVjdFBhbmVscyhkYXRhKSB7XHJcblx0cGFuZWxzLmZvckVhY2goIHBhbmVsID0+IHtcclxuXHRcdGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5lbCkpIHtcclxuXHRcdFx0c3dpdGNoIChwYW5lbCkge1xyXG5cdFx0XHRcdGNhc2UgJ3Zpcy1zcGVuZGluZyc6XHJcblx0XHRcdFx0XHRzcGVuZGluZyhkYXRhKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHRcdFxyXG5cdH0pO1xyXG59Il19
