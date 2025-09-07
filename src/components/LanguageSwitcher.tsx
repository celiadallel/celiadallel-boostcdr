import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const label = locale.toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">{label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("fr")}>Français</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("de")}>Deutsch</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("it")}>Italiano</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
