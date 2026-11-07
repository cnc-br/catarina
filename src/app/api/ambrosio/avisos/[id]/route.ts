import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const url = `${AmbrosioBaseUrl}/avisos`;

// Público: busca um aviso específico.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(`${url}/${id}`, {
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(
    data ?? { message: res.statusText },
    { status: res.status },
  );
}

// Somente ADMIN: atualiza um aviso com o token do admin no header.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }

  const res = await fetch(`${url}/${id}`, {
    method: "PATCH",
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
