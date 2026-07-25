const OPEN_CREATE_MODAL_EVENT = "applications:open-create-modal";
const OPEN_CREATE_MODAL_PENDING_KEY = "applications.openCreateModal.pending";

export function triggerOpenCreateApplicationModal(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(OPEN_CREATE_MODAL_PENDING_KEY, "1");
  window.dispatchEvent(new CustomEvent(OPEN_CREATE_MODAL_EVENT));
}

export function consumePendingCreateApplicationModalRequest(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hasPending =
    window.sessionStorage.getItem(OPEN_CREATE_MODAL_PENDING_KEY) === "1";

  if (hasPending) {
    window.sessionStorage.removeItem(OPEN_CREATE_MODAL_PENDING_KEY);
  }

  return hasPending;
}

export function subscribeOpenCreateApplicationModal(
  handler: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => handler();
  window.addEventListener(OPEN_CREATE_MODAL_EVENT, listener);

  return () => {
    window.removeEventListener(OPEN_CREATE_MODAL_EVENT, listener);
  };
}
