import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Mail, LogIn, User, Linkedin, Loader2, CheckCircle, AlertTriangle, KeyRound } from "lucide-react";

export default function Login() {
  const { signInWithEmail, signInWithProvider, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await signInWithEmail(email);
      if (error) throw error;
      setSent(true);
      toast.success("A magic link has been sent to your email");
    } catch (error: any) {
      toast.error(error?.message || "Unable to send magic link");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full mx-auto mt-12">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <LogIn className="w-6 h-6 text-primary" />
            Connecte-toi à EngagePods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <div className="text-green-700 flex items-center gap-2 justify-center text-center">
              <CheckCircle className="w-5 h-5" />
              Vous êtes connecté·e : <span className="font-semibold">{user.email}</span>
            </div>
          ) : sent ? (
            <div className="text-green-600 space-y-2 text-center">
              <CheckCircle className="w-7 h-7 mx-auto" />
              <div className="font-medium">Consulte ta boîte mail<br/>(et regarde le spam !)</div>
              <div className="text-sm text-muted-foreground">Clique sur le lien magique envoyé à <b>{email}</b> pour finaliser la connexion.</div>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <label className="block text-sm font-medium mb-2" htmlFor="email">
                  <Mail className="inline-block mr-1 w-4 h-4 text-muted-foreground" /> Email
                </label>
                <Input
                  type="email"
                  id="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  disabled={submitting || loading}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
                <Button type="submit" className="w-full gap-2" disabled={submitting || loading || !email}>
                  {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
                  Recevoir un lien magique
                </Button>
              </form>
              <div className="flex items-center py-2">
                <Separator className="flex-1" />
                <span className="px-2 text-xs text-muted-foreground">ou</span>
                <Separator className="flex-1" />
              </div>
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => signInWithProvider('google')} disabled={loading}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Continuer avec Google
              </Button>
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => signInWithProvider('linkedin')} disabled={loading}>
                <Linkedin className="w-5 h-5 text-blue-700" />
                LinkedIn (bientôt)
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
