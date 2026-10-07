export const PWA_UPDATE_AVAILABLE_EVENT = 'selfcare:pwa-update-available';

export interface PwaUpdateAvailableDetail {
  registration: ServiceWorkerRegistration;
}

let reloadingForUpdate = false;

function announceUpdate(registration: ServiceWorkerRegistration) {
  window.dispatchEvent(new CustomEvent<PwaUpdateAvailableDetail>(PWA_UPDATE_AVAILABLE_EVENT, {
    detail: { registration },
  }));
}

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadingForUpdate) return;
    reloadingForUpdate = true;
    window.location.reload();
  });

  const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
  });

  if (registration.waiting && navigator.serviceWorker.controller) announceUpdate(registration);

  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) announceUpdate(registration);
    });
  });
}

export function activateServiceWorkerUpdate(registration: ServiceWorkerRegistration): void {
  registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
}


