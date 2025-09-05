"use client";

import * as React from "react";
import {
  Home,
  Trophy,
  User,
  Search,
  Target,
  TrendingUp,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useTranslation } from 'react-i18next';

// This is sample data.
const getData = (t: any) => ({
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  home: [
    {
      title: t('managerHub'),
      url: "/dashboard",
      icon: Home,
    },
  ],
  leagues: [
    {
      title: t('myLeagues'),
      url: "/leagues",
      icon: Trophy,
    },
    {
      title: t('scoutLeagues'),
      url: "/browse-leagues",
      icon: Search,
    },
  ],
  management: [
    {
      title: t('createLeague'),
      url: "/create-league",
      icon: Target,
    },
    {
      title: t('leaderboard'),
      url: "/leaderboard",
      icon: TrendingUp,
    },
  ],
  projects: [],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  const data = getData(t);

  // Create user object for NavUser component
  const userData = user
    ? {
        name: user.name || t('user'),
        email: user.email,
        avatar: "/avatars/default.jpg", // You can add avatar support later
      }
    : {
        name: t('guest'),
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Draft Manager
            </span>
            <span className="text-xs text-muted-foreground">Football Game</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.home} />
        <NavMain items={data.leagues} label={t('leagues')} />
        <NavMain items={data.management} label={t('management')} />
        {data.projects.length > 0 && <NavProjects projects={data.projects} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
