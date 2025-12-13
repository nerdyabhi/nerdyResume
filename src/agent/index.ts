import { StateGraph, END } from "@langchain/langgraph";
import { StateAnnotation } from "./state/state.ts";
import {
  validateInfo,
  askMoreDetails,
  confirmChanges,
  saveProfile,
  routeAfterConfirm,
} from "./nodes/index.ts";
import { MemorySaver } from "@langchain/langgraph";

const memory = new MemorySaver();

const workflow = new StateGraph(StateAnnotation)
  .addNode("validate", validateInfo)
  .addNode("ask", askMoreDetails)
  .addNode("confirm", confirmChanges)
  .addNode("save", saveProfile)

  // Start → validate
  .addEdge("__start__", "validate")

  // Validate → confirm if complete, otherwise ask for more
  .addConditionalEdges("validate", (state) =>
    state.isComplete ? "confirm" : "ask"
  )

  // Ask → validate (loop back)
  .addEdge("ask", "validate")

  // Confirm → route based on user response
  .addConditionalEdges("confirm", routeAfterConfirm)

  // Save → end
  .addEdge("save", END);

export const agent = workflow.compile({
  checkpointer: memory,
});
