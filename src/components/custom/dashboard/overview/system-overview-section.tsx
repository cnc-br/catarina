import {
  Church,
  Flame,
  Home,
  MapPin,
  Users,
  UsersRound,
} from "lucide-react";

import {
  DistributionCard,
  DistributionLegend,
  DistributionRows,
  StackedDistributionBar,
  type DistributionRow,
} from "./distribution-card";
import MetricCard from "./metric-card";
import { formatNumber, type SystemOverview } from "./system-overview";

type SystemOverviewProps = {
  data: SystemOverview;
};

function plural(value: number, singular: string, pluralForm: string): string {
  return `${formatNumber(value)} ${value === 1 ? singular : pluralForm}`;
}

const ROLE_DOT_CLASSES = [
  "bg-primary",
  "bg-chart-2",
  "bg-muted-foreground/40",
];

export default function SystemOverviewSection({ data }: SystemOverviewProps) {
  const pessoasSegments = [
    {
      label: "Ativas",
      value: data.pessoas.ativas,
      percent: data.pessoas.ativasPercent,
      className: "bg-primary",
    },
    {
      label: "Inativas",
      value: data.pessoas.inativas,
      percent: data.pessoas.inativasPercent,
      className: "bg-muted-foreground/30",
    },
  ];

  const roleRows: DistributionRow[] = data.usuarios.porPapel.map(
    (role, index) => ({
      label: role.label,
      value: role.value,
      percent: role.percent,
      dotClassName: ROLE_DOT_CLASSES[index] ?? "bg-chart-3",
      muted: role.value === 0,
    }),
  );

  const generatedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  return (
    <section aria-labelledby="dados-sistema" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="dados-sistema"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Dados do sistema
          </h2>
          <p className="text-sm text-muted-foreground">
            Visão geral atualizada do cadastro
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Atualizado em {generatedAt}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Pessoas"
          value={formatNumber(data.pessoas.total)}
          icon={Users}
          detail={`${formatNumber(data.pessoas.ativas)} ativas · ${formatNumber(data.pessoas.inativas)} inativas`}
        >
          <StackedDistributionBar
            segments={pessoasSegments}
            ariaLabel={`Pessoas: ${plural(data.pessoas.ativas, "ativa", "ativas")} e ${plural(data.pessoas.inativas, "inativa", "inativas")}`}
          />
        </MetricCard>

        <MetricCard
          label="Paróquias"
          value={formatNumber(data.paroquias)}
          icon={Church}
          detail={plural(data.dioceses, "diocese", "dioceses")}
        />

        <MetricCard
          label="Dioceses"
          value={formatNumber(data.dioceses)}
          icon={MapPin}
          detail={plural(data.paroquias, "paróquia", "paróquias")}
        />

        <MetricCard
          label="Comunidades"
          value={formatNumber(data.comunidades)}
          icon={Home}
          detail={plural(data.equipes, "equipe", "equipes")}
        />

        <MetricCard
          label="Equipes"
          value={formatNumber(data.equipes)}
          icon={UsersRound}
          detail={plural(data.comunidades, "comunidade", "comunidades")}
        />

        <MetricCard
          label="Carismas"
          value={formatNumber(data.carismas.total)}
          icon={Flame}
          detail={plural(data.carismas.vinculos, "vínculo", "vínculos")}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <DistributionCard
          title="Pessoas por situação"
          description="Distribuição entre cadastros ativos e inativos"
        >
          <StackedDistributionBar
            segments={pessoasSegments}
            ariaLabel={`Pessoas por situação: ${plural(data.pessoas.ativas, "ativa", "ativas")} e ${plural(data.pessoas.inativas, "inativa", "inativas")}`}
          />
          <DistributionLegend segments={pessoasSegments} />
        </DistributionCard>

        <DistributionCard
          title="Usuários por papel"
          description={`${plural(data.usuarios.total, "usuário", "usuários")} no total`}
        >
          <DistributionRows rows={roleRows} />
        </DistributionCard>
      </div>
    </section>
  );
}
