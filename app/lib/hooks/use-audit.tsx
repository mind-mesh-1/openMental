// lib/hooks/use-copilot-action.tsx
import React, { createContext, useContext, useState } from 'react';

type CopilotActionContextType = {
  actions: string[];
  logAction: (action: string, context: string) => void;
};

const CopilotActionContext = createContext<
  CopilotActionContextType | undefined
>(undefined);

const AuditProvider = ({ children }: { children: React.ReactNode }) => {
  const [actions, setActions] = useState<string[]>([]);

  console.log(actions);

  const logAction = (action: string, context: string) => {
    console.log(`Logging action: ${action} in context: ${context}`);
    setActions((prevActions) => [...prevActions, `${context}: ${action}`]);
  };

  return (
    <CopilotActionContext.Provider value={{ actions, logAction }}>
      {children}
    </CopilotActionContext.Provider>
  );
};

const useAuditAction = () => {
  const context = useContext(CopilotActionContext);
  if (!context) {
    throw new Error(
      'useCopilotAction must be used within a CopilotActionProvider'
    );
  }
  return context;
};

export { AuditProvider, useAuditAction };
