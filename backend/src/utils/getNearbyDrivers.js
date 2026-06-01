
import { onlineDrivers } from "../sockets/onlineDrivers.js";

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
export const getNearbyDrivers = ({ lat, lng, vehicleType, radius = 5000 }) => {
  const nearbyDrivers = [];

    console.log("User location:", lat, lng);
  console.log("Vehicle type needed:", vehicleType);
  console.log("Total online drivers:", onlineDrivers.size);

  for (const [captainId, driver] of onlineDrivers) {
     if (driver.vehicleType !== vehicleType) continue;
    if (!driver.isAvailable) continue;
    if (!driver.lat || !driver.lng) continue;
     const distance = haversineDistance(lat, lng, driver.lat, driver.lng);
    console.log("Distance to driver:", distance, "meters");

    if (distance <= radius) {
      nearbyDrivers.push({ captainId, socketId: driver.socketId });
    }
  }

  console.log("Nearby drivers found:", nearbyDrivers.length);
  return nearbyDrivers;
};
