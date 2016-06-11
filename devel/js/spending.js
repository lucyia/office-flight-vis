/**
 * Visualization of monthly spending.
 * Creates a bar chart from given data and adds listeners for filtering one month.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {updatedSpending} from './visualize';

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
export function spending(data) {

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

	margin = {top: 10, right: 35, bottom: 30, left: 10};
	width = 810 - margin.left - margin.right;
	height = 345 - margin.top - margin.bottom;
	
	xScale = d3.scale.ordinal()
		.domain(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
		.rangeRoundBands([0, width], .05);

	// round the maximum value from data to thousands
	var roundedMax = Math.round( Math.max(...monthFares(data)) / 1000 ) * 1000;
	yScale = d3.scale.linear()
		.domain([ 0, roundedMax ])
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

	stack = d3.layout.stack();

	svg = d3.select('#vis-spending')
		.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
		.append('g')
			.attr('transform', 'translate('+ margin.left +','+ margin.top +')');

	/**
	 * Calculates the monthly spending for all ticket types and returns the created array.
	 *
	 * @param {array} data array of objects represending all year spedning
	 * @return {array} sumMonthlyFares array of numbers representing each months spending on all tickets
	 */
	function monthFares(data) {	
		// get all fares for each month
		var fares = uniqValues(data, 'month').map( month => data.filter( d => d.month === month ));
		// sum up all fares in each month
		var sumMonthlyFares = fares.map( fare => fare.reduce( (a,b) => a + b.fare, 0));
		
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
	tip = d3.tip()
		.attr('class', 'd3-tip')
		.html( d => {
			var index = color.range().indexOf(color(d.ticket));
			return '<span class="type type-'+index+'">'+ d.ticket +'</span><br/><span class="value">'+numeral(d.y).format('$0,0') + '</span>'; 
		});

	svg.call(tip);

	// create a rectangle as a background
	var background = svg.append('rect')
		.attr('class', 'svg-background')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', width)
		.attr('height', height)
		.attr('fill', 'transparent')
		.on('click', deselect);

	// create group for each ticket type
	var groups = svg.selectAll('g')
		.data(data)
		.enter()
			.append('g')
			.attr('class', (d,i) => 'ticket-'+i );

	// create bars for each ticket group
	groups.selectAll('.bar')
		.data( d => d )
		.enter()
		.append('rect')
			.attr('class', 'bar')
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
	 * Deletes the filter containing selected month and updates all other visualizations.
	 */
	function deselect() {

		var filter = document.getElementsByClassName('filter')[0];

		if (filter.childNodes.length > 0) {
			// delete selected month
			filter.removeChild(filter.childNodes[0]);

			// update all other visualizations
			updatedSpending();
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
		updatedSpending(data.x);

		// get all ticket types for selected month
		var ticketsMonth = dataset.map( tickets => tickets.filter( d => d.x === data.x ));

		// flatten the array
		ticketsMonth = [].concat.apply([], ticketsMonth);

		// calculate the height and starting point of months bar
		var y0 = ticketsMonth[0].y0;
		var barHeight = ticketsMonth.reduce( (a, b) => a + b.y, 0);
		
		// create and update rectangle for highlighting the selected month
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
				.attr('fill', 'none')
				.attr('x', d => xScale(d.x))
				.attr('y', d => yScale(barHeight))
				.attr('width', d => xScale.rangeBand())
				.attr('height', yScale(y0) - yScale(barHeight));

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
 * @return {array} dataset array of data objects grouped by ticket types and months
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
 * Finds out the unique values of given data for given parameter.
 *
 * @param {array} data array of objects representing all year spending
 * @param {string} param parameter which should be looked up
 * @return {array} uniqueValues array of all unique values for given parameter
 */
function uniqValues(data, param) {
	return [ ...new Set(data.map(d => d[param]))];
}