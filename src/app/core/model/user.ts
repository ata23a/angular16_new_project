import {BaseModel} from "./base-model";

class User extends BaseModel {
    id?: number;
    code?: string;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
    enabled?: boolean;
    last_logged_in_at?: string;
    /*Companies?: Company[];
    Geographies?: Geography[];
    Profile?: UserProfile;
    Roles?: Role[];*/
}
