/**
 * Visualization of top directorates.
 * Creates five bar charts stating the top directorates which spend the most.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {uniqValues, calcSpending} from './vis-util';

// general attribtues
var visId = 'vis-top-dir';
var margin;
var width;
var height;

// function for positioning elements in x direction
var xScale;
// function for positioning elements in y direction
var yScale;

// svg panel
var svg;

// function for advanced tooltip
var tip;

/**
 * Initializes all variables needed for visualization.
 */
export function topDirectorates(data) {	

	var topDir = calcTopDir(data);

	init(topDir);

	createBarChart(topDir, visId);

}

function calcTopDir(data) {
	return calcSpending(data, 'directorate').sort( (a, b) => b.fare - a.fare ).slice(0,5);
}

function init(data) {
	margin = {top: 0, right: 0, bottom: 0, left: 5};
	width = 260 - margin.left - margin.right;
	height = 130 - margin.top - margin.bottom;

	yScale = d3.scale.ordinal()
		.domain(data.map(d => d.directorate))
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

function createBarChart(data, visId) {

	// create tooltip and call it
	tip = d3.tip()
		.attr('class', 'd3-tip')
		.html( d => {
			return '<span class="value">'+numeral(d.fare).format('$0,0') + '</span>'; 
		});

	svg.call(tip);

	update(data);

}

export function updateTopDir(data) {
	var topDir = calcTopDir(data);
	update(topDir);
}

function update(data) {
	// update scale so relative differencies can be seen
	xScale.domain([ 0, Math.max(...data.map(d => d.fare)) ]);

	// draw rectangle representing spending
	var bars = svg.selectAll('.bar-dir')
		.data(data);

	bars.transition()
		.attr('width', d => xScale(d.fare));

	bars.enter()
		.append('rect')
			.attr('class', 'bar-dir')
			.attr('x', d => 0)
			.attr('y', d => yScale(d.directorate))
			.attr('height', d => yScale.rangeBand())
			.attr('width', d => xScale(d.fare))
			.attr('fill', d => '#af4c7e')
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

	bars.exit().remove();

	// draw text to the left of each bar representing the name
	var names = svg.selectAll('.bar-dir-name')
		.data(data);

	names.transition()
		.text(d => d.directorate);

	names.enter()
		.append('text')
			.attr('class', 'bar-dir-name')
			.attr('x', 0)
			.attr('y', d => yScale(d.directorate))
			.attr('dy', 17)
			.attr('dx', 5)
			.attr('fill', 'white')
			.text(d => d.directorate);

	names.exit().remove();

	// draw text to the right of each bar representing the rounded spending
	var fares = svg.selectAll('.bar-dir-fare')
		.data(data);

	fares.transition()
		.text(d => numeral(d.fare).format('0a'));

	fares.enter()
		.append('text')
			.attr('class', 'bar-dir-fare')
			.attr('x', width-35)
			.attr('y', d => yScale(d.directorate))
			.attr('dy', 17)
			.attr('dx', 5)
			.attr('fill', 'white')
			.text(d => numeral(d.fare).format('0a'));

	fares.exit().remove();
}