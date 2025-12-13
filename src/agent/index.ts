import { StateGraph } from "@langchain/langgraph";
import { StateAnnotation } from "./state/state.ts";
import {
  validateInfo,
  askMoreDetails,
  confirmChanges,
  saveProfile,
} from "./nodes/index.ts";
import { MemorySaver } from "@langchain/langgraph";

const memory = new MemorySaver();

const workflow = new StateGraph(StateAnnotation)
  .addNode("validate", validateInfo)
  .addNode("ask", askMoreDetails)
  .addNode("confirm", confirmChanges)
  .addNode("save", saveProfile)

  .addEdge("__start__", "validate")

  .addConditionalEdges("validate", (state) =>
    state.isComplete ? "confirm" : "ask"
  )

  .addEdge("ask", "validate")

  .addConditionalEdges("confirm", (state) => {
    if (state.isComplete) {
      return "save";
    } else {
      return "validate";
    }
  })

  .addEdge("save", "__end__");

export const agent = workflow.compile({
  checkpointer: memory,
});
