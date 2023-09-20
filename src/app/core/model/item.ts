import {BaseModel} from "./base-model";

export class Item extends BaseModel {
    id?: number;
    category_id?: number;
    bill_id?: number;
    company_id?: number;
    name?: string;
    item_type?: string;
    type?: string;
    description?: string;
    sale_price?: number;
    purchase_price?: number;
    quantity?: number;
    initial_quantity?: number;
    tax_id?: number;
    sku?: string;
    enabled?: boolean;
    attachments?: any[];
    /*Taxes?: Tax[];*/
    variations?: any[];
    ItemManufacturer: any;
    Itinerary: any;
    item_manufacturer_id: number;
    mileage_threshold?: number;
    vehicle_part_category_id?: number;
    /*available?: ItemInventory; // for UI
    Inventories?: ItemInventory[];*/
}

export default Item;
export class ItemUnit extends BaseModel {
    id?: number;
    company_id?: number;
    name: string;
    description?: string;
    symbol?: string;
    meta?: {};
    enabled?: boolean;
    user_id?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    To?: Array<any>;
    From?: Array<any>;
}
