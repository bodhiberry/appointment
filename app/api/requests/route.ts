import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const visitorSchema = z.object({
  name: z.string().min(2).max(100),
  citizenshipNo: z.string().min(5).max(50),
  organization: z.string().min(2).max(100),
  purpose: z.string().min(2).max(1000),
  personToMeet: z.string().min(2).max(100),
  visitDate: z.string().or(z.date()),
  phone: z.string().min(10).max(15),
  email: z.string().email().max(100),
  documentUrl: z.string().optional(),
  visitTime: z.string().optional(),
});

// Simple in-memory rate limiting (use Redis/database for production)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequests = new Map<string, { count: number; windowStart: number }>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const rateLimit = ipRequests.get(ip);

    if (rateLimit && now - rateLimit.windowStart < RATE_LIMIT_WINDOW) {
      if (rateLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
      rateLimit.count++;
    } else {
      ipRequests.set(ip, { count: 1, windowStart: now });
    }

    const body = await req.json();
    
    // Basic sanitation: trim all string values
    const sanitizedBody = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key, 
        typeof value === "string" ? value.trim() : value
      ])
    );

    const validatedData = visitorSchema.parse(sanitizedBody);

    // Check for existing active requests (PENDING or APPROVED)
    const existingActiveRequest = await prisma.visitorRequest.findFirst({
      where: {
        citizenshipNo: validatedData.citizenshipNo,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingActiveRequest) {
      return NextResponse.json(
        { error: "You already have an active request pending or approved. Please use your existing ID." },
        { status: 400 }
      );
    }

    const request = await prisma.visitorRequest.create({
      data: {
        ...validatedData,
        visitDate: new Date(validatedData.visitDate),
        status: "PENDING",
        documentUrl: validatedData.documentUrl ?? null,
        visitTime: validatedData.visitTime ?? null,
      },
    });

    return NextResponse.json(request);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    
    // Detailed error logging for deployment troubleshooting
    console.error("DEBUG: Request processing failed");
    console.error("Error Message:", error?.message);
    console.error("Error Stack:", error?.stack);
    if (error?.code) console.error("Prisma Error Code:", error.code);
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error?.message 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q");

    const requests = await prisma.visitorRequest.findMany({
      where: search
        ? {
            OR: [
              { requestId: { contains: search, mode: "insensitive" } },
              { citizenshipNo: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
