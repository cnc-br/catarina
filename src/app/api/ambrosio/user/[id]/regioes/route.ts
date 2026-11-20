import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const url = `${AmbrosioBaseUrl}/users`;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID do usuário é obrigatório" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { regiaoIds } = body;

    if (
      !Array.isArray(regiaoIds) ||
      !regiaoIds.every((idRegiao) => Number.isInteger(idRegiao))
    ) {
      return NextResponse.json(
        { message: "regiaoIds deve ser um array de números inteiros" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(`${url}/${id}/regioes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ regiaoIds }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: "Usuário não encontrado" },
          { status: 404 },
        );
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            message: "Você não tem permissão para atualizar as regiões do usuário",
          },
          { status: response.status },
        );
      }

      const errorData = await response.json().catch(() => ({}));

      if (response.status === 400) {
        return NextResponse.json(
          { message: errorData.message || "Dados inválidos" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { message: "Erro interno do servidor" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Regiões atualizadas com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar regiões do usuário:", error);

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
