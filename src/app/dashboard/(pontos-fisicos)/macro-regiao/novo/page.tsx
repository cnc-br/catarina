"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import MacroRegiaoForm from "@/components/custom/dashboard/macro-regioes/form-macro-regiao";
import { BASE_URL } from "@/lib/utils";

export default function NovaMacroRegiaoPage() {
  return (
    <div>
      <PageSubtitle
        title="Cadastro de nova macro região"
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/macro-regiao",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <MacroRegiaoForm urlBase={BASE_URL} />
    </div>
  );
}
