import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = { name: string; members: number; onView?: () => void };
export function PodCard({ name, members, onView }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription>{members} members · invite-only</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end">
        <Button variant="secondary" onClick={onView}>View</Button>
      </CardFooter>
    </Card>
  );
}