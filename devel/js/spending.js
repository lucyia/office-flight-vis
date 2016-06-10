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
export function spending(data) {
	init(data);

	dataset = spendingDataset(data);	
	
	update(dataset);
}

/**
 *
 */
function init(data) {
	margin = {top: 10, right: 10, bottom: 15, left: 10};
	width = 810 - margin.left - margin.right;
	height = 345 - margin.top - margin.bottom;
	
	xScale = d3.scale.ordinal()
		.domain(uniqValues(data, 'month'))
		.rangeRoundBands([0, width], .05);

	yScale = d3.scale.linear()
		.domain([ 0, round(Math.max(...monthFares(data)), 1000) ])
		.range([ height, 0 ]);
	
	color = d3.scale.ordinal()
		.domain(uniqValues(data, 'ticket'))
		.range(["#00bcd4", "#3f51b5", "#edcd02"]);
		//.range(["#34c7bd", "#3f51b5", "#edcd02"]);		

	stack = d3.layout.stack();

	svg = d3.select('#vis-spending')
		.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate('+ margin.left +','+ margin.top +')');
}

/**
 *
 */
function update(data) {

	stack(data);
	
	var groups = svg.selectAll('g')
		.data(data)
		.enter()
			.append('g');

	groups.selectAll('rect')
		.data( d => d )
		.enter()
		.append('rect')
			.attr('x', d => xScale(d.x))
			.attr('y', d => yScale(d.y + d.y0))
			.attr('width', d => xScale.rangeBand())
			.attr('height', d => yScale(d.y0) - yScale(d.y + d.y0))
			.attr('fill', d => color(d.ticket));
}

/**
 * Transform data into a new dataset which has rearranged values
 * so that it is an array of ticket type arrays
 */
function spendingDataset(data) {
	var dataset = [];

	var tickets = uniqValues(data, 'ticket');

	var monthlyData = uniqValues(data, 'month').map( month => data.filter( d => d.month === month ));
	
	tickets.forEach( ticket => {
		var ticketArray = [];

		monthlyData.forEach( monthData => {
			var dataObj = {};

			dataObj.ticket = ticket;			
			dataObj.values = monthData.filter( d => d.ticket === ticket);
			dataObj.x = monthData[0].month;
			dataObj.y = monthData.reduce( (a,b) => {
				if ( b.ticket === ticket ) {
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
	return [ ...new Set(data.map(d => d[param]))];
}

/**
 *
 */
function monthFares(data) {	
	// get all fares for each month
	var fares = uniqValues(data, 'month').map( month => data.filter( d => d.month === month ));
	// sum up all fares in each month
	var sumMonthlyFares = fares.map( fare => fare.reduce( (a,b) => a + b.fare, 0));
	
	return sumMonthlyFares;
}

/**
 *
 */
function round(number, roundValue) {
	return Math.round( number / roundValue ) * roundValue;
}