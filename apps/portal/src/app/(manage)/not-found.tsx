import Link from "next/link";

export default function ManageNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-display">Not found</h1>
      <p className="text-muted-foreground">This settings page doesn’t exist.</p>
      <Link
        href="/manage/profile"
        className="rounded-control bg-primary px-4 py-2 text-primary-foreground hover:bg-primary-hover"
      >
        Back to profile
      </Link>
    </div>
  );
}
