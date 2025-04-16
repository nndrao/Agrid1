# Manual Test for Font Size and Density Changes

## Test Steps

1. Open the application and observe the AG-Grid
2. Open the density dropdown menu (button with horizontal lines icon)
3. Adjust the "Grid Density" slider
4. Observe that:
   - The grid spacing changes immediately
   - The grid does not refresh/flicker
   - No console logs about "Applying settings to grid" appear

5. Adjust the "Font Size" slider
6. Observe that:
   - The font size changes immediately
   - The grid does not refresh/flicker
   - No console logs about "Applying settings to grid" appear

7. Change the font using the font dropdown
8. Observe that:
   - The font changes
   - The grid refreshes (this is expected)
   - Console logs about "Applying settings to grid" appear

## Expected Results

- Font size and density changes should be applied immediately via CSS without triggering a grid refresh
- Font family changes should still trigger a grid refresh
- When switching profiles, font size and density should be applied via CSS without triggering a grid refresh
