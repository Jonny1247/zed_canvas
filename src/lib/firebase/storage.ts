import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

/**
 * Uploads an artwork image to Firebase Storage.
 * Returns the public download URL once the upload completes.
 */
export async function uploadArtworkImage(
  file: File,
  artistId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/\s+/g, "_")}`;
  const storageRef = ref(storage, `artworks/${artistId}/${filename}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/\s+/g, "_")}`;
  const storageRef = ref(storage, `${path}/${filename}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
