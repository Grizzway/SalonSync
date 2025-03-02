import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl">Register</h1>
      <p>Choose your registration type:</p>
      <div className="flex flex-col space-y-2">
        <Link href="/register/customer" className="bg-blue-500 text-white px-4 py-2 rounded">
          Register as Customer
        </Link>
        <Link href="/register/business" className="bg-green-500 text-white px-4 py-2 rounded">
          Register as Business
        </Link>
      </div>
    </div>
  );
}
