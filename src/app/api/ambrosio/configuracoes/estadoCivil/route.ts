import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const url = `${AmbrosioBaseUrl}/estado-civil`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return Response.json(data);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json(
      { message: "Nao autorizado" },
      {
        status: 401,
      },
    );
  }

  const payload = await req.json();
  const descricao = typeof payload?.descricao === "string" ? payload.descricao.trim() : "";

  if (!descricao) {
    return Response.json(
      { message: "O campo descricao e obrigatorio" },
      {
        status: 400,
      },
    );
  }

  const response = await fetch(`${AmbrosioBaseUrl}/estado-civil`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ descricao }),
  });

  const data = await response.json();

  if (response.status === 201) {
    return Response.json(data, {
      status: 201,
    });
  }

  return Response.json(
    {
      message: data.message,
    },
    {
      status: response.status,
    },
  );
}
