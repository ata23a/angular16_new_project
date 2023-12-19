import {Component, OnInit} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatRippleModule} from "@angular/material/core";
import _orderBy from "lodash/orderBy";
import {RoleService} from "../../../../core/services/role/role.service";
import Role from "../../../../core/model/role";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSortModule} from "@angular/material/sort";
import {DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
const ELEMENT_DATA = [
    {name: 'Hydrogen'},
    {name: 'Helium'},
    {name: 'Lithium'},
    {name: 'Beryllium'},
    {name: 'Boron'},
    {name: 'Carbon'},
    {name: 'Nitrogen'},
    {name: 'Oxygen'},
    {name: 'Fluorine'},
    {name: 'Neon'},
];
@Component({
    selector: 'app-role',
    standalone: true,
    templateUrl: './role.component.html',
    imports: [
        MatTableModule,
        MatRippleModule,
        MatButtonModule,
        MatIconModule,
        MatSortModule,
        DatePipe,
        RouterLink
    ],
    styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit{
    displayedColumns: string[] = ['Id','Name','Label','Description','actions'];
    dataSource = ELEMENT_DATA;
    roles: Role[]

    constructor(
        private roleService: RoleService
    ) {
    }
    ngOnInit(): void {
        this.fetchRoles()
    }

    private fetchRoles() {
        this.roleService.list()
            .toPromise()
            .then(roles => this.roles = _orderBy(roles, ['id'], ['asc']))
            .catch(err =>{
                console.log(err)
            });
    }

}
