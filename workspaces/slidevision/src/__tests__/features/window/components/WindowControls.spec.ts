import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import { flushPromises, mount } from '@vue/test-utils';

import WindowControls from '#/features/window/components/WindowControls.vue';

describe('#WindowControls', () => {
  let commands: string[];

  beforeEach(() => {
    commands = [];
    mockWindows('main');
    mockIPC((command) => {
      commands.push(command);

      return null;
    });
  });

  afterEach(() => {
    clearMocks();
  });

  it.each([
    ['Close window', 'plugin:window|close'],
    ['Minimize window', 'plugin:window|minimize'],
    ['Maximize window', 'plugin:window|toggle_maximize'],
  ])('%s sends %s', async (label, command) => {
    const wrapper = mount(WindowControls);

    await wrapper.get(`[aria-label="${label}"]`).trigger('click');
    await flushPromises();

    expect(commands).toEqual([command]);
  });
});
