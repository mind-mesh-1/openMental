'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { Application } from '@/components/Application';
import '@copilotkit/react-ui/styles.css';
import '@radix-ui/themes/styles.css';
import React from 'react';
import { AuditProvider } from '@/lib/hooks/use-audit';

const RUNTIME_URL = process.env.NEXT_PUBLIC_COPILOT_RUNTIME_ENDPOINT;

export default function Home() {
  // const COPILOT_CLOUD_PUBLIC_API_KEY =
  //   process.env.NEXT_PUBLIC_COPILOT_CLOUD_PUBLIC_API_KEY;

  return (
    <CopilotKit runtimeUrl={RUNTIME_URL}>
      <AuditProvider>
        <Application />
      </AuditProvider>
    </CopilotKit>
  );
}
