import DashboardHeader from '../DashboardHeader';

export default function DashboardHeaderExample() {
  return (
    <div className="space-y-4">
      <DashboardHeader botRunning={true} onlineStatus="online" />
      <DashboardHeader botRunning={false} onlineStatus="offline" />
      <DashboardHeader botRunning={false} onlineStatus="loading" />
    </div>
  );
}
