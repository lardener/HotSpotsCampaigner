/**
 * User account and authentication structures.
 */

export interface UserAccount {
    __typename?: string;
    id: string;
    name: string;
    email: string;
    displayName: string | null;
    role: string;
}

export interface Profile {
    email: string;
    name: string;
}
