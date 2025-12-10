I will make the total sample size (456 households) configurable by allowing you to input this value when uploading the Excel file.

Here is the plan:

1.  **Modify `services/excelService.ts`**:
    *   Remove the hardcoded `TOTAL_HOUSEHOLDS` constant.
    *   Update `calculateWeeklyMetrics` and `calculateMetrics` functions to accept `totalHouseholds` as a parameter.

2.  **Modify `App.tsx`**:
    *   Add a state variable `totalHouseholds` with a default value of 456.
    *   Add an input field on the upload screen to allow you to change the "Total Households" (总样本量) before uploading.
    *   Pass the user-defined `totalHouseholds` value when calculating metrics.

3.  **Modify `components/Dashboard.tsx`**:
    *   Update the weekly metrics recalculation logic to use the configured total households value (stored in `metrics.totalTarget`) instead of a default.
