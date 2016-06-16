/**
 * Main visualization module for creating charts and vis for passed data.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {spending} from './spending';
import {distribution} from './distribution';
import {topSpending} from './topSpending';
import {ticket} from './ticket';
import {destinations} from './destinations';

// array of objects representing spending
var data;

// panels for visualizations, including callable function and parameters to set them up
var panels = [
	{ id: 'vis-spending', fn: spending, args: [] },
	{ id: 'vis-distribution', fn: distribution, args: [] },
	{ id: 'vis-ticket-num', fn: ticket, args: ['length', '#d0725d'] },
	{ id: 'vis-ticket-avg', fn: ticket, args: ['fare', '#d2a24c'] },
	{ id: 'vis-top-sup', fn: topSpending, args: ['supplier', '#4b9226', 5, 130] },
	{ id: 'vis-top-dir', fn: topSpending, args: ['directorate', '#af4c7e', 5, 130] },
	{ id: 'vis-destinations', fn: destinations, args: [] },
	{ id: 'vis-top10-sup', fn: topSpending, args: ['supplier', '#4b9226', 10, 320] }	
	];

/**
 * Stores the given data into module's global variable.
 * Then detects what visualizations are possible to create and sets them up with defined parameters.
 *
 * @param {array} dataset array of objects
 */
export function visualize(dataset){	

	data = dataset;

	panels.forEach( panel => {
		if (document.getElementById(panel.id)) {
			// some visualizations return object, store it, so it is callable later
			panel.vis = panel.fn( data, panel.id, ...panel.args);
		}
	});
}

/**
 * Data is firstly filtered according to month and all other visualizations are then redrawn with updated data.
 * If nothing is passed, then the default data with all months are visualized.
 *
 * @param {string} month selected month which will be used for filtering data
 */
export function updatedSpending(month) {
	// data to be visualized - either filtered or default data with all months
	var dataset;
	
	if (month) {
		// redraw all panels with only given month data
		dataset = data.filter( d => d.month === month );
	} else {
		// redraw all panels with all months data
		dataset = data;
	}

	panels.forEach( panel => {
		// if the visualization has an object returned, call update on it with the new dataset
		if (panel.vis) {
			panel.vis.update(dataset);
		}
	});
}