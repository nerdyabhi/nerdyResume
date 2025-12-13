import type { AgentState } from "../../state/state.ts";

/**
 * Router function that decides where to go after confirmation
 * - If user confirmed (isComplete=true) → go to save
 * - If user wants changes (isComplete=false) → go back to validate
 */
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
