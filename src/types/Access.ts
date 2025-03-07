import {Company} from "./Company.ts";

export interface Access {
    id: string;
    company: Company;
    user: string;
    level: string;
    createdAt: string;
    updatedAt: string;
}
