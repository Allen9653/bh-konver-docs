import { Helmet } from "react-helmet-async";

const SITE_URL = "https://bh-konver.lovable.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512.png`;

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export const SEO = ({ title, description, path, image = DEFAULT_OG_IMAGE }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
