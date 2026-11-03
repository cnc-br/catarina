import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";

const url = `${AmbrosioBaseUrl}/comunidade`;

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ comunidadeId: string; etapaComunidadeId: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const { comunidadeId, etapaComunidadeId } = await ctx.params;

  const payload = await req.json();

  const etapa = {
    etapaId: payload.etapa,
    observacao: payload.observacao,
    localConvivencia: payload.local,
    dataInicio: payload.dataInicio,
  };

  const response = await fetch(
    `${url}/${comunidadeId}/etapa/${etapaComunidadeId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(etapa),
    },
  );

  const data = await response.json();

  if (response.status === 201) {
    return Response.json(data.data, {
      status: 201,
    });
  } else {
    return Response.json(
      {
        message: data.message,
      },
      {
        status: response.status,
      },
    );
  }
}
