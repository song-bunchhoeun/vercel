import BaseFormLayout from '@/components/BaseForm/BaseFormLayout';
import { ReactNode } from 'react';

const ZoneLayout = ({ children }: { children: ReactNode }) => {
    return <BaseFormLayout className="px-4">{children}</BaseFormLayout>;
};

export default ZoneLayout;
