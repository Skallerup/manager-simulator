import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { TransferService } from "../services/transfer-service";
import { PriceService } from "../services/price-service";

const prisma = new PrismaClient();

// Helper function to get user from token
async function getUserFromToken(req: Request) {
  const token = req.cookies.access_token;
  if (!token) {
    throw new Error("No access token provided");
  }

  const { verifyAccessToken } = await import("../auth/tokens");
  const payload = verifyAccessToken(token);
  
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

// Get all available transfers
export async function getAvailableTransfersHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const transfers = await TransferService.getAvailableTransfers(user.id);
    res.json(transfers);
  } catch (error: any) {
    console.error("Get available transfers error:", error);
    res.status(500).json({ error: error.message || "Failed to get transfers" });
  }
}

// Get minimum price for a player
export async function getPlayerMinimumPriceHandler(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    const minimumPrice = PriceService.calculateMinimumPrice(
      player.speed,
      player.shooting,
      player.passing,
      player.defending,
      player.stamina,
      player.reflexes,
      player.age,
      player.position
    );

    const suggestedPrice = PriceService.calculateSuggestedPrice(
      player.speed,
      player.shooting,
      player.passing,
      player.defending,
      player.stamina,
      player.reflexes,
      player.age,
      player.position
    );

    // Calculate rating
    const rating = Math.round((player.speed + player.shooting + player.passing + 
                              player.defending + player.stamina + player.reflexes) / 6);

    res.json({
      playerId: player.id,
      playerName: player.name,
      rating,
      age: player.age,
      position: player.position,
      minimumPrice,
      suggestedPrice,
      formattedMinimumPrice: PriceService.formatPrice(minimumPrice),
      formattedSuggestedPrice: PriceService.formatPrice(suggestedPrice),
    });
  } catch (error: any) {
    console.error("Get player minimum price error:", error);
    res.status(500).json({ error: error.message || "Failed to get minimum price" });
  }
}

// Get team's transfers
export async function getTeamTransfersHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    
    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const transfers = await TransferService.getTeamTransfers(team.id);
    res.json(transfers);
  } catch (error: any) {
    console.error("Get team transfers error:", error);
    res.status(500).json({ error: error.message || "Failed to get team transfers" });
  }
}

// List a player for transfer
export async function listPlayerForTransferHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { playerId } = req.params;
    const { askingPrice } = req.body;

    if (!askingPrice || askingPrice <= 0) {
      return res.status(400).json({ error: "Invalid asking price" });
    }

    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Get player details to calculate minimum price
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    // Calculate minimum price
    const minimumPrice = PriceService.calculateMinimumPrice(
      player.speed,
      player.shooting,
      player.passing,
      player.defending,
      player.stamina,
      player.reflexes,
      player.age,
      player.position
    );

    // Validate asking price is at least minimum price
    if (askingPrice < minimumPrice) {
      return res.status(400).json({ 
        error: `Asking price must be at least ${PriceService.formatPrice(minimumPrice)}`,
        minimumPrice,
        suggestedPrice: PriceService.calculateSuggestedPrice(
          player.speed,
          player.shooting,
          player.passing,
          player.defending,
          player.stamina,
          player.reflexes,
          player.age,
          player.position
        )
      });
    }

    const transfer = await TransferService.listPlayerForTransfer(playerId, team.id, askingPrice);

    if (!transfer) {
      return res.status(400).json({ error: "Failed to list player for transfer" });
    }

    res.json(transfer);
  } catch (error: any) {
    console.error("List player for transfer error:", error);
    res.status(500).json({ error: error.message || "Failed to list player" });
  }
}

// Buy a player
export async function buyPlayerHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { transferId } = req.params;

    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const transfer = await TransferService.buyPlayer(transferId, team.id);
    res.json(transfer);
  } catch (error: any) {
    console.error("Buy player error:", error);
    res.status(400).json({ error: error.message || "Failed to buy player" });
  }
}

// Cancel a transfer
export async function cancelTransferHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { transferId } = req.params;

    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const success = await TransferService.cancelTransfer(transferId, team.id);

    if (!success) {
      return res.status(400).json({ error: "Failed to cancel transfer" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Cancel transfer error:", error);
    res.status(500).json({ error: error.message || "Failed to cancel transfer" });
  }
}

// Fire a player (remove from team and make available for free transfer)
export async function firePlayerHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { playerId } = req.params;

    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const success = await TransferService.firePlayer(playerId, team.id);

    if (!success) {
      return res.status(400).json({ error: "Failed to fire player" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Fire player error:", error);
    res.status(500).json({ error: error.message || "Failed to fire player" });
  }
}

// Get free transfer players (fired players available for free)
export async function getFreeTransferPlayersHandler(req: Request, res: Response) {
  try {
    const players = await TransferService.getFreeTransferPlayers();
    res.json(players);
  } catch (error: any) {
    console.error("Get free transfer players error:", error);
    res.status(500).json({ error: error.message || "Failed to get free transfer players" });
  }
}

// Sign a free transfer player (no cost)
export async function signFreeTransferPlayerHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { playerId } = req.params;

    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const success = await TransferService.signFreeTransferPlayer(playerId, team.id);

    if (!success) {
      return res.status(400).json({ error: "Failed to sign free transfer player" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Sign free transfer player error:", error);
    res.status(500).json({ error: error.message || "Failed to sign free transfer player" });
  }
}

// Generate free agents (admin function)
export async function generateFreeAgentsHandler(req: Request, res: Response) {
  try {
    const { count = 20 } = req.body;
    
    await TransferService.generateFreeAgents(count);
    
    res.json({ success: true, message: `Generated ${count} free agents` });
  } catch (error: any) {
    console.error("Generate free agents error:", error);
    res.status(500).json({ error: error.message || "Failed to generate free agents" });
  }
}
