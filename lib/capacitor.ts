/**
 * Capacitor native bridge — safe to import on web (all calls are no-ops
 * when running in a browser without native shell).
 */

import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/** Hide the native splash screen. Call once the app shell has rendered. */
export async function hideSplashScreen() {
  if (!isNative) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide({ fadeOutDuration: 300 });
}

/** Configure the status bar for M2M dark theme. */
export async function configureStatusBar() {
  if (!isNative) return;
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  await StatusBar.setStyle({ style: Style.Dark });
  if (platform === 'android') {
    await StatusBar.setBackgroundColor({ color: '#0a0e17' });
  }
}

/** Trigger a success haptic (analysis complete, PDF downloaded). */
export async function hapticSuccess() {
  if (!isNative) return;
  const { Haptics, NotificationType } = await import('@capacitor/haptics');
  await Haptics.notification({ type: NotificationType.Success });
}

/** Trigger a warning haptic (error, rate limit). */
export async function hapticWarning() {
  if (!isNative) return;
  const { Haptics, NotificationType } = await import('@capacitor/haptics');
  await Haptics.notification({ type: NotificationType.Warning });
}

/** Trigger a light impact haptic (button tap). */
export async function hapticImpact() {
  if (!isNative) return;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  await Haptics.impact({ style: ImpactStyle.Light });
}

/** Register app state listeners (foreground/background). */
export async function registerAppListeners(callbacks?: {
  onResume?: () => void;
  onPause?: () => void;
}) {
  if (!isNative) return;
  const { App } = await import('@capacitor/app');

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      callbacks?.onResume?.();
    } else {
      callbacks?.onPause?.();
    }
  });

  // Handle back button on Android
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}

/** Register keyboard listeners for scroll adjustment. */
export async function registerKeyboardListeners() {
  if (!isNative) return;
  const { Keyboard } = await import('@capacitor/keyboard');

  Keyboard.addListener('keyboardWillShow', (info) => {
    document.documentElement.style.setProperty(
      '--keyboard-height',
      `${info.keyboardHeight}px`
    );
  });

  Keyboard.addListener('keyboardWillHide', () => {
    document.documentElement.style.setProperty('--keyboard-height', '0px');
  });
}
