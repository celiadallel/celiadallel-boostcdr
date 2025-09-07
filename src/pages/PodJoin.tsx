import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PodJoin() {
  const nav = useNavigate();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Request sent (mock)");
    nav("/pods");
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Join Pod</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Invite code</Label>
          <Input id="code" required placeholder="XXXX-XXXX" />
        </div>
        <Button type="submit" className="w-full">Request Access</Button>
      </form>
    </div>
  );
}
