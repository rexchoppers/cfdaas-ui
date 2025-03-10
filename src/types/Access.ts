import {Company} from "./Company.ts";
import {User} from "./User.ts";

export interface Access {
    id: string;
    company?: Company | string;
    user?: User | string;
    level: string;
    createdAt: string;
    updatedAt: string;
}
