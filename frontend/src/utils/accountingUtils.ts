import { AccountingSetting, AccountingSettingKey } from "@/types/accountingSetting";

/**
 * Extracts specific account IDs from a list of accounting settings.
 * @param settings - Array of AccountingSetting objects for a branch.
 * @param keys - Array of AccountingSettingKey strings to look for.
 * @returns Array of account IDs (number) found for the given keys.
 */
export const getSpecificAccountIdsFromSettings = (
  settings: AccountingSetting[],
  keys: AccountingSettingKey[]
): number[] => {
  const accountIds: number[] = [];
  if (!settings || settings.length === 0) {
    return accountIds;
  }

  for (const key of keys) {
    const setting = settings.find(s => s.key === key);
    if (setting && setting.value_account_id) {
      accountIds.push(setting.value_account_id);
    }
  }
  return accountIds;
};

/**
 * Extracts a single specific account ID from a list of accounting settings.
 * @param settings - Array of AccountingSetting objects for a branch.
 * @param key - The AccountingSettingKey string to look for.
 * @returns The account ID (number) or undefined if not found.
 */
export const getSingleAccountIdFromSettings = (
    settings: AccountingSetting[],
    key: AccountingSettingKey
): number | undefined => {
    if (!settings || settings.length === 0) {
        return undefined;
    }
    const setting = settings.find(s => s.key === key);
    return setting?.value_account_id;
};
