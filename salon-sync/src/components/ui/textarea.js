export function Textarea({ className, ...props }) {
    return (
      <textarea
        className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${className}`}
        {...props}
      />
    );
  }
  