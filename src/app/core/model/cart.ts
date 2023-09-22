import Room from './room';

export class Cart {
  public items: Room[] = new Array<Room>();
  public duration: number = 0;
  public grossTotal: number = 0;
  public itemsTotal: number = 0;
  public isReserved: boolean = false; // todo: check if being reset

  public updateFrom(src: Cart) {
    this.items = src.items;
    this.duration = src.duration;
    this.isReserved = src.isReserved;
    this.grossTotal = src.grossTotal;
    this.itemsTotal = src.itemsTotal;
  }
}

export default Cart;
