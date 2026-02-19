import BaseFormLayout from '@/components/BaseForm/BaseFormLayout';
import { ReactNode } from 'react';

const WarehouseLayout = ({ children }: { children: ReactNode }) => {
    return <BaseFormLayout>{children}</BaseFormLayout>;
};

export default WarehouseLayout;
