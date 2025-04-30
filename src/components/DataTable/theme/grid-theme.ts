import { themeQuartz } from 'ag-grid-community';

export function createGridTheme(fontFamily: string, fontSize: number) {
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
        fontSize: fontSize,
        headerBackgroundColor: '#EFEFEFD6',
        headerFontFamily: fontFamily,
        headerFontSize: fontSize,
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
        fontSize: fontSize,
        browserColorScheme: 'dark',
        chromeBackgroundColor: {
          ref: 'foregroundColor',
          mix: 0.07,
          onto: 'backgroundColor',
        },
        columnBorder: true,
        foregroundColor: '#FFF',
        headerFontFamily: fontFamily,
        headerFontSize: fontSize,
        iconSize: 12,
        inputBorderRadius: 2,
        oddRowBackgroundColor: '#2A2E35',
        spacing: 6,
        wrapperBorderRadius: 2,
      },
      'dark'
    );
}