import StatsDisplay from '../StatsDisplay';

export default function StatsDisplayExample() {
  return (
    <div className="space-y-4">
      <StatsDisplay messagesReceived={42} messagesSent={38} threadCount={12} />
      <StatsDisplay messagesReceived={0} messagesSent={0} threadCount={0} />
    </div>
  );
}
