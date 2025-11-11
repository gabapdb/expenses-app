import Card from "./ui/Card";


export default function ProjectInfoCard(props: {
name: string;
team: string;
projectCost: number;
developer: string;
city: string;
startDate: string;
endDate: string;
projectSize: string;
}) {
return (
<Card>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<Field label="Project Name" value={props.name} />
<Field label="Team" value={props.team} />
<Field label="Project Cost" value={`₱${props.projectCost.toLocaleString()}`} />
<Field label="Developer" value={props.developer} />
<Field label="City" value={props.city} />
<Field label="Start Date" value={new Date(props.startDate).toLocaleDateString()} />
<Field label="End Date" value={new Date(props.endDate).toLocaleDateString()} />
<Field label="Project Size" value={props.projectSize} />
</div>
</Card>
);
}


function Field({ label, value }: { label: string; value: string }) {
return (
<div>
<div className="text-xs text-gray-500">{label}</div>
<div className="font-medium text-gray-900">{value}</div>
</div>
);
}