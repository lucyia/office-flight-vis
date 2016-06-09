(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {

		var dataset;

		d3.csv('Home_Office_Air_Travel_Data_2011.csv', function (error, data) {
				if (error) {
						console.log(error);
				}

				dataset = data;

				dataExtents(dataset);
		});

		function dataExtents(data) {
				console.log(data);

				var directorates = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return d.Directorate;
				}))));
				console.log('Directorates: ', directorates.length, directorates);
				// 26 unique values
				// string; e.g. "CRB", "Strategy & Reform Directorate", "Strategic Director Border"

				var suppliers = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return d.Supplier_name;
				}))));
				console.log('Suppliers: ', suppliers.length, suppliers);
				// 55 unique values
				// string upper case; e.g. "FLYBE BRITISH EUROPEAN", "EASYJET", "BRITISH AIRWAYS"

				var fares = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return parseFloat(d.Paid_fare);
				}))));
				console.log('Fares: ', fares.length, '[' + Math.min.apply(Math, _toConsumableArray(fares)) + ', ' + Math.max.apply(Math, _toConsumableArray(fares)) + ']', fares);
				// 2898 unique values
				// float - two decimals; e.g. 78.91, 59
				// min - 0
				// max - 5395.63

				var departures = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return d.Departure;
				}))));
				console.log('Departures: ', departures.length, departures);
				// 3 unique values
				// string; "UK", "Non EEA", "EEA"

				var destinations = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return d.Destination;
				}))));
				console.log('Destinations: ', destinations.length, destinations);
				// 3 unique values
				// string; "UK", "Non EEA", "EEA"

				var tickets = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return d.Ticket_class_description;
				}))));
				console.log('Tickets: ', tickets.length, tickets);
				// 3 unique values
				// string; "Economy", "Business Class", "Premium Economy"

				var months = [].concat(_toConsumableArray(new Set(data.map(function (d) {
						return d.Departure_2011;
				}))));
				console.log('Months: ', months.length, months);
				// 12 unique values
				// string; "February", "January", "March", "April", "September", "May", "June", "November", "July", "August", "December", "October"	
		}
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqc1xcaW5pdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxDQUFDLFlBQVc7O0FBRVgsTUFBSSxPQUFKOztBQUVBLEtBQUcsR0FBSCxDQUFPLHNDQUFQLEVBQStDLFVBQVMsS0FBVCxFQUFnQixJQUFoQixFQUFzQjtBQUNwRSxRQUFJLEtBQUosRUFBVztBQUFFLGNBQVEsR0FBUixDQUFZLEtBQVo7QUFBcUI7O0FBRWxDLGNBQVUsSUFBVjs7QUFFQSxnQkFBWSxPQUFaO0FBQ0EsR0FORDs7QUFRQSxXQUFTLFdBQVQsQ0FBcUIsSUFBckIsRUFBMkI7QUFDMUIsWUFBUSxHQUFSLENBQVksSUFBWjs7QUFFQSxRQUFJLDRDQUFtQixJQUFJLEdBQUosQ0FBUSxLQUFLLEdBQUwsQ0FBVTtBQUFBLGFBQUssRUFBRSxXQUFQO0FBQUEsS0FBVixDQUFSLENBQW5CLEVBQUo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixhQUFhLE1BQTNDLEVBQW1ELFlBQW5EOzs7O0FBSUEsUUFBSSx5Q0FBZ0IsSUFBSSxHQUFKLENBQVEsS0FBSyxHQUFMLENBQVU7QUFBQSxhQUFLLEVBQUUsYUFBUDtBQUFBLEtBQVYsQ0FBUixDQUFoQixFQUFKO0FBQ0EsWUFBUSxHQUFSLENBQVksYUFBWixFQUEyQixVQUFVLE1BQXJDLEVBQTZDLFNBQTdDOzs7O0FBSUEsUUFBSSxxQ0FBWSxJQUFJLEdBQUosQ0FBUSxLQUFLLEdBQUwsQ0FBVTtBQUFBLGFBQUssV0FBVyxFQUFFLFNBQWIsQ0FBTDtBQUFBLEtBQVYsQ0FBUixDQUFaLEVBQUo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLE1BQU0sTUFBN0IsRUFBcUMsTUFBSSxLQUFLLEdBQUwsZ0NBQVksS0FBWixFQUFKLEdBQXVCLElBQXZCLEdBQTRCLEtBQUssR0FBTCxnQ0FBWSxLQUFaLEVBQTVCLEdBQStDLEdBQXBGLEVBQXlGLEtBQXpGOzs7Ozs7QUFNQSxRQUFJLDBDQUFpQixJQUFJLEdBQUosQ0FBUSxLQUFLLEdBQUwsQ0FBVTtBQUFBLGFBQUssRUFBRSxTQUFQO0FBQUEsS0FBVixDQUFSLENBQWpCLEVBQUo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxjQUFaLEVBQTRCLFdBQVcsTUFBdkMsRUFBK0MsVUFBL0M7Ozs7QUFJQSxRQUFJLDRDQUFtQixJQUFJLEdBQUosQ0FBUSxLQUFLLEdBQUwsQ0FBVTtBQUFBLGFBQUssRUFBRSxXQUFQO0FBQUEsS0FBVixDQUFSLENBQW5CLEVBQUo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixhQUFhLE1BQTNDLEVBQW1ELFlBQW5EOzs7O0FBSUEsUUFBSSx1Q0FBYyxJQUFJLEdBQUosQ0FBUSxLQUFLLEdBQUwsQ0FBVTtBQUFBLGFBQUssRUFBRSx3QkFBUDtBQUFBLEtBQVYsQ0FBUixDQUFkLEVBQUo7QUFDQSxZQUFRLEdBQVIsQ0FBWSxXQUFaLEVBQXlCLFFBQVEsTUFBakMsRUFBeUMsT0FBekM7Ozs7QUFJQSxRQUFJLHNDQUFhLElBQUksR0FBSixDQUFRLEtBQUssR0FBTCxDQUFVO0FBQUEsYUFBSyxFQUFFLGNBQVA7QUFBQSxLQUFWLENBQVIsQ0FBYixFQUFKO0FBQ0EsWUFBUSxHQUFSLENBQVksVUFBWixFQUF3QixPQUFPLE1BQS9CLEVBQXVDLE1BQXZDOzs7QUFJQTtBQUVELENBdEREIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcclxuXHJcblx0dmFyIGRhdGFzZXQ7XHJcblxyXG5cdGQzLmNzdignSG9tZV9PZmZpY2VfQWlyX1RyYXZlbF9EYXRhXzIwMTEuY3N2JywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcclxuXHRcdGlmIChlcnJvcikgeyBjb25zb2xlLmxvZyhlcnJvcik7IH1cclxuXHRcdFxyXG5cdFx0ZGF0YXNldCA9IGRhdGE7XHJcblxyXG5cdFx0ZGF0YUV4dGVudHMoZGF0YXNldCk7XHJcblx0fSk7XHJcblxyXG5cdGZ1bmN0aW9uIGRhdGFFeHRlbnRzKGRhdGEpIHtcclxuXHRcdGNvbnNvbGUubG9nKGRhdGEpXHJcblxyXG5cdFx0dmFyIGRpcmVjdG9yYXRlcyA9IFsuLi5uZXcgU2V0KGRhdGEubWFwKCBkID0+IGQuRGlyZWN0b3JhdGUgKSldO1xyXG5cdFx0Y29uc29sZS5sb2coJ0RpcmVjdG9yYXRlczogJywgZGlyZWN0b3JhdGVzLmxlbmd0aCwgZGlyZWN0b3JhdGVzKTtcclxuXHRcdC8vIDI2IHVuaXF1ZSB2YWx1ZXNcclxuXHRcdC8vIHN0cmluZzsgZS5nLiBcIkNSQlwiLCBcIlN0cmF0ZWd5ICYgUmVmb3JtIERpcmVjdG9yYXRlXCIsIFwiU3RyYXRlZ2ljIERpcmVjdG9yIEJvcmRlclwiXHJcblxyXG5cdFx0dmFyIHN1cHBsaWVycyA9IFsuLi5uZXcgU2V0KGRhdGEubWFwKCBkID0+IGQuU3VwcGxpZXJfbmFtZSApKV07XHJcblx0XHRjb25zb2xlLmxvZygnU3VwcGxpZXJzOiAnLCBzdXBwbGllcnMubGVuZ3RoLCBzdXBwbGllcnMpO1xyXG5cdFx0Ly8gNTUgdW5pcXVlIHZhbHVlc1xyXG5cdFx0Ly8gc3RyaW5nIHVwcGVyIGNhc2U7IGUuZy4gXCJGTFlCRSBCUklUSVNIIEVVUk9QRUFOXCIsIFwiRUFTWUpFVFwiLCBcIkJSSVRJU0ggQUlSV0FZU1wiXHJcblxyXG5cdFx0dmFyIGZhcmVzID0gWy4uLm5ldyBTZXQoZGF0YS5tYXAoIGQgPT4gcGFyc2VGbG9hdChkLlBhaWRfZmFyZSkgKSldO1xyXG5cdFx0Y29uc29sZS5sb2coJ0ZhcmVzOiAnLCBmYXJlcy5sZW5ndGgsICdbJytNYXRoLm1pbiguLi5mYXJlcykrJywgJytNYXRoLm1heCguLi5mYXJlcykrJ10nLCBmYXJlcyk7XHJcblx0XHQvLyAyODk4IHVuaXF1ZSB2YWx1ZXNcclxuXHRcdC8vIGZsb2F0IC0gdHdvIGRlY2ltYWxzOyBlLmcuIDc4LjkxLCA1OVxyXG5cdFx0Ly8gbWluIC0gMFxyXG5cdFx0Ly8gbWF4IC0gNTM5NS42M1xyXG5cclxuXHRcdHZhciBkZXBhcnR1cmVzID0gWy4uLm5ldyBTZXQoZGF0YS5tYXAoIGQgPT4gZC5EZXBhcnR1cmUgKSldO1xyXG5cdFx0Y29uc29sZS5sb2coJ0RlcGFydHVyZXM6ICcsIGRlcGFydHVyZXMubGVuZ3RoLCBkZXBhcnR1cmVzKTtcdFx0XHJcblx0XHQvLyAzIHVuaXF1ZSB2YWx1ZXNcclxuXHRcdC8vIHN0cmluZzsgXCJVS1wiLCBcIk5vbiBFRUFcIiwgXCJFRUFcIlxyXG5cclxuXHRcdHZhciBkZXN0aW5hdGlvbnMgPSBbLi4ubmV3IFNldChkYXRhLm1hcCggZCA9PiBkLkRlc3RpbmF0aW9uICkpXTtcclxuXHRcdGNvbnNvbGUubG9nKCdEZXN0aW5hdGlvbnM6ICcsIGRlc3RpbmF0aW9ucy5sZW5ndGgsIGRlc3RpbmF0aW9ucyk7XHRcdFxyXG5cdFx0Ly8gMyB1bmlxdWUgdmFsdWVzXHJcblx0XHQvLyBzdHJpbmc7IFwiVUtcIiwgXCJOb24gRUVBXCIsIFwiRUVBXCJcclxuXHRcdFxyXG5cdFx0dmFyIHRpY2tldHMgPSBbLi4ubmV3IFNldChkYXRhLm1hcCggZCA9PiBkLlRpY2tldF9jbGFzc19kZXNjcmlwdGlvbiApKV07XHJcblx0XHRjb25zb2xlLmxvZygnVGlja2V0czogJywgdGlja2V0cy5sZW5ndGgsIHRpY2tldHMpO1x0XHRcclxuXHRcdC8vIDMgdW5pcXVlIHZhbHVlc1xyXG5cdFx0Ly8gc3RyaW5nOyBcIkVjb25vbXlcIiwgXCJCdXNpbmVzcyBDbGFzc1wiLCBcIlByZW1pdW0gRWNvbm9teVwiXHJcblxyXG5cdFx0dmFyIG1vbnRocyA9IFsuLi5uZXcgU2V0KGRhdGEubWFwKCBkID0+IGQuRGVwYXJ0dXJlXzIwMTEgKSldO1xyXG5cdFx0Y29uc29sZS5sb2coJ01vbnRoczogJywgbW9udGhzLmxlbmd0aCwgbW9udGhzKTtcclxuXHRcdC8vIDEyIHVuaXF1ZSB2YWx1ZXNcclxuXHRcdC8vIHN0cmluZzsgXCJGZWJydWFyeVwiLCBcIkphbnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiU2VwdGVtYmVyXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIk5vdmVtYmVyXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIkRlY2VtYmVyXCIsIFwiT2N0b2JlclwiXHRcclxuXHRcdFxyXG5cdH1cclxuXHJcbn0pKCk7Il19
