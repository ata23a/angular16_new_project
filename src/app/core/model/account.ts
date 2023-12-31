import BaseModel from './base-model';
import Contact from './contact';
import Vehicle from './vehicle';

class Account extends BaseModel {
  bank_address?: string;
  bank_name?: string;
  bank_phone?: string;
  card_balance?: number;
  card_uid?: string;
  company_id?: number;
  contact_id?: number;
  created_at?: string;
  currency?: string;
  currency_code?: string;
  default?: boolean;
  enabled?: boolean;
  id?: number;
  name?: string;
  number?: string;
  opening_balance?: number;
  vehicle_id?: number;
  Contact?: Contact;
  Vehicle?: Vehicle;
}

export default Account;
