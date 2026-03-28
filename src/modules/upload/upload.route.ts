import { Router, type RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../auth/middlewares/auth.middleware.js";

const router = Router();

// Require auth on all upload routes so we have req.user.id
router.use(authMiddleware);

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

// Configure multer with dynamic per-user destination
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const userId = (req as any).user?.id ?? "anonymous";
        const userDir = path.join(UPLOADS_ROOT, userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "image-" + uniqueSuffix + ext);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});

const uploadHandler: RequestHandler = (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: true, message: "No file uploaded" });
        return;
    }

    const userId = (req as any).user?.id ?? "anonymous";
    const host = req.protocol + "://" + req.get("host");
    const fileUrl = `${host}/uploads/${userId}/${req.file.filename}`;

    res.status(200).json({
        statusCode: 200,
        message: "File uploaded successfully",
        data: { url: fileUrl },
    });
};

router.post("/", upload.single("image"), uploadHandler);

export default router;
