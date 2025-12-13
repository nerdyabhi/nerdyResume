import { StateGraph } from "@langchain/langgraph";
import { StateAnnotation } from "./state/state.ts";
import {
  validateInfo,
  askForMore,
  confirmProfile,
  saveProfile,
} from "./nodes/index.ts";
import { MemorySaver } from "@langchain/langgraph";

const memory = new MemorySaver();

const workflow = new StateGraph(StateAnnotation)
  .addNode("validate", validateInfo)
  .addNode("ask", askForMore)
  .addNode("confirm", confirmProfile)
  .addNode("save", saveProfile)

  .addEdge("__start__", "validate")

  // If validation finds complete info, go to confirm
  // Otherwise ask for more
  .addConditionalEdges("validate", (state) =>
    state.isComplete ? "confirm" : "ask"
  )

  // After asking, always go back to validate
  .addEdge("ask", "validate")

  // After confirm, check if user approved or wants changes
  .addConditionalEdges("confirm", (state) => {
    if (state.isComplete) {
      return "save"; // User confirmed, save it
    } else {
      return "validate"; // User wants changes, re-validate with new messages
    }
  })

  .addEdge("save", "__end__");

export const agent = workflow.compile({
  checkpointer: memory,
});
