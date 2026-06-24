/**
 * GrievanceModule.tsx — কর্মী অভিযোগ ব্যবস্থাপনা
 *
 * Wrapped in ModuleShell — the 3 tabs (submit / track / management)
 * become standard sidebar steps matching every other RMS module.
 *
 * All sub-components (SubmitView, TrackView, ManagementView, FlowBoard,
 * shared styles/constants/api/types) are used exactly as uploaded —
 * only the outer shell wrapper is changed from a custom header+nav
 * to ModuleShell.
 */

import { useState }    from 'react';
import ModuleShell     from '../shell/ModuleShell';
import { useSecurity } from '../../security';
import SubmitView      from './employee/SubmitView';
import TrackView       from './employee/TrackView';
import ManagementView  from './management/ManagementView';

type GrievanceStepId = 'submit' | 'track' | 'management';

const BASE_STEPS = [
  { id: 'submit',  label: 'অভিযোগ দাখিল', icon: 'ti-file-text'         },
  { id: 'track',   label: 'অভিযোগ ট্র্যাক', icon: 'ti-radar'            },
];

const MANAGER_STEP = {
  id: 'management', label: 'ব্যবস্থাপনা', icon: 'ti-layout-dashboard',
};

export default function GrievanceModule() {
  const security                      = useSecurity();
  const [activeStep, setActiveStep]   = useState<GrievanceStepId>('submit');

  const steps = [
    ...BASE_STEPS,
    ...(security.isManager ? [MANAGER_STEP] : []),
  ];

  return (
    <ModuleShell
      moduleName="কর্মী অভিযোগ ব্যবস্থাপনা"
      moduleNameEn="Employee Grievance Management"
      steps={steps}
      activeStep={activeStep}
      onStepChange={id => setActiveStep(id as GrievanceStepId)}
      configured={true}
      adapterName="Grievance API"
    >
      {activeStep === 'submit'     && <SubmitView />}
      {activeStep === 'track'      && <TrackView />}
      {activeStep === 'management' && <ManagementView />}
    </ModuleShell>
  );
}
