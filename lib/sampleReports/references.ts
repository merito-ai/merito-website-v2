import { REFERENCE_CATEGORIES, type RefereeRow } from "@/lib/referenceChecks";

const ratings = (values: number[]): { category: string; value: number }[] =>
  REFERENCE_CATEGORIES.map(({ value: category }, i) => ({ category, value: values[i] }));

// Fictional referees for the sample reference report. Raw rows rather than a
// precomputed report, so the sample's category averages are produced by the
// same computeReferenceReport() the paid page uses.
export const SAMPLE_REFEREES: RefereeRow[] = [
  {
    id: "sample-1",
    name: "Meera Raghavan",
    email: "meera@example.com",
    phone: null,
    status: "completed",
    reminder_count: 0,
    role: "manager",
    organization: "Northwind Analytics",
    ratings: ratings([4, 5, 4, 4, 5, 4, 3]),
    overall_feedback:
      "Took ownership of our weekly reporting cycle within a month and kept it running without supervision. Asks good questions before starting work rather than after.",
  },
  {
    id: "sample-2",
    name: "Karan Dutta",
    email: "karan@example.com",
    phone: null,
    status: "completed",
    reminder_count: 0,
    role: "team-lead",
    organization: "Northwind Analytics",
    ratings: ratings([4, 4, 5, 3, 4, 4, 3]),
    overall_feedback:
      "Reliable and easy to work alongside. Written updates could be more concise, but the analysis underneath them has always been sound.",
  },
  {
    id: "sample-3",
    name: "Priyanka Nair",
    email: "priyanka@example.com",
    phone: null,
    status: "completed",
    reminder_count: 0,
    role: "teammate",
    organization: "Northwind Analytics",
    ratings: ratings([3, 4, 5, 4, 4, 4, 4]),
    overall_feedback:
      "Steady under deadline pressure and generous with help. Would like to see more challenge to assumptions early rather than accepting the brief as given.",
  },
];
