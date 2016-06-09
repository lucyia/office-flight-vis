(function() {

	var dataset;

	d3.csv('Home_Office_Air_Travel_Data_2011.csv', function(error, data) {
		if (error) { console.log(error); }
		
		dataset = data;

		dataExtents(dataset);
	});

	function dataExtents(data) {
		console.log(data)

		var directorates = [...new Set(data.map( d => d.Directorate ))];
		console.log('Directorates: ', directorates.length, directorates);
		// 26 unique values
		// string; e.g. "CRB", "Strategy & Reform Directorate", "Strategic Director Border"

		var suppliers = [...new Set(data.map( d => d.Supplier_name ))];
		console.log('Suppliers: ', suppliers.length, suppliers);
		// 55 unique values
		// string upper case; e.g. "FLYBE BRITISH EUROPEAN", "EASYJET", "BRITISH AIRWAYS"

		var fares = [...new Set(data.map( d => parseFloat(d.Paid_fare) ))];
		console.log('Fares: ', fares.length, '['+Math.min(...fares)+', '+Math.max(...fares)+']', fares);
		// 2898 unique values
		// float - two decimals; e.g. 78.91, 59
		// min - 0
		// max - 5395.63

		var departures = [...new Set(data.map( d => d.Departure ))];
		console.log('Departures: ', departures.length, departures);		
		// 3 unique values
		// string; "UK", "Non EEA", "EEA"

		var destinations = [...new Set(data.map( d => d.Destination ))];
		console.log('Destinations: ', destinations.length, destinations);		
		// 3 unique values
		// string; "UK", "Non EEA", "EEA"
		
		var tickets = [...new Set(data.map( d => d.Ticket_class_description ))];
		console.log('Tickets: ', tickets.length, tickets);		
		// 3 unique values
		// string; "Economy", "Business Class", "Premium Economy"

		var months = [...new Set(data.map( d => d.Departure_2011 ))];
		console.log('Months: ', months.length, months);
		// 12 unique values
		// string; "February", "January", "March", "April", "September", "May", "June", "November", "July", "August", "December", "October"	
		
	}

})();