export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
return (
<input
className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
{...props}
/>
);
}