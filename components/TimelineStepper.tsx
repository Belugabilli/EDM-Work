import React from 'react';
import { ComplaintStatus, ComplaintStatusHistory } from '@/types';
import { CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Ban, Circle } from 'lucide-react';

interface TimelineStepperProps {
  currentStatus: ComplaintStatus;
  history: ComplaintStatusHistory[];
}

const ORDERED_STEPS: { status: ComplaintStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
];

export function TimelineStepper({ currentStatus, history }: TimelineStepperProps) {
  const isRejected = currentStatus === 'REJECTED';
  const isEscalated = currentStatus === 'ESCALATED';

  // Get index of current status in standard flow
  const currentStepIndex = ORDERED_STEPS.findIndex((s) => s.status === currentStatus);

  // Map history records by new_status to retrieve timestamp and comments
  const historyByStatus = new Map<string, ComplaintStatusHistory>();
  history.forEach((h) => {
    historyByStatus.set(h.new_status, h);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <h3 className="text-base font-semibold text-slate-900 mb-6 flex items-center justify-between">
        <span>Complaint Status Timeline</span>
        <span className="text-xs font-normal text-slate-500">Live University Track</span>
      </h3>

      {/* Exceptional status banner if Rejected or Escalated */}
      {isRejected && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <Ban className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-900">Complaint Rejected</h4>
            <p className="text-xs text-red-700 mt-0.5">
              This grievance has been reviewed and closed by campus administration.
            </p>
          </div>
        </div>
      )}

      {isEscalated && (
        <div className="mb-6 p-4 rounded-lg bg-purple-50 border border-purple-200 flex items-start gap-3">
          <ArrowUpRight className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-purple-900">Complaint Escalated</h4>
            <p className="text-xs text-purple-700 mt-0.5">
              This issue has been escalated to senior university authorities for immediate review.
            </p>
          </div>
        </div>
      )}

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {ORDERED_STEPS.map((step, idx) => {
          const stepRecord = historyByStatus.get(step.status);
          const isCompleted =
            !isRejected && (idx <= currentStepIndex || (currentStatus === 'RESOLVED' && idx <= 3));
          const isCurrent = step.status === currentStatus;

          return (
            <div key={step.status} className="relative flex items-start gap-4">
              {/* Stepper Node */}
              <div
                className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white transition-colors ${
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : isCurrent
                    ? 'border-blue-600 bg-blue-50 text-blue-600 animate-pulse'
                    : 'border-slate-300 text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-slate-300" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-blue-900'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {stepRecord?.timestamp && (
                    <span className="text-xs text-slate-400">
                      {new Date(stepRecord.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {stepRecord?.comment && (
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-md border border-slate-100">
                    {stepRecord.comment}
                  </p>
                )}

                {stepRecord?.changed_by && (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Updated by: <strong className="font-medium text-slate-600">{stepRecord.changed_by}</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
