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
	});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyIsImpzXFxzcGVuZGluZy5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ09BOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7QUFDZCxJQUFHLEdBQUgsQ0FBTyxzQ0FBUCxFQUNFLEdBREYsQ0FDTyxhQUFLO0FBQ1YsU0FBTztBQUNOLGNBQVcsRUFBRSxTQURQO0FBRU4sZ0JBQWEsRUFBRSxXQUZUO0FBR04sZ0JBQWEsRUFBRSxXQUhUO0FBSU4sVUFBTyxFQUFFLGNBSkg7QUFLTixTQUFNLFdBQVcsRUFBRSxTQUFiLENBTEE7QUFNTixXQUFRLEVBQUUsd0JBTko7QUFPTixhQUFVLEVBQUU7QUFQTixHQUFQO0FBU0EsRUFYRixFQVlFLEdBWkYsQ0FZTyxVQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQ3RCLE1BQUksS0FBSixFQUFXLFFBQVEsR0FBUixDQUFZLEtBQVo7O0FBRVgsNEJBQVUsSUFBVjtBQUNBLEVBaEJGO0FBaUJBOzs7Ozs7OztRQ1hlLFEsR0FBQSxROzs7Ozs7Ozs7OztBQXBCaEIsSUFBSSxNQUFKO0FBQ0EsSUFBSSxLQUFKO0FBQ0EsSUFBSSxNQUFKOztBQUVBLElBQUksTUFBSjtBQUNBLElBQUksTUFBSjs7QUFFQSxJQUFJLEtBQUo7OztBQUdBLElBQUksS0FBSjs7O0FBR0EsSUFBSSxPQUFKOztBQUVBLElBQUksR0FBSjs7Ozs7QUFLTyxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0I7QUFD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QUFqQjtBQUFBLEdBQWIsQ0FBVDtBQUFBLEVBQS9CLENBQVo7O0FBRUEsS0FBSSxrQkFBa0IsTUFBTSxHQUFOLENBQVc7QUFBQSxTQUFRLEtBQUssTUFBTCxDQUFhLFVBQUMsQ0FBRCxFQUFHLENBQUg7QUFBQSxVQUFTLElBQUksRUFBRSxJQUFmO0FBQUEsR0FBYixFQUFrQyxDQUFsQyxDQUFSO0FBQUEsRUFBWCxDQUF0Qjs7QUFFQSxRQUFPLGVBQVA7QUFDQTs7Ozs7QUFLRCxTQUFTLEtBQVQsQ0FBZSxNQUFmLEVBQXVCLFVBQXZCLEVBQW1DO0FBQ2xDLFFBQU8sS0FBSyxLQUFMLENBQVksU0FBUyxVQUFyQixJQUFvQyxVQUEzQztBQUNBOzs7Ozs7OztRQ3JJZSxTLEdBQUEsUzs7QUFWaEI7O0FBRUEsSUFBSSxJQUFKLEM7Ozs7Ozs7QUFDQSxJQUFJLFNBQVMsQ0FBQyxjQUFELEVBQWlCLGtCQUFqQixDQUFiOzs7Ozs7O0FBT08sU0FBUyxTQUFULENBQW1CLE9BQW5CLEVBQTJCO0FBQ2pDLFNBQU8sT0FBUDs7QUFFQSxlQUFhLElBQWI7QUFDQTs7Ozs7QUFLRCxTQUFTLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEI7QUFDM0IsU0FBTyxPQUFQLENBQWdCLGlCQUFTO0FBQ3hCLFFBQUksU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQUosRUFBb0M7QUFDbkMsY0FBUSxLQUFSO0FBQ0MsYUFBSyxjQUFMO0FBQ0Msa0NBQVMsSUFBVDtBQUNBO0FBSEY7QUFLQTtBQUNELEdBUkQ7QUFTQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcclxuICogSW5pdGlhbGl6YXRpb24gb2YgYWxsIG1vZHVsZXMgXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbmltcG9ydCB7dmlzdWFsaXplfSBmcm9tICcuL3Zpc3VhbGl6ZSc7XHJcblxyXG4oZnVuY3Rpb24gcmVhZHkoZm4pIHtcclxuXHRpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKXtcclxuXHRcdGZuKCk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbik7XHJcblx0fVxyXG59KShpbml0KTtcclxuXHJcbi8qKlxyXG4gKiBJbml0aWFsaXplcyByZWFkaW5nIG9mIGZpbGUgYW5kIHRoZW4gdmlzdWFsaXphdGlvbiBwcm9jZXNzLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5pdCgpe1xyXG5cdGQzLmNzdignSG9tZV9PZmZpY2VfQWlyX1RyYXZlbF9EYXRhXzIwMTEuY3N2JylcclxuXHRcdC5yb3coIGQgPT4geyBcclxuXHRcdFx0cmV0dXJuIHsgXHJcblx0XHRcdFx0ZGVwYXJ0dXJlOiBkLkRlcGFydHVyZSwgXHJcblx0XHRcdFx0ZGVzdGluYXRpb246IGQuRGVzdGluYXRpb24sIFxyXG5cdFx0XHRcdGRpcmVjdG9yYXRlOiBkLkRpcmVjdG9yYXRlLCBcclxuXHRcdFx0XHRtb250aDogZC5EZXBhcnR1cmVfMjAxMSwgXHJcblx0XHRcdFx0ZmFyZTogcGFyc2VGbG9hdChkLlBhaWRfZmFyZSksIFxyXG5cdFx0XHRcdHRpY2tldDogZC5UaWNrZXRfY2xhc3NfZGVzY3JpcHRpb24sIFxyXG5cdFx0XHRcdHN1cHBsaWVyOiBkLlN1cHBsaWVyX25hbWUgXHJcblx0XHRcdH07XHJcblx0XHR9KVxyXG5cdFx0LmdldCggKGVycm9yLCBkYXRhKSA9PiB7XHJcblx0XHRcdGlmIChlcnJvcikgY29uc29sZS5sb2coZXJyb3IpXHJcblx0XHRcdFxyXG5cdFx0XHR2aXN1YWxpemUoZGF0YSk7XHJcblx0XHR9KTtcclxufSIsIi8qKlxyXG4gKiBWaXN1YWxpemF0aW9uIG9mIG1vbnRobHkgc3BlbmRpbmcuXHJcbiAqXHJcbiAqIEBhdXRob3IgbHVjeWlhIDxwaW5nQGx1Y3lpYS5jb20+XHJcbiAqIEB2ZXJzaW9uIDAuMVxyXG4gKi9cclxuXHJcbnZhciBtYXJnaW47XHJcbnZhciB3aWR0aDtcclxudmFyIGhlaWdodDtcclxuXHJcbnZhciB4U2NhbGU7XHJcbnZhciB5U2NhbGU7XHJcblxyXG52YXIgY29sb3I7XHJcblxyXG4vLyBzY2FsZSBmb3Igc3RhY2tpbmcgcmVjdGFuZ2xlc1xyXG52YXIgc3RhY2s7XHJcblxyXG4vLyB0cmFuc2Zvcm1lZCBkYXRhXHJcbnZhciBkYXRhc2V0O1xyXG5cclxudmFyIHN2ZztcclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNwZW5kaW5nKGRhdGEpIHtcclxuXHRpbml0KGRhdGEpO1xyXG5cclxuXHRkYXRhc2V0ID0gc3BlbmRpbmdEYXRhc2V0KGRhdGEpO1x0XHJcblx0XHJcblx0dXBkYXRlKGRhdGFzZXQpO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIGluaXQoZGF0YSkge1xyXG5cdG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMTUsIGxlZnQ6IDEwfTtcclxuXHR3aWR0aCA9IDgxMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xyXG5cdGhlaWdodCA9IDM0NSAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xyXG5cdFxyXG5cdHhTY2FsZSA9IGQzLnNjYWxlLm9yZGluYWwoKVxyXG5cdFx0LmRvbWFpbih1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpKVxyXG5cdFx0LnJhbmdlUm91bmRCYW5kcyhbMCwgd2lkdGhdLCAuMDUpO1xyXG5cclxuXHR5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKVxyXG5cdFx0LmRvbWFpbihbIDAsIHJvdW5kKE1hdGgubWF4KC4uLm1vbnRoRmFyZXMoZGF0YSkpLCAxMDAwKSBdKVxyXG5cdFx0LnJhbmdlKFsgaGVpZ2h0LCAwIF0pO1xyXG5cdFxyXG5cdGNvbG9yID0gZDMuc2NhbGUub3JkaW5hbCgpXHJcblx0XHQuZG9tYWluKHVuaXFWYWx1ZXMoZGF0YSwgJ3RpY2tldCcpKVxyXG5cdFx0LnJhbmdlKFtcIiMwMGJjZDRcIiwgXCIjM2Y1MWI1XCIsIFwiI2VkY2QwMlwiXSk7XHJcblx0XHQvLy5yYW5nZShbXCIjMzRjN2JkXCIsIFwiIzNmNTFiNVwiLCBcIiNlZGNkMDJcIl0pO1x0XHRcclxuXHJcblx0c3RhY2sgPSBkMy5sYXlvdXQuc3RhY2soKTtcclxuXHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjdmlzLXNwZW5kaW5nJylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHRcdC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnKyBtYXJnaW4ubGVmdCArJywnKyBtYXJnaW4udG9wICsnKScpO1xyXG59XHJcblxyXG4vKipcclxuICpcclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZShkYXRhKSB7XHJcblxyXG5cdHN0YWNrKGRhdGEpO1xyXG5cdFxyXG5cdHZhciBncm91cHMgPSBzdmcuc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGRhdGEpXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdnJyk7XHJcblxyXG5cdGdyb3Vwcy5zZWxlY3RBbGwoJ3JlY3QnKVxyXG5cdFx0LmRhdGEoIGQgPT4gZCApXHJcblx0XHQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHRcdC5hdHRyKCd4JywgZCA9PiB4U2NhbGUoZC54KSlcclxuXHRcdFx0LmF0dHIoJ3knLCBkID0+IHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgZCA9PiB4U2NhbGUucmFuZ2VCYW5kKCkpXHJcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBkID0+IHlTY2FsZShkLnkwKSAtIHlTY2FsZShkLnkgKyBkLnkwKSlcclxuXHRcdFx0LmF0dHIoJ2ZpbGwnLCBkID0+IGNvbG9yKGQudGlja2V0KSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUcmFuc2Zvcm0gZGF0YSBpbnRvIGEgbmV3IGRhdGFzZXQgd2hpY2ggaGFzIHJlYXJyYW5nZWQgdmFsdWVzXHJcbiAqIHNvIHRoYXQgaXQgaXMgYW4gYXJyYXkgb2YgdGlja2V0IHR5cGUgYXJyYXlzXHJcbiAqL1xyXG5mdW5jdGlvbiBzcGVuZGluZ0RhdGFzZXQoZGF0YSkge1xyXG5cdHZhciBkYXRhc2V0ID0gW107XHJcblxyXG5cdHZhciB0aWNrZXRzID0gdW5pcVZhbHVlcyhkYXRhLCAndGlja2V0Jyk7XHJcblxyXG5cdHZhciBtb250aGx5RGF0YSA9IHVuaXFWYWx1ZXMoZGF0YSwgJ21vbnRoJykubWFwKCBtb250aCA9PiBkYXRhLmZpbHRlciggZCA9PiBkLm1vbnRoID09PSBtb250aCApKTtcclxuXHRcclxuXHR0aWNrZXRzLmZvckVhY2goIHRpY2tldCA9PiB7XHJcblx0XHR2YXIgdGlja2V0QXJyYXkgPSBbXTtcclxuXHJcblx0XHRtb250aGx5RGF0YS5mb3JFYWNoKCBtb250aERhdGEgPT4ge1xyXG5cdFx0XHR2YXIgZGF0YU9iaiA9IHt9O1xyXG5cclxuXHRcdFx0ZGF0YU9iai50aWNrZXQgPSB0aWNrZXQ7XHRcdFx0XHJcblx0XHRcdGRhdGFPYmoudmFsdWVzID0gbW9udGhEYXRhLmZpbHRlciggZCA9PiBkLnRpY2tldCA9PT0gdGlja2V0KTtcclxuXHRcdFx0ZGF0YU9iai54ID0gbW9udGhEYXRhWzBdLm1vbnRoO1xyXG5cdFx0XHRkYXRhT2JqLnkgPSBtb250aERhdGEucmVkdWNlKCAoYSxiKSA9PiB7XHJcblx0XHRcdFx0aWYgKCBiLnRpY2tldCA9PT0gdGlja2V0ICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGEgKyBiLmZhcmU7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiBhO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSwgMCk7XHJcblxyXG5cdFx0XHR0aWNrZXRBcnJheS5wdXNoKGRhdGFPYmopO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0ZGF0YXNldC5wdXNoKHRpY2tldEFycmF5KTtcclxuXHR9KTtcclxuXHJcblx0cmV0dXJuIGRhdGFzZXQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gdW5pcVZhbHVlcyhkYXRhLCBwYXJhbSkge1xyXG5cdHJldHVybiBbIC4uLm5ldyBTZXQoZGF0YS5tYXAoZCA9PiBkW3BhcmFtXSkpXTtcclxufVxyXG5cclxuLyoqXHJcbiAqXHJcbiAqL1xyXG5mdW5jdGlvbiBtb250aEZhcmVzKGRhdGEpIHtcdFxyXG5cdC8vIGdldCBhbGwgZmFyZXMgZm9yIGVhY2ggbW9udGhcclxuXHR2YXIgZmFyZXMgPSB1bmlxVmFsdWVzKGRhdGEsICdtb250aCcpLm1hcCggbW9udGggPT4gZGF0YS5maWx0ZXIoIGQgPT4gZC5tb250aCA9PT0gbW9udGggKSk7XHJcblx0Ly8gc3VtIHVwIGFsbCBmYXJlcyBpbiBlYWNoIG1vbnRoXHJcblx0dmFyIHN1bU1vbnRobHlGYXJlcyA9IGZhcmVzLm1hcCggZmFyZSA9PiBmYXJlLnJlZHVjZSggKGEsYikgPT4gYSArIGIuZmFyZSwgMCkpO1xyXG5cdFxyXG5cdHJldHVybiBzdW1Nb250aGx5RmFyZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gcm91bmQobnVtYmVyLCByb3VuZFZhbHVlKSB7XHJcblx0cmV0dXJuIE1hdGgucm91bmQoIG51bWJlciAvIHJvdW5kVmFsdWUgKSAqIHJvdW5kVmFsdWU7XHJcbn0iLCIvKipcclxuICogTWFpbiB2aXN1YWxpemF0aW9uIG1vZHVsZSBmb3IgY3JlYXRpbmcgY2hhcnRzIGFuZCB2aXMgZm9yIHBhc3NlZCBkYXRhLlxyXG4gKlxyXG4gKiBAYXV0aG9yIGx1Y3lpYSA8cGluZ0BsdWN5aWEuY29tPlxyXG4gKiBAdmVyc2lvbiAwLjFcclxuICovXHJcblxyXG5pbXBvcnQge3NwZW5kaW5nfSBmcm9tICcuL3NwZW5kaW5nJztcclxuXHJcbnZhciBkYXRhO1xyXG52YXIgcGFuZWxzID0gWyd2aXMtc3BlbmRpbmcnLCAndmlzLWRpc3RyaWJ1dGlvbiddO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXJyYXl9IGRhdGFzZXQgYXJyYXkgb2Ygb2JqZWN0cyBmb3IgdmlzdWFsaXphdGlvblxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhc2V0KXtcdFxyXG5cdGRhdGEgPSBkYXRhc2V0O1xyXG5cclxuXHRkZXRlY3RQYW5lbHMoZGF0YSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKlxyXG4gKi9cclxuZnVuY3Rpb24gZGV0ZWN0UGFuZWxzKGRhdGEpIHtcclxuXHRwYW5lbHMuZm9yRWFjaCggcGFuZWwgPT4ge1xyXG5cdFx0aWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhbmVsKSkge1xyXG5cdFx0XHRzd2l0Y2ggKHBhbmVsKSB7XHJcblx0XHRcdFx0Y2FzZSAndmlzLXNwZW5kaW5nJzpcclxuXHRcdFx0XHRcdHNwZW5kaW5nKGRhdGEpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cdFx0XHJcblx0fSk7XHJcbn0iXX0=
