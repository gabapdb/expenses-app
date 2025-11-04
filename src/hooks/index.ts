/*********************************************************
 * src/hooks/index.ts
 * Centralized Hook Exports
 * --------------------------------------------------------
 * Provides unified imports for all Firestore, validation,
 * and authentication hooks used across the Expenses App.
 *********************************************************/

export { useAuthUser } from "./useAuthUser";

/*********************** PROJECTS ************************/
/**
 * @module useProjects
 * Real-time listener for all projects and single project.
 * - useProjects(): get all projects
 * - useProject(id): get one project
 */
export { useProjects } from "./useProjects";
export type { Project } from "./useProjects";

/*********************** EXPENSES ************************/
/**
 * @module useExpense
 * Fetch a single expense document for a specific month.
 */
export { useExpense } from "./useExpense";

/**
 * @module useRealtimeExpenses
 * Real-time listener for all expenses in a month.
 */
export { useRealtimeExpenses } from "./useRealtimeExpenses";

/**
 * @module useMonthlyExpenses
 * Alias for useRealtimeExpenses (for backward compatibility).
 */
export { useMonthlyExpenses } from "./useMonthlyExpenses";

/**
 * @module useProjectExpenses
 * Real-time listener for all expenses tied to one project in a given month.
 */
export { useProjectExpenses } from "./useProjectExpenses";

/**
 * @module useProjectExpensesCollection
 * Global expense listener across all projects.
 * Includes cache management helpers.
 */
export {
  useProjectExpensesCollection,
  clearProjectExpenseCache,
  invalidateProjectExpenses,
} from "./useProjectExpensesCollection";

/**
 * @module useProjectExpensesByYear
 * Aggregates monthly totals for a given project and year.
 */
export { useProjectExpensesByYear } from "./useProjectExpensesByYear";

/**
 * @module useProjectExpenseBreakdown
 * Produces per-category and per-subcategory summaries.
 */
export { useProjectExpenseBreakdown } from "./useProjectExpenseBreakdown";

/*********************** VALIDATION **********************/
/**
 * @module useValidation
 * Validates form inputs and provides inline error state.
 */
export { useValidation } from "./useValidation";

/*********************** CATEGORIES **********************/
/**
 * @module useCategories
 * Loads and validates the categories collection.
 */
export { useCategories } from "./useCategories";
