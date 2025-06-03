export type OrganizationType = {
    id: string;
    name: string;
    location: string;
    employees: {
      id: string;
      name: string;
      position: string;
    }[];
}