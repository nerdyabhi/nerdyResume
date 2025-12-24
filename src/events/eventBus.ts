import EventEmitter from "events";

export const eventBus = new EventEmitter();

export const EVENTS = {
  PDF_GENERATED: "pdf:generated",
  RESUME_PROGRESS: "resume:progress",
} as const;
