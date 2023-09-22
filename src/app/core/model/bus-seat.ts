import BusTrip from './bus-trip';

class BusSeat {
  audit?: any[];
  company_id?: number;
  contact_id?: number;
  id?: string;
  invoice_item_id: number;
  label?: number;
  meta?: string;
  price?: number;
  reservation_id?: number;
  status?: number;
  trip?: BusTrip;

  constructor(args = {}) {
    for (const key of Object.keys(args)) {
      this[key] = (args[key] === '') ? null : args[key];
    }
  }
}

export default BusSeat;
