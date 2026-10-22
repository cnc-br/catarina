import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const url = `${AmbrosioBaseUrl}/paroquia`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const { id } = await params;

  const token = cookieStore.get("token")?.value;
  const res = await fetch(`${url}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    return Response.json(
      {
        message: "Paroquia não encontrada",
      },
      {
        status: 404,
      }
    );
  }

  if (res.status === 401) {
    return Response.json(
      {
        message: "Você não tem permissão para acessar essa paroquia",
      },
      {
        status: 401,
      }
    );
  }

  const data = await res.json();
  return Response.json(data.data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const data = await req.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const paroquia = {
    descricao: data.descricao,
    diocese: {
      id: data.dioceseId,
    },
    observacao: data.observacao,
    endereco: {
      id: parseInt(data.enderecoId),
      logradouro: data.logradouro,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      UF: data.uf,
      cep: data.cep,
    },
  };

  const { id } = await params;
  const res = await fetch(`${url}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paroquia),
  });

  const resData = await res.json();

  if (res.status === 200) {
    return Response.json(resData, {
      status: 200,
    });
  } else {
    return Response.json(
      {
        message: resData.message[0],
      },
      {
        status: res.status,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const { id } = await params;

  const token = cookieStore.get("token")?.value;
  const res = await fetch(`${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    return Response.json(
      {
        message: "Paróquia não encontrada",
      },
      {
        status: 404,
      }
    );
  }

  if (res.status === 401 || res.status === 403) {
    return Response.json(
      {
        message: "Você não tem permissão para excluir essa paroquia",
      },
      {
        status: res.status,
      }
    );
  }

  if (!res.ok) {
    const resData = await res.json();
    const message = Array.isArray(resData?.message)
      ? resData.message[0]
      : resData?.message;

    return Response.json(
      {
        message: message ?? "Erro ao excluir paroquia",
      },
      {
        status: res.status,
      }
    );
  }

  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const resData = await res.json();
  return Response.json(resData, {
    status: res.status,
  });
}
