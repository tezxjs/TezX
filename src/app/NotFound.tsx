import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center h-screen bg-base-100">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-extrabold">404 - Page Not Found</h1>
        <p className="mt-4 text-lg">
          Oops! The page you are looking for does not exist or may have been
          moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-blue-600 underline hover:text-blue-800"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
