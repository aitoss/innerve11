import type { TimelineItem } from "@/types/content";

export const EVENT = {
  name: "Innerve 11",
  dates: "30–31 Jan 2027",
  eventStart: "2027-01-30T09:00:00+05:30",
  organiser: "OSS Club · AIT Pune",
  timeline: [
    {
      date: "15 Nov 2026",
      title: "Registration Starts",
      text: "Secure your spot starting November 15, 2026, at 12:00 AM IST.",
    },
    {
      date: "31 Dec 2026",
      title: "Registration Ends",
      text: "Registration closes on December 31, 2026, at 11:59 PM IST. Don't miss your chance.",
    },
    {
      date: "08 Jan 2027",
      title: "Shortlisted Teams Announced",
      text: "Shortlisted teams will be announced on January 8, 2027. Check back to see if your team advances.",
    },
    {
      date: "30 Jan 2027",
      title: "Hackathon Begins",
      text: "The 24-hour coding marathon starts on January 30, 2027. Build innovative solutions and bring your ideas to life.",
    },
    {
      date: "31 Jan 2027",
      title: "Results Announced",
      text: "Winners will be announced on January 31, 2027. Exciting prizes and recognition await.",
    },
  ] satisfies TimelineItem[],
};

