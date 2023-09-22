import Account from './account';
import BaseModel from './base-model';
import VehiclePartCategory from "./vehicle-part-category";

class Vehicle extends BaseModel{
  brand?: string;
  category?: string;
  company?: string;
  class?: string;
  engine_type?: number;
  enabled?: boolean;
  id?: number;
  license_plate?: string;
  model?: string;
  note?: string;
  seat_count?: number;
  service_tag?: string;
  vin?: string;
  year?: number;
  created_at?: string;
  deleted_at?: null;
  updated_at?: string;
  checked_at?: string;
  Owner: any;
  attachments: any[];
  audit?: any[];
  meta?: {
    insurance?: string;
    license?: string;
    note?: string,
    patente?: string,
    cargo_capacity?: number,
    rfid_tag?: string,
    card_num?: string,
    wifi_sim_num?: string,
    wifi_sim_imei?: string,
    wifi_code?: string,
    qrcode?: string,
    technical_visit?: string;
    trunk_volume?: number,
    fuel_tank_capacity?: number,
    is_out_for_repair: boolean
  };
  Account?: Account;
  VehiclePartCategories?: VehiclePartCategory[];
}

export default Vehicle;
