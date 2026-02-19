'use client';

interface FormSectionProps {
    title: string | React.ReactNode;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function FormSection({
    title,
    subtitle,
    icon,
    children
}: FormSectionProps) {
    return (
        <section className="grid grid-cols-12 gap-8 py-6">
            <div className="col-span-12 md:col-span-3">
                <div className="flex items-center gap-1.5">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {icon}
                </div>
                {subtitle && (
                    <p className="text-sm text-secondary-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="col-span-12 md:col-span-9 space-y-4">
                {children}
            </div>
        </section>
    );
}
