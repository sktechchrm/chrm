import { useState, lazy, Suspense } from "react";
import Navigation from "../components/common/Navigation";
import Dashboard from "../components/Dashboard";
import Footer from "../components/common/footer";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { useAuth } from "../context/AuthContext";
import RouteGuard from "../security/RouteGuard";
import SessionWarningBanner from "../components/common/SessionWarningBanner";

// ── Code splitting: each HR module loads on first access only ─────────────────
const MaternityBenefit  = lazy(() => import("../components/maternityBenefit/maternityBenefit"));
const FinalSettlement   = lazy(() => import("../components/finalSettlement/FinalSettlement"));
const LeftNotice        = lazy(() => import("../components/LeftEmployeeNotice/EmployeeNoticeView"));
const RequisitionManager= lazy(() => import("../components/requisition/RequisitionManager"));
const IncrementManager  = lazy(() => import("../components/incrementBill/IncrementManager"));
const PersonalFile      = lazy(() => import("../components/employeePersonalFile/EmployeeFileSystem"));
const Meeting           = lazy(() => import("../components/meeting/MeetingManager"));
const WorkerRights      = lazy(() => import("../components/mapp/WorkerRights"));
const WorkerGuidelineViewer = lazy(() => import("../components/workerGuideline/WorkerGuidelineViewer"));
const ReportModule          = lazy(() => import("../components/reports/ReportModule"));
const AuthorityControlModule = lazy(() => import("../components/authorityControl/AuthorityControl"));
const DatabaseAdminModule    = lazy(() => import("../components/admin/DatabaseAdmin"));
const GrievanceModule        = lazy(() => import("../components/grievance/GrievanceModule"));

// ── Skeleton loader — shown while a lazy module chunk is downloading ──────────
// Uses CSS animation (no JS timers) so it renders instantly and is safe for
// any module. The shimmer effect signals "loading" without a jarring spinner.
function ModuleLoader() {
  return (
    <div
      role="status"
      aria-label="Loading module, please wait"
      style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -800px 0; }
          100% { background-position:  800px 0; }
        }
        .skeleton-block {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      {/* Header bar skeleton */}
      <div className="skeleton-block" style={{ height: "48px", width: "55%", marginBottom: "28px" }} />

      {/* Two-column form rows */}
      {[1, 2, 3].map(row => (
        <div key={row} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <div className="skeleton-block" style={{ height: "13px", width: "40%", marginBottom: "8px" }} />
            <div className="skeleton-block" style={{ height: "40px" }} />
          </div>
          <div>
            <div className="skeleton-block" style={{ height: "13px", width: "40%", marginBottom: "8px" }} />
            <div className="skeleton-block" style={{ height: "40px" }} />
          </div>
        </div>
      ))}

      {/* Full-width row */}
      <div style={{ marginBottom: "16px" }}>
        <div className="skeleton-block" style={{ height: "13px", width: "30%", marginBottom: "8px" }} />
        <div className="skeleton-block" style={{ height: "40px" }} />
      </div>

      {/* Result card skeleton */}
      <div className="skeleton-block" style={{ height: "120px", marginTop: "28px", borderRadius: "14px" }} />

      {/* Screen-reader announcement */}
      <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        Loading…
      </span>
    </div>
  );
}


// ── Main shell ────────────────────────────────────────────────────────────────
export default function RewardApp() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user } = useAuth();

  const goTo = (page: string) => setCurrentPage(page);

  const renderPage = () => {
    if (currentPage === "dashboard") return <Dashboard setCurrentPage={goTo} />;

    // RouteGuard checks both role minimum AND allowedModules — single enforced gate
    return (
      <RouteGuard moduleId={currentPage}>
        <ErrorBoundary moduleName={currentPage}>
          <Suspense fallback={<ModuleLoader />}>
            {currentPage === "maternity"       && <MaternityBenefit />}
            {currentPage === "settlement"      && <FinalSettlement />}
            {currentPage === "leftnotice"      && <LeftNotice />}
            {currentPage === "requisition"     && <RequisitionManager />}
            {currentPage === "increment"       && <IncrementManager />}
            {currentPage === "personalfile"    && <PersonalFile />}
            {currentPage === "meeting"         && <Meeting />}
            {currentPage === "workerrights"    && <WorkerRights />}
            {currentPage === "workerguideline" && <WorkerGuidelineViewer />}
            {currentPage === "reports"         && <ReportModule onNavigateToModule={(mod, _rec) => {
              // Map DbModule names → currentPage IDs used by RewardApp
              const DB_TO_PAGE: Record<string, string> = {
                employees:    'personalfile',
                settlements:  'settlement',
                maternity:    'maternity',
                leftnotice:   'leftnotice',
                requisitions: 'requisition',
                increments:   'increment',
                meetings:     'meeting',
                grievance:    'grievance',
              };
              const page = DB_TO_PAGE[mod] ?? mod;
              goTo(page);
            }} />}
            {currentPage === "authority"       && <AuthorityControlModule />}
            {currentPage === "database"        && <DatabaseAdminModule />}
            {currentPage === "grievance"       && <GrievanceModule />}
          </Suspense>
        </ErrorBoundary>
      </RouteGuard>
    );
  };

  return (
    <>
      <SessionWarningBanner />
      <style>{`
        :root { --nav-h: 60px; --footer-h: 40px; }
        html, body { margin: 0; padding: 0; background: #f1f5f9; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .app-shell { min-height: 100vh; background: #f1f5f9; }
        .app-main  { padding-top: var(--nav-h); padding-bottom: var(--footer-h);
                     min-height: 100vh; box-sizing: border-box; }
      `}</style>
      <div className="app-shell">
        <Navigation currentPage={currentPage} setCurrentPage={goTo} />
        <main id="main-content" className="app-main" tabIndex={-1}>{renderPage()}</main>
        <Footer />
      </div>
    </>
  );
}