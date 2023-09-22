import VehiclePartCategory from "./vehicle-part-category";

export default class VehiclePartCategoryNode extends VehiclePartCategory{
    visible?: boolean = true;
    isSelected?: boolean = false;
    isLeaf?: boolean = true;
    inDanger?: boolean = false;
    ChildCategory?:VehiclePartCategoryNode[];
    ParentChain?:VehiclePartCategoryNode[];
}