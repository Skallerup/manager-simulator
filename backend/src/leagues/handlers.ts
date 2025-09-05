import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import {
  createLeagueSchema,
  updateLeagueSchema,
  joinLeagueSchema,
} from "./types";
import { verifyAccessToken } from "../auth/tokens";

// Helper function to get user from token
async function getUserFromToken(req: Request) {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  const payload = verifyAccessToken(accessToken);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function createLeagueHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const parsed = createLeagueSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.errors });
    }

    const { name, description, maxTeams, draftMethod, signupDeadline } =
      parsed.data;

    const league = await prisma.league.create({
      data: {
        name,
        description,
        maxTeams,
        draftMethod,
        signupDeadline: new Date(signupDeadline),
        adminId: user.id,
        leagueMembers: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
        leagueMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        teams: true,
      },
    });

    return res.status(201).json(league);
  } catch (error: any) {
    console.error("Create league error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create league" });
  }
}

export async function getLeaguesHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);

    const leagues = await prisma.league.findMany({
      where: {
        OR: [
          { adminId: user.id },
          { leagueMembers: { some: { userId: user.id } } },
        ],
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
        leagueMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        teams: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { teams: true, leagueMembers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(leagues);
  } catch (error: any) {
    console.error("Get leagues error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get leagues" });
  }
}

export async function browseLeaguesHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);

    // Get all public leagues that the user is not already a member of
    const leagues = await prisma.league.findMany({
      where: {
        AND: [
          // Not admin
          { adminId: { not: user.id } },
          // Not already a member
          { leagueMembers: { none: { userId: user.id } } },
          // Only show leagues that are still accepting signups
          { status: "SIGNUP" },
          // Only show leagues where signup deadline hasn't passed
          { signupDeadline: { gt: new Date() } },
        ],
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { teams: true, leagueMembers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(leagues);
  } catch (error: any) {
    console.error("Browse leagues error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to browse leagues" });
  }
}

export async function getLeagueHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    const league = await prisma.league.findFirst({
      where: {
        id,
        OR: [
          { adminId: user.id },
          { leagueMembers: { some: { userId: user.id } } },
        ],
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
        leagueMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        teams: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: { draftPicks: true },
            },
          },
        },
        _count: {
          select: { teams: true, leagueMembers: true },
        },
      },
    });

    if (!league) {
      return res.status(404).json({ error: "League not found" });
    }

    return res.status(200).json(league);
  } catch (error: any) {
    console.error("Get league error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get league" });
  }
}

export async function updateLeagueHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;
    const parsed = updateLeagueSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.errors });
    }

    // Check if user is admin of the league
    const league = await prisma.league.findFirst({
      where: { id, adminId: user.id },
    });

    if (!league) {
      return res
        .status(403)
        .json({ error: "Only league admin can update league" });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.signupDeadline) {
      updateData.signupDeadline = new Date(updateData.signupDeadline);
    }
    if (updateData.draftStartTime) {
      updateData.draftStartTime = new Date(updateData.draftStartTime);
    }

    const updatedLeague = await prisma.league.update({
      where: { id },
      data: updateData,
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
        leagueMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        teams: true,
      },
    });

    return res.status(200).json(updatedLeague);
  } catch (error: any) {
    console.error("Update league error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to update league" });
  }
}

export async function deleteLeagueHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    // Check if user is admin of the league
    const league = await prisma.league.findFirst({
      where: { id, adminId: user.id },
    });

    if (!league) {
      return res
        .status(403)
        .json({ error: "Only league admin can delete league" });
    }

    await prisma.league.delete({
      where: { id },
    });

    return res.status(200).json({ message: "League deleted successfully" });
  } catch (error: any) {
    console.error("Delete league error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete league" });
  }
}

export async function joinLeagueHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    // Check if league exists and is in signup phase
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        leagueMembers: true,
        teams: true,
      },
    });

    if (!league) {
      return res.status(404).json({ error: "League not found" });
    }

    if (league.status !== "SIGNUP") {
      return res
        .status(400)
        .json({ error: "League is not accepting new members" });
    }

    if (new Date() > league.signupDeadline) {
      return res.status(400).json({ error: "Signup deadline has passed" });
    }

    if (league.teams.length >= league.maxTeams) {
      return res.status(400).json({ error: "League is full" });
    }

    // Check if user is already a member
    const existingMember = league.leagueMembers.find(
      (member) => member.userId === user.id
    );
    if (existingMember) {
      return res
        .status(400)
        .json({ error: "You are already a member of this league" });
    }

    // Add user as member
    await prisma.leagueMember.create({
      data: {
        userId: user.id,
        leagueId: id,
        role: "MEMBER",
      },
    });

    return res.status(200).json({ message: "Successfully joined league" });
  } catch (error: any) {
    console.error("Join league error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to join league" });
  }
}

export async function leaveLeagueHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    // Check if user is a member (but not admin)
    const league = await prisma.league.findFirst({
      where: { id, adminId: user.id },
    });

    if (league) {
      return res
        .status(400)
        .json({ error: "League admin cannot leave the league" });
    }

    const member = await prisma.leagueMember.findFirst({
      where: { userId: user.id, leagueId: id },
    });

    if (!member) {
      return res
        .status(404)
        .json({ error: "You are not a member of this league" });
    }

    // Remove user from league
    await prisma.leagueMember.delete({
      where: { id: member.id },
    });

    // Also remove any teams the user has in this league
    await prisma.team.deleteMany({
      where: { ownerId: user.id, leagueId: id },
    });

    return res.status(200).json({ message: "Successfully left league" });
  } catch (error: any) {
    console.error("Leave league error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to leave league" });
  }
}
