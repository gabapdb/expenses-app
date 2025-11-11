export function useDashboardStats() {
// TODO: wire to Firestore
// Example shape expected by the Dashboard page
return {
projectsCount: 12,
totalExpenses: 245300,
remainingBalance: 82150,
loading: false,
} as const;
}