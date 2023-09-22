import BaseModel from './base-model';

export default class Vendor extends BaseModel {
  is_business: boolean;
  verified: boolean;
  attachments: Array<any>;
  audit: Array<any>;
  id: number;
  name: string;
  currency_code: string;
  company_id: number;
  user_id: number;
  updated_at: Date;
  created_at: Date;
  email: string;
  tax_number: string;
  phone: number;
  address: string;
  website: string;
  enabled: boolean;
  deleted_at: Date;
  reference: string;
  contact_id: number;
  note: string;
  meta: string;
}
