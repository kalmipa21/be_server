import multer from "multer";
import path from "path";
import Messages from "../utils/messages.js";

const Storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname.toLowerCase());
    const unixSuffix = `img_${Date.now()}${ext}`;
    cb(null, unixSuffix);
  },
});

const Upload = multer({
  storage: Storage,
  limits: { fileSize: 1 * 1024 * 1024 }, //1MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname.toLowerCase());
    if (![".png", ".jpg", ".jpeg"].includes(ext)) {
      const newMessages = {
        messages: "Extention must be png/jpg/jpeg",
        code: "wrongtype",
      };
      cb(newMessages, false);
      return;
    }
    cb(null, true);
  },
});

const uploadImage = (req, res, next) => {
  const upload = Upload.single("image");

  upload(req, res, (err) => {
    if (err) {
      const { messages, code } = err;
      if (code === "LIMIT_FILE_SIZE") {
        Messages(res, 413, messages);
      } else if (code === "wrongtype") {
        Messages(res, 400, messages);
      } else {
        Messages(res, 500, "Something wrong when upload image", err);
      }
    } else {
      next();
    }
  });
};

export default uploadImage;
