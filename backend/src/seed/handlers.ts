import { Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function seedDatabaseHandler(req: Request, res: Response) {
  try {
    console.log("🌱 Starting database seeding via API...");

    // Run the seed script
    const { stdout, stderr } = await execAsync("npm run seed", {
      cwd: process.cwd(),
    });

    if (stderr) {
      console.error("Seeding stderr:", stderr);
    }

    console.log("Seeding stdout:", stdout);

    return res.status(200).json({
      message: "Database seeded successfully",
      output: stdout,
    });
  } catch (error: any) {
    console.error("❌ Seeding failed:", error);
    return res.status(500).json({
      error: "Failed to seed database",
      details: error.message,
    });
  }
}
