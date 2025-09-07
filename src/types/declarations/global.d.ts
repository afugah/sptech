interface QliroOne {
  lock: () => void;
  unlock: () => void;
  onOrderUpdated: (callback: () => void) => void;
}

interface Window {
  q1: QliroOne;
}
