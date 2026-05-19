export interface SocialLink {
  label: string;
  href: string;
  status?: string;
}

export interface MusicTrack {
  title: string;
  src: string;
}

export interface AppConfig {
  artistName: string;
  tagline: string;
  music: {
    title: string;
    tracks: MusicTrack[];
  };
  website: {
    label: string;
    href: string;
    disabled?: boolean;
  };
  socialLinks: SocialLink[];
  assets: {
    logo: string;
    banner: string;
    ogImage: string;
  };
  seo: {
    title: string;
    description: string;
    url: string;
  };
}

export const config: AppConfig = {
  artistName: "Villxin",
  tagline: "Your music, your vibe",
  music: {
    title: "Now Playing",
    tracks: [
      {
        title: "Moonlight (COMING SOON)",
        src: "/audio/Moonlight (Demo).wav",
      },
      {
        title: "Freed From Chains (Demo Preview)",
        src: "/audio/Freed From Chains (Demo).wav",
      },
      {
        title: "Up In Smoke (Demo Preview)",
        src: "/audio/Up In Smoke (Demo).wav",
      },
    ],
  },
  website: {
    label: "Website",
    href: "#",
    disabled: true,
  },
  socialLinks: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/villxin_music/",
    },
    {
      label: "X",
      href: "https://x.com/villxin_music",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@villxin-music",
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@villxin_music",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/villxin.music",
    },
    {
      label: "Discord",
      href: "https://discord.gg/DVtjsUPrJQ",
      status: "Under Construction",
    },
  ],
  assets: {
    logo: "/images/villxin-logo.png",
    banner: "/images/villxin-title-2.png",
    ogImage: "/images/og-image.jpg",
  },
  seo: {
    title: "Villxin - Official Landing Page",
    description: "Official landing page - Listen to music, connect on social media, and stay updated.",
    url: "https://villxin.com",
  },
};
