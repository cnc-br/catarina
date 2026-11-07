import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const url = `${AmbrosioBaseUrl}/avisos`;

// Público: lista os avisos sem headers de autenticação.
export async function GET() {
  const res = await fetch(url, {
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { message: res.statusText }, {
    status: res.status,
  });
}

// Somente ADMIN: cadastra um novo aviso com o token do admin no header.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(
    data ?? { message: res.statusText },
    { status: res.status },
  );
}
