"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useTeams } from "../../hooks/useTeams";

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50),
  logo: z.string().optional(),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

interface CreateTeamProps {
  leagueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeam({ leagueId, open, onOpenChange }: CreateTeamProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTeam } = useTeams(leagueId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
  });

  const onSubmit = async (data: CreateTeamForm) => {
    try {
      setIsSubmitting(true);
      await createTeam({ 
        name: data.name, 
        leagueId, 
        logo: data.logo || "/avatars/default.svg" 
      });
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Failed to create team:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create your team for this league. Choose a unique name that
            represents your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter team name"
              className="bg-background text-foreground"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
