import Link from "next/link";

export default function ShopNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Store Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          The store you are looking for does not exist or is currently unavailable.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Learn more about NexiaCore
        </Link>
      </div>
    </main>
  );
}