import { defineConfig } from 'vitepress';

import { readReleases } from './releases';

const releases = readReleases({
  dir: process.env.SLIDEVISION_RELEASES_DIR,
});

const BASE = '/slidevision/';

export default defineConfig({
  title: 'Slidevision',
  description:
    'Browse Slidev decks and present them across two screens on macOS and Windows.',
  base: BASE,
  cleanUrls: true,
  appearance: 'force-dark',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/png',
        href: `${BASE}icon.png`,
      },
    ],
  ],
  themeConfig: {
    logo: '/icon.png',
    nav: [
      {
        text: 'Download',
        link: '/#download',
      },
      {
        text: 'Install',
        link: '/install',
      },
      {
        text: 'Workspace CLI',
        link: '/workspace',
      },
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/zgid123/slidevision',
      },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: `© ${new Date().getFullYear()} Alpha.`,
    },
  },
  transformPageData(pageData) {
    if (pageData.relativePath === 'index.md') {
      pageData.frontmatter.releases = releases;
    }
  },
});
