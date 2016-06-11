/**
 * Visualization of top spending for given element.
 * Creates five bar charts stating the top elements which spend the most.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {uniqValues, calcSpending} from './vis-util';

// general attribtues
var margin;
var width;
var height;

// function for advanced tooltip
var tip;

/**
 * Initializes all variables needed for visualization.
 *
 * @param {array} data array of data objects
 * @param {string} param name of the parameter which will be used for visualization of top spending
 * @param {string} visId id of the visualization panel
 * @param {string} color fill color used for all rectangles
 */
export function topSpending(data, param, visId, color) {

	var vis = {};
	vis.update = updateTopSpending;	

	var xScale;
	var yScale;
	var svg;

	// calculate data, initialize and draw chart
	var topData = calcTop(data);

	init(topData);

	createBarChart(topData);

	return vis;

	/**
	 * Firstly, calculates the new top data and then updates the bar chart and text values according to new data.
	 *
	 * @param {array} data
	 */
	function updateTopSpending(data) {	
		update(calcTop(data));
	}

	/**
	 * Calculates top five items from data according to spending (fare) values.
	 *
	 * @param {array} data
	 * @return {array} dataset updated 
	 */
	function calcTop(data) {
		return calcSpending(data, param).sort( (a, b) => b.fare - a.fare ).slice(0,5);
	}

	/**
	 * Initializes all needed variables for visualization and creates a SVG panel. 
	 *
	 * @param {array} data
	 */
	function init(data) {
		margin = {top: 0, right: 0, bottom: 0, left: 5};
		width = 260 - margin.left - margin.right;
		height = 130 - margin.top - margin.bottom;

		yScale = d3.scale.ordinal()
			.domain(data.map(d => d[param]))
			.rangeRoundBands([0, height], .1);

		xScale = d3.scale.linear()
			.domain([ 0, Math.max(...data.map(d => d.fare)) ])
			.range([ 0, width ]);

		svg = d3.select('#'+visId)
			.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate('+ margin.left +','+ margin.top +')');
	}

	/**
	 * Creates bar chart and a tooltip.
	 *
	 * @param {array} data
	 */
	function createBarChart(data) {

		// create tooltip and call it
		tip = d3.tip()
			.attr('class', 'd3-tip')
			.html( d => {
				return '<span class="value">'+numeral(d.fare).format('$0,0') + '</span>'; 
			});

		svg.call(tip);

		// create bar charts
		update(data);

	}

	/**
	 * Updates the bar chart visualization with all names and fare values.
	 *
	 * @param {array} data array of objects; e.g. [ { fare: x, otherParam: a }, { fare: y, otherParam: b }, ... ]
	 */
	function update(data) {
		// update scale so relative differencies can be seen
		xScale.domain([ 0, Math.max(...data.map(d => d.fare)) ]);

		// draw rectangle representing spending
		var bars = svg.selectAll('.bar-'+param)
			.data(data);

		bars.transition()
			.attr('width', d => xScale(d.fare));

		bars.enter()
			.append('rect')
				.attr('class', 'bar-'+param)
				.attr('x', d => 0)
				.attr('y', d => yScale(d[param]))
				.attr('height', d => yScale.rangeBand())
				.attr('width', d => xScale(d.fare))
				.attr('fill', color)
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

		bars.exit().remove();

		// draw text to the left of each bar representing the name
		var names = svg.selectAll('.bar-'+param+'-name')
			.data(data);

		names.transition()
			.text(d => d[param]);

		names.enter()
			.append('text')
				.attr('class', 'bar-'+param+'-name')
				.attr('x', 0)
				.attr('y', d => yScale(d[param]))
				.attr('dy', 17)
				.attr('dx', 5)
				.attr('fill', 'white')
				.text(d => d[param])
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

		names.exit().remove();

		// draw text to the right of each bar representing the rounded spending
		var fares = svg.selectAll('.bar-'+param+'-fare')
			.data(data);

		fares.transition()
			.text(d => numeral(d.fare).format('0a'));

		fares.enter()
			.append('text')
				.attr('class', 'bar-'+param+'-fare')
				.attr('x', width-35)
				.attr('y', d => yScale(d[param]))
				.attr('dy', 17)
				.attr('dx', 5)
				.attr('fill', 'white')
				.text(d => numeral(d.fare).format('0a'));

		fares.exit().remove();
	}
}