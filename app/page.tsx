"use client";

import { TasksList } from "@/components/TasksList";
import { TasksProvider } from "@/lib/hooks/use-tasks";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";



const COPILOT_RUN_TIME_URL = "http://localhost:4000/copilotkit";


export default function Home() {
  const COPILOT_CLOUD_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_COPILOT_CLOUD_PUBLIC_API_KEY;
  return (
    <>
      <CopilotKit runtimeUrl={COPILOT_RUN_TIME_URL}>
        <TasksProvider>
          <TasksList />
        </TasksProvider>
        <CopilotPopup />
      </CopilotKit>
    </>
  );
}
