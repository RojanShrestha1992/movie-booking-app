const ImageKit = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const ensureImageKitConfig = () => {
  if (
    !process.env.IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.IMAGEKIT_URL_ENDPOINT
  ) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in backend/.env"
    );
  }
};

const uploadPosterToImageKit = async (fileBuffer, originalName) => {
  ensureImageKitConfig();

  const safeName = `${Date.now()}-${originalName.replace(/\s+/g, "-")}`;
  const uploadResponse = await imagekit.files.upload({
    file: fileBuffer,
    fileName: safeName,
    folder: "/movie-posters",
    useUniqueFileName: true,
  });

  return uploadResponse.url;
};

module.exports = {
  uploadPosterToImageKit,
};
