/**
 * Main visualization module for creating charts and vis for passed data.
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {spending} from './spending';

var data;
var panels = ['vis-spending', 'vis-distribution'];

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
	} else {
		// redraw all panels with all months data
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
			}
		}		
	});
}