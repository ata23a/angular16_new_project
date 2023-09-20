
import {BaseModel} from "./base-model";

export class Contact extends BaseModel {
    address?: string;
    attachments?: any[];
    bio_dob?: string | Date;
    bio_nationality?: string;
    bio_pob?: string;
    code?: string;
    company_id?: string;
    created_at?: string;
    currency_code?: string;
    deleted_at?: string;
    doc_cin?: string;
    doc_driver_license?: string;
    doc_other?: string;
    doc_passport?: string;
    email?: string;
    enabled?: boolean;
    id?: number;
    id_cin?: string;
    id_driver_license?: string;
    id_other?: string;
    id_passport?: string;
    is_business?: boolean;
    parent_id?: number;
    points_accumulated?: number;
    meta?: any;
    name?: string;
    note?: string;
    phone?: string;
    photo?: string;
    status?: string;
    verified?: boolean;

}
