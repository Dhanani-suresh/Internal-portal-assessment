import { NextResponse } from "next/server";
import { deleteAnnouncement } from "@/lib/announcements";
import { currentUser } from "@/lib/auth";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to manage announcements." }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await deleteAnnouncement(id, user.email);
  if (result === "not-found") {
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  }
  if (result === "forbidden") {
    return NextResponse.json({ error: "You can only delete your own announcements." }, { status: 403 });
  }

  return new NextResponse(null, { status: 204 });
}
