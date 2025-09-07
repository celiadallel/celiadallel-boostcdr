import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Target, MessageCircle, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";

export default function Pricing() {
  const { t } = useI18n();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Up to 2 submissions per day",
        "Basic pod matching",
        "Manual engagement only",
        "Community support",
        "Basic analytics"
      ],
      limitations: [
        "No industry targeting",
        "No engagement customization", 
        "Standard delivery only",
        "Limited comment options"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "Advanced targeting and customization",
      features: [
        "Up to 10 submissions per day",
        "Industry-specific targeting",
        "Engagement goal customization (5-100 likes)",
        "Comment templates & custom comments",
        "Fast delivery (6-12h) included",
        "Priority pod matching",
        "Advanced analytics",
        "Email support"
      ],
      addOns: [
        "Viral push delivery (+$15 per post)",
        "AI comment generation (coming soon)"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Team",
      price: "Custom",
      period: "",
      description: "For agencies and teams",
      features: [
        "Unlimited submissions",
        "Multi-industry targeting",
        "White-label options",
        "Custom engagement limits",
        "AI comment generation",
        "Instant viral delivery included",
        "Dedicated account manager", 
        "SLA support",
        "Team management",
        "Bulk campaign tools"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];
  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-bold tracking-tight">
            {t("pricing.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Card 
              key={i}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Crown className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.name === 'Pro' && <Target className="h-5 w-5 text-primary" />}
                  {plan.name === 'Team' && <Zap className="h-5 w-5 text-primary" />}
                </CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-base font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Included features:</h4>
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.addOns && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-primary">Add-ons available:</h4>
                    {plan.addOns.map((addon, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{addon}</span>
                      </div>
                    ))}
                  </div>
                )}

                {plan.limitations && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-medium text-muted-foreground text-sm">Free plan limitations:</h4>
                    {plan.limitations.map((limitation, j) => (
                      <div key={j} className="text-xs text-muted-foreground">
                        • {limitation}
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className={`w-full mt-6 ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Premium Features Overview</h2>
          <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Industry Targeting</h3>
                <p className="text-sm text-muted-foreground">
                  Target your posts to professionals in specific industries like tech, finance, marketing, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Comments</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from templates, write custom comments, or use AI-generated responses for authentic engagement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Delivery Speeds</h3>
                <p className="text-sm text-muted-foreground">
                  Choose normal, fast (6-12h), or viral push (1-3h) delivery based on your campaign needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}