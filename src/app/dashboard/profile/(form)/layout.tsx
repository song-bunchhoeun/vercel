import BaseFormLayout from '@/components/BaseForm/BaseFormLayout';
import { ReactNode } from 'react';

const ProfileLayout = ({ children }: { children: ReactNode }) => {
    return <BaseFormLayout>{children}</BaseFormLayout>;
};

export default ProfileLayout;
