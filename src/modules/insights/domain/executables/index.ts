import { ActiveApplications } from "./active-applications";
import { ArchivedApplications } from "./archived-applications";
import { AvgDaysToResponse } from "./avg-days-to-response";
import { FollowUps } from "./follow-ups";
import { Interviews } from "./interviews";
import { OffersReceived } from "./offers-received";
import { ResponseRate } from "./response-rate";
import { WeeklyApplicationPace } from "./weekly-application-pace";

export { ActiveApplications } from "./active-applications";
export { ArchivedApplications } from "./archived-applications";
export { AvgDaysToResponse } from "./avg-days-to-response";
export { FollowUps } from "./follow-ups";
export { Interviews } from "./interviews";
export { OffersReceived } from "./offers-received";
export { ResponseRate } from "./response-rate";
export { WeeklyApplicationPace } from "./weekly-application-pace";

export const INSIGHTS = [
  ActiveApplications,
  WeeklyApplicationPace,
  ResponseRate,
  AvgDaysToResponse,
  Interviews,
  FollowUps,
  OffersReceived,
  ArchivedApplications,
];
