import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { searchRepositories, toPublicError } from "@/lib/github/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const result = await searchRepositories({
      q: searchParams.get("q") ?? "",
      page: Number(searchParams.get("page") ?? "1"),
      perPage: Number(searchParams.get("per_page") ?? "10"),
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "入力値が不正です。" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: toPublicError(error) }, { status: 500 });
  }
}
