/**
 * Main visualization module for creating charts and vis for passed data.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {spending} from './spending';
import {distribution} from './distribution';
import {topSpending, updateTopDir} from './topSpending';

var data;
var panels = ['vis-spending', 'vis-distribution', 'vis-top-dir', 'vis-top-sup'];

var sup;
var dir;

/**
 *
 *
 * @param {array} dataset array of objects for visualization
 */
export function visualize(dataset){	
	data = dataset;

	detectPanels(data);
}

/**
 * Data is firstly filtered according to month and all other visualizations are then redrawn with updated data.
 *
 * @param {string} month selected month which will be used for filtering data
 */
export function updatedSpending(month) {
	if (month) {
		// redraw all panels with only given month data
		var dataset = data.filter( d => d.month === month );
		sup.update(dataset);
		dir.update(dataset);
	} else {
		// redraw all panels with all months data
		sup.update(data);
		dir.update(data);
	}
}


/**
 *
 */
function detectPanels(data) {
	panels.forEach( panel => {
		if (document.getElementById(panel)) {
			switch (panel) {
				case 'vis-spending':
					spending(data);
					break;
				case 'vis-distribution':
					distribution(data);
					break;
				case 'vis-avg-month':
					avgMonth(data);
					break;
				case 'vis-avg-price':
					avgPrice(data);
					break;
				case 'vis-top-sup':					
					sup = topSpending(data, 'supplier', 'vis-top-sup', '#4b9226');
					break;
				case 'vis-top-dir':
					dir = topSpending(data, 'directorate', 'vis-top-dir', '#af4c7e');
					break;
			}
		}		
	});
}