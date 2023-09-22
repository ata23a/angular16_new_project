import Invoice from './invoice';
import Contact from './contact';
import User from './user';
import BusSeat from './bus-seat';
import BusTrip from './bus-trip';

class BusReservation {
  id?: number;
  company_id?: number;
  notes?: string;
  has_checked_in?: boolean;
  channel?: string;
  mizotra_ticket_id?: number;
  status?: string;
  trip_id?: number;
  invoice_id?: number;
  contact_id?: number;
  contact_name?: string;
  mpgw_tokenid?: string;
  notif_token?: string;
  pay_token?: string;
  user_id?: number;
  created_at?: string;
  audit?: any[];
  Luggage?: Array<BusLuggage>;
  BusTrip: BusTrip;
  Company?: any;
  Contact: Contact;
  Invoice: Invoice;
  Seats: BusSeat[];
  User: User;
  Vehicle: any;
  Itinerary: any;

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default BusReservation;

export interface BusLuggage {
  description: string;
  id?: number;
  price?: number;
  quantity: number;
  storage: 'RACK' | 'HOLD' | 'OTHER';
  type: string;
}
