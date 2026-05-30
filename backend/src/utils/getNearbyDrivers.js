import { getDistance } from "geolib";
import { onlineDrivers } from "../sockets/onlineDrivers.js";

export const getNearbyDrivers = ({ lat, lng, vehicleType, radius = 5000 }) => {
  const nearbyDrivers = [];

  for (const [captainId, driver] of onlineDrivers) {
    if (driver.vehicleType !== vehicleType) {
      continue;
    }
    if (!driver.isAvailable) {
      continue;
    }
    console.log("NEARBY DRIVERS", nearbyDrivers);
    console.log("ONLINE DRIVERS", onlineDrivers);

    const distance = getDistance(
      {
        latitude: lat,
        longitude: lng,
      },
      {
        latitude: driver.lat,
        longitude: driver.lng,
      },
    );

    if (distance <= radius) {
      nearbyDrivers.push({
        captainId,
        socketId: driver.socketId,
      });
    }
  }

  return nearbyDrivers;
};
