import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellRing, Terminal } from "lucide-react";
import { ROLE_NAO_IDENTIFICADO } from "@/constants";
import { cookies } from "next/headers";
import { AmbrosioBaseUrl } from "@/lib/utils";

type DashboardUser = {
  email?: string;
  role?: string;
};

type DashboardAviso = {
  id: number;
  texto: string;
  dataFim: string;
};

const avisosUrl = `${AmbrosioBaseUrl}/avisos`;

async function getAuthenticatedUser(): Promise<DashboardUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const response = await fetch(`${AmbrosioBaseUrl}/users/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload?.data ?? null;
}

async function getAvisos(): Promise<DashboardAviso[]> {
  try {
    const response = await fetch(avisosUrl, { cache: "no-store" });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const lista = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    return lista.filter(
      (aviso: DashboardAviso) =>
        typeof aviso?.texto === "string" && aviso.texto.trim().length > 0,
    );
  } catch (error) {
    console.error("Erro ao carregar avisos", error);
    return [];
  }
}

function formatarData(dataFim: string): string {
  const date = new Date(dataFim);
  if (Number.isNaN(date.getTime())) return dataFim;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const [user, avisos] = await Promise.all([
    getAuthenticatedUser(),
    getAvisos(),
  ]);

  return (
    <div className="pt-8">
      <div className="flex justify-center items-center min-h-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo!</h2>
            <h3>{user?.email}</h3>
            <p className="text-muted-foreground mb-4">
              Estamos felizes em ter você aqui.
            </p>
            <Badge variant="secondary" className="text-sm font-semibold">
              Perfil: {user?.role}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {user?.role === ROLE_NAO_IDENTIFICADO && (
        <div className="mx-auto max-w-lg mt-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Você ainda não tem autorização para administrar. Aguarde ou entre
              em contato com o responsável por autorizar sua entrada no sistema.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="mx-auto max-w-lg mb-8 space-y-4 mt-8">
          {avisos.map((aviso) => (
            <Alert key={aviso.id} variant={"destructive"}>
              <BellRing className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Recado importante
                <Badge variant="outline" className="text-xs font-normal">
                  Válido até {formatarData(aviso.dataFim)}
                </Badge>
              </AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {aviso.texto}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
