
import { z } from 'zod'

export const usernameSchema = z.string()
  .min(3, 'At least 3 characters')
  .max(30, 'Max 30 characters')
  .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscore')
  .refine(val => !['admin','root','api','dashboard','auth','login','register'].includes(val), 'Reserved username')

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().min(1, 'Display name required').max(60),
  bio: z.string().max(300).optional().default(''),
  location: z.string().max(80).optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_email_public: z.boolean().optional(),
  visibility: z.enum(['public','unlisted','disabled']).default('public'),
  status_text: z.string().max(80).optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  theme_config: z.any().optional()
})

export const linkSchema = z.object({
  title: z.string().min(1, 'Title required').max(80),
  url: z.string().url('Must be valid URL').refine(u => {
    try { const p = new URL(u); return ['http:','https:'].includes(p.protocol) } catch { return false }
  }, 'Only http/https allowed'),
  description: z.string().max(140).optional(),
  icon: z.string().max(30).optional(),
  is_active: z.boolean().default(true),
  is_public: z.boolean().default(true),
  group_id: z.string().uuid().nullable().optional()
})

export type ProfileInput = z.infer<typeof profileSchema>
export type LinkInput = z.infer<typeof linkSchema>
