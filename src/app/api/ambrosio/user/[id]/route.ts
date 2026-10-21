import { AmbrosioBaseUrl } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const url = `${AmbrosioBaseUrl}/users`;

export async function GET(
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

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const response = await fetch(`${url}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: "Usuário não encontrado" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Erro ao buscar usuário" },
        { status: response.status },
      );
    }

    const body = await response.json();
    const data = body.data ?? body;

    return NextResponse.json({
      id: data.id,
      pessoaId: data.pessoaId ?? null,
      pessoa: data.pessoa ?? null,
      email: data.email,
      whatsapp: data.whatsapp ?? null,
      role: data.role,
      active: data.active,
      verifiedWhatsapp: data.verifiedWhatsapp,
      createdAt: data.createdAt,
      paroquias: Array.isArray(data.paroquias) ? data.paroquias : [],
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

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
    const { email, active, whatsapp, role } = body;

    // Validação do formato do email (se fornecido)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Formato de e-mail inválido" },
        { status: 400 },
      );
    }

    // Validação do WhatsApp (se fornecido - 10 ou 11 dígitos)
    if (whatsapp && !/^\d{10,11}$/.test(whatsapp)) {
      return NextResponse.json(
        { message: "WhatsApp deve conter 10 ou 11 dígitos numéricos" },
        { status: 400 },
      );
    }

    // Construir objeto com apenas os campos fornecidos
    const updateData: Record<string, any> = {};
    updateData.active = active;
    if (email) updateData.email = email;
    if (whatsapp) updateData.whatsapp = whatsapp;
    if (role) updateData.role = role;

    // Validar se pelo menos um campo foi fornecido
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Pelo menos um campo deve ser fornecido para atualizar" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Chamada para a API externa
    const response = await fetch(`${url}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Tratamento de erros específicos
      if (response.status === 404) {
        return NextResponse.json(
          { message: "Usuário não encontrado" },
          { status: 404 },
        );
      }

      if (response.status === 409) {
        return NextResponse.json(
          {
            message: "Já existe um usuário com esse E-mail ou CPF cadastrado.",
          },
          { status: 409 },
        );
      }

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

    const userData = await response.json();

    return NextResponse.json(
      {
        message: "Usuário atualizado com sucesso",
        user: {
          id: userData.id,
          email: userData.email,
          whatsapp: userData.whatsapp,
          active: userData.active,
          role: userData.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}