import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

const QUEUE = [
  { id: 1, title: "Jane on PM metrics", url: "https://linkedin.com" },
  { id: 2, title: "Alex growth teardown", url: "https://linkedin.com" },
];

export default function Demo() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("demo.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("demo.subtitle")}</p>
      </div>
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("demo.queue_title")}</h2>
          <ul className="space-y-3">
            {QUEUE.map((q) => (
              <li key={q.id} className="flex items-center justify-between border rounded-md p-3">
                <span className="text-sm">{q.title}</span>
                <Button asChild size="sm"><a href={q.url} target="_blank" rel="noreferrer">{t("demo.open")}</a></Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("demo.points_title")}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border rounded-md p-4"><div className="text-sm">Likes</div><div className="text-2xl font-semibold">+1</div></div>
            <div className="border rounded-md p-4"><div className="text-sm">Comments</div><div className="text-2xl font-semibold">+3</div></div>
            <div className="border rounded-md p-4"><div className="text-sm">Daily limit</div><div className="text-2xl font-semibold">2</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}