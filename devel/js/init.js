/**
 * Initialization of all modules 
 *
 * @author lucyia <ping@lucyia.com>
 * @version 0.1
 */

import {visualize} from './visualize';

(function ready(fn) {
	if (document.readyState !== 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
})(init);

/**
 * Initializes reading of file and then visualization process.
 */
function init(){

	// setup numeral for correct number formatting
	numeral.language('en-gb');

	// parse file
	d3.csv('Home_Office_Air_Travel_Data_2011.csv')
		.row( d => { 
			return { 
				departure: d.Departure, 
				destination: d.Destination, 
				directorate: d.Directorate, 
				month: d.Departure_2011, 
				fare: parseFloat(d.Paid_fare), 
				ticket: d.Ticket_class_description, 
				supplier: d.Supplier_name 
			};
		})
		.get( (error, data) => {
			if (error) console.log(error)
			
			visualize(data);
		});
}