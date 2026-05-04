
/**
 * Isolated Memory Bridge Module.
 * This module holds the transient session token in-memory only.
 * It is used for identity resolution in webviews that block third-party cookies,
 * and breaks circular dependencies between Auth pages and the HttpClient.
 */

let _token: string | null = null;

export const memoryBridge = {
  /**
   * Retrieves the current bridge token from memory.
   */
  get: () => _token,

  /**
   * Pushes a new token into the memory bridge.
   */
  set: (t: string) => {
    _token = t;
  },

  /**
   * Clears the bridge token (e.g. on logout).
   */
  clear: () => {
    _token = null;
  },
};
