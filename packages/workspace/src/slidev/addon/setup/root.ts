import { useDrawings } from '@slidev/client/composables/useDrawings.ts';
import {
  isInputting,
  showGotoDialog,
  showOverview,
} from '@slidev/client/state/storage.ts';

export const endPresentationEvent = 'slidevision:end-presentation';

export default function setupSlidevisionRoot(): void {
  const { drawingEnabled } = useDrawings();

  window.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key !== 'Escape' ||
        drawingEnabled.value ||
        showOverview.value ||
        showGotoDialog.value ||
        isInputting.value
      ) {
        return;
      }

      window.dispatchEvent(new CustomEvent(endPresentationEvent));
    },
    {
      capture: true,
    },
  );
}
