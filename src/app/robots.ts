import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
    }],
    sitemap: 'https://bd-travel-spirit-guide-system.vercel.app/sitemap.xml',
  }
}