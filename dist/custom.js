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

},{"./visualize":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visualize = visualize;
/**
 * Main visualization module for creating charts and vis for passed data.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

function visualize(data) {
  console.log(data);
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyIsImpzXFx2aXN1YWxpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ09BOztBQUVBLENBQUMsU0FBUyxLQUFULENBQWUsRUFBZixFQUFtQjtBQUNuQixLQUFJLFNBQVMsVUFBVCxLQUF3QixTQUE1QixFQUFzQztBQUNyQztBQUNBLEVBRkQsTUFFTztBQUNOLFdBQVMsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQThDLEVBQTlDO0FBQ0E7QUFDRCxDQU5ELEVBTUcsSUFOSDs7Ozs7Ozs7Ozs7O0FBV0EsU0FBUyxJQUFULEdBQWU7QUFDZCxJQUFHLEdBQUgsQ0FBTyxzQ0FBUCxFQUNFLEdBREYsQ0FDTyxhQUFLO0FBQ1YsU0FBTztBQUNOLGNBQVcsRUFBRSxTQURQO0FBRU4sZ0JBQWEsRUFBRSxXQUZUO0FBR04sZ0JBQWEsRUFBRSxXQUhUO0FBSU4sVUFBTyxFQUFFLGNBSkg7QUFLTixTQUFNLFdBQVcsRUFBRSxTQUFiLENBTEE7QUFNTixXQUFRLEVBQUUsd0JBTko7QUFPTixhQUFVLEVBQUU7QUFQTixHQUFQO0FBU0EsRUFYRixFQVlFLEdBWkYsQ0FZTyxVQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWlCO0FBQ3RCLE1BQUksS0FBSixFQUFXLFFBQVEsR0FBUixDQUFZLEtBQVo7O0FBRVgsNEJBQVUsSUFBVjtBQUNBLEVBaEJGO0FBaUJBOzs7Ozs7OztRQy9CZSxTLEdBQUEsUzs7Ozs7Ozs7QUFBVCxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBd0I7QUFDOUIsVUFBUSxHQUFSLENBQVksSUFBWjtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBJbml0aWFsaXphdGlvbiBvZiBhbGwgbW9kdWxlcyBcclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuaW1wb3J0IHt2aXN1YWxpemV9IGZyb20gJy4vdmlzdWFsaXplJztcclxuXHJcbihmdW5jdGlvbiByZWFkeShmbikge1xyXG5cdGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpe1xyXG5cdFx0Zm4oKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKTtcclxuXHR9XHJcbn0pKGluaXQpO1xyXG5cclxuLyoqXHJcbiAqIEluaXRpYWxpemVzIHJlYWRpbmcgb2YgZmlsZSBhbmQgdGhlbiB2aXN1YWxpemF0aW9uIHByb2Nlc3MuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbml0KCl7XHJcblx0ZDMuY3N2KCdIb21lX09mZmljZV9BaXJfVHJhdmVsX0RhdGFfMjAxMS5jc3YnKVxyXG5cdFx0LnJvdyggZCA9PiB7IFxyXG5cdFx0XHRyZXR1cm4geyBcclxuXHRcdFx0XHRkZXBhcnR1cmU6IGQuRGVwYXJ0dXJlLCBcclxuXHRcdFx0XHRkZXN0aW5hdGlvbjogZC5EZXN0aW5hdGlvbiwgXHJcblx0XHRcdFx0ZGlyZWN0b3JhdGU6IGQuRGlyZWN0b3JhdGUsIFxyXG5cdFx0XHRcdG1vbnRoOiBkLkRlcGFydHVyZV8yMDExLCBcclxuXHRcdFx0XHRmYXJlOiBwYXJzZUZsb2F0KGQuUGFpZF9mYXJlKSwgXHJcblx0XHRcdFx0dGlja2V0OiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiwgXHJcblx0XHRcdFx0c3VwcGxpZXI6IGQuU3VwcGxpZXJfbmFtZSBcclxuXHRcdFx0fTtcclxuXHRcdH0pXHJcblx0XHQuZ2V0KCAoZXJyb3IsIGRhdGEpID0+IHtcclxuXHRcdFx0aWYgKGVycm9yKSBjb25zb2xlLmxvZyhlcnJvcilcclxuXHRcdFx0XHJcblx0XHRcdHZpc3VhbGl6ZShkYXRhKTtcclxuXHRcdH0pO1xyXG59IiwiLyoqXHJcbiAqIE1haW4gdmlzdWFsaXphdGlvbiBtb2R1bGUgZm9yIGNyZWF0aW5nIGNoYXJ0cyBhbmQgdmlzIGZvciBwYXNzZWQgZGF0YS5cclxuICpcclxuICogQGF1dGhvciBsdWN5aWEgPHBpbmdAbHVjeWlhLmNvbT5cclxuICogQHZlcnNpb24gMC4xXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc3VhbGl6ZShkYXRhKXtcdFxyXG5cdGNvbnNvbGUubG9nKGRhdGEpO1xyXG59Il19
