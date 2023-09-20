import {BaseModel} from "./base-model";
import  {Category} from "./category"

export class Requests extends BaseModel {
    id?: number;
    contact_id?: number;
    contact_name?: string;
    category_id?: number;
    trip_id?: number;
    category_name?: string;
    vehicle_id?: number;
    due_at?: string;
    facility_id: number;
    order_number?: string;
    requested_at: string;
    request_type_id?: number;
    reservation_id?: number;
    room_id?: number;
    staff_id: number;
    staff_name: string;
    status?: string;
    title?: string;
    type?: string;
    description?: string;
    event_start?: string;
    event_end?: string;
    is_event?: boolean;
    is_event_all_day?: boolean;
    comments?: string;
    created_at?: string;
    meta?: any;
    /*BusTrip: BusTrip;
    Invoice?:Invoice[];
    Contact?: Contact;
    Facility: any;
    Room?: Room;
    User?: User;
    Staff?: User;
    Staffs?: User[];
    Vehicle?: Vehicle;
    attachments: Array<any>;
    Category?: Category;
    Contacts: Contact[];
    Bills: Bill[];
    Invoices: Invoice[];
    RequestHistories: Array<RequestHistory>;
    RequestItems: Array<any>;
    RequestStatus: RequestStatus;
    RequestType: RequestType;
    HealthDiagnosticCodes?: HealthDiagnosticCodeNode[];
    RawCodes?: HealthDiagnosticCode[];*/
}

export class RequestStatus extends BaseModel {
    category_id: number;
    company_id: number;
    createdAt: string;
    deleted_at: string;
    description: string;
    meta: {
        shouldClearItems?: boolean
    };
    enabled: boolean;
    id: number;
    name: string;
    updatedAt: string;
    user_id: number;

    Category?: Category;
}
