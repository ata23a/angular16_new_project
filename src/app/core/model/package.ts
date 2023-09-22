import BusTrip from './bus-trip';
import Company from './company';
import Contact from './contact';
import Invoice from './invoice';
import PackageType from './package-type';
import User from './user';

export interface PackageMeta {
  amount_discount: number;
  amount_insurance: number;
  amount_pickup?: number;
  amount_handling?: number;
  discount_rate: number;
  parent_id?: number;
  shipping_address: string;
  stopover: any;
}

class Package {
  amount: number;
  created_at: string;
  description: string;
  estimated_value: number;
  height: number;
  id: number;
  is_on_credit: boolean;
  meta: PackageMeta;
  notes: string;
  trip_id: number;
  type_id: number;
  rank: number;
  recipient_id: number;
  sender_id: number;
  status: any;
  storage_type: string;
  volume: number;
  weight: number;
  width: number;
  Itinerary: any;
  DepartureStation: any;
  ArrivalStation: any;
  PackageHistories: any[];
  BusTrip: BusTrip;
  Company: Company;
  Invoice: Invoice;
  PackageType: PackageType;
  Sender: Contact;
  Recipient: Contact;
  User: User;

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default Package;
