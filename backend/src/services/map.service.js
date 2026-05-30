import axios from "axios";
import { getDistance } from "geolib";

export const searchPlacesService = async (query, userLat, userLng) => {
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json`,
    {
      params: {
        access_token: process.env.MAPBOX_ACCESS_TOKEN,

        limit: 10,

        country: "in",

        proximity: `${userLng},${userLat}`,
      },
    },
  );

  const features = response.data.features || [];

  // Agar user location available nahi hai
  if (userLat == null || userLng == null) {
    return features;
  }

  // Sirf 80 KM radius ke results
  const filteredPlaces = features.filter((place) => {
    if (!place.center || place.center.length < 2) {
      return false;
    }

    const distance = getDistance(
      {
        latitude: userLat,
        longitude: userLng,
      },
      {
        latitude: place.center[1],
        longitude: place.center[0],
      },
    );

    return distance <= 80000;
  });

  return filteredPlaces;
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

  const route = response.data.routes?.[0];

  if (!route) {
    throw new Error("Route not found");
  }

  return {
    distance: route.distance / 1000,

    duration: route.duration / 60,

    geometry: route.geometry,
  };
};
