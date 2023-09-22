import BusItinerary from './bus-itinerary';
import InvoiceGroup from './invoice-group';

class BusTrip {
  id: number;
  createdAt: string;
  company_id?: number;
  index?: string;
  fb_index?: string;
  itinerary_id?: number;
  departure?: string;
  departure_date?: string;
  departure_time?: string;
  category?: string;
  rank?: number;
  vehicle_id?: number;
  vehicle_type?: number;
  driver_id?: number;
  driver_assist_id?: number;
  has_checked_at?: boolean;
  has_left?: boolean;
  has_left_at?: string;
  out_of_service?: boolean;
  meta?: any;
  note?: string;
  manifest?: string;
  user_id?: number;
  audit?: any[];
  Company?: any;
  Driver?: any;
  DriverAssist?: any;
  Vehicle?: any;
  User?: any;
  InvoiceGroup?: InvoiceGroup;
  Itinerary?: BusItinerary;

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default BusTrip;
