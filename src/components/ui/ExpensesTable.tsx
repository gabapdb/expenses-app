export default function ExpensesTable() {
  const rows = [
    { date: "Nov 2, 2025", project: "Building A", item: "Cement", total: "₱12,300" },
    { date: "Nov 1, 2025", project: "Office Renovation", item: "Paint", total: "₱4,200" },
    { date: "Oct 31, 2025", project: "Warehouse", item: "Electrical Wiring", total: "₱8,700" },
    { date: "Oct 30, 2025", project: "Road Repair", item: "Asphalt", total: "₱23,500" },
  ];

  return (
    <table className="expenses-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Project</th>
          <th>Item</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.date}</td>
            <td>{r.project}</td>
            <td>{r.item}</td>
            <td>{r.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
