export default function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
return <input type="checkbox" className="h-4 w-4 rounded border-gray-300" {...props} />;
}