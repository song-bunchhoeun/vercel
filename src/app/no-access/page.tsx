import Link from 'next/link';

export default function Unauthorized() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-semibold">Unauthorized</h1>
            <p className="text-muted-foreground">
                You don’t have access. Please sign in again.
            </p>
            <Link href="/login" className="underline">
                Go to login
            </Link>
        </div>
    );
}
