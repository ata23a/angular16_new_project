import BaseModel from "./base-model";
import Item from "./item";

class VehicleTracker extends BaseModel{
    id?: number;
    item_id?: number;
    mileage?: number;
    vehicle_part_category_id?: number;
    Item?:Item;
}

export default VehicleTracker ;