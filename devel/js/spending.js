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
export function spending(data) {

	init(data);

	dataset = spendingDataset(data);
	
	update(dataset);
}

/**
 *
 */
function init(data) {	

	margin = {top: 10, right: 35, bottom: 30, left: 10};
	width = 810 - margin.left - margin.right;
	height = 345 - margin.top - margin.bottom;
	
	xScale = d3.scale.ordinal()
		.domain(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
		.rangeRoundBands([0, width], .05);

	yScale = d3.scale.linear()
		.domain([ 0, round(Math.max(...monthFares(data)), 1000) ])
		.range([ height, 0 ]);

	xAxis = d3.svg.axis()
		.scale(xScale)
		.orient('bottom');

	yAxis = d3.svg.axis()
		.scale(yScale)
		.orient('right')
		.tickFormat( d => numeral(d).format('0a'));
	
	color = d3.scale.ordinal()
		.domain(uniqValues(data, 'ticket'))		
		.range(["#00bcd4", "#1d6dd0", "#edcd02"]);
		//.range(["#00bcd4", "#3f51b5", "#edcd02"]);
		//.range(["#34c7bd", "#3f51b5", "#edcd02"]);		

	stack = d3.layout.stack();

	svg = d3.select('#vis-spending')
		.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate('+ margin.left +','+ margin.top +')');

	/**
	 *
	 */
	function round(number, roundValue) {
		return Math.round( number / roundValue ) * roundValue;
	}

}

/**
 *
 */
function update(data) {

	// create stacked data for the visualization
	stack(data);

	// create tooltip and call it
	tip = d3.tip()
		.attr('class', 'd3-tip')
		.html( d => {
			var index = color.range().indexOf(color(d.ticket));
			return '<span class="type type-'+index+'">'+ d.ticket +'</span><br/><span class="value">'+numeral(d.y).format('$0,0') + '</span>'; 
		});

	svg.call(tip);
	
	// create group for each ticket type
	var groups = svg.selectAll('g')
		.data(data)
		.enter()
			.append('g')
			.attr('class', (d,i) => 'ticket-'+i );

	// create bars for each ticket group
	groups.selectAll('rect')
		.data( d => d )
		.enter()
		.append('rect')
			.attr('x', d => xScale(d.x))
			.attr('y', d => yScale(d.y + d.y0))
			.attr('width', d => xScale.rangeBand())
			.attr('height', d => yScale(d.y0) - yScale(d.y + d.y0))
			.attr('fill', d => color(d.ticket))
			.on('mouseover', mouseover)
			.on('mouseout', mouseout)
			.on('click', mouseclick);

	svg.append('g')
		.attr('class', 'axis axis-x')
		.attr('transform', 'translate('+ 0 +','+ height +')')
		.call(xAxis);

	svg.append('g')
		.attr('class', 'axis axis-y')
		.attr('transform', 'translate('+ width +','+ 0 +')')
		.call(yAxis);

	filter = svg.append('g')
		.attr('class', 'filter');

	/**
	 * 
	 *
	 * @param {object} data
	 */
	function mouseclick(data) {

		// get all ticket types for selected month
		var ticketsMonth = dataset.map( tickets => tickets.filter( d => d.x === data.x ));

		// flatten the array
		ticketsMonth = [].concat.apply([], ticketsMonth);

		// calculate the height and starting point of months bar
		var y0 = ticketsMonth[0].y0;
		var barHeight = ticketsMonth.reduce( (a, b) => a + b.y, 0);
		
		// create a rectangle for highlighting the selected month
		var selected = filter.selectAll('.selected')
			.data([data]);

		selected.attr('x', d => xScale(d.x))
			.attr('y', d => yScale(barHeight))
			.attr('height', yScale(y0) - yScale(barHeight));

		selected.enter()
			.append('rect')
				.attr('class', 'selected')	
				.attr('stroke-width', 3)
				.attr('stroke', 'white')
				.attr('x', d => xScale(d.x))
				.attr('y', d => yScale(barHeight))
				.attr('width', d => xScale.rangeBand())
				.attr('height', yScale(y0) - yScale(barHeight));

		selected.attr('fill', 'none');

		selected.exit().remove();

	}

	/**
	 * Hihglight the hovered element and shows tooltip.
	 *
	 * @param {object} data
	 */
	function mouseover(d) {
		d3.select(this)
			.attr('fill', d => d3.rgb(color(d.ticket)).brighter(.5));

		tip.show(d);
	}

	/**
	 * Resets the color of the element and hides the tooltip.
	 */
	function mouseout() {		
		d3.select(this)
			.attr('fill', d => color(d.ticket));

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