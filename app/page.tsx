"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";

type VinResult = {
  vin: string;
  status: "checking" | "valid" | "invalid";
};

export default function VinCheckerPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<VinResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    const vins = input
      .split(/[\s,;,\n]+/)
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean);

    setResults(vins.map((vin) => ({ vin, status: "checking" })));
    setLoading(true);

    for (const vin of vins) {
      try {
        const res = await fetch("/api/check-vin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chassi: vin }),
        });

        const data = await res.json();

        setResults((prev) =>
          prev.map((r) =>
            r.vin === vin
              ? { ...r, status: data.valid ? "valid" : "invalid" }
              : r
          )
        );
      } catch {
        setResults((prev) =>
          prev.map((r) => (r.vin === vin ? { ...r, status: "invalid" } : r))
        );
      }
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-end p-4">
        <UserButton showName/>
      </div>
      <div className="max-w-2xl mx-auto mt-10 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h1 className="text-xl font-semibold text-center">
              Validador de VIN Hyundai
            </h1>
            <Textarea
              placeholder="Cole um ou mais VINs (um por linha ou separados por vírgula)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={handleCheck}
              disabled={loading || !input.trim()}
              className="w-full"
            >
              {loading ? "Verificando..." : "Validar VINs"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(({ vin, status }) => (
              <Card key={vin} className="p-3 flex justify-between items-center">
                <span className="font-mono">{vin}</span>
                <Badge
                  variant={
                    status === "checking"
                      ? "warning"
                      : status === "valid"
                      ? "success"
                      : "destructive"
                  }
                >
                  {status === "checking"
                    ? "Verificando..."
                    : status === "valid"
                    ? "Válido"
                    : "Inválido"}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
