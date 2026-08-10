import { properties } from "./fixtures/properties";
import { units } from "./fixtures/units";
import { tenants } from "./fixtures/tenants";
import { restrictions } from "./fixtures/restrictions";
import { retailers } from "./fixtures/retailers";
import { deals } from "./fixtures/deals";
import { dataRoomFiles } from "./fixtures/dataRoomFiles";
import { leaseDocs, clauses } from "./fixtures/leaseDocs";
import { criteriaSets } from "./fixtures/criteriaSets";
import { savedSearches } from "./fixtures/searches";
import { renewals } from "./fixtures/renewals";
import { reminders } from "./fixtures/reminders";
import { reports } from "./fixtures/reports";
import { standingRules } from "./fixtures/standingRules";
import { users } from "./fixtures/users";

export const db = {
  properties,
  units,
  tenants,
  restrictions,
  retailers,
  deals,
  dataRoomFiles,
  leaseDocs,
  clauses,
  criteriaSets,
  savedSearches,
  renewals,
  reminders,
  reports,
  standingRules,
  users,
};

export type DB = typeof db;
