var beerApp = {};

beerApp.URL_ROOT = 'http://lcboapi.com/';
beerApp.key = "MDpjZTNkOTNiMC0yYTk0LTExZTUtYTg1My0xZjk3ZWIwMDRmNjI6WFVxeVJYRHFQam1ITGtha1hkOUtnYjRkWGRhZmJDRG5NRnJh";

beerApp.displayedBeerStyle;

beerApp.init = function(){
	beerApp.showBeerStyle();
	beerApp.selectBeerStyle();

	$('#start-container').on('click', function(){
		$('html body').animate({
			scrollTop: $('#beerChoice').offset().top
		}, 700);
	});

	// add popovers to types of beers
	$('.popover-container').popover({ trigger: "hover" });

	$('.arrowPrevious').on('click', function(){
		$('html body').animate({
			scrollTop: $('#beerChoice').offset().top
		}, 600);
	});


	// submitting the form
	$('#submitForm').on('submit', function(e) {
		e.preventDefault();
		console.log('getting results');

		// stop the user if they have not completed the form
		var choiceType = beerApp.getBeerType();
		var choiceStyle = beerApp.getBeerStyle();

		if ( !choiceStyle || !choiceType ) {
			$('.beer-list').css('border', '3px solid red');
			$('p.warning').text('Please select a style of beer!');
			console.log('alert works!');
			return false
		} else {

			setTimeout(function(){
				$('html body').animate({
					scrollTop: $('#searchResults').offset().top
				}, 700);
				$('#footerContent').removeClass('hide-section');
			},800);
		};

		beerApp.getResults();

		// clear results when user resubmits form
		$('#searchResults').empty();
		
	});

	$('#something').click(function() {
	    location.reload();
	});

	$('#searchRestart').click(function() {
	    location.reload();
		$('html body').scrollTop(0);
	});
};


// Get type of beer from user
beerApp.getBeerType = function() {
	var choiceBeerType = $('fieldset#beerChoice').find(':checked').val();
	console.log('get beer type', choiceBeerType);
	return choiceBeerType;
};


// Get style of beer from user 
beerApp.getBeerStyle = function() {
	var choiceBeerStyle = beerApp.displayedBeerStyle.find(':checked').val(); //!!!
	console.log('get beer style', choiceBeerStyle);
	return choiceBeerStyle;
};


beerApp.showBeerStyle = function() {
	$('input[name=beer-type]').on('click', function() {
		console.log($(this).val());

		var name = $(this).val();
		$('.beer-list').hide();
		$('.beer-list[data-name="' + name + '"]').show();

		var target = $('.beer-list[data-name="' + name + '"]');

		$('html body').animate({
			scrollTop: target.offset().top
		}, 700);

		beerApp.displayedBeerStyle = target;

	});
};

// shows search button when form is completed
beerApp.selectBeerStyle = function() {
	$('input[name=beer-style]').on('click', function (){
		console.log($(this).val());

		$('.search-container').html($('#searchButton'));

		$('#searchButton input').removeClass('hide');

		$('#searchResults').empty();
	});
}



// Get search results 
beerApp.getResults = function() {

	// LCBO API
	var selected = $('input[name="beer-style"]:checked').val();
	console.log(selected);

	$.ajax({
		url: 'http://lcboapi.com/products',
		type: 'GET',
		data: {
			q: selected,
			per_page: 20
		},
		dataType: 'jsonp',
		// see if API is hooked up properly
		success: function(data) {
			console.log(data);
			beerApp.displayResults(data.result)
		}
	});

	//  Brewery DB API
	// setup the url 
	var url = 'http://api.brewerydb.com/v2/beers?key=05fcac0856b3c8f2e36acc5c31f7b975&withBreweries=Y&name=' + selected;

	$.ajax({
		url: 'http://jsonp.afeld.me/?url=' + encodeURIComponent(url),
		type: 'GET',
		// see if API is hooked up properly
		success: function(data) {
			console.log("-----------");
			console.log(data);
			console.log("-----------");

			console.log(data);
			beerApp.displayBreweryDBResults(data.data)
		}
	});
};


// Display search results
beerApp.displayResults = function(result) {
	
	$.each(result, function(i, item){

		// style results items
		var beerTitle = $('<h3>').addClass('results-title').text(item.name);
		var beerProducer = $('<h4>').addClass('results-subtitle').text(item.producer_name);
		var beerOrigin = $('<h5>').addClass('results-subtitle').text(item.origin);

		var description = "";
		if (item.tasting_note) {
			description = item.tasting_note;
		}

		var beerNote = $('<h5>').addClass('results-subtitle').text(description);

		var beerImage = $('<img>').addClass('results-image').attr('src', item.image_thumb_url);

		// if there's no image available
		var image = "";
		if (item.image_thumb_url){
			image = item.image_thumb_url;
		} else {
			$('.results-image').addClass('no-image');
			console.log('image works');
		}


		var beerURL = $('<a>').attr({'href':''});

		//put items in containers
		var resultsImageContainer = $('<div>').addClass('col-md-4 col-sm-4 results-image-container').append(beerImage);
		var resultsTextContainer = $('<div>').addClass('col-md-8 col-sm-8 results-text-container').append(beerTitle, beerProducer, beerOrigin, beerNote);

		// put all results items in one container 
		var resultsContainer = $('<div>').addClass('row results-container').append(resultsImageContainer, resultsTextContainer);

		// append results into DIV
		$('#searchResults').append(resultsContainer);

	});
};


// Display Brewery DB search results
beerApp.displayBreweryDBResults = function(result) {
	
	$.each(result, function(i, item){

		// style results items
		var beerBreweryTitle = $('<h3>').addClass('results-title').text(item.breweries[0].name + ' ' + item.name);

		// var beerBreweryProducer = $('<h4>').addClass('results-subtitle').text(item.producer_name);
		var beerBreweryOrigin = $('<h5>').addClass('results-subtitle').text(item.breweries[0].locations[0].country.displayName);
		var beerBreweryDescription = $('<h5>').addClass('results-subtitle').text(item.description);

		// if there's no image available
		var image = "";
		if (item.labels){
			image = item.labels.medium;
		} else {
			$('.results-image').addClass('no-image');
			console.log('image works');
		}

		var beerBreweryImage = $('<img>').addClass('results-image').attr('src', image);

		console.log(item);

		// add link to product
		var beerBreweryURL = $('<a>').attr({'href':''});

		//put items in containers
		var resultsBreweryImageContainer = $('<div>').addClass('col-md-4 col-sm-4 results-image-container').append(beerBreweryImage);
		var resultsBreweryTextContainer = $('<div>').addClass('col-md-8 col-sm-8 results-text-container').append(beerBreweryTitle, beerBreweryOrigin, beerBreweryDescription);

		// put all results items in one container 
		var resultsBreweryContainer = $('<div>').addClass('row results-container').append(resultsBreweryImageContainer, resultsBreweryTextContainer);

		// append results into DIV
		$('#searchResults').append(resultsBreweryContainer).css('padding-top','60px');
	});
};

$(function(){
  	beerApp.init();
});

