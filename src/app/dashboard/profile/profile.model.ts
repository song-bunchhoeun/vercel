export interface Profile {
    id: string;
    username: string;
    createdDate: Date;
    status: 'Active' | 'Inactive';
    role: 'Admin' | 'User';
    phoneNumber: string;
    // assignedWareHouse: Warehouse;
    assignedWareHouse: string;
}
