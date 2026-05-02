import type { PriorityNotification } from "@/utils/priorityNotifications";

type Props = PriorityNotification;

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp.includes("T") ? timestamp : timestamp.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function NotificationCard({
  ID,
  Type,
  Message,
  Timestamp,
  priorityScore,
  rank,
}: Props) {
  return (
    <article className={`card card--${Type.toLowerCase()}`}>
      <div className="card__rank">#{rank}</div>
      <div className="card__body">
        <div className="card__meta">
          <span>{Type}</span>
          <time dateTime={Timestamp}>{formatTime(Timestamp)}</time>
        </div>
        <h3>{Message}</h3>
        <p>ID: {ID}</p>
        <small>Score {priorityScore}</small>
      </div>
    </article>
  );
}
