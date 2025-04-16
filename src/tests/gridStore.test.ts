import { useGridStore } from '../store/gridStore';

// Mock document.documentElement.style
Object.defineProperty(document.documentElement, 'style', {
  value: {
    setProperty: jest.fn(),
  },
});

// Mock window.setTimeout
jest.useFakeTimers();

describe('GridStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const store = useGridStore.getState();
    store.initializeStore();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  test('updateSettings should not call applySettingsToGrid for fontSize changes', () => {
    // Setup
    const store = useGridStore.getState();
    const applySettingsToGridSpy = jest.spyOn(store, 'applySettingsToGrid');
    
    // Act
    store.updateSettings({ fontSize: 16 });
    jest.runAllTimers(); // Run all timers to trigger any setTimeout callbacks
    
    // Assert
    expect(applySettingsToGridSpy).not.toHaveBeenCalled();
  });

  test('updateSettings should not call applySettingsToGrid for density changes', () => {
    // Setup
    const store = useGridStore.getState();
    const applySettingsToGridSpy = jest.spyOn(store, 'applySettingsToGrid');
    
    // Act
    store.updateSettings({ density: 2.5 });
    jest.runAllTimers(); // Run all timers to trigger any setTimeout callbacks
    
    // Assert
    expect(applySettingsToGridSpy).not.toHaveBeenCalled();
  });

  test('updateSettings should call applySettingsToGrid for font changes', () => {
    // Setup
    const store = useGridStore.getState();
    const applySettingsToGridSpy = jest.spyOn(store, 'applySettingsToGrid');
    
    // Act
    store.updateSettings({ 
      font: { name: 'Test Font', value: "'Test Font', monospace" } 
    });
    jest.runAllTimers(); // Run all timers to trigger any setTimeout callbacks
    
    // Assert
    expect(applySettingsToGridSpy).toHaveBeenCalled();
  });

  test('updateSettings should call applySettingsToGrid for columnsState changes', () => {
    // Setup
    const store = useGridStore.getState();
    const applySettingsToGridSpy = jest.spyOn(store, 'applySettingsToGrid');
    
    // Act
    store.updateSettings({ 
      columnsState: [{ columnId: 'test', width: 100 }] 
    });
    jest.runAllTimers(); // Run all timers to trigger any setTimeout callbacks
    
    // Assert
    expect(applySettingsToGridSpy).toHaveBeenCalled();
  });
});
