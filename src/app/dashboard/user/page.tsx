import { Suspense } from 'react';
import { UserList } from './UserList';

export default function UserListPage() {
    return (
        <Suspense>
            <UserList />
        </Suspense>
    );
}
