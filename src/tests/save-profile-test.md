# Manual Test for Save Profile Functionality

## Test Steps

1. Open the application and observe the AG-Grid
2. Make some changes to the grid (e.g., adjust column widths, apply filters, etc.)
3. Click the "Save Profile" button
4. Observe that:
   - The grid does not refresh/flicker
   - The grid maintains its current state
   - No console logs about "Applying settings to grid" appear twice

## Expected Results

- When saving a profile, the grid should not refresh or flicker
- The grid should maintain its current state
- The profile should be saved successfully
- There should be no double refresh of the grid

## Console Logs to Check

- There should not be multiple "Applying settings to grid" logs when saving a profile
- You should see "Profile saved successfully without refreshing the grid" in the console
- You should not see any logs about "Restoring column state after profile save"
