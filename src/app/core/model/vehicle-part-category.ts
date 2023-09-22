import BaseModel from "./base-model";
import VehicleTracker from "./vehicle-tracker";

class VehiclePartCategory extends BaseModel{
    id?: number;
    code: string;
    company_id: number;
    title: string;
    description?: string;
    type?: string;
    attachements?: any[];
    mileage_threshold?: number;
    parent_id?: number;
    enabled?: boolean;
    is_placeholder?: boolean;
    ParentCategory?:VehiclePartCategory;
    VehiclePartTracker?:VehicleTracker;
}

export default VehiclePartCategory ;