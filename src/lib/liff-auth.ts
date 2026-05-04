import liff from "@line/liff";
import { authApi } from "./api";

/**
 * LiffAuth provides a clean interface for handling LINE/LIFF authentication
 * and synchronizing with the backend Customer entity.
 */
export const LiffAuth = {
  /**
   * Initializes LIFF and ensures the user is logged in.
   * If not logged in, redirects to LINE login.
   */
  async init(liffId: string) {
    await liff.init({ liffId });
    if (!liff.isLoggedIn()) {
      liff.login();
      return false;
    }
    return true;
  },

  /**
   * Logs out from both LIFF and the backend.
   * This triggers a full server-side logout to purge HttpOnly cookies.
   */
  async logout() {
    liff.logout();
    window.location.href = "/api/auth/logout";
  }
};
