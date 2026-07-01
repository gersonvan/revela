import { redirect } from "next/navigation";

type ShortScreenPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ShortScreenPage({ params }: ShortScreenPageProps) {
  const { slug } = await params;

  redirect(`/screen/${slug}`);
}
