import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True once the component has hydrated on the client. Avoids the
 * setState-in-effect pattern for SSR/CSR reconciliation (e.g. reading
 * `next-themes`' resolved theme, which is unknown on the server). */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
