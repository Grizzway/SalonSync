import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white px-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-200">
          Register
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose your registration type:
        </p>
        <div className="mt-6 space-y-4">
          <Link
            href="/register/customer"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Register as Customer
          </Link>
          <Link
            href="/register/business"
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Register as Business
          </Link>
        </div>
      </div>
    </div>
  );
}
