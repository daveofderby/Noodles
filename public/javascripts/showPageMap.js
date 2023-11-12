mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: noodles.geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
});

new mapboxgl.Marker()
  .setLngLat(noodles.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ closeOnClick: true, closeButton: false }).setHTML(
      `<h4>${noodles.title}</h4><span>${noodles.location}</span>`
    )
  )
  .addTo(map);
