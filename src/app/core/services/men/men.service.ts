import { Injectable } from '@angular/core';
import Geography from "../../model/geograhy";
import {HttpClient} from "@angular/common/http";
import {AppService} from "../app/app.service";

@Injectable({
  providedIn: 'root'
})
export class MenService {

  constructor(
      private httpClient: HttpClient
  ) { }

    getGeographies(type: 'RGN' | 'DST' | 'CMN'): Promise<Geography[]> {
        const url = [AppService.API, 'geographies'].join('/');
        return this.httpClient.get<Geography[]>(url, { params: { type } }).toPromise();
    }
}
