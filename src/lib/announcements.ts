import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
};

export type DeleteAnnouncementResult = "deleted" | "forbidden" | "not-found";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "announcements.json");

const starterAnnouncements: Announcement[] = [
  {
    id: "welcome-to-the-portal",
    title: "Welcome to the team portal",
    body: "Use this space to share updates, decisions, and useful news with the team.",
    author: "team@acme.test",
    createdAt: "2026-09-01T09:00:00.000Z",
  },
];

async function ensureDataFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(starterAnnouncements, null, 2), "utf8");
  }
}

async function saveAnnouncements(announcements: Announcement[]) {
  const temporaryFile = `${dataFile}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(announcements, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

export async function listAnnouncements() {
  await ensureDataFile();
  const file = await readFile(dataFile, "utf8");
  const announcements = JSON.parse(file) as Announcement[];
  return announcements.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createAnnouncement(input: Pick<Announcement, "title" | "body" | "author">) {
  const announcements = await listAnnouncements();
  const announcement: Announcement = {
    id: randomUUID(),
    title: input.title.trim(),
    body: input.body.trim(),
    author: input.author,
    createdAt: new Date().toISOString(),
  };

  await saveAnnouncements([announcement, ...announcements]);
  return announcement;
}

export async function deleteAnnouncement(id: string, requesterEmail: string): Promise<DeleteAnnouncementResult> {
  const announcements = await listAnnouncements();
  const announcement = announcements.find((item) => item.id === id);
  if (!announcement) return "not-found";
  if (announcement.author !== requesterEmail) return "forbidden";

  await saveAnnouncements(announcements.filter((item) => item.id !== id));
  return "deleted";
}
