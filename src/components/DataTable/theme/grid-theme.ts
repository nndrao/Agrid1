import { themeQuartz } from 'ag-grid-community';

export function createGridTheme(fontFamily: string) {
  return themeQuartz
    .withParams(
      {
        accentColor: '#8AAAA7',
        backgroundColor: '#F7F7F7',
        borderColor: '#23202029',
        browserColorScheme: 'light',
        buttonBorderRadius: 2,
        cellTextColor: '#000000',
        checkboxBorderRadius: 2,
        columnBorder: true,
        fontFamily: fontFamily,
        fontSize: 14,
        headerBackgroundColor: '#EFEFEFD6',
        headerFontFamily: fontFamily,
        headerFontSize: 14,
        headerFontWeight: 500,
        iconButtonBorderRadius: 1,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: '#EEF1F1E8',
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      'light'
    )
    .withParams(
      {
        accentColor: '#8AAAA7',
        backgroundColor: '#1f2836',
        borderRadius: 2,
        checkboxBorderRadius: 2,
        fontFamily: fontFamily,
        browserColorScheme: 'dark',
        chromeBackgroundColor: {
          ref: 'foregroundColor',
          mix: 0.07,
          onto: 'backgroundColor',
        },
        columnBorder: true,
        fontSize: 14,
        foregroundColor: '#FFF',
        headerFontFamily: fontFamily,
        headerFontSize: 14,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: '#2A2E35',
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      'dark'
    );
}