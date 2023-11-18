'use strict';

let map;
let service;
let infowindow;

// Google Mapsを初期化し、最初に表示する地図の設定を行う
// Google Maps JavaScript APIのスクリプトがロードされたときに自動的に呼び出される
function initMap() {
  const defaultPlace = new google.maps.LatLng(35.689501, 139.691722);
  infowindow = new google.maps.InfoWindow();  // div#map にGoogle Mapを挿入
  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultPlace,
    zoom: 15
  });  // 描画範囲
}

// textSearchを実行することでText SearchとPlace Detailsを行う
function doTextSearch (
  query = "SDGs 市ヶ谷 レストラン"
) {
  const request = {
    query: query,
    fields: ['place_id'],
    location: new google.maps.LatLng(35.689501, 139.691722),
    radius: "500"
  };

  const service = new google.maps.places.PlacesService(map);

  // Text Searchの実行
  service.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        console.log("results[", i, "]", results[i])
        getPlaceDetails(
          results[i].place_id,  // 結果からplace_idを取り出し
          function (itsPlace) {
            createMarker(itsPlace, (i === 0));
          }
        );
      }
    }
  });
}

// Place Detailsの実行
function getPlaceDetails(place_id = "", callback) {
  const request = {
    placeId: place_id,
    fields: ['types', 'name', 'icon', 'formatted_address', 'formatted_phone_number', 'business_status', 'opening_hours', 'url', 'website', 'geometry']
  };

  service = new google.maps.places.PlacesService(map);

  service.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK &&
      place &&
      place.geometry &&
      place.geometry.location
      ) {
      callback(place);
      createMarker(results[i],)
    }
  });
}

// Google Mapにピンをさす
function createMarker(place, doItCenter = false) {
  console.log("Markered place: ", place);

  infowindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);

  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
  });

  google.maps.event.addListener(marker, "mouseover", () => {
    const content = document.createElement("div");

    const nameElement = document.createElement("h3");
    nameElement.textContent = place.name;
    content.appendChild(placeIdElement);

    const placeAddressElement = document.createElement("p");
    placeAddressElement.textContent = place.formatted_address;
    content.appendChild(placeAddressElement);

    infowindow.setContent(content);
    infowindow.open(map, marker);
  });

  if (doItCenter = true) {map.setCenter(place.geometry.location)};
}