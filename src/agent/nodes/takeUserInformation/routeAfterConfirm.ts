import type { AgentState } from "../../state/state.ts";

export function routeAfterConfirm(state: AgentState): "save" | "validate" {
  console.log("🔀 Routing after confirm. isComplete:", state.isComplete);

  if (state.isComplete) {
    console.log("✅ Routing to save");
    return "save";
  } else {
    console.log("🔄 Routing back to validate for corrections");
    return "validate";
  }
}
