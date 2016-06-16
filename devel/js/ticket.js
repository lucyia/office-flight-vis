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
export function ticket(data, visId, param, color) {
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
		margin = {top: 0, right: 0, bottom: 10, left: 5};
		width = 260 - margin.left - margin.right;
		height = 130 - margin.top - margin.bottom;

		colorType = d3.scale.ordinal()			
			.range([color, 'rgba(0,0,0,.3)'])

		svg = d3.select('#'+visId)
			.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate('+ width/2 +','+ (height/2-margin.bottom) +')');

		arc = d3.svg.arc()
			.outerRadius(50 - 10)
			.innerRadius(50 - 20);

		pie = d3.layout.pie()
			.sort(null)
			.value(d => d.value);
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
		path = svg.selectAll('.arc-'+param)
			.data(data)
			.enter()
			.append('path')
				.attr('class', 'arc-'+param)			
				.attr('d', arc)
				.attr('fill', (d, i) => colorType(i))
				.each( function (d) { this._current = d });		

		// update
		percentage = svg.selectAll('.perc-'+param)
			.data([data[0]])
			.enter()
			.append('text')
				.attr('class', 'perc-'+param)
				.attr('x', -15 )
				.attr('y', 5 )
				.attr('fill', 'white')
				.text( percent );

		exactValue = svg.selectAll('.exval-'+param)
			.data([data[0]])
			.enter()
			.append('text')
				.attr('class', 'exval-'+param)
				.attr('x', -15 )
				.attr('y', 65 )
				.attr('fill', 'white')
				.attr('font-size', 18)
				.text( roundValue );
	}

	/**
	 * Updates the chart and all text values according to new given data. 
	 */
	function updateChart(dataset) {

		var data = updateData(dataset);

		// compute the new angles
		path = path.data( data );
		// redraw all arcs
		path.transition().attrTween('d', arcTween);

		// update text - percentage number
		percentage.data([data[0]])
			.text( percent );

		// update text - exact value number
		exactValue.data([data[0]])
			.text( roundValue );

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
			
			return function(t) {
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
		var percent = d.value/allItems*100;
		return Math.round(percent)+'%';
	}
}

/**
 * Calculates the average price of tickets from given data - sum of all fares over number of all tickets.
 *
 * @param {array} data
 * @return {number} avgPrice
 */
function avgPrice(data) {
	
	var priceSum = data.reduce( (a, b) => a + b.fare, 0 );
	
	var ticketNum = data.length;

	return priceSum / ticketNum;
}