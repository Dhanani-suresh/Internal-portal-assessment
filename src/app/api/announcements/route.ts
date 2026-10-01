import { NextResponse } from "next/server";
import { createAnnouncement, listAnnouncements } from "@/lib/announcements";
import { currentUser } from "@/lib/auth";

function unauthorized() {
  return NextResponse.json({ error: "You must be signed in to access announcements." }, { status: 401 });
}

export async function GET() {
  if (!(await currentUser())) return unauthorized();
  return NextResponse.json({ announcements: await listAnnouncements() });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();

  try {
    const { title, body } = await request.json();
    if (typeof title !== "string" || typeof body !== "string") {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }
    if (title.trim().length < 2 || title.trim().length > 100 || body.trim().length < 3 || body.trim().length > 1000) {
      return NextResponse.json({ error: "Title must be 2–100 characters and message must be 3–1000 characters." }, { status: 400 });
    }
    const announcement = await createAnnouncement({ title, body, author: user.email });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Please send a valid request." }, { status: 400 });
  }
}
