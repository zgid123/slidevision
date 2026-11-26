import { mount } from '@vue/test-utils';

import UpdateBanner from '#/features/updates/components/UpdateBanner.vue';
import { type TUpdateState, updateStatus } from '#/features/updates/interface';

describe('#UpdateBanner', () => {
  const mountBanner = (state: TUpdateState) => {
    return mount(UpdateBanner, {
      props: {
        state,
      },
    });
  };

  suite('when idle', () => {
    it('renders nothing', () => {
      const wrapper = mountBanner({
        status: updateStatus.idle,
      });

      expect(wrapper.html()).toBe('<!--v-if-->');
    });
  });

  suite('when checking', () => {
    it('shows checking status', () => {
      const wrapper = mountBanner({
        status: updateStatus.checking,
      });

      expect(wrapper.get('[role="status"]').text()).toContain(
        'Checking for updates…',
      );
    });
  });

  suite('when up to date', () => {
    it('shows confirmation and emits dismiss', async () => {
      const wrapper = mountBanner({
        status: updateStatus.upToDate,
      });

      expect(wrapper.get('[role="status"]').text()).toContain(
        'Slidevision is up to date',
      );

      await wrapper
        .get('[aria-label="Dismiss update notification"]')
        .trigger('click');

      expect(wrapper.emitted('dismiss')).toHaveLength(1);
    });
  });

  suite('when an update is available', () => {
    it('shows version and notes, and emits install or dismiss', async () => {
      const wrapper = mountBanner({
        status: updateStatus.available,
        version: '0.2.0',
        notes: 'Two-screen improvements',
      });

      expect(wrapper.text()).toContain('Slidevision 0.2.0 is available');
      expect(wrapper.text()).toContain('Two-screen improvements');

      const updateButton = wrapper.findAll('button').find((button) => {
        return button.text().includes('Update');
      });

      await updateButton?.trigger('click');

      expect(wrapper.emitted('install')).toHaveLength(1);

      await wrapper
        .get('[aria-label="Dismiss update notification"]')
        .trigger('click');

      expect(wrapper.emitted('dismiss')).toHaveLength(1);
    });
  });

  suite('when downloading', () => {
    it('shows the version and progress percentage', () => {
      const wrapper = mountBanner({
        status: updateStatus.downloading,
        version: '0.2.0',
        progress: 42,
      });

      expect(wrapper.get('[role="status"]').text()).toContain(
        'Downloading 0.2.0…',
      );
      expect(wrapper.get('[role="status"]').text()).toContain('42%');
    });
  });

  suite('when ready to restart', () => {
    it('shows restarting message', () => {
      const wrapper = mountBanner({
        status: updateStatus.ready,
        version: '0.2.0',
      });

      expect(wrapper.get('[role="status"]').text()).toContain(
        'Restarting to update…',
      );
    });
  });

  suite('when update failed', () => {
    it('emits retry when check failed', async () => {
      const wrapper = mountBanner({
        status: updateStatus.failed,
        message: 'Timeout',
        canRetryInstall: false,
      });

      expect(wrapper.get('[role="alert"]').text()).toContain('Timeout');

      const retryButton = wrapper.findAll('button').find((button) => {
        return button.text().includes('Retry');
      });

      await retryButton?.trigger('click');

      expect(wrapper.emitted('retry')).toHaveLength(1);
    });

    it('emits install when download or install failed', async () => {
      const wrapper = mountBanner({
        status: updateStatus.failed,
        message: 'Checksum mismatch',
        canRetryInstall: true,
      });

      const retryButton = wrapper.findAll('button').find((button) => {
        return button.text().includes('Retry');
      });

      await retryButton?.trigger('click');

      expect(wrapper.emitted('install')).toHaveLength(1);
    });
  });
});
