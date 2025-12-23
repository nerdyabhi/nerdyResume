import EventEmitter from "events";

export const eventBus = new EventEmitter();

export const EVENTS = {
  PDF_GENERATED: "pdf:generated",
  PROFILE_SAVED: "profile:saved",
  RESUME_REQUESTED: "resume:requested",
} as const;
