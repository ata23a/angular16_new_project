class BusItinerary {
  id: number;
  price: number;
  departure_station_id: number;
  arrival_station_id: number;
  category: string;
  distance: null;
  duration: null;
  user_id: number;
  createdAt: string;
  updatedAt: string;
  deleted_at: string;
  DepartureStation: any;
  ArrivalStation: any;

  meta: {
    PackageConfig?: any;
    TripConfig?: any;
  };

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default BusItinerary;
