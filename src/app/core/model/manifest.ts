import BusItinerary from './bus-itinerary';
import BusReservation from './bus-reservation';
import Package from './package';
import User from './user';
import Vehicle from './vehicle';

class Manifest {
  audit: any[];
  created_at: any;
  deleted_at: any;
  departure_date: string;
  departure_time: string;
  manifest: any;
  package_count?: number;
  passengerCount?: number;
  rank: number;
  trip_id?: number;
  vehicle_type: string;
  BusReservations: BusReservation[];
  Driver: User;
  DriverAssist: User;
  Itinerary: BusItinerary;
  Packages: Package[];
  User: User;
  Vehicle: Vehicle;

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default Manifest;
