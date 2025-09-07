import { useI18n } from "@/i18n";

const Index = () => {
  const { t } = useI18n();
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          {t("hero.title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          {t("hero.subtitle")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/pricing" className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm">{t("cta.pricing")}</a>
          <a href="/demo" className="inline-flex items-center rounded-md border px-4 py-2 text-sm">{t("cta.demo")}</a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 grid gap-4 sm:grid-cols-3">
        <div className="border rounded-lg p-4 text-left">
          <div className="text-sm font-medium">{t("features.invite.title")}</div>
          <p className="text-sm text-muted-foreground">{t("features.invite.desc")}</p>
        </div>
        <div className="border rounded-lg p-4 text-left">
          <div className="text-sm font-medium">{t("features.fair.title")}</div>
          <p className="text-sm text-muted-foreground">{t("features.fair.desc")}</p>
        </div>
        <div className="border rounded-lg p-4 text-left">
          <div className="text-sm font-medium">{t("features.points.title")}</div>
          <p className="text-sm text-muted-foreground">{t("features.points.desc")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold">{t("how.title")}</h2>
        </div>
        <ol className="md:col-span-2 space-y-3 text-sm text-muted-foreground">
          <li>{t("how.step1")}</li>
          <li>{t("how.step2")}</li>
          <li>{t("how.step3")}</li>
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold">{t("compliance.title")}</h2>
        </div>
        <div className="md:col-span-2 text-sm text-muted-foreground">
          {t("compliance.copy")}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-lg font-semibold mb-4">{t("faq.title")}</h2>
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div>
            <div className="font-medium text-foreground">{t("faq.platforms_q")}</div>
            {t("faq.platforms_a")}
          </div>
          <div>
            <div className="font-medium text-foreground">{t("faq.submissions_q")}</div>
            {t("faq.submissions_a")}
          </div>
          <div>
            <div className="font-medium text-foreground">{t("faq.points_q")}</div>
            {t("faq.points_a")}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;