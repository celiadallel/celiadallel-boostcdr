import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PodCard } from "@/components/PodCard";

const MOCK = [
  { name: "LinkedIn Growth - Mktg", members: 18 },
  { name: "Product Leaders", members: 12 },
];

export default function Pods() {
  const nav = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Pods</h1>
          <p className="text-sm text-muted-foreground">Invite-only groups to exchange likes and comments.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild><Link to="/pods/create">Create Pod</Link></Button>
          <Button asChild variant="secondary"><Link to="/pods/join">Join with Invite</Link></Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK.map((p) => (
          <PodCard key={p.name} name={p.name} members={p.members} onView={() => nav("/queue")} />
        ))}
      </div>
    </div>
  );
}
