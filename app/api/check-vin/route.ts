import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "@/lib/hmbApi";

export async function POST(req: NextRequest) {
  try {
    const { chassi } = await req.json();

    if (!chassi) {
      return NextResponse.json({ success: false, error: "Chassi é obrigatório" }, { status: 400 });
    }

    const accessToken = await getValidToken();

    const url = `https://api.hyundai-brasil.com:8065/integration/v1.1/repairorder/RepairOrderSet?$filter=CHASSI eq '${chassi}'&$expand=CarWashChecklistSet,TechniciansHoursSet,ProductsSet,ServicesSet`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erro na consulta OS:", errorText);
      return NextResponse.json({ success: false, error: "Erro na API Hyundai" }, { status: 500 });
    }

    const data = await res.json();

    const hasRecords = Array.isArray(data?.d?.results) && data.d.results.length > 0;

    return NextResponse.json({ success: true, valid: hasRecords });

  } catch (err) {
    console.error("Erro interno:", err);
    return NextResponse.json({ success: false, error: "Erro interno no servidor" }, { status: 500 });
  }
}
