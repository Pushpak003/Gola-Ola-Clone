export const calculateFare = (distance) => {
  const fares = {
    BIKE: 40 + distance * 8,
    AUTO: 60 + distance * 10,
    MINI: 80 + distance * 15,
    SEDAN: 120 + distance * 20,
    SUV: 180 + distance * 28,
  };

  return fares;
};
