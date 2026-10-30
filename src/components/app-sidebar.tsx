"use client";

import type { ComponentProps } from "react";
import {
  ChurchIcon,
  GitBranchIcon,
  Map,
  MonitorCogIcon,
  MonitorUpIcon,
  NotepadTextDashedIcon,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavOutros } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { ProjectCNCSwitcher } from "@/components/projectcnc-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import packageJson from "../../package.json";

// This is sample data.
const data = {
  cnc: {
    name: "CNC - Gestão",
    logo: ChurchIcon,
    subTitle: "Caminho Neocatecumenal",
  },
  navMain: [
    {
      title: "Nucleo",
      url: "#",
      icon: MonitorUpIcon,
      isActive: true,
      items: [
        {
          title: "Pessoas",
          url: "/dashboard/pessoas",
        },
        {
          title: "Comunidades",
          url: "/dashboard/comunidades",
        },
        {
          title: "Equipes",
          url: "/dashboard/equipes",
        },
      ],
    },
    {
      title: "Pontos fisicos",
      url: "#",
      icon: ChurchIcon,
      isActive: true,
      items: [
        {
          title: "Macro Região",
          url: "/dashboard/macro-regiao",
        },
        {
          title: "Região",
          url: "/dashboard/regioes",
        },
        {
          title: "Setor",
          url: "/dashboard/setores",
        },
        {
          title: "Diocese",
          url: "/dashboard/dioceses",
        },
        {
          title: "Paroquia",
          url: "/dashboard/paroquias",
        },
        {
          title: "Localidade",
          url: "/dashboard/localidade",
        },
      ],
    },
    {
      title: "Relatorios",
      url: "#",
      icon: NotepadTextDashedIcon,
      items: [
        {
          title: "Comunidades",
          url: "#",
        },
        {
          title: "Região",
          url: "#",
        },
      ],
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "País",
          url: "/dashboard/pais",
        },
        {
          title: "Cidades",
          url: "/dashboard/cidades",
        },
        {
          title: "Carismas",
          url: "/dashboard/carismas",
        },
        {
          title: "Etapas",
          url: "/dashboard/etapas",
        },
        {
          title: "Estado Civil",
          url: "/dashboard/estado-civil",
        },
        {
          title: "Usuários",
          url: "/dashboard/usuarios",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Passaportes",
      url: "/dashboard/passaportes",
      icon: Map,
    },
    {
      name: "Github / Codigo",
      url: "https://github.com/leonardocintra/catarina",
      icon: GitBranchIcon,
    },
  ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const versao = packageJson.version;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectCNCSwitcher cnc={data.cnc} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavOutros projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <div className="flex justify-center items-center text-orange-600 font-semibold space-x-2">
          <MonitorCogIcon size={"16px"} />
          <div className="text-xs">v{versao}</div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
