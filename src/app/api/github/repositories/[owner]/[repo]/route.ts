import { NextResponse } from "next/server";

import { getRepositoryDetail, toPublicError } from "@/lib/github/client";

type RouteContext = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { owner, repo } = await context.params;

  try {
    const result = await getRepositoryDetail(owner, repo);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: toPublicError(error) }, { status: 500 });
  }
}
