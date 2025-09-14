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
  Users,
  Gamepad2,
  ShoppingCart,
  Shield,
  UserCheck,
  Building2,
  Zap,
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
const getData = (t: any, isAdmin: boolean = false, isTestAccount: boolean = false) => ({
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
            title: t('allLeagues'),
            url: "/leagues",
            icon: Trophy,
          },
        ],
  management: [
    {
      title: t('myTeam'),
      url: "/my-team",
      icon: Users,
    },
    {
      title: t('transfers'),
      url: "/transfers",
      icon: ShoppingCart,
    },
    {
      title: t('match'),
      url: "/match",
      icon: Gamepad2,
    },
    {
      title: t('training'),
      url: "/training",
      icon: Zap,
    },
    {
      title: t('stadium'),
      url: "/stadium",
      icon: Building2,
    },
  ],
  admin: isAdmin ? [
    {
      title: t('switchToTest'),
      url: "/admin/switch-test",
      icon: UserCheck,
      action: "switchToTest",
    },
  ] : [],
  testAccount: isTestAccount ? [
    {
      title: t('switchToAdmin'),
      url: "/admin/switch-admin",
      icon: Shield,
      action: "switchToAdmin",
    },
  ] : [],
  projects: [],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { t } = useTranslation('navigation');
  
  // Check if user is admin or test account
  const isAdmin = user?.email === 'skallerup+3@gmail.com';
  const isTestAccount = user?.email === 'skallerup+4@gmail.com';
  
  const data = getData(t, isAdmin, isTestAccount);

  // Create user object for NavUser component
  const userData = user
    ? {
        name: user.name || t('user'),
        email: user.email,
        avatar: "/avatars/default.svg", // You can add avatar support later
      }
    : {
        name: t('guest'),
        email: "guest@example.com",
        avatar: "/avatars/default.svg",
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
              Manager Simulator
            </span>
            <span className="text-xs text-muted-foreground">Football Game</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.home} />
        <NavMain items={data.leagues} label={t('leagues')} />
        <NavMain items={data.management} label={t('management')} />
        {data.admin.length > 0 && <NavMain items={data.admin} label={t('admin')} />}
        {data.testAccount.length > 0 && <NavMain items={data.testAccount} label={t('testAccount')} />}
        {data.projects.length > 0 && <NavProjects projects={data.projects} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
