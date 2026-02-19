'use client';

import BaseFormLayout from '@/components/BaseForm/BaseFormLayout';
import React, { ReactNode } from 'react';

const UserFormLayout = ({ children }: { children: ReactNode }) => {
    return <BaseFormLayout>{children}</BaseFormLayout>;
};

export default UserFormLayout;
