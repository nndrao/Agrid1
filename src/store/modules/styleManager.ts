// Style Management module for the grid store
import { StateCreator } from 'zustand';
import { GridStoreState } from './types';

// Style management slice creator
export const createStyleManagerSlice: StateCreator<
  GridStoreState,
  [],
  [],
  {
    batchApplyHeaderStyles: (columnField: string, styles: any) => void;
    batchApplyCellStyles: (columnField: string, styles: any) => void;
    flushBatchedStyles: () => void;
    removeCellStyles: (columnField: string) => void;
  }
> = (set, get) => ({
  batchApplyHeaderStyles: (columnField, styles) => {
    // Update pending styles in store state only (no DOM manipulation)
    set(state => ({
      styleBatch: {
        ...state.styleBatch,
        pendingHeaderStyles: {
          ...state.styleBatch.pendingHeaderStyles,
          [columnField]: JSON.parse(JSON.stringify(styles))
        }
      }
    }));
  },

  batchApplyCellStyles: (columnField, styles) => {
    // Update pending cell styles in store state only (no DOM manipulation)
    set(state => ({
      styleBatch: {
        ...state.styleBatch,
        pendingCellStyles: {
          ...state.styleBatch.pendingCellStyles,
          [columnField]: JSON.parse(JSON.stringify(styles))
        }
      }
    }));
  },

  flushBatchedStyles: () => {
    // Compose all batched header and cell styles into a string and store in state for UI to consume
    const { styleBatch, gridApi } = get();
    const { pendingHeaderStyles, pendingCellStyles } = styleBatch;
    let allHeaderStyles = '';
    let allCellStyles = '';

    // Generate consolidated CSS for headers
    Object.keys(pendingHeaderStyles).forEach(columnField => {
      const style = pendingHeaderStyles[columnField];
      if (!style) return;
      let cssProps = '';
      if (style.fontFamily) cssProps += `font-family: ${style.fontFamily} !important; `;
      if (style.fontSize) cssProps += `font-size: ${style.fontSize} !important; `;
      if (style.bold) cssProps += 'font-weight: bold !important; ';
      if (style.italic) cssProps += 'font-style: italic !important; ';
      if (style.underline) cssProps += 'text-decoration: underline !important; ';
      if (style.alignH) cssProps += `text-align: ${style.alignH} !important; `;
      if (style.textColor !== undefined) cssProps += `color: ${style.textColor} !important; `;
      if (style.backgroundColor !== undefined) cssProps += `background-color: ${style.backgroundColor} !important; `;
      if (style.borderStyle !== undefined && style.borderWidth !== undefined && style.borderColor !== undefined && style.borderSides !== undefined) {
        const borderStyle = `${style.borderWidth}px ${style.borderStyle.toLowerCase()} ${style.borderColor}`;
        const borderProperty = style.borderSides === 'All' ? 'border' : `border-${style.borderSides.toLowerCase()}`;
        cssProps += `${borderProperty}: ${borderStyle} !important; `;
      }
      if (cssProps) {
        allHeaderStyles += `
          div.ag-theme-quartz .ag-header-cell[col-id="${columnField}"],
          div.ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"],
          html body div.ag-theme-quartz .ag-header-cell[col-id="${columnField}"],
          html body div.ag-theme-quartz-dark .ag-header-cell[col-id="${columnField}"],
          div.ag-theme-quartz div.ag-header-container div.ag-header-row div.ag-header-cell[col-id="${columnField}"],
          .ag-theme-quartz .ag-header-cell.custom-header-${columnField},
          .ag-theme-quartz-dark .ag-header-cell.custom-header-${columnField} {
            ${cssProps}
          }
        `;
      }
    });

    // Generate consolidated CSS for cells
    Object.keys(pendingCellStyles).forEach(columnField => {
      const styles = pendingCellStyles[columnField];
      if (!styles) return;
      let columnStyle = '';
      if (styles.fontFamily) columnStyle += `font-family: ${styles.fontFamily}; `;
      if (styles.fontSize) columnStyle += `font-size: ${styles.fontSize}; `;
      if (styles.bold) columnStyle += 'font-weight: bold; ';
      if (styles.italic) columnStyle += 'font-style: italic; ';
      if (styles.underline) columnStyle += 'text-decoration: underline; ';
      if (styles.alignH) columnStyle += `text-align: ${styles.alignH}; `;
      if (styles.textColor) columnStyle += `color: ${styles.textColor}; `;
      if (styles.backgroundColor) columnStyle += `background-color: ${styles.backgroundColor}; `;
      if (columnStyle) {
        allCellStyles += `
          .ag-theme-quartz .ag-cell[col-id="${columnField}"],
          .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
            ${columnStyle} !important;
          }
        `;
      }
      if (styles.borderStyle !== undefined && styles.borderWidth !== undefined && styles.borderColor !== undefined && styles.borderSides !== undefined) {
        const borderStyle = `${styles.borderWidth}px ${styles.borderStyle.toLowerCase()} ${styles.borderColor}`;
        const borderProperty = styles.borderSides === 'All' ? 'border' : `border-${styles.borderSides.toLowerCase()}`;
        allCellStyles += `
          .ag-theme-quartz .ag-cell[col-id="${columnField}"],
          .ag-theme-quartz-dark .ag-cell[col-id="${columnField}"] {
            ${borderProperty}: ${borderStyle} !important;
          }
        `;
      }
    });

    // Store the generated CSS in state for the UI to consume and render in a <style> tag
    set(state => ({
      styleBatch: {
        ...state.styleBatch,
        appliedHeaderStyles: allHeaderStyles,
        appliedCellStyles: allCellStyles,
        pendingHeaderStyles: {},
        pendingCellStyles: {}
      }
    }));

    // Optionally, refresh the grid
    if (gridApi) {
      try {
        if (typeof gridApi.refreshHeader === 'function') {
          gridApi.refreshHeader();
        }
        if (typeof gridApi.refreshCells === 'function') {
          gridApi.refreshCells({ force: true });
        }
      } catch (error) {
        console.error('Error refreshing grid after applying styles:', error);
      }
    }
  },

  removeCellStyles: (columnField) => {
    // Remove cell styles from state only (no DOM manipulation)
    set(state => {
      const newPendingCellStyles = { ...state.styleBatch.pendingCellStyles };
      delete newPendingCellStyles[columnField];
      const newAppliedCellStyles = state.styleBatch.appliedCellStyles
        ? state.styleBatch.appliedCellStyles.replace(new RegExp(`\.ag-cell\\[col-id=\\"${columnField}\\"\][^}]*}`, 'g'), '')
        : '';
      return {
        styleBatch: {
          ...state.styleBatch,
          pendingCellStyles: newPendingCellStyles,
          appliedCellStyles: newAppliedCellStyles
        }
      };
    });
  }
});