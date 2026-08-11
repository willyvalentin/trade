export {
  TRADE_AUTH_COOKIE,
  applicationSessionContractVersion,
  applicationSessionCookieOptions,
  applicationSessionMaxAgeSeconds,
  applicationOwnerUserIdEnvironmentKey,
  createApplicationSession,
  getConfiguredApplicationOwnerUserId,
  getTradeAuthToken,
  normalizeApplicationOwnerUserId,
  verifyApplicationSession,
} from "@/lib/application-session-core";
