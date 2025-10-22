import { Instagram, Linkedin, Youtube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SocialMediaLink {
  name: string;
  url: string;
  icon: LucideIcon;
  username: string;
  color: string;
}

export const SOCIAL_MEDIA = {
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com/bdi.consultora/',
    icon: Instagram,
    username: '@bdi.consultora',
    color: '#E4405F',
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/bdiconsultora/',
    icon: Linkedin,
    username: 'BDI Consultora',
    color: '#0A66C2',
  },
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com/@bdi.consultora',
    icon: Youtube,
    username: '@bdi.consultora',
    color: '#FF0000',
  },
} as const;

export const SOCIAL_MEDIA_LINKS = Object.values(SOCIAL_MEDIA);
