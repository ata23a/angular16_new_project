import BusSeat from './bus-seat';

export class BusCart {
  public items: BusSeat[] = [];
  public duration: number = 0;
  public grossTotal: number = 0;
  public itemsTotal: number = 0;
  public isReserved: boolean = false; // todo: check if being reset

  public updateFrom(src: BusCart) {
    this.items = src.items;
    this.duration = src.duration;
    this.isReserved = src.isReserved;
    this.grossTotal = src.grossTotal;
    this.itemsTotal = src.itemsTotal;
  }
}

export default BusCart;
