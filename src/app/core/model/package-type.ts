import BaseModel from './base-model';

class PackageType extends BaseModel {
  height?: number;
  id: number;
  index: string;
  length?: number;
  meta?: any;
  name: string;
  price: number;
  price_with_insurance?: number;
  unit?: string;
  weight?: number;
  width?: number;
}

export default PackageType;
