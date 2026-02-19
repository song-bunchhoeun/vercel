import Link from 'next/link';

export default function Forbidden() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-semibold">Forbidden</h1>
            <p className="text-muted-foreground">
                {`You're signed in, but you don't have permission to view this`}
                page.
            </p>
            <Link href="/dashboard" className="underline">
                Back to dashboard
            </Link>
        </div>
    );
}
