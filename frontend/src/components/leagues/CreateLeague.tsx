"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from 'react-i18next';
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
import { useLeagues } from "../../hooks/useLeagues";
import type { CreateLeagueData } from "../../lib/types";

const createLeagueSchema = z.object({
  name: z.string().min(1, "League name is required").max(100),
  description: z.string().optional(),
  maxTeams: z.number().int().min(2).max(20),
});

type CreateLeagueForm = z.infer<typeof createLeagueSchema>;

interface CreateLeagueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateLeague({
  open,
  onOpenChange,
  onSuccess,
}: CreateLeagueProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createLeague } = useLeagues();
  const { t } = useTranslation('leagues');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLeagueForm>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      maxTeams: 8,
    },
  });

  const onSubmit = async (data: CreateLeagueForm) => {
    try {
      setIsSubmitting(true);
      const leagueData: CreateLeagueData = {
        ...data,
      };
      await createLeague(leagueData);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to create league:", error);
      // Show error message to user
      if (error instanceof Error) {
        let errorMessage = error.message;
        // Add validation details if available
        if ((error as Error & { details?: unknown[] }).details) {
          const details = (error as Error & { details: unknown[] }).details;
          errorMessage +=
            "\n\nValidation errors:\n" +
            details
              .map((d: unknown) => {
                const detail = d as { path: string[]; message: string };
                return `- ${detail.path.join(".")}: ${detail.message}`;
              })
              .join("\n");
        }
        alert(`Error: ${errorMessage}`);
      } else {
        alert(t('unexpectedError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createNewLeague')}</DialogTitle>
          <DialogDescription>
            {t('setUpNewLeague')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('createLeague')}</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t('enterLeagueName')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionOptional')}</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder={t('enterLeagueDescription')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTeams">{t('maximumTeams')}</Label>
            <Input
              id="maxTeams"
              type="number"
              min="2"
              max="20"
              {...register("maxTeams", { valueAsNumber: true })}
            />
            {errors.maxTeams && (
              <p className="text-sm text-red-600">{errors.maxTeams.message}</p>
            )}
          </div>


          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('createLeague')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
