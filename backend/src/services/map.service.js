import axios from "axios";

export const searchPlacesService = async (query) => {
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
    {
      params: {
        access_token: process.env.MAPBOX_ACCESS_TOKEN,
        limit: 5,
      },
    },
  );

  return response.data.features;
};
export const getDistanceService = async (
  pickupLng,
  pickupLat,
  destinationLng,
  destinationLat,
) => {
  const response = await axios.get(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupLng},${pickupLat};${destinationLng},${destinationLat}`,
    {
      params: {
        access_token: process.env.MAPBOX_ACCESS_TOKEN,
        geometries: "geojson",
      },
    },
  );

  const route = response.data.routes[0];

  return {
    distance: route.distance / 1000,
    duration: route.duration / 60,
    geometry: route.geometry,
  };
};
