import Link from 'next/link';
import CustomerForm from '@/components/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/customers"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block"
          >
            ← Back to Customers
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-4">
            Add New Customer
          </h1>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-8">
          <CustomerForm />
        </div>
      </div>
    </div>
  );
}
