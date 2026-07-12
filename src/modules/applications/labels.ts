import {
    ApplicationAttendanceType,
    ApplicationEmploymentType,
} from "@/modules/applications/enums";
import type { Application } from "@/modules/applications/types";

export function getAttendanceLabel(
  attendanceType: Application["attendanceType"],
): string {
  switch (attendanceType) {
    case ApplicationAttendanceType.OnSite:
      return "Onsite";
    case ApplicationAttendanceType.Remote:
      return "Remote";
    case ApplicationAttendanceType.Hybrid:
      return "Hybrid";
    default:
      return "-";
  }
}

export function getEmploymentLabel(
  employmentType: Application["employmentType"],
): string {
  switch (employmentType) {
    case ApplicationEmploymentType.FullTime:
      return "Full Time";
    case ApplicationEmploymentType.PartTime:
      return "Part Time";
    case ApplicationEmploymentType.Contract:
      return "Contract";
    case ApplicationEmploymentType.Internship:
      return "Internship";
    case ApplicationEmploymentType.Volunteer:
      return "Volunteer";
    default:
      return "-";
  }
}
