import { useI18n } from "@/i18n";
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground">
        {t("footer.copy")}
      </div>
    </footer>
  );
}