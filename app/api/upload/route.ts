import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Ensure uploads directory exists in public folder
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    // Handle Multipart Form Data (File Input)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate extension
      const originalName = file.name || "avatar.jpg";
      const ext = path.extname(originalName).toLowerCase() || ".jpg";
      const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
      const finalExt = allowedExts.includes(ext) ? ext : ".jpg";

      const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${finalExt}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/avatars/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    // Handle JSON Base64 Data URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { image } = body;

      if (!image || typeof image !== "string") {
        return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
      }

      // Check if it's already a regular URL
      if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/uploads/")) {
        return NextResponse.json({ success: true, url: image });
      }

      // Parse data URL: data:image/png;base64,...
      const match = image.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Invalid base64 image format" }, { status: 400 });
      }

      const extType = match[1].toLowerCase();
      const ext = extType === "jpeg" ? ".jpg" : `.${extType}`;
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);

      const publicUrl = `/uploads/avatars/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl });
    }

    return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
