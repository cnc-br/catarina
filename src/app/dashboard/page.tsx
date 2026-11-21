import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BellRing, CircleAlert, Terminal } from "lucide-react";
import { ROLE_NAO_IDENTIFICADO } from "@/constants";
import { cookies } from "next/headers";
import { AmbrosioBaseUrl } from "@/lib/utils";
import SystemOverviewSection from "@/components/custom/dashboard/overview/system-overview-section";
import {
  extractSystemOverviewPayload,
  normalizeSystemOverview,
  type SystemOverview,
} from "@/components/custom/dashboard/overview/system-overview";

type DashboardUser = {
  email?: string;
  role?: string;
};

type DashboardAviso = {
  id: number;
  texto: string;
  dataFim: string;
};

type SystemOverviewResult =
  | { status: "ok"; data: SystemOverview }
  | { status: "error" };

const avisosUrl = `${AmbrosioBaseUrl}/avisos`;
const systemOverviewUrl = `${AmbrosioBaseUrl}/dashboard`;

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

async function getSystemOverview(): Promise<SystemOverviewResult | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(systemOverviewUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Erro ao carregar dados do sistema",
        response.status,
        response.statusText,
      );
      return { status: "error" };
    }

    const payload = extractSystemOverviewPayload(await response.json());

    if (!payload) {
      console.error("Payload inválido recebido de /dashboard");
      return { status: "error" };
    }

    return { status: "ok", data: normalizeSystemOverview(payload) };
  } catch (error) {
    console.error("Erro ao carregar dados do sistema", error);
    return { status: "error" };
  }
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
  const [user, avisos, overview] = await Promise.all([
    getAuthenticatedUser(),
    getAvisos(),
    getSystemOverview(),
  ]);

  return (
    <div className="space-y-5 pt-4">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo!</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="break-all">{user?.email}</span>
          <Badge variant="secondary" className="text-xs font-semibold">
            Perfil: {user?.role}
          </Badge>
        </div>
      </header>

      {user?.role === ROLE_NAO_IDENTIFICADO && (
        <div className="w-full max-w-3xl">
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
        <div className="w-full max-w-3xl space-y-4">
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

      {overview?.status === "error" && (
        <div className="w-full max-w-3xl">
          <Alert variant="destructive">
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Dados indisponíveis</AlertTitle>
            <AlertDescription>
              Não foi possível carregar os dados do sistema agora. Tente
              novamente mais tarde.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {overview?.status === "ok" && (
        <SystemOverviewSection data={overview.data} />
      )}
    </div>
  );
}
