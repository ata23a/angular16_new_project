import Contact from "./contact";

class BusStation {
  id: number;
  code: string;
  route: string;
  name: string;
  audit: any[];
  coordinates: any;
  contact_id: number;
  Contact: Contact;
  user_id: number;
  createdAt: string;
  updatedAt: string;
  deleted_at: string;
}

export default BusStation;
