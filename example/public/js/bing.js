var map,
	pushpins = new Array(),
	points = new Array(),
	mePoint,
	pinInfoBox,
	infoboxLayer = new Microsoft.Maps.EntityCollection(),
  	pinLayer = new Microsoft.Maps.EntityCollection(),
  	apiKey = "AtUOsaZe-KKbqvGH-B_-705DptUb1EkqcGS5ERadgYyHI-aTssLs4iMM6zlhQt0e",
  	firstMove = true,
	infoShow = false;

function addBingLocation(map, lat, lon, index, profileUrl, className, name, address, image) {
	var point = new Microsoft.Maps.Location(lat, lon);
	var pushpin = {
		width: 35,
		height: 34,
		typeName: className + 'Pin',


		zIndex: 100
	};

	if (className != 'me') {
		pushpin.anchor = new Microsoft.Maps.Point(35, 34);
	} else {
		pushpin.anchor = new Microsoft.Maps.Point(17, 17);
	}

	if (image) {
		pushpin.icon = image;
	}

	var pin = new Microsoft.Maps.Pushpin(point, pushpin);
	pin.url = profileUrl;
	pin.Title = name;
	pin.Description = address;
      pin.Class = className;

      if (className != 'me' && name != null && address != null) {
      	Microsoft.Maps.Events.addHandler(pin, 'click', displayInfobox);
	}

				map.entities.push(pin);
		pushpins.push(pin);


	// Don't account the my position to show the map
	if (className != 'me' && className.substr(0, 3) != 'msp' ) {
		points.push(point);
	} else if (className == 'me') {
		mePoint = point;
	}

	return pin;
}

function pinClick(e) {
	detailClick(e.target.url);
}

function detailClick(url) {
	window.location = url;
}

function initMap() {
	 // Create the info box for the
      pinInfobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), { visible: false, zIndex:101, showPointer: true });
	infoboxLayer.push(pinInfobox);

	map = new Microsoft.Maps.Map(document.getElementById('tabmap'), {
		credentials: apiKey,
		mapTypeId: Microsoft.Maps.MapTypeId.road,
		showMapTypeSelector: false,
		showDashboard: true,
		showScalebar: false,
		showCopyright: false,
		disableUserInput: false,
		enableSearchLogo: false,
		enableClickableLogo: false
	});

	map.entities.push(infoboxLayer);

	// "map" is our Bing Maps object, overload the built-in getZoomRange function
      // to set our own min/max zoom
      map.getZoomRange = function ()
      {
        return {
          max:      17,
          min:      5
        };
      };

	Microsoft.Maps.Events.addHandler(map, 'viewchangeend', mapMoved);
	Microsoft.Maps.Events.addHandler(map, 'viewchangestart', mapStartMove);

	if (points.length == 1) {
		map.setView({ zoom: 15});
	}

	updateMapSize();
}

function loadPins(container, recenter) {
	map.entities.clear();
	pushpins = new Array();
	points = new Array();
	hideInfobox();

	map.entities.push(infoboxLayer);

	if (container == undefined) {
		container = '.listing div:first';
	}

	$(container + ' .list').each(function(index, item) {
			var self = $(item);
         				addBingLocation(map, self.attr('data-lat'), self.attr('data-lng'), index, self.attr('href'), self.attr('data-class'), self.children('h1').html(), self.children('p').html(), self.children('img').attr('src'));
			 		});

		if (recenter == undefined || recenter) {
 		map.setView({ bounds: Microsoft.Maps.LocationRect.fromLocations(points) });
 		firstMove = true;
		}
}

