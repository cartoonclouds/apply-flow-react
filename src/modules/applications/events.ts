const OPEN_CREATE_DRAWER_EVENT = "applications:open-create-drawer";
const OPEN_CREATE_DRAWER_PENDING_KEY = "applications.openCreateDrawer.pending";

export function triggerOpenCreateApplicationDrawer(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(OPEN_CREATE_DRAWER_PENDING_KEY, "1");
  window.dispatchEvent(new CustomEvent(OPEN_CREATE_DRAWER_EVENT));
}

export function consumePendingCreateApplicationDrawerRequest(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hasPending =
    window.sessionStorage.getItem(OPEN_CREATE_DRAWER_PENDING_KEY) === "1";

  if (hasPending) {
    window.sessionStorage.removeItem(OPEN_CREATE_DRAWER_PENDING_KEY);
  }

  return hasPending;
}

export function subscribeOpenCreateApplicationDrawer(
  handler: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => handler();
  window.addEventListener(OPEN_CREATE_DRAWER_EVENT, listener);

  return () => {
    window.removeEventListener(OPEN_CREATE_DRAWER_EVENT, listener);
  };
}
