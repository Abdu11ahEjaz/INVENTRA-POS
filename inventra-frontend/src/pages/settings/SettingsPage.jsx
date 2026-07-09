import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

const TIMEZONES = [
  "UTC", "UTC+05:30", "UTC+05:00", "UTC+03:00", "UTC+04:00",
  "UTC-05:00", "UTC-08:00", "UTC+08:00", "UTC+09:00", "UTC+01:00",
];

export default function SettingsPage() {
  const { currencyCode, setCurrency, CURRENCIES, formatCurrency } = useCurrency();

  const [company, setCompany] = useState({
    name:     localStorage.getItem("inventra_company_name")     || "My Company",
    taxId:    localStorage.getItem("inventra_company_taxid")    || "",
    timezone: localStorage.getItem("inventra_company_timezone") || "UTC+05:30",
  });

  const handleSaveCompany = () => {
    localStorage.setItem("inventra_company_name",     company.name);
    localStorage.setItem("inventra_company_taxid",    company.taxId);
    localStorage.setItem("inventra_company_timezone", company.timezone);
    toast.success("Company settings saved");
  };

  const handleCurrencyChange = (code) => {
    setCurrency(code);
    toast.success(`Currency changed to ${code}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Workspace, billing & integration preferences"
      />

      {/* Company */}
      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="text-base font-semibold">Company</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              placeholder="My Company"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tax ID</Label>
            <Input
              value={company.taxId}
              onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
              placeholder="GST / VAT number"
            />
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <Select value={company.timezone} onValueChange={(v) => setCompany({ ...company, timezone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveCompany} className="gradient-primary text-primary-foreground">
            Save Company Settings
          </Button>
        </div>
      </Card>

      {/* Currency */}
      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="text-base font-semibold">Currency</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes the currency symbol and format across the entire app — all prices, charts, and tables update instantly.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Select Currency</Label>
            <Select value={currencyCode} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="w-6 text-center font-mono text-sm">{c.symbol}</span>
                      <span>{c.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Preview</Label>
            <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 text-sm font-semibold">
              {formatCurrency(1234567.89)}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Currently selected: <strong>{currencyCode}</strong> — {CURRENCIES.find(c => c.code === currencyCode)?.name}
        </p>
      </Card>

      {/* Offline & Sync */}
      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="text-base font-semibold">Offline & Sync</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cache data locally and sync when reconnected.
        </p>
        <Separator className="my-4" />
        <div className="space-y-4">
          {[
            { l: "Enable offline mode",        d: "Keep working without internet" },
            { l: "Auto-sync on reconnect",      d: "Push queued changes when back online" },
            { l: "Background invoice queue",    d: "Queue prints when offline" },
          ].map((s) => (
            <div key={s.l} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{s.l}</p>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </Card>

      {/* API Integration */}
      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="text-base font-semibold">API Integration</h3>
        <p className="mt-1 text-sm text-muted-foreground">Connect your MERN backend.</p>
        <div className="mt-4 grid gap-2">
          <Label>API Base URL</Label>
          <Input
            defaultValue={import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
            placeholder="http://localhost:5000/api"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={() => toast.success("Settings saved")}
          >
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