function displayInfobox(e) {
	var content = '<div class="infoWindow" onclick="detailClick(\'' + e.target.url + '\')"><div';

	if (e.target.Class != 'empty') {
		content += ' class="icon ' + e.target.Class + '"';
	}

	content += '><h1>' + e.target.Title + '</h1><p>' + e.target.Description + '</p></div></div>';

      pinInfobox.setOptions({
		visible: true,
		offset: new Microsoft.Maps.Point(-150,48),
		htmlContent: content
	});

      pinInfobox.setLocation(e.target.getLocation());
      pinInfobox.url = e.target.url;

      // Make sure we can click on the infobox
      $('.infoWindow').parent().parent().parent().parent().css('pointerEvents', '').css('zIndex', '200');

      infoShow = true;
	positionInfobox();
  }

  function positionInfobox() {
  	//A buffer limit to use to specify the infobox must be away from the edges of the map.
	var buffer = 25;

	var infoboxOffset = pinInfobox.getOffset(),
		infoboxAnchor = pinInfobox.getAnchor(),
		infoboxLocation = map.tryLocationToPixel(pinInfobox.getLocation(), Microsoft.Maps.PixelReference.control);

	var dx = infoboxLocation.x + infoboxOffset.x - infoboxAnchor.x,
		dy = infoboxLocation.y - 25 - infoboxAnchor.y;

	if (dy < buffer * 3) {    //Infobox overlaps with top of map.
	  //Offset in opposite direction.
	  dy *= -1;

	  //add buffer from the top edge of the map.
	  dy += buffer * 3;
	} else {
	  //If dy is greater than zero than it does not overlap.
	  dy = 0;
	}

	if (dx < buffer) {    //Check to see if overlapping with left side of map.
	  //Offset in opposite direction.
	  dx *= -1;

	  //add a buffer from the left edge of the map.
	  dx += buffer;
	} else {              //Check to see if overlapping with right side of map.
	  dx = map.getWidth() - infoboxLocation.x + infoboxAnchor.x - pinInfobox.getWidth() - infoboxOffset.x;

	  //If dx is greater than zero then it does not overlap.
	  if (dx > buffer) {
	      dx = 0;
	  } else {
	      //add a buffer from the right edge of the map.
	      dx -= buffer;
	  }
	}

	//Adjust the map so infobox is in view
	if (dx != 0 || dy != 0) {
		map.setView({ centerOffset: new Microsoft.Maps.Point(dx, dy), center: map.getCenter() });
	}
  }

  function hideInfobox(e) {
      pinInfobox.setOptions({ visible: false });
  }

  function mapStartMove(e) {
      restrictZoom();

  	if (!infoShow) {
		hideInfobox(e);
	}

	infoShow = false;
  }

  function mapMoved(e) {
	if (!firstMove) {

		var url = "/business/map/pizza/cZ/";
		url = url.replace('cZ', map.getCenter().latitude + ',' + map.getCenter().longitude);

		$('.searchHere').show().find('a').attr('href', url);
	}

	firstMove = false;
}

function updateMapSize() {
	var mapHeight = window.innerHeight;
		mapWidth = $("body > header").outerWidth(),
		alertbox = $(".alert:visible");


	if (mapHeight == undefined) {
		mapHeight = document.documentElement.clientHeight;
	}

	if ($("body > header").is(':visible')) {
  		mapHeight -= $("body > header").outerHeight();
	} else {
  		mapWidth = $("body").outerWidth();
	}


	if (alertbox.length > 0) {
		mapHeight -= alertbox.outerHeight(true);
	}

				mapHeight -= $(".tabsSearch").outerHeight(true);

	map.setView({ height: mapHeight, width: mapWidth});
}

function askFrom(e) {
	$('#listing').click();
	$('.itinerary_from').show().find('.from').focus();
}

function directionsModuleLoaded() {
	// Initialize the DirectionsManager
	var directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);

	if (mePoint != undefined) {
		directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: mePoint }));
	} else if ($('.from').val() != "") {
		directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ address: $('.from').val() }));
	} else {
		askFrom();
		return;
	}

	$.each(points, function (index, item) {
		directionsManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint({ location: item }));
	});

	// Set the id of the div to use to display the directions
	directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('itinerary') });

	// Specify a handler for when an error occurs
	Microsoft.Maps.Events.addHandler(directionsManager, 'directionsError', askFrom);

	// Calculate directions, which displays a route on the map
	directionsManager.calculateDirections();
}


  // Forcibly set the zoom to our min/max whenever the view starts to change beyond them
  var restrictZoom = function ()
  {
    if (map.getZoom() <= map.getZoomRange().min)
    {
      map.setView({
        'zoom':       map.getZoomRange().min,
        'animate':    false
      });
    }
    else if (map.getZoom() >= map.getZoomRange().max)
    {
      map.setView({
        'zoom':       map.getZoomRange().max,
        'animate':    false
      });
    }
  };


$(document).ready(function() {
  if (!$('body').hasClass('searchPage')) return;

	initMap();
	loadPins();

	map.setView({ zoom: 15});
	map.setView({ bounds: Microsoft.Maps.LocationRect.fromLocations(points) });

	onOrientationChange(updateMapSize);
});