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

var data;

/*
var panels = [
	{id: 'vis-spending', fn: spending, args: [data]}
	];
*/
var panels = [
	'vis-spending',
	'vis-distribution', 
	'vis-ticket-num', 
	'vis-ticket-avg', 
	'vis-top-sup',
	'vis-top-dir', 
	'vis-destinations',
	'vis-top10-sup'
	];

var sup;
var dir;

var price;
var num;

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
	var dataset;
	
	if (month) {
		// redraw all panels with only given month data
		dataset = data.filter( d => d.month === month );
	} else {
		// redraw all panels with all months data
		dataset = data;
	}

	sup.update(dataset);
	dir.update(dataset);
	num.update(dataset);
	price.update(dataset);
}


/**
 *
 */
function detectPanels(data) {
	panels.forEach( panel => {
		if (document.getElementById(panel)) {
			switch (panel) {
				case panels[0]:
					spending(data);
					break;

				case panels[1]:
					distribution(data);
					break;

				case panels[2]:
					num = ticket(data, 'length', panels[2], '#d0725d');
					break;

				case panels[3]:
					price = ticket(data, 'fare', panels[3], '#d2a24c');
					break;

				case panels[4]:
					sup = topSpending(data, 'supplier', panels[4], '#4b9226', 5, 130);
					break;

				case panels[5]:
					dir = topSpending(data, 'directorate', panels[5], '#af4c7e', 5, 130);
					break;

				case panels[6]:
					destinations(data);
					break;

				case panels[7]:
					sup = topSpending(data, 'supplier', panels[7], '#4b9226', 10, 320);
					break;

			}
		}		
	});
}